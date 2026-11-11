package com.kiyeon.thaifast;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;
import com.getcapacitor.JSObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 화면이 꺼져도 계속 재생하는 서비스.
 * 단어마다: (뜻 가리기면 잠깐 쉬고) 태국어 발음 → (한국어 뜻 읽기) → 반복 횟수만큼 → 다음 단어
 */
public class PlaybackService extends Service {
    static final String ACTION_START = "com.kiyeon.thaifast.START";
    static final String ACTION_STOP = "com.kiyeon.thaifast.STOP";
    static final String CHANNEL = "playback";
    static final int NOTE_ID = 7;

    static volatile Config pending;
    static volatile PlaybackService current;

    static class Item {
        final String f, ko, th, ex, exk;
        Item(String f, String ko, String th, String ex, String exk) { this.f = f; this.ko = ko; this.th = th; this.ex = ex; this.exk = exk; }
    }

    static class Config {
        List<Item> items = new ArrayList<>();
        float speed = 1f;
        boolean readKo;
        int reps = 1;
        boolean pair;
        int recallMs;
        int exPlay; // 0 끄기, 1 예문 태국어, 2 예문 태국어+한국어
        String title = "";
    }

    final Handler h = new Handler(Looper.getMainLooper());
    MediaPlayer mp;
    TextToSpeech tts;
    boolean ttsReady;
    int ttsWait;
    PowerManager.WakeLock wl;
    AudioManager am;
    Config cfg;
    int idx, rep, gen, lastStartId;

