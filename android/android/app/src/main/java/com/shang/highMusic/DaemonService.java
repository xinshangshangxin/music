package com.shang.highMusic;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

public class DaemonService extends Service {
    private static final String TAG = "DaemonService";
    public static final int NOTICE_ID = 100;
    private static final String CHANNEL_ID_STRING = "channel";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        Log.i(TAG, "DaemonService---->onCreate被调用，启动前台service");

        NotificationManager notificationManager = (NotificationManager)
                getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel mChannel = null;

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            mChannel = new NotificationChannel(CHANNEL_ID_STRING, "Music", NotificationManager.IMPORTANCE_HIGH);
            notificationManager.createNotificationChannel(mChannel);
            Notification notification = new Notification.Builder(getApplicationContext(), CHANNEL_ID_STRING).build();
            startForeground(NOTICE_ID, notification);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // 如果Service被终止，当资源允许情况下，重启service
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        NotificationManager mManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        mManager.cancel(NOTICE_ID);

        Log.d(TAG, "DaemonService---->onDestroy，前台service被杀死");
        // 重启自己
        Intent intent = new Intent(getApplicationContext(), DaemonService.class);
        startService(intent);
    }
}