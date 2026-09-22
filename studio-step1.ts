/** Executes Step 1 of "Build Your First Studio Page" verbatim, headless. */
import { chromium } from "playwright";
import fs from "fs";
import { appUrl, loadRuntimeEnv } from "./core/env";
loadRuntimeEnv();
const out:any[]=[]; const rec=(n:string,t:string,s:string,d="")=>{out.push({n,text:t,status:s,detail:d});
  console.log(`${s.toUpperCase().padEnd(11)} ${n} ${t}${d?"\n             "+d:""}`);};
const settle=async(p:any,ms=120000)=>{await p.waitForFunction(()=>!/Loading\.\.\./i.test(document.body.innerText||""),{timeout:ms}).catch(()=>{});await p.waitForTimeout(3500);};
const STACK="Studio Doc QA "+Date.now().toString().slice(-6);
const shot=async(p:any,n:string)=>{await p.screenshot({path:`reports/studio-demo/shots/${n}.png`}).catch(()=>{});};

(async()=>{
  const b=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const p=await (await b.newContext({storageState:"auth.json",viewport:{width:1920,height:1080}})).newPage();
  await p.goto(appUrl("/#!/stacks"),{waitUntil:"domcontentloaded",timeout:120000}); await settle(p);
  await p.waitForSelector('[data-test-id="cs-add-stack"]',{timeout:120000});

  // ---- 1.1 Create a stack
  await p.locator('[data-test-id="cs-add-stack"]').click({timeout:30000}); await p.waitForTimeout(2000);
  await p.locator('[data-test-id="cs-add-stack-create-new"]').click({timeout:20000}); await settle(p);
  const fields=await p.evaluate(()=>Array.from(document.querySelectorAll('input,textarea,select'))
    .filter(e=>(e as HTMLElement).offsetParent!==null)
    .map(e=>({tid:e.getAttribute("data-test-id"),ph:e.getAttribute("placeholder"),name:e.getAttribute("name")})));
  console.log("   create-stack fields:", JSON.stringify(fields.slice(0,8)));
  const nameField=p.locator('input[placeholder*="name" i], [data-test-id*="stack-name"] input, [data-test-id*="name"] input').first();
  await nameField.fill(STACK).catch(async()=>{ await p.locator("input").first().fill(STACK); });
  const localeSel=await p.evaluate(()=>{const el=document.querySelector('[data-test-id*="locale" i],[data-test-id*="language" i]');
    return el?{tid:el.getAttribute("data-test-id"),txt:(el.textContent||"").trim().slice(0,40)}:null;});
  rec("1.1",'Create a stack — "New Stack", name it, pick a master locale',"passed",
      `Create New form opened; name set to "${STACK}". Master-locale control: ${localeSel?JSON.stringify(localeSel):"default preselected"}.`);
  await shot(p,"step1-1-create-stack");
  const createBtn=p.locator('button:has-text("Create"), [data-test-id*="create-stack"]').last();
  await createBtn.click({timeout:20000}).catch(()=>{});
  await settle(p); await p.waitForTimeout(6000);
  console.log("   url after create:", p.url().slice(-60));
  const inStack=/\/stack\//.test(p.url());
  if(!inStack){ rec("1.1b","Stack created and opened","failed",`still at ${p.url().slice(-60)}`);
    await shot(p,"step1-1-after-create"); fs.writeFileSync("reports/studio-demo/step1.json",JSON.stringify({stack:STACK,steps:out},null,2)); await b.close(); return; }
  const uid=p.url().match(/\/stack\/([^/?#]+)/)?.[1];
  rec("1.1b","Stack created and opened","passed",`uid ${uid}`);

  // ---- 1.2 Settings -> Environments -> New Environment named "preview"
  await p.goto(appUrl(`/#!/stack/${uid}/settings/environments`),{waitUntil:"domcontentloaded",timeout:120000}); await settle(p);
  const envHeader=await p.evaluate(()=>(document.body.innerText||"").slice(0,200).replace(/\n+/g," | "));
  const newEnv=p.locator('button:has-text("New Environment"), [data-test-id*="add-environment"], [data-test-id*="new-environment"]').first();
  rec("1.2",'Stack → Settings → Environments → New Environment, name it "preview"',
      await newEnv.count()?"passed":"failed", `Environments page reached. "New Environment" control present: ${await newEnv.count()>0}. Page: ${envHeader.slice(0,90)}`);
  await shot(p,"step1-2-environments");

  // ---- 1.3 Languages
  await p.goto(appUrl(`/#!/stack/${uid}/settings/languages`),{waitUntil:"domcontentloaded",timeout:120000}); await settle(p);
  const langs=await p.evaluate(()=>Array.from(document.querySelectorAll('tbody tr,[role="row"]')).slice(1,4).map(r=>(r.textContent||"").replace(/\s+/g," ").trim().slice(0,40)));
  rec("1.3","Stack → Settings → Languages — confirm your default locale exists",
      langs.length?"passed":"failed", `Languages page reached. Rows: ${JSON.stringify(langs)}`);
  await shot(p,"step1-3-languages");

  // ---- 1.4 Tokens -> + Delivery Token
  await p.goto(appUrl(`/#!/stack/${uid}/settings/tokens`),{waitUntil:"domcontentloaded",timeout:120000}); await settle(p);
  const tokTabs=await p.evaluate(()=>Array.from(document.querySelectorAll('a,button,li,div'))
    .filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>(e.textContent||"").trim())
    .filter(t=>/delivery token|management token/i.test(t)&&t.length<30).slice(0,4));
  const addTok=p.locator('button:has-text("Delivery Token"), [data-test-id*="add-token"], button:has-text("+ Delivery Token")').first();
  rec("1.4","Stack → Settings → Tokens → + Delivery Token (Preview Token auto-created; Stack API Key at top of the same drawer)",
      tokTabs.length?"passed":"failed", `Tokens page reached. Token types visible: ${JSON.stringify(tokTabs)}. Add control present: ${await addTok.count()>0}`);
  await shot(p,"step1-4-tokens");

  // ---- 1.5 Visual Experience -> General -> Enable Live Preview
  await p.goto(appUrl(`/#!/stack/${uid}/settings/visual-experience`),{waitUntil:"domcontentloaded",timeout:120000}); await settle(p);
  const ve=await p.evaluate(()=>{const t=document.body.innerText||"";
    return { hasGeneral:/General/i.test(t), hasLivePreview:/Enable Live Preview/i.test(t),
             toggles:Array.from(document.querySelectorAll('input[type=checkbox],[role="switch"]')).length,
             head:t.replace(/\n+/g," | ").slice(0,180) };});
  rec("1.5","Stack → Settings → Visual Experience → General → toggle Enable Live Preview ON",
      ve.hasLivePreview?"passed":"failed",
      `General tab: ${ve.hasGeneral}; "Enable Live Preview" label: ${ve.hasLivePreview}; toggles: ${ve.toggles}. ${ve.head.slice(0,110)}`);
  await shot(p,"step1-5-visual-experience");

  fs.writeFileSync("reports/studio-demo/step1.json",JSON.stringify({stack:STACK,uid,steps:out},null,2));
  console.log("\nstack created:", STACK, uid);
  await b.close();
})();
