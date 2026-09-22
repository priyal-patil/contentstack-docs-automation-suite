import { chromium } from "playwright";
import fs from "fs";
import { appUrl, loadRuntimeEnv } from "./core/env";
loadRuntimeEnv();
const out:any[]=[]; const rec=(n:string,t:string,s:string,d="")=>{out.push({n,text:t,status:s,detail:d});
  console.log(`${s.toUpperCase().padEnd(11)} ${n} ${t}${d?"\n             "+d:""}`);};
const settle=async(p:any,ms=120000)=>{await p.waitForFunction(()=>!/Loading\.\.\./i.test(document.body.innerText||""),{timeout:ms}).catch(()=>{});await p.waitForTimeout(3500);};
const UID=process.argv[2];
const shot=async(p:any,n:string)=>{await p.screenshot({path:`reports/studio-demo/shots/${n}.png`}).catch(()=>{});};
(async()=>{
  const b=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const p=await (await b.newContext({storageState:"auth.json",viewport:{width:1920,height:1080}})).newPage();

  // ---- 1.2 create the "preview" environment
  await p.goto(appUrl(`/#!/stack/${UID}/settings/environments`),{waitUntil:"domcontentloaded",timeout:120000}); await settle(p);
  await p.locator('button:has-text("New Environment"), [data-test-id*="new-environment"], [data-test-id*="add-environment"]').first().click({timeout:30000});
  await p.waitForTimeout(3000);
  const envFields=await p.evaluate(()=>Array.from(document.querySelectorAll('input')).filter(e=>(e as HTMLElement).offsetParent!==null)
    .map(e=>({tid:e.getAttribute("data-test-id"),ph:e.getAttribute("placeholder"),name:e.getAttribute("name")})).slice(0,8));
  console.log("   env fields:", JSON.stringify(envFields));
  await p.locator('input[placeholder*="name" i], input[name="name"]').first().fill("preview").catch(()=>{});
  await shot(p,"step1-2b-new-env");
  await p.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Save")').last().click({timeout:20000}).catch(()=>{});
  await settle(p); await p.waitForTimeout(4000);
  const envs=await p.evaluate(()=>(document.body.innerText||"").replace(/\n+/g," | "));
  rec("1.2",'Add an environment named "preview"', /preview/i.test(envs)?"passed":"failed",
      `Environment list now contains "preview": ${/preview/i.test(envs)}`);

  // ---- 1.4 Tokens: navigate via the Settings menu, not a guessed URL
  await p.locator('a[aria-label="Settings"], [data-test-id="cms-nav-settings"]').first().click({timeout:30000}); await settle(p);
  const menu=await p.evaluate(()=>Array.from(document.querySelectorAll('a,li,button')).filter(e=>(e as HTMLElement).offsetParent!==null)
    .map(e=>(e.textContent||"").trim()).filter(t=>/token/i.test(t)&&t.length<26));
  console.log("   token menu entries:", JSON.stringify(menu));
  const dt=p.getByText(/^Delivery Tokens$/i).first();
  if(await dt.count()){ await dt.click({timeout:20000}); await settle(p); }
  console.log("   tokens url:", p.url().slice(-52));
  const addBtn=p.locator('button:has-text("Delivery Token"), [data-test-id*="add"], button:has-text("New")').first();
  const pageTxt=await p.evaluate(()=>(document.body.innerText||"").replace(/\n+/g," | ").slice(0,200));
  rec("1.4a","Stack → Settings → Tokens → + Delivery Token", await addBtn.count()?"passed":"failed",
      `Reached ${p.url().split("/settings/")[1]||"?"}. Controls: ${pageTxt.slice(0,120)}`);
  await shot(p,"step1-4a-tokens");

  if(await addBtn.count()){
    await addBtn.click({timeout:20000}); await p.waitForTimeout(3500);
    const drawer=await p.evaluate(()=>{const t=document.body.innerText||"";
      return { hasPreviewToken:/preview token/i.test(t), hasApiKey:/api key/i.test(t),
               hasScope:/environment/i.test(t), head:t.replace(/\n+/g," | ").slice(0,300) };});
    rec("1.4b","Scope it to preview; Preview Token created automatically on the same screen; Stack API Key visible at the top of the same drawer",
        (drawer.hasPreviewToken&&drawer.hasApiKey)?"passed":"partial",
        `In the create drawer — "Preview Token" mentioned: ${drawer.hasPreviewToken}; "API Key" visible: ${drawer.hasApiKey}; environment scope control: ${drawer.hasScope}. ${drawer.head.slice(0,150)}`);
    await shot(p,"step1-4b-token-drawer");
  }
  fs.writeFileSync("reports/studio-demo/step1b.json",JSON.stringify({uid:UID,steps:out},null,2));
  await b.close();
})();
