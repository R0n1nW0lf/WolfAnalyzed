const fs=require('fs'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
fs.mkdirSync('output/wolfanalyze-1.4.7',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({acceptDownloads:true});
const errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
let evidence='From: sender@example.test\nTo: analyst@example.test\nSubject: Regression fixture\nReceived: by receiver.example.test with SMTP id 2026.10.06.18.22.03\nReceived: from relay.example.test [209.85.220.41] by receiver.example.test\nReceived: by relay.example.test\nReceived-SPF: pass; client-ip=209.85.220.41\nAuthentication-Results: receiver.example.test; spf=pass; dkim=pass; dmarc=pass\n\nFixture body';
if(process.argv[2]){
 await page.goto(require('url').pathToFileURL(require('path').resolve(process.argv[2])).href);
 evidence=await page.locator('section').filter({has:page.locator('h2',{hasText:'Raw Original'})}).locator('pre').textContent();
}
assert(evidence.includes('10.06.18.22'));
await page.goto(require('url').pathToFileURL(require('path').resolve('index.html')).href);
await page.locator('#input').fill(evidence);await page.locator('#analyzeBtn').click();
const checks=await page.evaluate(()=>{
 const rep=lastReport,summary=emailSummaryText(rep),working=highlightWorking(workingView(raw)),holder=document.createElement('div');holder.innerHTML=working;
 return {ips:rep.ips,hops:emailValues(rep.events[0],'received').length,actualHops:rep.events[0].fields.filter(([k])=>/^received_\d+$/.test(k)).length,nested:holder.querySelectorAll('mark mark').length,renderNested:results.querySelectorAll('mark mark').length,sameText:holder.textContent===raw,rawPreserved:rep.raw===raw,summary,ipCases:extractIPs('id x.2026.10.06.18.22.03 999.1.2.3 01.2.3.4 [192.168.1.2] src=10.0.0.1'),auth:authenticationSummary(parseEmail('Authentication-Results: mx.test; spf=pass; dkim=fail; dmarc=pass\nReceived-SPF: softfail\nDKIM-Signature: v=1; b=abc')),safe:highlight('<script>alert(1)</script> SMTP DENY Received-SPF: pass'),decoded:highlightWorking('[[WOLFDECODE:<img src=x>]]')};
});
assert.deepEqual(checks.ips,['209.85.220.41']);assert.equal(checks.hops,checks.actualHops);assert.equal(checks.nested,0);assert.equal(checks.renderNested,0);assert(checks.sameText&&checks.rawPreserved);assert.deepEqual(checks.ipCases,['192.168.1.2','10.0.0.1']);assert(checks.auth.includes('pass (Authentication-Results: mx.test)'));assert(checks.auth.includes('softfail (Received-SPF)'));assert(checks.auth.includes('fail (Authentication-Results: mx.test)'));assert(!checks.safe.includes('<script>'));assert(!checks.decoded.includes('<img'));
await page.locator('#reportName').fill('Heya Rwwesley!_v1.4.7');
let [download]=await Promise.all([page.waitForEvent('download'),page.locator('#saveHtml').click()]);await download.saveAs('output/wolfanalyze-1.4.7/Heya Rwwesley!_v1.4.7_Reports.html');
await page.locator('#input').fill('CONFIDENTIAL-EVIDENCE-MARKER');
[download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadOffline').click()]);assert.equal(download.suggestedFilename(),'WolfAnalyze_Phase1.4.7_Offline.html');await download.saveAs('output/wolfanalyze-1.4.7/WolfAnalyze_Phase1.4.7_Offline.html');
const offline=fs.readFileSync('output/wolfanalyze-1.4.7/WolfAnalyze_Phase1.4.7_Offline.html','utf8');assert(!offline.includes('CONFIDENTIAL-EVIDENCE-MARKER'));assert(!offline.includes('d9443c01a7336-2e604844d94'));
await page.goto(require('url').pathToFileURL(require('path').resolve('output/wolfanalyze-1.4.7/WolfAnalyze_Phase1.4.7_Offline.html')).href);assert.equal(await page.locator('#input').inputValue(),'');await page.locator('#sample').click();assert.equal(await page.locator('#cEvents').textContent(),'2');
await page.locator('#decode').check();assert.equal(await page.locator('#results mark mark').count(),0);
await page.goto(require('url').pathToFileURL(require('path').resolve('output/wolfanalyze-1.4.7/Heya Rwwesley!_v1.4.7_Reports.html')).href);assert.equal(await page.locator('mark mark').count(),0);assert.equal(await page.locator('section').filter({has:page.locator('h2',{hasText:'Raw Original'})}).locator('pre').textContent(),evidence);
await page.screenshot({path:'output/wolfanalyze-1.4.7/report-preview.png',fullPage:true});assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
fs.writeFileSync('output/wolfanalyze-1.4.7/validation.json',JSON.stringify({checks,errors,network,source:process.argv[2]?'Raw Original extracted from supplied HTML report':'Synthetic email regression fixture'},null,2));
console.log(JSON.stringify({ips:checks.ips,hops:checks.hops,nested:checks.nested,rawPreserved:checks.rawPreserved,offline:'passed',errors,network}));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
