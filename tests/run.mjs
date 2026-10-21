/* Führt runSelfTests() ohne Browser aus: node tests/run.mjs
   Lädt alle Skripte aus index.html (außer js/app.js, dem Start) in einen vm-Kontext mit einfachen Attrappen. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(f=>f!=='js/app.js');

/* Attrappe: jede Eigenschaft ist wieder aufrufbar und liefert eine Attrappe */
const stub=()=>{const f=function(){return stub();};return new Proxy(f,{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='length'?0:stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});};
const store={};
const win={
  document:stub(),history:{replaceState(){},pushState(){}},
  localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
  addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),scrollTo(){},
  setTimeout,clearTimeout,Math,Date,JSON,Number,Object,Array,String,Set,Map,Promise,console
};
win.window=win;
const ctx=vm.createContext(win);
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});

const r=vm.runInContext('runSelfTests()',ctx);
console.log(`${r.passed} von ${r.total} Tests bestanden`);
if(r.failed.length){console.error('Fehlgeschlagen:\n- '+r.failed.join('\n- '));process.exit(1);}
