package com.kiyeon.thaifast;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** 웹 화면(JS)에서 단어 목록을 받아 PlaybackService로 넘겨주는 다리 */
@CapacitorPlugin(name = "Player")
public class PlayerPlugin extends Plugin {
    static PlayerPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    static void emit(String event, JSObject data) {
        PlayerPlugin p = instance;
        if (p != null) p.notifyListeners(event, data, false);
    }

    @PluginMethod
    public void start(PluginCall call) {
        try {
            JSArray arr = call.getArray("items");
            List<PlaybackService.Item> items = new ArrayList<>();
            if (arr != null) {
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.getJSONObject(i);
                    items.add(new PlaybackService.Item(o.optString("f"), o.optString("ko"), o.optString("th")));
                }
            }
            PlaybackService.Config cfg = new PlaybackService.Config();
            cfg.items = items;
            Float sp = call.getFloat("speed", 1f);
            cfg.speed = sp == null || sp <= 0 ? 1f : sp;
            cfg.readKo = Boolean.TRUE.equals(call.getBoolean("readKo", false));
            Integer reps = call.getInt("reps", 1);
            cfg.reps = reps == null ? 1 : Math.max(1, reps);
            cfg.pair = Boolean.TRUE.equals(call.getBoolean("pair", false));
            Integer rec = call.getInt("recallMs", 0);
            cfg.recallMs = rec == null ? 0 : rec;
            cfg.title = call.getString("title", "태국어 빠른 암기");
            PlaybackService.pending = cfg;
            Intent it = new Intent(getContext(), PlaybackService.class);
            it.setAction(PlaybackService.ACTION_START);
            if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(it);
            else getContext().startService(it);
            call.resolve();
        } catch (Exception e) {
            call.reject("start failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        final PlaybackService s = PlaybackService.current;
        if (s != null) s.h.post(() -> s.halt(false));
        call.resolve();
    }
}
