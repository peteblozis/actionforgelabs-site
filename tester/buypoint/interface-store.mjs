// Device-local pilot storage. One transaction commits state and its outcome receipt.
export const BUILD = 'FAIRSIGHT-INTERFACES-PILOT-1';
export function openStore(name = 'fairsight-interface-pilot-v1') {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('workspace');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}
const empty = () => ({version:1, revision:0, product:null, targets:{}, budget:null, alerts:{}, saved:{}, receipts:[], requests:{}});
export async function transact(db, command = null) {
  return new Promise((resolve,reject) => {
    const tx=db.transaction('workspace', command ? 'readwrite' : 'readonly');
    const store=tx.objectStore('workspace'), req=store.get('current');
    let result, failure;
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(failure || tx.error);
    tx.onabort=()=>reject(failure || tx.error || new Error('Storage transaction aborted'));
    req.onsuccess=()=>{
      try {
        const state=req.result || empty();
        if (!command) {result=state; return;}
        const {id, source, type, value}=command;
        if (!id || !['chat','screen','voice'].includes(source)) throw new Error('Invalid command');
        const fingerprint=JSON.stringify({type,value});
        if (Object.hasOwn(state.requests,id)) {
          if(state.requests[id]!==fingerprint) throw new Error('Request ID already used for a different action');
          result=state; return;
        }
        const started=command.started || Date.now();
        let error=null;
        try {
          if(type==='product') {
            if(!value?.id || !Array.isArray(value.offers)) throw new Error('No verified product');
            state.product=value;
          } else if(type==='budget') {
            if(!Number.isFinite(value)||value<=0) throw new Error('Enter a positive budget');
            state.budget=value;
          } else if(type==='target') {
            if(!state.product) throw new Error('Find a product first');
            if(!Number.isFinite(value)||value<=0) throw new Error('Enter a positive target');
            state.targets[state.product.id]=value;
            if(state.alerts[state.product.id]) state.alerts[state.product.id].target=value;
          } else if(type==='watch'||type==='save') {
            if(!state.product) throw new Error('Find a product first');
            const p=state.product, target=state.targets[p.id] ?? p.recommended;
            if(!Number.isFinite(target)||target<=0) throw new Error('A valid target is required');
            state.saved[p.id]={id:p.id,name:p.name,target};
            if(type==='watch') state.alerts[p.id]={id:p.id,target,status:'local intent only; notifications not connected'};
          } else if(type!=='explain') throw new Error('Unsupported action');
        } catch(e) {error=e.message;}
        state.revision++;
        state.requests[id]=fingerprint;
        state.receipts.push({id,build:BUILD,source,type,startedAt:new Date(started).toISOString(),completedAt:new Date().toISOString(),durationMs:Math.max(0,Date.now()-started),status:error?'failed':'completed',error,correctness:'not independently assessed',costUsd:null,helpNeeded:null,executionError:!!error,correction:type==='target'||type==='budget',evidenceMode:state.product?.live?'provider':'fixture',revision:state.revision});
        store.put(state,'current'); result=state;
      } catch(e) {failure=e;tx.abort();}
    };
  });
}
export function parseCommand(raw) {
  const text=raw.trim();
  let m=text.match(/^(?:set |change |my )?(budget|target)(?: (?:to|is))?\s+\$?(\d+(?:\.\d{1,2})?)\.?$/i);
  if(m) return {type:m[1].toLowerCase(),value:Number(m[2])};
  if(/^(?:watch|watch price|alert me)$/i.test(text)) return {type:'watch'};
  if(/^(?:save|save item)$/i.test(text)) return {type:'save'};
  if(/^(?:explain|explain this|what is my budget|show my budget)\??$/i.test(text)) return {type:'explain'};
  return {type:'unsupported'};
}
export function explain(state) {
  const p=state.product;
  const budget=state.budget===null?'not set':`$${state.budget.toFixed(2)}`;
  if(!p) return `Budget: ${budget}. Find a product to compare.`;
  const target=state.targets[p.id] ?? p.recommended;
  const prices=p.offers.map(o=>Number(o.price)).filter(Number.isFinite);
  const best=prices.length?Math.min(...prices):null;
  return `${p.name}. Budget: ${budget}. Target: $${target.toFixed(2)}. Lowest listed price: ${best===null?'unknown':'$'+best.toFixed(2)}. ${state.budget!==null&&best!==null&&best>state.budget?'Above your budget. ':''}${p.live?'Saved provider evidence; refresh to check current prices.':'Dated fixture for interface testing only.'} Shipping and tax may change the final total.`;
}
