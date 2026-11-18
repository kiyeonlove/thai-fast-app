package com.kiyeon.thaifast;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;

/** 말해보기: 휴대폰 음성 인식으로 태국어를 듣고 글자로 돌려줘요 */
@CapacitorPlugin(
    name = "Speech",
    permissions = { @Permission(alias = "mic", strings = { Manifest.permission.RECORD_AUDIO }) }
)
public class SpeechPlugin extends Plugin {
    SpeechRecognizer sr;
    PluginCall cur;

    @PluginMethod
    public void available(PluginCall call) {
        JSObject r = new JSObject();
        boolean ok = false;
        try { ok = SpeechRecognizer.isRecognitionAvailable(getContext()); } catch (Exception ignored) { }
        r.put("ok", ok);
        call.resolve(r);
    }

    @PluginMethod
    public void listen(PluginCall call) {
        if (getPermissionState("mic") != PermissionState.GRANTED) {
            requestPermissionForAlias("mic", call, "micDone");
            return;
        }
        begin(call);
    }

    @PermissionCallback
    private void micDone(PluginCall call) {
        if (getPermissionState("mic") == PermissionState.GRANTED) begin(call);
        else call.reject("마이크 권한이 없어요", "denied");
    }

    void begin(final PluginCall call) {
        final String lang = call.getString("lang", "th-TH");
        getActivity().runOnUiThread(() -> {
            try {
                if (cur != null) { PluginCall old = cur; cur = null; old.reject("다시 시작", "busy"); }
                if (sr != null) { try { sr.destroy(); } catch (Exception ignored) { } sr = null; }
                cur = call;
                sr = SpeechRecognizer.createSpeechRecognizer(getContext());
                sr.setRecognitionListener(new RecognitionListener() {
                    @Override public void onReadyForSpeech(Bundle b) { state("ready"); }
                    @Override public void onBeginningOfSpeech() { state("speaking"); }
                    @Override public void onRmsChanged(float v) { }
                    @Override public void onBufferReceived(byte[] b) { }
                    @Override public void onEndOfSpeech() { state("end"); }
                    @Override public void onError(int e) { done(null, e); }
                    @Override public void onResults(Bundle b) { done(b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION), 0); }
                    @Override public void onPartialResults(Bundle b) { }
                    @Override public void onEvent(int t, Bundle b) { }
                });
                Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
                it.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, true);
                it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                it.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
                it.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());
                sr.startListening(it);
            } catch (Exception e) {
                PluginCall c = cur; cur = null;
                if (c != null) c.reject("음성 인식을 시작할 수 없어요", "fail");
            }
        });
    }

    void state(String s) {
        JSObject d = new JSObject();
        d.put("s", s);
        notifyListeners("state", d);
    }

    void done(ArrayList<String> m, int err) {
        PluginCall c = cur;
        cur = null;
        if (sr != null) { try { sr.destroy(); } catch (Exception ignored) { } sr = null; }
        if (c == null) return;
        if (m == null) { c.reject("인식 실패 " + err, "e" + err); return; }
        JSArray a = new JSArray();
        for (String s : m) a.put(s);
        JSObject r = new JSObject();
        r.put("matches", a);
        c.resolve(r);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> { if (sr != null) { try { sr.stopListening(); } catch (Exception ignored) { } } });
        call.resolve();
    }
}
