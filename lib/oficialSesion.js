"use client";
import { useEffect, useState, useCallback } from "react";
/* Recuerda el codigo del oficial mientras dure la sesion del navegador
   (sessionStorage, maximo 4 horas). Es solo una comodidad de digitacion:
   el servidor sigue validando el codigo en cada accion. */
const KEY="oficialSesion:v1", TTL=4*60*60*1000;
function leer(){
  try{
    const r=JSON.parse(sessionStorage.getItem(KEY)||"null");
    if(r&&r.codigo&&Date.now()-r.t<TTL) return r.codigo;
  }catch{}
  return "";
}
export function useOficial(){
  const [codigo,setCodigoState]=useState("");
  useEffect(()=>{ setCodigoState(leer()); },[]);
  const setCodigo=useCallback(v=>{
    setCodigoState(v);
    try{
      if(v) sessionStorage.setItem(KEY,JSON.stringify({codigo:v,t:Date.now()}));
      else sessionStorage.removeItem(KEY);
    }catch{}
  },[]);
  return [codigo,setCodigo];
}
