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
const defaultState=()=>({v:1,levelByType:{},rounds:{},progress:{},games:{},skills:{},lab:null,passed:{},checked:{},days:{},perfect:{},intro:{},ui:{size:'m'},view:{kind:'home'}});
let S=Object.assign(defaultState(),Store.load()||{});
function persist(){Store.save(S);}

