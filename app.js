/* Almindhry Email Fraud Check — runs fully in the browser, reads public DNS via Google Public DNS. Nothing is stored. */
(function(){
"use strict";
const WA_NUMBER = "601123109560";
const SITE = "almindhrybuilds.me/check";
const LANG = (document.documentElement.lang||"en").slice(0,2);
const RTL = document.documentElement.dir === "rtl";

const I18N = {
en:{
  ui:{checking:"Scanning…",run:"Run the check",invalid:"Type a domain like yourcompany.com",dnsErr:"Couldn't reach Google Public DNS. Check your connection and try again.",checked:"Checked",found:"Registered",copied:"Link copied"},
  titles:{dmarc:"DMARC · the blocker",spf:"SPF · allowed senders",dkim:"DKIM · signature",mx:"Mail provider",ll:"Lookalike domains"},
  dm:{missing:["Missing","No DMARC record. Receivers get no instruction to block email that fakes your address."],broken:["2 records: broken","There are two DMARC records. Receivers ignore both, so nothing is enforced."],none:["Watch only (p=none)","Your domain watches but asks receivers to do nothing. Fake emails are delivered."],quarantine:["Quarantine","Fakes go to the spam folder. Better, but a customer can still open them from spam."],rejectPartial:[p=>`Reject (${p}%)`,p=>`Only ${p}% of fakes are refused; the rest go to spam.`],reject:["Reject","Fake emails using your domain are refused. This is the strongest setting."]},
  spf:{missing:["Missing","No SPF record. Any server can claim to send for you."],broken:[n=>`${n} records: broken`,"More than one SPF record makes SPF fail for every email, including your real ones."],plusall:["Dangerous (+all)","'+all' approves every server on the internet to send as you."],strict:["Strict (-all)","Only listed servers may send. Good."],soft:["Set (~all)","Listed servers are approved; others are marked suspicious. Strong once DMARC enforces it."],weak:["Weak","The record doesn't end with ~all or -all, so unknown senders aren't flagged."],toomany:["Over the limit",n=>`About ${n} DNS lookups; the limit is 10. SPF can fail for your real email.`]},
  dk:{found:["Found",s=>`Signing key found (${s}).`],notfound:["Not on common names","We checked the usual DKIM names and found none. Your provider may use a custom name, or signing is off."]},
  mx:{provider:["Receives email",p=>`Email is hosted with ${p}.`],host:["Receives email",h=>`Email is hosted on ${h}.`],nomail:["No mail","This domain doesn't receive email. It can still be faked, so it should publish 'v=spf1 -all' and DMARC reject."]},
  ll:{none:["None found",n=>`We tried ${n} near-identical names (typos, swapped letters, other endings). None are registered by an outsider right now.`],some:[k=>`${k} registered`,(k,n)=>`Of ${n} near-identical names we tried, ${k} ${k===1?"is":"are"} registered with different name servers from yours. Many are harmless; any one could send convincing fake invoices.`],mine:"Registered on your own name servers (likely yours):"},
  verdict:{bad:[d=>`Yes. Anyone can send email as @${d}`,"A fake invoice “from you” with new bank details isn't stopped by your domain. Your customers' mail servers have no instruction to block it."],warn:[()=>"Partly protected","Fakes are filtered, not fully refused. One more step closes it."],good:[()=>"Fake emails in your name are blocked","Your DMARC policy tells Gmail, Outlook and others to refuse forged email. Keep it monitored: switching hosting can break it."],label:d=>`Result for ${d}`},
  nx:["This domain doesn't exist","Check the spelling, or use the part after the @ in your work email."],
  score:["Protection","Our scoring of public DNS settings, out of 100."],
  sim:{title:"The fake invoice a fraudster could send as you, today",from:"From",to:"To",toVal:"your customer",subject:"Invoice 2291: our bank details have changed",body:"Dear customer, please use our new account for this payment. The old one is closed.",src:"Fraudster",dst:"Customer's inbox",stamp:{bad:"DELIVERED TO INBOX",warn:"SENT TO SPAM",good:"REJECTED"},note:{bad:"Nothing in your domain's settings tells the receiving server to stop this email.",warn:"It lands in spam. Some customers still open spam when they're expecting an invoice.",good:"The receiving server checks your DMARC policy and refuses it. Your customer never sees it."}},
  cta:{badH:d=>`Get ${d} locked down`,badP:"Done in stages so your own invoices never bounce. You pay only after this same public check shows fake emails are blocked.",badWa:"Send this result on WhatsApp",goodH:"Protected. Want it to stay that way?",goodP:"The monthly watch re-checks these settings and alerts you on WhatsApp the day a new lookalike of your domain is registered.",goodWa:"Ask about the monthly watch",save:"Save report image",copy:"Copy link"},
  wa:{main:"Hello Muhammad, I'd like my company's email checked and locked down.",bad:(d,s)=>`Hello Muhammad, I checked ${d} on your Email Fraud Check: ${s}. Can you help us fix it?`,good:(d,s)=>`Hello Muhammad, I checked ${d} on your Email Fraud Check (${s}). Tell me about the monthly watch.`},
  report:{title:"EMAIL FRAUD REPORT",date:"Checked"}
},
ar:{
  ui:{checking:"جارٍ الفحص…",run:"ابدأ الفحص",invalid:"اكتب نطاقًا مثل yourcompany.com",dnsErr:"تعذّر الوصول إلى Google Public DNS. تحقق من اتصالك وحاول مجددًا.",checked:"تم فحص",found:"مسجّلة",copied:"تم نسخ الرابط"},
  titles:{dmarc:"DMARC · الحاجب",spf:"SPF · المرسلون المسموح لهم",dkim:"DKIM · التوقيع",mx:"مزود البريد",ll:"النطاقات المشابهة"},
  dm:{missing:["غير موجود","لا يوجد سجل DMARC. الخوادم المستقبِلة لا تتلقى أي تعليمات لحجب البريد الذي ينتحل عنوانك."],broken:["سجلّان: معطّل","يوجد سجلّا DMARC. تتجاهل الخوادم كليهما، فلا يُطبَّق شيء."],none:["مراقبة فقط (p=none)","نطاقك يراقب لكنه يطلب من الخوادم ألا تفعل شيئًا. الرسائل المزيفة تُسلَّم."],quarantine:["عزل","الرسائل المزيفة تذهب إلى البريد العشوائي. أفضل، لكن العميل قد يفتحها من هناك."],rejectPartial:[p=>`رفض (${p}%)`,p=>`تُرفض ${p}% فقط من الرسائل المزيفة، والباقي يذهب إلى العشوائي.`],reject:["رفض","الرسائل المزيفة التي تستخدم نطاقك تُرفض. هذا أقوى إعداد."]},
  spf:{missing:["غير موجود","لا يوجد سجل SPF. أي خادم يستطيع الادعاء بأنه يرسل باسمك."],broken:[n=>`${n} سجلات: معطّل`,"وجود أكثر من سجل SPF يجعل SPF يفشل لكل رسالة، حتى رسائلك الحقيقية."],plusall:["خطير (+all)","الإعداد ‎+all يسمح لكل خوادم الإنترنت بالإرسال باسمك."],strict:["صارم (-all)","الخوادم المدرجة فقط يمكنها الإرسال. جيد."],soft:["مضبوط (~all)","الخوادم المدرجة معتمدة، والبقية تُعلَّم كمشبوهة. قوي عندما يفرضه DMARC."],weak:["ضعيف","السجل لا ينتهي بـ ~all أو -all، فلا يُعلَّم المرسلون المجهولون."],toomany:["تجاوز الحد",n=>`نحو ${n} عمليات بحث DNS، والحد الأقصى 10. قد يفشل SPF لبريدك الحقيقي.`]},
  dk:{found:["موجود",s=>`تم العثور على مفتاح توقيع (${s}).`],notfound:["غير موجود بالأسماء الشائعة","فحصنا أسماء DKIM المعتادة ولم نجد شيئًا. قد يستخدم مزودك اسمًا مخصصًا، أو أن التوقيع غير مفعّل."]},
  mx:{provider:["يستقبل البريد",p=>`البريد مستضاف لدى ${p}.`],host:["يستقبل البريد",h=>`البريد مستضاف على ${h}.`],nomail:["لا بريد","هذا النطاق لا يستقبل بريدًا، لكن يمكن انتحاله رغم ذلك؛ لذا يجب أن ينشر v=spf1 -all وسياسة DMARC reject."]},
  ll:{none:["لا يوجد",n=>`جرّبنا ${n} اسمًا شبه مطابق (أخطاء إملائية، حروف مبدّلة، امتدادات أخرى). لا يوجد منها حاليًا ما سجّله طرف آخر.`],some:[k=>`${k} مسجّلة`,(k,n)=>`من بين ${n} اسمًا شبه مطابق جرّبناها، ${k} مسجّلة بخوادم أسماء مختلفة عن خوادمك. كثير منها غير ضار، لكن أيًا منها يمكن أن يرسل فواتير مزيفة مقنعة.`],mine:"مسجّلة على خوادم أسمائك (غالبًا تخصك):"},
  verdict:{bad:[d=>`نعم. يستطيع أي شخص إرسال بريد باسم @${d}`,"فاتورة مزيفة «منك» ببيانات بنكية جديدة لا يوقفها نطاقك. خوادم بريد عملائك لا تملك أي تعليمات لحجبها."],warn:[()=>"محمي جزئيًا","الرسائل المزيفة تُفلتر ولا تُرفض بالكامل. خطوة واحدة أخرى تُغلق الثغرة."],good:[()=>"الرسائل المزيفة باسمك محجوبة","سياسة DMARC لديك تطلب من Gmail وOutlook وغيرهما رفض البريد المزوّر. أبقِها تحت المراقبة: تغيير الاستضافة قد يعطّلها."],label:d=>`نتيجة ${d}`},
  nx:["هذا النطاق غير موجود","تحقق من الكتابة، أو استخدم الجزء الذي بعد @ في بريد عملك."],
  score:["الحماية","تقييمنا لإعدادات DNS العامة، من 100."],
  sim:{title:"الفاتورة المزيفة التي يستطيع محتال إرسالها باسمك اليوم",from:"From",to:"To",toVal:"your customer",subject:"الفاتورة 2291: تغيّرت بياناتنا البنكية",body:"عزيزي العميل، يرجى استخدام حسابنا الجديد لهذه الدفعة. الحساب القديم مُغلق.",src:"المحتال",dst:"صندوق عميلك",stamp:{bad:"وصلت إلى صندوق الوارد",warn:"ذهبت إلى العشوائي",good:"مرفوضة"},note:{bad:"لا شيء في إعدادات نطاقك يطلب من الخادم المستقبِل إيقاف هذه الرسالة.",warn:"تصل إلى العشوائي. بعض العملاء يفتحون العشوائي حين ينتظرون فاتورة.",good:"الخادم المستقبِل يفحص سياسة DMARC لديك ويرفضها. عميلك لن يراها أبدًا."}},
  cta:{badH:d=>`أحكِم حماية ${d}`,badP:"على مراحل حتى لا ترتد فواتيرك أبدًا. لا تدفع إلا بعد أن يُظهر هذا الفحص العام نفسه أن الرسائل المزيفة محجوبة.",badWa:"أرسل النتيجة عبر واتساب",goodH:"محمي. تريد أن يبقى كذلك؟",goodP:"المتابعة الشهرية تعيد فحص هذه الإعدادات وتنبهك عبر واتساب يوم تسجيل نطاق مشابه جديد.",goodWa:"اسأل عن المتابعة الشهرية",save:"احفظ صورة التقرير",copy:"انسخ الرابط"},
  wa:{main:"مرحبًا محمد، أريد فحص بريد شركتي وإحكام حمايته.",bad:(d,s)=>`مرحبًا محمد، فحصت ${d} على أداة فحص احتيال البريد: ${s}. هل يمكنك مساعدتنا في الإصلاح؟`,good:(d,s)=>`مرحبًا محمد، فحصت ${d} على أداة فحص احتيال البريد (${s}). أخبرني عن المتابعة الشهرية.`},
  report:{title:"تقرير احتيال البريد الإلكتروني",date:"تاريخ الفحص"}
},
sw:{
  ui:{checking:"Inakagua…",run:"Anza ukaguzi",invalid:"Andika domain kama kampuniyako.co.tz",dnsErr:"Imeshindikana kufikia Google Public DNS. Hakiki mtandao wako ujaribu tena.",checked:"Imekagua",found:"Zimesajiliwa",copied:"Kiungo kimenakiliwa"},
  titles:{dmarc:"DMARC · kizuizi",spf:"SPF · watumaji walioruhusiwa",dkim:"DKIM · sahihi",mx:"Mtoa huduma wa barua",ll:"Domain zinazofanana"},
  dm:{missing:["Haipo","Hakuna rekodi ya DMARC. Seva zinazopokea hazipati maelekezo ya kuzuia barua inayoghushi anwani yako."],broken:["Rekodi 2: imeharibika","Kuna rekodi mbili za DMARC. Seva zinazipuuza zote, kwa hiyo hakuna kinachotekelezwa."],none:["Uangalizi tu (p=none)","Domain yako inaangalia tu lakini inaziomba seva zisifanye kitu. Barua bandia zinafika."],quarantine:["Karantini","Barua bandia zinaenda spam. Ni bora, lakini mteja bado anaweza kuzifungua kutoka spam."],rejectPartial:[p=>`Kataa (${p}%)`,p=>`Ni ${p}% tu ya barua bandia zinazokataliwa; zilizobaki zinaenda spam.`],reject:["Kataa","Barua bandia zinazotumia domain yako zinakataliwa. Huu ndio mpangilio imara zaidi."]},
  spf:{missing:["Haipo","Hakuna rekodi ya SPF. Seva yoyote inaweza kudai inatuma kwa niaba yako."],broken:[n=>`Rekodi ${n}: imeharibika`,"Rekodi zaidi ya moja za SPF zinafanya SPF ishindwe kwa kila barua, hata zile halali."],plusall:["Hatari (+all)","'+all' inaruhusu kila seva duniani kutuma kwa jina lako."],strict:["Imara (-all)","Seva zilizoorodheshwa pekee ndizo zinaweza kutuma. Vizuri."],soft:["Imewekwa (~all)","Seva zilizoorodheshwa zimeidhinishwa; nyingine zinawekwa alama ya shaka. Imara DMARC ikiitekeleza."],weak:["Dhaifu","Rekodi haimalizii na ~all au -all, kwa hiyo watumaji wasiojulikana hawawekewi alama."],toomany:["Imezidi kikomo",n=>`Takriban maombi ${n} ya DNS; kikomo ni 10. SPF inaweza kushindwa kwa barua zako halali.`]},
  dk:{found:["Ipo",s=>`Ufunguo wa sahihi umepatikana (${s}).`],notfound:["Haipo kwa majina ya kawaida","Tumekagua majina ya kawaida ya DKIM na hatukupata. Mtoa huduma wako anaweza kutumia jina maalum, au sahihi haijawashwa."]},
  mx:{provider:["Inapokea barua",p=>`Barua pepe zinahifadhiwa na ${p}.`],host:["Inapokea barua",h=>`Barua pepe zinahifadhiwa kwenye ${h}.`],nomail:["Haipokei barua","Domain hii haipokei barua pepe, lakini bado inaweza kughushiwa; iweke 'v=spf1 -all' na DMARC reject."]},
  ll:{none:["Hakuna",n=>`Tumejaribu majina ${n} yanayofanana karibu kabisa (makosa ya tahajia, herufi zilizobadilishana, viambishi vingine). Hakuna lililosajiliwa na mtu mwingine kwa sasa.`],some:[k=>`${k} zimesajiliwa`,(k,n)=>`Kati ya majina ${n} tuliyojaribu, ${k} yamesajiliwa kwa name server tofauti na zako. Mengi hayana madhara, lakini lolote linaweza kutuma ankara bandia zinazoaminika.`],mine:"Zimesajiliwa kwenye name server zako (huenda ni zako):"},
  verdict:{bad:[d=>`Ndiyo. Mtu yeyote anaweza kutuma barua kama @${d}`,"Ankara bandia “kutoka kwako” yenye taarifa mpya za benki haizuiwi na domain yako. Seva za barua za wateja wako hazina maelekezo ya kuizuia."],warn:[()=>"Umelindwa kiasi","Barua bandia zinachujwa, hazikataliwi kabisa. Hatua moja zaidi inafunga mwanya."],good:[()=>"Barua bandia kwa jina lako zinazuiwa","Sera yako ya DMARC inaziambia Gmail, Outlook na nyinginezo zikatae barua za kughushi. Endelea kuifuatilia: kubadilisha hosting kunaweza kuiharibu."],label:d=>`Matokeo ya ${d}`},
  nx:["Domain hii haipo","Hakiki tahajia, au tumia sehemu iliyo baada ya @ kwenye barua pepe ya kazini."],
  score:["Ulinzi","Tathmini yetu ya mipangilio ya umma ya DNS, kati ya 100."],
  sim:{title:"Ankara bandia ambayo tapeli anaweza kutuma kwa jina lako leo",from:"From",to:"To",toVal:"your customer",subject:"Ankara 2291: taarifa zetu za benki zimebadilika",body:"Mpendwa mteja, tafadhali tumia akaunti yetu mpya kwa malipo haya. Ile ya zamani imefungwa.",src:"Tapeli",dst:"Inbox ya mteja",stamp:{bad:"IMEFIKA INBOX",warn:"IMEENDA SPAM",good:"IMEKATALIWA"},note:{bad:"Hakuna kitu kwenye mipangilio ya domain yako kinachoiambia seva inayopokea isimamishe barua hii.",warn:"Inafika spam. Baadhi ya wateja hufungua spam wanapotarajia ankara.",good:"Seva inayopokea inakagua sera yako ya DMARC na kuikataa. Mteja wako haioni kamwe."}},
  cta:{badH:d=>`Linda ${d} kikamilifu`,badP:"Kwa hatua, ili ankara zako halali zisirudi kamwe. Unalipa tu baada ya ukaguzi huu huu wa umma kuonyesha barua bandia zinazuiwa.",badWa:"Tuma matokeo haya WhatsApp",goodH:"Umelindwa. Unataka ibaki hivyo?",goodP:"Uangalizi wa kila mwezi unakagua mipangilio hii upya na kukujulisha WhatsApp siku domain inayofanana na yako ikisajiliwa.",goodWa:"Uliza kuhusu uangalizi wa kila mwezi",save:"Hifadhi picha ya ripoti",copy:"Nakili kiungo"},
  wa:{main:"Habari Muhammad, nataka barua pepe za kampuni yangu zikaguliwe na kulindwa.",bad:(d,s)=>`Habari Muhammad, nimekagua ${d} kwenye Email Fraud Check yako: ${s}. Unaweza kutusaidia kurekebisha?`,good:(d,s)=>`Habari Muhammad, nimekagua ${d} kwenye Email Fraud Check yako (${s}). Nieleze kuhusu uangalizi wa kila mwezi.`},
  report:{title:"RIPOTI YA UTAPELI WA BARUA PEPE",date:"Imekaguliwa"}
}};
const T = I18N[LANG] || I18N.en;
const v = (x,...a) => typeof x === "function" ? x(...a) : x;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const waLink = txt => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`;
document.querySelectorAll("[data-wa-main]").forEach(a=>a.href=waLink(T.wa.main));
const yr=$("#yr"); if(yr) yr.textContent=new Date().getFullYear();

/* ---------- background network ---------- */
(function bg(){
  const c=$("#bg"); if(!c) return; const x=c.getContext("2d"); let W,H,P=[],raf;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  function size(){W=c.width=innerWidth*dpr;H=c.height=innerHeight*dpr;const n=Math.round(Math.min(90,innerWidth/16));P=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25*dpr,vy:(Math.random()-.5)*.25*dpr}));}
  function draw(){
    x.clearRect(0,0,W,H);
    const g=110*dpr;
    for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;}
    for(let i=0;i<P.length;i++){for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<g){x.strokeStyle=`rgba(110,150,255,${.13*(1-d/g)})`;x.lineWidth=dpr;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}}}
    for(const p of P){x.fillStyle="rgba(140,200,255,.55)";x.fillRect(p.x,p.y,1.6*dpr,1.6*dpr);}
    if(!reduced) raf=requestAnimationFrame(draw);
  }
  size(); draw(); addEventListener("resize",()=>{cancelAnimationFrame(raf);size();draw();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(raf);else if(!reduced)draw();});
})();

/* ---------- reveal ---------- */
const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12}):null;
document.querySelectorAll(".reveal").forEach(el=>io?io.observe(el):el.classList.add("in"));

/* ---------- DNS helpers ---------- */
const MULTI=["co.tz","or.tz","ac.tz","go.tz","ne.tz","com.om","co.om","net.om","org.om","co.ae","net.ae","org.ae","com.sa","net.sa","co.uk","org.uk","com.my","co.ke","or.ke","com.qa","com.bh","com.kw","co.za","com.au","co.in","com.eg","co.ug","co.rw"];
function clean(s){s=(s||"").trim().toLowerCase();if(s.includes("@"))s=s.split("@").pop();s=s.replace(/^[a-z]+:\/\//,"").split(/[\/?#:\s]/)[0].replace(/^www\./,"").replace(/\.$/,"");return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s)?s:null;}
function splitDomain(d){for(const m of MULTI)if(d.endsWith("."+m)){const l=d.slice(0,-(m.length+1));if(!l.includes("."))return[l,m];}const p=d.split(".");return[p.slice(0,-1).join("."),p[p.length-1]];}
async function dns(name,type){const r=await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,{headers:{accept:"application/dns-json"}});if(!r.ok)throw new Error("dns");return r.json();}
const txts=j=>(j.Answer||[]).filter(a=>a.type===16).map(a=>a.data.replace(/^"|"$/g,"").replace(/"\s*"/g,""));
const PROVIDERS=[[/protection\.outlook\.com|outlook\.com/,"Microsoft 365"],[/google\.com|googlemail\.com/,"Google Workspace"],[/zoho\./,"Zoho Mail"],[/hostinger/,"Hostinger"],[/titan\.email/,"Titan"],[/secureserver\.net/,"GoDaddy"],[/mimecast/,"Mimecast"],[/pphosted/,"Proofpoint"],[/emailsrvr/,"Rackspace"],[/yandex/,"Yandex"],[/icewarp/,"IceWarp"],[/barracuda/,"Barracuda"],[/mailgun/,"Mailgun"],[/websitewelcome|hostgator/,"HostGator"],[/bluehost/,"Bluehost"],[/privateemail|registrar-servers/,"Namecheap"],[/emirates\.net\.ae|etisalat/,"Etisalat"],[/omantel/,"Omantel"],[/jellyfish\.systems/,"Namecheap (shared hosting)"]];
const providerOf=mx=>{for(const[re,n]of PROVIDERS)if(re.test(mx))return n;return null;};
function variants(L,tld){
  const out=new Set(),homo={o:"0",l:"1",i:"l",e:"3",a:"4",s:"5"};
  for(let i=0;i<L.length;i++){out.add(L.slice(0,i)+L.slice(i+1));out.add(L.slice(0,i)+L[i]+L.slice(i));}
  for(let i=0;i<L.length-1;i++)out.add(L.slice(0,i)+L[i+1]+L[i]+L.slice(i+2));
  for(let i=0;i<L.length;i++){const h=homo[L[i]];if(h)out.add(L.slice(0,i)+h+L.slice(i+1));}
  out.add(L.replace(/m/g,"rn"));out.add(L.replace(/rn/g,"m"));out.add(L.replace(/w/g,"vv"));
  const doms=new Set();
  out.forEach(s=>{if(s&&s!==L&&s.length>2&&!s.startsWith("-")&&!s.endsWith("-"))doms.add(s+"."+tld);});
  ["com","net","co","org","ae","om","info","biz","co.tz"].forEach(t=>{if(t!==tld)doms.add(L+"."+t);});
  return[...doms].slice(0,72);
}

/* ---------- console + radar ---------- */
const term=$("#term"), bar=$("#bar");
let t0=0;
function log(html){const el=document.createElement("div");el.className="l";const t=((performance.now()-t0)/1000).toFixed(2).padStart(5,"0");el.innerHTML=`<span class="t">[${t}s]</span> ${html}`;const cur=term.querySelector(".cursor-line");term.insertBefore(el,cur);term.scrollTop=term.scrollHeight;}
const prog=p=>{bar.style.width=p+"%";};
const radar=(function(){
  const c=$("#radar"); if(!c) return {start(){},stop(){},blip(){},reset(){}};
  const x=c.getContext("2d"); const dpr=Math.min(2,window.devicePixelRatio||1); let S, ang=0, raf=null, B=[];
  function size(){const r=c.getBoundingClientRect();S=c.width=c.height=Math.round(r.width*dpr);}
  function frame(){
    if(!S) size(); const cx=S/2, R=S/2-4*dpr;
    x.clearRect(0,0,S,S);
    x.strokeStyle="rgba(56,225,255,.18)";x.lineWidth=dpr;
    for(let i=1;i<=4;i++){x.beginPath();x.arc(cx,cx,R*i/4,0,Math.PI*2);x.stroke();}
    x.beginPath();x.moveTo(cx-R,cx);x.lineTo(cx+R,cx);x.moveTo(cx,cx-R);x.lineTo(cx,cx+R);x.stroke();
    for(let k=0;k<28;k++){const a=ang-k*0.03;x.strokeStyle=`rgba(56,225,255,${.32*(1-k/28)})`;x.lineWidth=3*dpr;x.beginPath();x.moveTo(cx,cx);x.lineTo(cx+Math.cos(a)*R,cx+Math.sin(a)*R);x.stroke();}
    for(const b of B){const age=Math.max(0,1-((ang-b.a+Math.PI*2)%(Math.PI*2))/(Math.PI*2));const px=cx+Math.cos(b.a)*R*b.r,py=cx+Math.sin(b.a)*R*b.r;
      if(b.hit){x.fillStyle=`rgba(255,77,106,${.45+.55*age})`;x.beginPath();x.arc(px,py,4.2*dpr,0,Math.PI*2);x.fill();x.strokeStyle=`rgba(255,77,106,${.5*age})`;x.beginPath();x.arc(px,py,(7+6*age)*dpr,0,Math.PI*2);x.stroke();}
      else{x.fillStyle=`rgba(120,200,255,${.12+.3*age})`;x.fillRect(px-1*dpr,py-1*dpr,2*dpr,2*dpr);}}
    x.fillStyle="#38e1ff";x.beginPath();x.arc(cx,cx,3*dpr,0,Math.PI*2);x.fill();
    ang=(ang+0.045)%(Math.PI*2);
    raf=requestAnimationFrame(frame);
  }
  return{start(){size();if(!raf)frame();},stop(){cancelAnimationFrame(raf);raf=null;},blip(hit){B.push({a:Math.random()*Math.PI*2,r:.18+Math.random()*.78,hit});},reset(){B=[];}};
})();

/* ---------- analysis ---------- */
function analyze(d,r){
  const A={d};
  // DMARC
  if(r.dmarc.length>1){A.dm={k:"broken",cls:"bad",pts:0};}
  else if(r.dmarc.length===1){const t=r.dmarc[0];const m=t.match(/(?:^|;)\s*p\s*=\s*(\w+)/i);const pol=m?m[1].toLowerCase():"none";const pm=t.match(/pct\s*=\s*(\d+)/i);const pct=pm?+pm[1]:100;
    if(pol==="reject"&&pct>=100)A.dm={k:"reject",cls:"good",pts:50};
    else if(pol==="reject")A.dm={k:"rejectPartial",cls:"warn",pts:40,arg:pct};
    else if(pol==="quarantine")A.dm={k:"quarantine",cls:"warn",pts:32};
    else A.dm={k:"none",cls:"bad",pts:8};
    A.dm.raw=t;}
  else A.dm={k:"missing",cls:"bad",pts:0};
  // SPF
  if(r.spf.length>1)A.spf={k:"broken",cls:"bad",pts:0,arg:r.spf.length};
  else if(r.spf.length===1){const s=r.spf[0];const n=(s.match(/(?:^|\s)[+\-~?]?(include:|a(?=[\s:\/]|$)|mx(?=[\s:\/]|$)|ptr|exists:|redirect=)/gi)||[]).length;
    if(/(^|\s)\+?all\b/i.test(s)&&!/[-~?]all\b/i.test(s))A.spf={k:"plusall",cls:"bad",pts:0};
    else if(n>10)A.spf={k:"toomany",cls:"bad",pts:6,arg:n};
    else if(/-all\b/i.test(s))A.spf={k:"strict",cls:"good",pts:20};
    else if(/~all\b/i.test(s))A.spf={k:"soft",cls:"good",pts:20};
    else A.spf={k:"weak",cls:"warn",pts:10};
    A.spf.raw=s;}
  else A.spf={k:"missing",cls:"bad",pts:0};
  // DKIM
  A.dk=r.dkim.length?{k:"found",cls:"good",pts:15,arg:r.dkim.join(", ")}:{k:"notfound",cls:"info",pts:6};
  // MX
  const prov=[...new Set(r.mxs.map(providerOf).filter(Boolean))];
  A.mx=!r.mxs.length?{k:"nomail",cls:"warn"}:prov.length?{k:"provider",cls:"info",arg:prov.join(", ")}:{k:"host",cls:"info",arg:r.mxs[0]};
  // lookalikes
  A.others=r.found.filter(f=>!f.mine); A.mine=r.found.filter(f=>f.mine); A.checked=r.checked;
  const k=A.others.length; A.ll=k?{k:"some",cls:k>3?"bad":"warn",pts:k>3?4:9}:{k:"none",cls:"good",pts:15};
  A.v=A.dm.cls==="good"?"good":A.dm.cls==="warn"?"warn":"bad";
  // without an enforcing DMARC policy the other settings can't stop a fake, so the score is capped
  A.score=Math.min(A.dm.pts+A.spf.pts+A.dk.pts+A.ll.pts,{bad:35,warn:75,good:100}[A.v]);
  return A;
}
const pill=(grp,o)=>v(T[grp][o.k][0],o.arg,o.arg);
const text=(grp,o,extra)=>v(T[grp][o.k][1],o.arg,extra);

/* ---------- run ---------- */
let busy=false, last=null;
const form=$("#f"), input=$("#d"), go=$("#go");
form.addEventListener("submit",e=>{e.preventDefault();run();});
async function run(){
  if(busy)return;
  const d=clean(input.value);
  if(!d){input.value="";input.placeholder=T.ui.invalid;input.focus();return;}
  busy=true;go.disabled=true;go.querySelector("span").textContent=T.ui.checking;
  try{history.replaceState(null,"","?d="+d);}catch(e){}
  ["#sim","#report"].forEach(s=>$(s).style.display="none");
  $("#ops").style.display="block"; term.querySelectorAll(".l").forEach(n=>n.remove()); prog(0);
  radar.reset(); radar.start(); t0=performance.now();
  $("#llc").textContent="0"; $("#llh").textContent="0";
  $("#ops").scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
  try{
    log(`<span class="hi">target</span> ${esc(d)}`); await sleep(250);
    log(`resolving NS ${esc(d)} …`);
    const [ns,mx,txt,dm]=await Promise.all([dns(d,"NS"),dns(d,"MX"),dns(d,"TXT"),dns("_dmarc."+d,"TXT")]);
    prog(18);
    if(ns.Status===3){log(`<span class="bad">NXDOMAIN</span> domain does not exist`);prog(100);radar.stop();showNX(d);return;}
    log(`NS  <span class="ok">✓</span> ${(ns.Answer||[]).length} name server(s)`); await sleep(160);
    const mxs=(mx.Answer||[]).filter(a=>a.type===15).map(a=>a.data.split(" ").pop().replace(/\.$/,"").toLowerCase());
    log(mxs.length?`MX  <span class="ok">✓</span> ${esc(mxs[0])}${mxs.length>1?` +${mxs.length-1}`:""}`:`MX  <span class="warn">—</span> no mail servers`); await sleep(160);
    const spf=txts(txt).filter(t=>/^v=spf1/i.test(t));
    log(spf.length===1?`SPF <span class="ok">✓</span> ${esc(spf[0].slice(0,90))}${spf[0].length>90?"…":""}`:spf.length?`SPF <span class="bad">✕</span> ${spf.length} records (conflict)`:`SPF <span class="bad">✕</span> not found`); await sleep(160);
    const dmarc=txts(dm).filter(t=>/^v=dmarc1/i.test(t));
    log(dmarc.length?`DMARC ${/p\s*=\s*reject/i.test(dmarc[0])?'<span class="ok">✓</span>':/p\s*=\s*quarantine/i.test(dmarc[0])?'<span class="warn">~</span>':'<span class="bad">✕</span>'} ${esc(dmarc[0].slice(0,90))}`:`DMARC <span class="bad">✕</span> no policy published`); prog(34); await sleep(160);
    log(`probing DKIM selectors …`);
    const sels=["selector1","selector2","google","default","k1","s1","s2","dkim","mail","zmail","titan1","hostingermail1","mxvault"];
    const dk=await Promise.all(sels.map(s=>dns(s+"._domainkey."+d,"TXT").then(j=>((j.Answer||[]).some(a=>/p=|v=dkim1/i.test(a.data)||a.type===5))?s:null).catch(()=>null)));
    const dkim=dk.filter(Boolean);
    log(dkim.length?`DKIM <span class="ok">✓</span> ${dkim.join(", ")}`:`DKIM <span class="warn">?</span> none on ${sels.length} common selectors`); prog(46);
    const [label,tld]=splitDomain(d); const vs=variants(label,tld);
    log(`generating ${vs.length} lookalike candidates · scanning …`);
    const found=[],q=[...vs];let done=0;
    async function worker(){while(q.length){const c=q.shift();let hit=false;try{const j=await dns(c,"NS");if(j.Status===0&&(j.Answer||[]).length){hit=true;found.push({v:c,ns:(j.Answer||[]).map(a=>a.data.toLowerCase()).join(" ")});}}catch(e){}
      done++;radar.blip(hit);$("#llc").textContent=done;if(hit){$("#llh").textContent=found.length;log(`<span class="bad">! registered</span> ${esc(c)}`);}prog(46+Math.round(52*done/vs.length));}}
    await Promise.all(Array.from({length:6},worker));
    const myNs=(ns.Answer||[]).map(a=>a.data.toLowerCase());
    found.forEach(f=>f.mine=myNs.some(n=>f.ns.includes(n)));
    prog(100); log(`<span class="hi">analysis complete</span>`);
    await sleep(500); radar.stop();
    last=analyze(d,{mxs,spf,dmarc,dkim,found,checked:vs.length});
    await simulate(last);
    showReport(last);
  }catch(err){log(`<span class="bad">${esc(T.ui.dnsErr)}</span>`);radar.stop();}
  finally{busy=false;go.disabled=false;go.querySelector("span").textContent=T.ui.run;}
}

function showNX(d){
  const R=$("#report");R.style.display="block";
  $("#gaugeWrap").style.display="none";
  $("#verdict").className="verdict warn";
  $("#verdict").innerHTML=`<small>${esc(T.verdict.label(d))}</small><h2>${esc(T.nx[0])}</h2><p>${esc(T.nx[1])}</p>`;
  $("#cards").innerHTML="";$("#cta").style.display="none";
  R.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
}

async function simulate(A){
  const S=$("#sim"); S.style.display="block";
  const mail=$("#mail"), stamp=$("#stamp");
  $("#simFrom").textContent=`Accounts <accounts@${A.d}>`;
  stamp.className="stamp"; stamp.textContent=T.sim.stamp[A.v];
  mail.style.transition="none"; mail.style[RTL?"right":"left"]="0"; mail.style.opacity="1"; mail.style.transform="translate(0,-50%)";
  $("#simNote").textContent="";
  S.scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"});
  await sleep(reduced?50:700);
  mail.style.transition="";
  const track=$("#track"); const target=Math.max(0,track.clientWidth-mail.offsetWidth);
  const stopAt=A.v==="good"?target*0.55:target;
  mail.style[RTL?"right":"left"]=stopAt+"px";
  await sleep(reduced?50:1700);
  if(A.v==="good"){mail.style.transform="translate(0,-50%) scale(.92)";mail.style.opacity=".35";}
  stamp.classList.add("on",A.v);
  $("#simNote").textContent=T.sim.note[A.v];
  await sleep(reduced?50:1300);
}

function countTo(el,to){if(reduced){el.textContent=to;return;}const t0=performance.now(),dur=1400;(function f(t){const p=Math.min(1,(t-t0)/dur);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f);})(t0);}

function showReport(A){
  const R=$("#report");R.style.display="block";$("#gaugeWrap").style.display="";$("#cta").style.display="";
  const col={bad:"#ff4d6a",warn:"#ffb547",good:"#3be38f"}[A.v];
  const ring=$("#ring"),C=2*Math.PI*70;ring.style.stroke=col;ring.style.strokeDasharray=C;ring.style.strokeDashoffset=C;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ring.style.transition=reduced?"none":"stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)";ring.style.strokeDashoffset=C*(1-A.score/100);}));
  countTo($("#scoreNum"),A.score);
  const V=T.verdict[A.v];
  $("#verdict").className="verdict "+A.v;
  $("#verdict").innerHTML=`<small>${esc(T.verdict.label(A.d))}</small><h2>${esc(v(V[0],A.d))}</h2><p>${esc(V[1])}</p><p class="scorenote">${esc(T.score[1])}</p>`;
  const card=(title,cls,p,body,raw,wide,extra)=>`<div class="card hud${wide?" wide":""}"><div class="top"><h3>${esc(title)}</h3><span class="pill ${cls}">${esc(p)}</span></div><p>${esc(body)}</p>${raw?`<code class="raw">${esc(raw)}</code>`:""}${extra||""}</div>`;
  const llExtra=(A.others.length?`<div class="ll">${A.others.slice(0,30).map(f=>`<span>${esc(f.v)}</span>`).join("")}</div>`:"")+(A.mine.length?`<p style="font-size:13px">${esc(T.ll.mine)}</p><div class="ll">${A.mine.map(f=>`<span class="mine">${esc(f.v)}</span>`).join("")}</div>`:"");
  $("#cards").innerHTML=
    card(T.titles.dmarc,A.dm.cls,pill("dm",A.dm),text("dm",A.dm),A.dm.raw)+
    card(T.titles.spf,A.spf.cls,pill("spf",A.spf),text("spf",A.spf),A.spf.raw)+
    card(T.titles.dkim,A.dk.cls,pill("dk",A.dk),text("dk",A.dk))+
    card(T.titles.mx,A.mx.cls,pill("mx",A.mx),text("mx",A.mx))+
    card(T.titles.ll,A.ll.cls,v(T.ll[A.ll.k][0],A.others.length),v(T.ll[A.ll.k][1],A.ll.k==="some"?A.others.length:A.checked,A.checked),"",true,llExtra);
  const summary=`DMARC: ${pill("dm",A.dm)}; SPF: ${pill("spf",A.spf)}; DKIM: ${pill("dk",A.dk)}; ${T.titles.ll}: ${v(T.ll[A.ll.k][0],A.others.length)}; ${T.score[0]} ${A.score}/100`;
  const good=A.v==="good";
  $("#cta").innerHTML=`<div><h3>${esc(good?T.cta.goodH:T.cta.badH(A.d))}</h3><p>${esc(good?T.cta.goodP:T.cta.badP)}</p></div><div class="row"><a class="btn wa" target="_blank" rel="noopener" href="${waLink(good?T.wa.good(A.d,summary):T.wa.bad(A.d,summary))}">${icWa}<span>${esc(good?T.cta.goodWa:T.cta.badWa)}</span></a><button class="btn ghost" id="save" type="button">${esc(T.cta.save)}</button><button class="btn ghost" id="copy" type="button">${esc(T.cta.copy)}</button></div>`;
  $("#save").onclick=()=>saveReport(A);
  $("#copy").onclick=e=>{const b=e.currentTarget;(navigator.clipboard?navigator.clipboard.writeText(location.href):Promise.reject()).then(()=>b.textContent=T.ui.copied).catch(()=>{});};
  R.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
  [...$("#cards").children].forEach((c,i)=>setTimeout(()=>c.classList.add("show"),reduced?0:140*i));
}
const icWa=`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>`;

/* ---------- report image ---------- */
function saveReport(A){
  const W=1200,H=630,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const fam=getComputedStyle(document.body).fontFamily;
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,"#060a18");g.addColorStop(1,"#141a3d");x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle="rgba(120,150,255,.08)";for(let i=0;i<W;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();}for(let j=0;j<H;j+=40){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke();}
  const col={bad:"#ff4d6a",warn:"#ffb547",good:"#3be38f"}[A.v];
  x.direction=RTL?"rtl":"ltr"; const L=RTL?W-70:70; x.textAlign=RTL?"right":"left";
  x.fillStyle="#38e1ff";x.font=`600 22px ${fam}`;x.fillText(T.report.title,L,80);
  x.fillStyle="#eaf0ff";x.font=`700 54px ${fam}`;x.direction="ltr";x.fillText(A.d,L,150);x.direction=RTL?"rtl":"ltr";
  x.fillStyle=col;x.font=`700 34px ${fam}`;
  const head=v(T.verdict[A.v][0],A.d); wrap(x,head,L,215,760,42);
  const rows=[[T.titles.dmarc,pill("dm",A.dm),A.dm.cls],[T.titles.spf,pill("spf",A.spf),A.spf.cls],[T.titles.dkim,pill("dk",A.dk),A.dk.cls],[T.titles.ll,v(T.ll[A.ll.k][0],A.others.length),A.ll.cls]];
  const cmap={bad:"#ff4d6a",warn:"#ffb547",good:"#3be38f",info:"#38e1ff"};
  rows.forEach((r,i)=>{const y=345+i*52;x.fillStyle="#9ba8d1";x.font=`500 24px ${fam}`;x.fillText(r[0],L,y);x.fillStyle=cmap[r[2]];x.font=`700 24px ${fam}`;x.fillText(r[1],RTL?L-440:L+440,y);});
  // gauge
  const gx=RTL?190:W-190,gy=300,R=110;x.lineWidth=16;x.strokeStyle="rgba(255,255,255,.08)";x.beginPath();x.arc(gx,gy,R,0,Math.PI*2);x.stroke();
  x.strokeStyle=col;x.lineCap="round";x.beginPath();x.arc(gx,gy,R,-Math.PI/2,-Math.PI/2+Math.PI*2*A.score/100);x.stroke();
  x.textAlign="center";x.direction="ltr";x.fillStyle="#eaf0ff";x.font=`700 64px ${fam}`;x.fillText(String(A.score),gx,gy+20);x.fillStyle="#9ba8d1";x.font=`600 18px ${fam}`;x.fillText("/ 100",gx,gy+50);
  x.textAlign=RTL?"right":"left";x.direction=RTL?"rtl":"ltr";x.fillStyle="#6b779e";x.font=`500 20px ${fam}`;
  x.fillText(`${T.report.date}: ${new Date().toISOString().slice(0,10)} · ${SITE}`,L,H-50);
  c.toBlob(b=>{const f=new File([b],`email-fraud-report-${A.d}.png`,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[f]})&&matchMedia("(pointer:coarse)").matches){navigator.share({files:[f],title:T.report.title}).catch(()=>{});return;}
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);},"image/png");
}
function wrap(x,t,X,Y,maxW,lh){const w=t.split(" ");let line="",y=Y;for(const word of w){const test=line?line+" "+word:word;if(x.measureText(test).width>maxW&&line){x.fillText(line,X,y);line=word;y+=lh;}else line=test;}x.fillText(line,X,y);}

/* ---------- lang links keep ?d= ---------- */
const qs=location.search; if(qs) document.querySelectorAll(".lang a").forEach(a=>a.href=a.getAttribute("href").split("?")[0]+qs);
const pre=new URLSearchParams(location.search).get("d"); if(pre){input.value=pre;setTimeout(run,400);}
})();
