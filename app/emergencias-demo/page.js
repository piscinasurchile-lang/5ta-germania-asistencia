'use client';

import { useEffect, useRef, useState } from 'react';

function startMartinshorn(ctxRef, timerRef) {
  if (ctxRef.current) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  ctxRef.current = ctx;
  const play = (freq) => {
    if (!ctxRef.current) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.22, ctx.currentTime + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.78);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.8);
  };
  let high = false;
  play(435);
  timerRef.current = window.setInterval(() => { high = !high; play(high ? 580 : 435); }, 850);
  if (navigator.vibrate) navigator.vibrate([500, 250, 500, 250, 900]);
}

function stopMartinshorn(ctxRef, timerRef) {
  if (timerRef.current) window.clearInterval(timerRef.current);
  timerRef.current = null;
  if (ctxRef.current) ctxRef.current.close().catch(() => {});
  ctxRef.current = null;
  if (navigator.vibrate) navigator.vibrate(0);
}

export default function EmergenciasDemoPage() {
  const [alert, setAlert] = useState(null);
  const [answer, setAnswer] = useState('');
  const ctxRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => stopMartinshorn(ctxRef, timerRef), []);

  const fire = (kind) => {
    setAnswer('');
    setAlert({
      kind,
      code: kind === 'general' ? 'LLAMADO GENERAL' : '10-0',
      address: 'Pedro de Valdivia 1250, Villarrica',
      reference: 'Despacho simulado para prueba',
      time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      original: kind === 'general' ? 'CENTRAL: LLAMADO GENERAL - Pedro de Valdivia 1250, Villarrica' : 'CENTRAL: 10-0 - B-5 - Pedro de Valdivia 1250, Villarrica'
    });
    startMartinshorn(ctxRef, timerRef);
  };

  const respond = (value) => { setAnswer(value); stopMartinshorn(ctxRef, timerRef); };
  const route = () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.address)}`, '_blank', 'noopener,noreferrer');

  return <main style={{minHeight:'100dvh',background:'#07182b',color:'#fff',padding:20,fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:760,margin:'0 auto'}}>
      <h1 style={{marginBottom:8}}>Emergencias GERMANIA</h1>
      <p style={{opacity:.78,marginTop:0}}>Banco de pruebas aislado. No lee Telegram todavía y no modifica asistencia.</p>
      <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',marginTop:28}}>
        <button onClick={()=>fire('b5')} style={btn('#b42318')}>SIMULAR DESPACHO B-5</button>
        <button onClick={()=>fire('general')} style={btn('#7a271a')}>SIMULAR LLAMADO GENERAL</button>
      </div>
      {answer && <p style={{marginTop:22,padding:14,background:'#12304d',borderRadius:12}}>Respuesta registrada en la prueba: <b>{answer}</b></p>}
    </div>
    {alert && <div role="alertdialog" aria-modal="true" style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(60,0,0,.97)',display:'grid',placeItems:'center',padding:18}}>
      <section style={{width:'min(680px,100%)',background:'#fff',color:'#151515',borderRadius:22,padding:22,boxShadow:'0 20px 80px #000'}}>
        <div style={{fontWeight:900,color:'#b42318',fontSize:14,letterSpacing:1}}>GERMANIA · EMERGENCIA</div>
        <h2 style={{fontSize:'clamp(30px,7vw,54px)',lineHeight:1,margin:'10px 0'}}>{alert.kind==='general'?'LLAMADO GENERAL':'B-5 DESPACHADO'}</h2>
        <div style={{fontSize:22,fontWeight:800}}>{alert.code}</div>
        <div style={{fontSize:23,marginTop:18}}><b>Dirección:</b> {alert.address}</div>
        <div style={{marginTop:8}}><b>Referencia:</b> {alert.reference}</div>
        <div style={{marginTop:8}}><b>Hora:</b> {alert.time}</div>
        <div style={{display:'grid',gap:10,marginTop:24}}>
          <button onClick={()=>respond('VOY AL CUARTEL')} style={btn('#067647')}>VOY AL CUARTEL</button>
          <button onClick={()=>respond('VOY DIRECTO')} style={btn('#175cd3')}>VOY DIRECTO</button>
          <button onClick={()=>respond('NO VOY')} style={btn('#475467')}>NO VOY</button>
          <button onClick={route} style={btn('#101828')}>ABRIR RUTA</button>
          <button onClick={()=>stopMartinshorn(ctxRef,timerRef)} style={{...btn('#fff'),color:'#333',border:'1px solid #bbb'}}>SILENCIAR ALARMA</button>
        </div>
        <details style={{marginTop:18}}><summary>Mensaje original de Central</summary><p>{alert.original}</p></details>
      </section>
    </div>}
  </main>;
}

function btn(background) { return {background,color:'#fff',border:0,borderRadius:12,padding:'16px 18px',fontSize:16,fontWeight:850,cursor:'pointer'}; }
