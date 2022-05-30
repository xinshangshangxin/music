package com.shang.highMusic;


import android.content.Intent;
import android.media.MediaPlayer;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Log;
import android.view.KeyEvent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Objects;

@CapacitorPlugin(name = "MediaSessionManager")
public class MediaSessionManager extends Plugin {
    private static final String TAG = "MediaSessionManager";

    private MediaSessionCompat mMediaSession;

    @Override
    public void load() {
        this.setupMediaSession();
    }

    /**
     * 初始化并激活MediaSession
     */
    private void setupMediaSession() {
        mMediaSession = new MediaSessionCompat(this.getContext(), TAG);
        mMediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
                | MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS);
        mMediaSession.setCallback(callback);
        mMediaSession.setActive(true);
    }

    @PluginMethod()
    public void playPause(PluginCall call) {
        Log.v("action", "playPause");
        String state = call.getString("state");

        int s = Objects.equals(state, "paused") ? PlaybackStateCompat.STATE_PLAYING :
                PlaybackStateCompat.STATE_PAUSED;

        mMediaSession.setPlaybackState(
                new PlaybackStateCompat.Builder()
                        .setState(s, 0, 1)
                        .build()
        );
    }

    @PluginMethod()
    public void updateSongMeta(PluginCall call) {
        Log.v("action", "updateSongMeta");
        String name = call.getString("title");
        String artist = call.getString("artist");
        String album = call.getString("album");
        String artworkUrl = call.getString("artworkUrl");

        if (name == null || artist == null) {
            mMediaSession.setMetadata(null);
            return;
        }

        if (album == null) {
            album = "";
        }

        if (artworkUrl == null) {
            artworkUrl = "";
        }

        mMediaSession.setMetadata(
                new MediaMetadataCompat.Builder()
                        .putString(MediaMetadataCompat.METADATA_KEY_TITLE, name)
                        .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album)
                        .putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ART_URI, artworkUrl)
                        .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist).build()
        );
    }

    /**
     * 释放MediaSession，退出播放器时调用
     */
    public void release() {
        mMediaSession.setCallback(null);
        mMediaSession.setActive(false);
        mMediaSession.release();
    }

    private MediaSessionCompat.Callback callback = new MediaSessionCompat.Callback() {
        @Override
        public boolean onMediaButtonEvent(Intent intent) {

            KeyEvent keyEvent = intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT);

//            只响应 耳机 按下操作
            if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_HEADSETHOOK && keyEvent.getAction() != KeyEvent.ACTION_DOWN) {
                JSObject ret = new JSObject();
                ret.put("name", "HEADSET_ACTION_DOWN");
                notifyListeners("action", ret);

                return true;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_MEDIA_NEXT) {
                JSObject ret = new JSObject();
                ret.put("name", "nexttrack");
                notifyListeners("action", ret);
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_MEDIA_PREVIOUS) {
                JSObject ret = new JSObject();
                ret.put("name", "previoustrack");
                notifyListeners("action", ret);
            }

            //返回true表示不让别的程序继续处理这个广播
            return true;
        }

        @Override
        public void onPlay() {
            JSObject ret = new JSObject();
            ret.put("name", "play");
            notifyListeners("action", ret);
        }

        @Override
        public void onPause() {
            JSObject ret = new JSObject();
            ret.put("name", "pause");
            notifyListeners("action", ret);
        }

        @Override
        public void onSkipToNext() {
            JSObject ret = new JSObject();
            ret.put("name", "nexttrack");
            notifyListeners("action", ret);
        }

        @Override
        public void onSkipToPrevious() {
            JSObject ret = new JSObject();
            ret.put("name", "previoustrack");
            notifyListeners("action", ret);
        }

        @Override
        public void onStop() {
            JSObject ret = new JSObject();
            ret.put("name", "stop");
            notifyListeners("action", ret);
        }
    };
}
