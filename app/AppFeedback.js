"use client";
import {useEffect} from "react";
export default function AppFeedback(){useEffect(()=>{const f=e=>{const b=e.target?.closest?.("button,a.g-menu-item");if(!b||b.disabled)return;try{navigator.vibrate?.(22)}catch{}};document.addEventListener("click",f,{passive:true});return()=>document.removeEventListener("click",f)},[]);return null}
