import {test,expect} from '@playwright/test';
const path='/tester/buypoint/?pilot=interfaces';
async function open(page){await page.goto(path);await expect(page.locator('#pilotStatus')).toContainText('FAIRSIGHT-INTERFACES-PILOT-1');}
async function product(page){await page.locator('#find').click();await expect(page.locator('#pilotSummary')).toContainText('Bartenura');}
async function chat(page,text){await page.locator('#pilotCommand').fill(text);await page.locator('#pilotChat button').first().click();}
test('chat and screen watch requests share one persistent alert, including retries',async({page})=>{
 await open(page);await product(page);await chat(page,'watch price');await expect(page.locator('#pilotWatch')).toContainText('1 local');await page.locator('#watch').click();
 await page.evaluate(async()=>{await window.fairsightPilot.dispatch('watch',undefined,'chat','retry-one');await window.fairsightPilot.dispatch('watch',undefined,'screen','retry-one');});
 const s=await page.evaluate(()=>window.fairsightPilot.getState());expect(Object.keys(s.alerts)).toHaveLength(1);expect(s.receipts.filter(r=>r.id==='retry-one')).toHaveLength(1);
 await page.reload();await expect(page.locator('#pilotWatch')).toContainText('1 local');
});
test('screen budget and target persist into conversational answer and restored evidence',async({page})=>{
 await open(page);await product(page);await page.locator('#pilotBudgetValue').fill('10');await page.locator('#pilotBudget button').click();await chat(page,'target 12');await expect(page.locator('#recommended')).toHaveText('$12.00');await expect(page.locator('#verdict')).toHaveText('BUY');
 await page.reload();await expect(page.locator('#pilotSummary')).toContainText('Budget: $10.00');await chat(page,'explain');await expect(page.locator('#pilotReply')).toContainText('Above your budget');await expect(page.locator('#pilotReply')).toContainText('Target: $12.00');
});
test('concurrent tabs retain both edits',async({page,context})=>{
 await open(page);const second=await context.newPage();await open(second);
 await Promise.all([page.evaluate(()=>window.fairsightPilot.dispatch('budget',20,'chat','concurrent-budget')),second.evaluate(()=>window.fairsightPilot.dispatch('explain',undefined,'screen','concurrent-explain'))]);
 const s=await page.evaluate(()=>window.fairsightPilot.getState());expect(s.budget).toBe(20);expect(s.receipts).toHaveLength(2);await expect(second.locator('#pilotSummary')).toContainText('$20.00');
});
test('outcome receipts distinguish failure and preserve unknown cost and accuracy',async({page})=>{
 await open(page);await chat(page,'watch price');await expect(page.locator('#pilotReply')).toContainText('Find a product first');await chat(page,'budget 15');await expect(page.locator('#pilotSummary')).toContainText('$15.00');
 const s=await page.evaluate(()=>window.fairsightPilot.getState());expect(s.receipts.map(r=>r.status)).toEqual(['failed','completed']);expect(s.receipts.every(r=>r.costUsd===null&&r.correctness==='not independently assessed')).toBe(true);expect(s.receipts[0].executionError).toBe(true);expect(s.receipts[0].helpNeeded).toBeNull();
});
test('request token reuse with changed payload fails without changing budget',async({page})=>{
 await open(page);const s=await page.evaluate(async()=>{await window.fairsightPilot.dispatch('budget',10,'chat','same');try{await window.fairsightPilot.dispatch('budget',999,'screen','same');}catch(e){return {message:e.message,state:await window.fairsightPilot.getState()};}});expect(s.message).toContain('different action');expect(s.state.budget).toBe(10);
});
test('voice transcript uses shared actions (mock speech recognizer)',async({page})=>{
 await page.addInitScript(()=>{window.SpeechRecognition=class{start(){this.onresult({results:[[{transcript:'budget 18'}]]});}};});await open(page);await page.locator('#pilotVoice').click();await expect(page.locator('#pilotSummary')).toContainText('$18.00');const s=await page.evaluate(()=>window.fairsightPilot.getState());expect(s.receipts[0].source).toBe('voice');
});
test('mobile pilot controls fit viewport and export contains outcome records',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await chat(page,'budget 25');await expect(page.locator('#pilotSummary')).toContainText('$25.00');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);const download=page.waitForEvent('download');await page.locator('#pilotExport').click();expect((await download).suggestedFilename()).toBe('fairsight-interface-pilot-results.json');
});