    final AudioManager.OnAudioFocusChangeListener focus = change -> {
        // 전화가 오거나 다른 앱이 소리를 내면 멈춰요
        if (change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
            h.post(() -> halt(true));
        }
    };

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        current = this;
        am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "thaifast:play");
        wl.setReferenceCounted(false);
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(Locale.KOREAN);
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { h.post(() -> afterKo(id)); }
                    @Override public void onError(String id) { h.post(() -> afterKo(id)); }
                });
                ttsReady = true;
            }
        });
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "단어 재생", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(ch);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        lastStartId = startId;
        String action = intent != null ? intent.getAction() : null;
        if (ACTION_STOP.equals(action)) {
            halt(true);
            return START_NOT_STICKY;
        }
        Config c = pending;
        pending = null;
        Item first = c != null && !c.items.isEmpty() ? c.items.get(0) : null;
        goForeground(c != null ? c.title : "태국어 빠른 암기", first);
        if (first == null) {
            shutdown();
            return START_NOT_STICKY;
        }
        cfg = c;
        idx = 0;
        rep = 0;
        ttsWait = 0;
        gen++;
        if (!wl.isHeld()) wl.acquire(6 * 60 * 60 * 1000L);
        am.requestAudioFocus(focus, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        startItem(gen);
        return START_NOT_STICKY;
    }

    void goForeground(String title, Item it) {
        Notification n = buildNote(title, it);
        if (Build.VERSION.SDK_INT >= 29) {
            ServiceCompat.startForeground(this, NOTE_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTE_ID, n);
        }
    }

    Notification buildNote(String title, Item it) {
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        PendingIntent pOpen = PendingIntent.getActivity(this, 0, open, fl);
        Intent stop = new Intent(this, PlaybackService.class);
        stop.setAction(ACTION_STOP);
        PendingIntent pStop = PendingIntent.getService(this, 1, stop, fl);
        return new NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title == null ? "태국어 빠른 암기" : title)
            .setContentText(it == null ? "" : it.th + "   " + it.ko)
            .setContentIntent(pOpen)
            .addAction(android.R.drawable.ic_media_pause, "멈춤", pStop)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    void startItem(final int g) {
        if (g != gen || cfg == null) return;
        if (idx >= cfg.items.size()) { finishAll(); return; }
        Item it = cfg.items.get(idx);
        rep = 0;
        JSObject d = new JSObject();
        d.put("i", idx);
        PlayerPlugin.emit("item", d);
        try {
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).notify(NOTE_ID, buildNote(cfg.title, it));
        } catch (Exception ignored) { }
        if (cfg.recallMs > 0) h.postDelayed(() -> playTh(g), (long) (cfg.recallMs / cfg.speed));
        else playTh(g);
    }

    void playTh(final int g) {
        if (g != gen) return;
        Item it = cfg.items.get(idx);
        playFile(g, "public/audio/" + it.f + ".ogg", cfg.speed, 250, () -> afterTh(g));
    }

    /** 파일 하나 재생하고 끝나면 쉬었다가 next 실행 */
    void playFile(final int g, String asset, float speed, long pauseMs, final Runnable next) {
        if (g != gen) return;
        releaseMp();
        final Runnable go = () -> { if (g == gen) next.run(); };
        try {
            MediaPlayer m = new MediaPlayer();
            mp = m;
            m.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build());
            setSource(m, asset);
            m.setOnCompletionListener(x -> h.postDelayed(go, (long) (pauseMs / speed)));
            m.setOnErrorListener((x, what, extra) -> { h.post(go); return true; });
            m.prepare();
            if (Build.VERSION.SDK_INT >= 23 && speed != 1f) {
                try { m.setPlaybackParams(m.getPlaybackParams().setSpeed(speed)); } catch (Exception ignored) { }
            }
            if (!m.isPlaying()) m.start();
        } catch (Exception e) {
            h.postDelayed(go, 800);
        }
    }

    /** 압축된 파일이면 캐시에 복사해서 재생 */
    void setSource(MediaPlayer m, String asset) throws Exception {
        try {
            AssetFileDescriptor fd = getAssets().openFd(asset);
            m.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
            fd.close();
        } catch (Exception e) {
            File f = new File(getCacheDir(), asset.replace('/', '_'));
            if (!f.exists()) {
                try (InputStream in = getAssets().open(asset); OutputStream out = new FileOutputStream(f)) {
                    byte[] buf = new byte[16384];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                }
            }
            m.setDataSource(f.getAbsolutePath());
        }
    }

    void afterTh(final int g) {
        if (g != gen) return;
        Item it = cfg.items.get(idx);
        boolean wantKo = (cfg.pair || cfg.readKo) && it.ko != null && !it.ko.isEmpty();
        if (wantKo && !ttsReady && ttsWait < 10) {
            ttsWait++;
            h.postDelayed(() -> afterTh(g), 300);
            return;
        }
        if (wantKo && ttsReady) {
            tts.setSpeechRate(cfg.speed);
            tts.speak(it.ko, TextToSpeech.QUEUE_FLUSH, new Bundle(), "g" + g);
        } else {
            afterKo("g" + g);
        }
    }

    void afterKo(String id) {
        final int g;
        try { g = Integer.parseInt(id.substring(1)); } catch (Exception e) { return; }
        if (g != gen || cfg == null) return;
        long gap = cfg.pair ? (long) (350 / cfg.speed) : 0;
        rep++;
        if (rep < Math.max(1, cfg.reps)) {
            h.postDelayed(() -> playTh(g), gap);
            return;
        }
        h.postDelayed(() -> playEx(g), gap + (long) (300 / cfg.speed));
    }

    /** 예문: 태국어 → (한국어) → 다음 단어 */
    void playEx(final int g) {
        if (g != gen || cfg == null) return;
        Item it = cfg.items.get(idx);
        if (cfg.exPlay > 0 && it.ex != null && !it.ex.isEmpty()) {
            JSObject d = new JSObject(); d.put("i", idx); d.put("part", "th");
            PlayerPlugin.emit("ex", d);
            playFile(g, "public/" + it.ex, cfg.speed, 250, () -> {
                if (cfg.exPlay == 2 && it.exk != null && !it.exk.isEmpty()) {
                    JSObject d2 = new JSObject(); d2.put("i", idx); d2.put("part", "ko");
                    PlayerPlugin.emit("ex", d2);
                    float ks = Math.min(cfg.speed, 1.5f);
                    playFile(g, "public/" + it.exk, ks, 0, () -> nextItem(g));
                } else nextItem(g);
            });
        } else nextItem(g);
    }

    void nextItem(final int g) {
        h.postDelayed(() -> {
            if (g != gen) return;
            idx++;
            startItem(g);
        }, (long) (700 / cfg.speed));
    }

    /** 멈춤. tell=true면 화면(JS)에 멈췄다고 알려요 */
    void halt(boolean tell) {
        gen++;
        h.removeCallbacksAndMessages(null);
        releaseMp();
        if (tts != null) tts.stop();
        if (tell) {
            JSObject d = new JSObject();
            d.put("i", idx);
            PlayerPlugin.emit("paused", d);
        }
        shutdown();
    }

    void finishAll() {
        PlayerPlugin.emit("done", new JSObject());
        shutdown();
    }

    void shutdown() {
        try { am.abandonAudioFocus(focus); } catch (Exception ignored) { }
        if (wl.isHeld()) wl.release();
        stopForeground(true);
        stopSelfResult(lastStartId);
    }

    void releaseMp() {
        if (mp != null) {
            try { mp.setOnCompletionListener(null); mp.release(); } catch (Exception ignored) { }
            mp = null;
        }
    }

    @Override
    public void onDestroy() {
        gen++;
        h.removeCallbacksAndMessages(null);
        releaseMp();
        if (tts != null) tts.shutdown();
        if (wl.isHeld()) wl.release();
        if (current == this) current = null;
        super.onDestroy();
    }
}
