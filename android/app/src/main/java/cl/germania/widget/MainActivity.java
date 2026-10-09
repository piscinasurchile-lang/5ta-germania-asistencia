package cl.germania.widget;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Pantalla mínima: explica cómo agregar el widget y abre GERMANIA. */
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setGravity(Gravity.CENTER);
        l.setPadding(48, 48, 48, 48);
        l.setBackgroundColor(0xFF07090B);

        TextView t = new TextView(this);
        t.setText("GERMANIA · Widget\n\nPara agregarlo: mantén presionado un espacio vacío del escritorio → Widgets → GERMANIA.\n\nMuestra En cuartel, Disponibles y Maquinistas, y se actualiza solo cada pocos minutos.");
        t.setTextColor(0xFFFFFFFF);
        t.setTextSize(18);
        l.addView(t);

        Button bt = new Button(this);
        bt.setText("Abrir GERMANIA");
        bt.setMinHeight(144);
        bt.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(ResumenWidget.URL_APP)));
            }
        });
        l.addView(bt);
        setContentView(l);
    }
}
