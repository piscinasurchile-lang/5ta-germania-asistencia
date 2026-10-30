import {getDocumentProxy,extractText} from 'unpdf';
import {MAX_PDF,extraerDisposicion,detectarReferencias,extraerFechaDocumento} from './odd-dominio.mjs';
export async function analizarPDF(bytes,numero) {
 if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_PDF || bytes.byteLength < 8 || Buffer.from(bytes.subarray(0,5)).toString() !== '%PDF-') throw Error('pdf_invalido');
 let pdf;
 try {
  pdf = await getDocumentProxy(bytes,{isEvalSupported:false,maxImageSize:4000000,isOffscreenCanvasSupported:false,isImageDecoderSupported:false});
  if (pdf.numPages > 30) throw Error('pdf_supera_30_paginas');
  const {text} = await extractText(pdf,{mergePages:true});
  return {fechaDocumento:extraerFechaDocumento(text),resumen:extraerDisposicion(text),dejaSinEfecto:detectarReferencias(text,numero),requiereRevision:!extraerDisposicion(text)};
 } finally { await pdf?.loadingTask?.destroy(); }
}
