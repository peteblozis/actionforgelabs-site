import {openStore,transact,parseCommand,explain,BUILD} from './interface-store.mjs';
if(new URLSearchParams(location.search).get('pilot')==='interfaces') {
  const section=document.createElement('section');section.className='card';section.id='interfacePilot';
  section.innerHTML=`<h2>Fairsight interface pilot</h2><p class="small">This test saves work in this browser. It does not sync devices or send price alerts.</p>
  <form id="pilotChat"><label for="pilotCommand">Ask Fairsight</label><input id="pilotCommand" placeholder="Set budget to $15"><p class="small">Try: “budget 15”, “target 11”, “watch price”, “save item”, or “explain”.</p><button>Send</button><button type="button" id="pilotVoice">Speak command</button></form>
  <p id="pilotReply" role="status" aria-live="polite"></p>
  <form id="pilotBudget"><label for="pilotBudgetValue">Shopping budget ($)</label><input id="pilotBudgetValue" type="number" min="0.01" step="0.01"><button>Update budget</button></form>
  <p id="pilotSummary"></p><p id="pilotWatch"></p><button id="pilotExport">Export pilot results</button><p id="pilotStatus" role="status"></p>`;
  document.querySelector('#entry').after(section);
  const status=document.querySelector('#pilotStatus');
  try {
    const db=await openStore();
    let state=await transact(db);
    const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('fairsight-interface-pilot'):null;
    function draw(){
      window.fairsightPilotState=state;
      document.querySelector('#pilotBudgetValue').value=state.budget ?? '';
      document.querySelector('#pilotSummary').textContent=explain(state);
      document.querySelector('#pilotWatch').textContent=`${Object.keys(state.alerts).length} local watch intent(s).`;
      status.textContent=`${BUILD} · ${state.receipts.length} recorded actions. Cost and correctness are unverified.`;
      if(state.product){product=state.product;renderDecision();['result','offersCard'].forEach(id=>document.querySelector('#'+id).classList.remove('hidden'));document.querySelector('#providerNotice').textContent=state.product.live?'Saved provider evidence; refresh to verify current prices.':'Dated fixture for interface testing only.';}
      document.querySelector('#savedCount').textContent=Object.keys(state.saved).length;
      document.querySelector('#savedList').innerHTML=Object.values(state.saved).map(p=>`<div class="savedItem"><b>${esc(p.name)}</b><div class="small">BuyPoint ${money(state.targets[p.id]??p.target)} · ${state.alerts[p.id]?'Price & stock watch requested (local intent only)':'Saved item'}</div></div>`).join('')||'No saved items yet.';
    }
    async function dispatch(type,value,source='screen',id=crypto.randomUUID(),started=Date.now()){
      state=await transact(db,{id,source,type,value,started});draw();channel?.postMessage(state.revision);
      const receipt=state.receipts.find(r=>r.id===id);
      document.querySelector('#pilotReply').textContent=receipt?.error||explain(state);
      return state;
    }
    function run(p){p.catch(e=>{status.textContent=`Could not save: ${e.message}. No success claimed.`;});}
    // All entry points share dispatch, the same transaction and the same evidence snapshot.
    window.fairsightPilot={dispatch,getState:()=>transact(db)};
    window.fairsightPilotProduct=p=>dispatch('product',p,method==='voice'?'voice':'screen');
    document.querySelector('#pilotChat').onsubmit=e=>{e.preventDefault();const c=parseCommand(document.querySelector('#pilotCommand').value);run(dispatch(c.type,c.value,'chat'));};
    document.querySelector('#pilotBudget').onsubmit=e=>{e.preventDefault();run(dispatch('budget',Number(document.querySelector('#pilotBudgetValue').value)));};
    document.querySelector('#save').onclick=()=>run(dispatch('save'));
    document.querySelector('#watch').onclick=()=>run(dispatch('watch'));
    document.querySelector('#overridePrice').onclick=()=>{const raw=prompt('Your preferred BuyPoint',state.product?state.targets[state.product.id]??state.product.recommended:'');if(raw!==null)run(dispatch('target',Number(raw)));};
    document.querySelector('#openSaved').onclick=()=>{draw();document.querySelector('#savedDialog').showModal();};
    document.querySelector('#pilotVoice').onclick=()=>{
      const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!Recognition){status.textContent='Voice is unavailable here; type the command instead.';return;}
      const recognition=new Recognition();recognition.lang='en-US';recognition.interimResults=false;
      recognition.onresult=e=>{const text=e.results[0][0].transcript;document.querySelector('#pilotCommand').value=text;const c=parseCommand(text);run(dispatch(c.type,c.value,'voice'));};
      recognition.onerror=()=>{status.textContent='Voice input failed; type the command instead.';};recognition.start();
    };
    document.querySelector('#pilotExport').onclick=async()=>{
      try{state=await transact(db);const blob=new Blob([JSON.stringify({build:BUILD,scope:'device-local interface pilot',...state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fairsight-interface-pilot-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){status.textContent=e.message;}
    };
    channel && (channel.onmessage=()=>run(transact(db).then(s=>{state=s;draw();})));
    draw();document.querySelector('#find').disabled=false;
  }catch(e){status.textContent=`Pilot storage unavailable: ${e.message}. Reload without the pilot to use the original tester.`;}
}
