import { procesarUpdate, armarAvisoPrueba } from './src/alerta.mjs';

const SIMULACION_GRUPO_ID = '-1001234567890';
const SIMULACION_TEMA = 'germania_sandbox_local_2026';
const ejemplo = {
  update_id: 1000,
  message: {
    message_id: 88,
    chat: { id: Number(SIMULACION_GRUPO_ID), title: 'DESPACHOS VILLARRICA 2023 (SIMULACIÓN)' },
    text: 'PRUEBA 10-0. Se despacha B-5 a calle de ejemplo 123.'
  }
};
const decision = procesarUpdate(ejemplo, SIMULACION_GRUPO_ID);
console.log(JSON.stringify({ decision, aviso: armarAvisoPrueba(decision, SIMULACION_TEMA), envioReal: false }, null, 2));
