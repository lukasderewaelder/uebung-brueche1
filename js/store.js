'use strict';
/* ---------- 4 Speicher ---------- */
const KEY='bruchwerkstatt_v1';
const Store={
  ok:true,
  load(){
    try{const raw=localStorage.getItem(KEY);if(raw){const o=JSON.parse(raw);if(o&&o.v===1)return o;}}
    catch(e){this.ok=false;}
    return null;
  },
  save(o){
    try{localStorage.setItem(KEY,JSON.stringify(o));}
    catch(e){this.ok=false;}
  },
  clear(){try{localStorage.removeItem(KEY);}catch(e){this.ok=false;}}
};
const defaultState=()=>({v:1,modus:{},levelByType:{},rounds:{},progress:{},games:{},skills:{},lab:null,passed:{},checked:{},days:{},perfect:{},intro:{},ui:{size:'m',theme:'auto'},view:{kind:'home'}});
let S=Object.assign(defaultState(),Store.load()||{});
function persist(){Store.save(S);}
/* Umstellung der Stationen R01–R05 („Addieren und Subtrahieren“ hat seit Version 2 fünf neu geschnittene Bausteine statt drei): Stände der alten Bausteine passen nicht mehr und werden einmal verworfen */
function migrateState(o){
  if(o.addsubV!==2){
    ['progress','passed','perfect','rounds','intro','levelByType','checked'].forEach(k=>{
      const m=o[k];
      if(m&&typeof m==='object')Object.keys(m).forEach(x=>{if(/^R0[1-5](-|$)/.test(x))delete m[x];});
    });
    o.addsubV=2;
  }
  return o;
}
migrateState(S);persist();

