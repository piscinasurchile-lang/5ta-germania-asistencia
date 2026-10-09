package cl.germania.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Widget de escritorio: En cuartel · Disponibles · Maquinistas.
 * Lee SOLO los tres números de https://.../api/resumen (una consulta, sin datos personales).
 * Si no hay conexión conserva los últimos números y muestra la hora de la última actualización.
 */
public class ResumenWidget extends AppWidgetProvider {

    static final String URL_APP = "https://5ta-germania-asistencia.vercel.app/";
    static final String URL_API = URL_APP + "api/resumen";
    static final String ACCION_REFRESCAR = "cl.germania.widget.REFRESCAR";
    static final long CADA_MS = 5 * 60 * 1000L;
    static final String PREFS = "resumen";

    @Override
    public void onEnabled(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime() + CADA_MS, CADA_MS, pendiente(ctx));
        }
    }

    @Override
    public void onDisabled(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(pendiente(ctx));
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        pintar(ctx, mgr, ids, null);
        pedir(ctx, goAsync());
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (ACCION_REFRESCAR.equals(intent.getAction())) {
            pedir(ctx, goAsync());
        } else {
            super.onReceive(ctx, intent);
        }
    }

    static PendingIntent pendiente(Context ctx) {
        Intent i = new Intent(ctx, ResumenWidget.class).setAction(ACCION_REFRESCAR);
        return PendingIntent.getBroadcast(ctx, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Pide los números en segundo plano y repinta todos los widgets. */
    static void pedir(final Context ctx, final BroadcastReceiver.PendingResult res) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                String fallo = null;
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(URL_API).openConnection();
                    c.setConnectTimeout(8000);
                    c.setReadTimeout(8000);
                    c.setRequestProperty("Cache-Control", "no-cache");
                    if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
                    StringBuilder sb = new StringBuilder();
                    BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), "UTF-8"));
                    String l;
                    while ((l = r.readLine()) != null) sb.append(l);
                    r.close();
                    JSONObject j = new JSONObject(sb.toString());
                    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                            .putInt("cuartel", j.getInt("cuartel"))
                            .putInt("disp", j.getInt("disponibles"))
                            .putInt("maq", j.getInt("maquinistas"))
                            .putLong("hora", System.currentTimeMillis())
                            .apply();
                } catch (Exception e) {
                    fallo = "sin conexión";
                }
                AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
                int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ResumenWidget.class));
                pintar(ctx, mgr, ids, fallo);
                if (res != null) res.finish();
            }
        }).start();
    }

    static void pintar(Context ctx, AppWidgetManager mgr, int[] ids, String fallo) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean hay = p.contains("hora");
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_resumen);
        v.setTextViewText(R.id.n_cuartel, hay ? String.valueOf(p.getInt("cuartel", 0)) : "–");
        v.setTextViewText(R.id.n_disp, hay ? String.valueOf(p.getInt("disp", 0)) : "–");
        v.setTextViewText(R.id.n_maq, hay ? String.valueOf(p.getInt("maq", 0)) : "–");
        String hora = hay ? new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date(p.getLong("hora", 0))) : "";
        String estado = fallo != null ? (hay ? "sin conexión · última " + hora : "sin conexión") : (hay ? "actualizado " + hora : "cargando…");
        v.setTextViewText(R.id.estado, estado);

        Intent abrir = new Intent(Intent.ACTION_VIEW, Uri.parse(URL_APP));
        PendingIntent pAbrir = PendingIntent.getActivity(ctx, 1, abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        v.setOnClickPendingIntent(R.id.raiz, pAbrir);
        v.setOnClickPendingIntent(R.id.refrescar, pendiente(ctx));
        for (int id : ids) mgr.updateAppWidget(id, v);
    }
}
