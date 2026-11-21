/* Almindhry Email Fraud Check. Runs fully in the browser and reads public DNS via Google Public DNS. Nothing is stored. */
(function(){
"use strict";
const WA_NUMBER="601123109560", SITE="almindhrybuilds.me/check";
const LANG=(document.documentElement.lang||"en").slice(0,2), RTL=document.documentElement.dir==="rtl";

const I18N={
en:{
 ui:{checking:"Checking…",run:"Check my company",invalid:"Type your company's website, like yourcompany.com",dnsErr:"We couldn't reach Google's public directory. Check your internet and try again.",copied:"Link copied",checkingFor:"Checking"},
 steps:["Finding your email provider","Checking fake-email blocking","Checking your approved senders list","Looking for your email signature","Searching for copycat domains"],
 status:{bad:["Not protected",d=>`Right now, anyone can send an email that looks like it comes from @${d}.`,["A fraudster can email your customers asking them to pay a “new” bank account.","Your customers will see your real company address on it.","Nothing in your settings tells Gmail or Outlook to stop it."]],
         warn:["Partly protected",d=>`Fake emails pretending to be @${d} go to the spam folder, but they aren't refused.`,["Fake emails land in spam instead of the inbox.","A customer expecting an invoice may open spam and believe it.","One more step makes them refused completely."]],
         good:["Protected",d=>`Fake emails pretending to be @${d} are refused by Gmail, Outlook and others.`,["Gmail and Outlook refuse forged email in your name.","Protection holds as long as these settings stay in place.","Changing hosting can break it, so it's worth watching."]],
         shield:{bad:"Your company can be faked",warn:"Your company can be faked, partly",good:"Your company is protected"}},
 names:{dm:["Fake-email blocking","DMARC"],spf:["Approved senders list","SPF"],dk:["Email signature","DKIM"],mx:["Email provider","MX"],ll:["Copycat domains","lookalikes"]},
 dm:{missing:["Off","Not set up. Gmail and Outlook have no instruction to block fake emails that use your address."],broken:["Broken","Set up twice by mistake, so it's ignored and nothing is blocked."],none:["Watch only","Switched on, but set to only watch. Fake emails still reach the inbox."],quarantine:["Spam folder","Fake emails go to spam. Better, but people do open spam when they're expecting an invoice."],rejectPartial:[p=>`Partly on (${p}%)`,p=>`Only ${p}% of fake emails are refused.`],reject:["On","Fake emails that use your address are refused. This is the strongest protection."]},
 spf:{missing:["Missing","There's no list of who is allowed to send your company's email."],broken:["Broken",n=>`There are ${n} lists instead of one, so mail servers ignore them, even for your real emails.`],plusall:["Unsafe","The list allows every computer on the internet to send as you."],strict:["In place","Only your approved systems may send as you."],soft:["In place","Your approved systems are listed. Strong when fake-email blocking is on."],weak:["Weak","The list doesn't say what to do with senders who aren't on it."],toomany:["Too long",n=>`The list is too long (about ${n} lookups, the limit is 10), so it can fail even for your real emails.`]},
 dk:{found:["Found",s=>`Your emails carry a digital signature (${s}) that proves they weren't forged.`],notfound:["Not found","We didn't find a signature under the usual names. Your provider may use a custom one, or it's switched off."]},
 mx:{provider:["Found",p=>`Your email runs on ${p}.`],host:["Found",h=>`Your email runs on ${h}.`],nomail:["None","This domain doesn't receive email. It can still be faked, so it needs blocking switched on too."]},
 ll:{none:["None found",n=>`We tried ${n} near-copies of your name (typos, swapped letters, other endings). None belong to someone else right now.`],some:[k=>`${k} found`,(k,n)=>`Of ${n} near-copies we tried, ${k} are registered by someone else. Most are harmless, but any of them could send fake invoices that look like yours.`],mine:"These look like yours (same servers):"},
 tech:"Technical details",
 score:["Protection score","Our rating of your public settings, out of 100."],
 sim:{title:"The fake email a stranger could send as you, today",src:"Stranger",dst:"Your customer",subject:"Invoice 2291: our bank details have changed",body:"Dear customer, please use our new account for this payment. The old one is closed.",stamp:{bad:"DELIVERED TO INBOX",warn:"SENT TO SPAM",good:"REFUSED"},note:{bad:"Nothing in your settings tells your customer's email service to stop this email.",warn:"It lands in spam. Some customers open spam when they're expecting an invoice.",good:"Your customer's email service checks your settings and refuses it. They never see it."}},
 cta:{badH:d=>`Get ${d} protected`,badP:"We set it up with you in stages, so your real emails keep arriving. You pay only after this page shows green.",badWa:"Fix it with Muhammad on WhatsApp",goodH:"You're protected. Keep it that way.",goodP:"Settings break when companies change hosting. The monthly watch re-checks this for you and alerts you on WhatsApp the day a copycat domain appears.",goodWa:"Ask about the monthly watch",save:"Save as image",copy:"Copy link",again:"Check another company"},
 wa:{main:"Hello Muhammad, I'd like my company's email checked and protected.",bad:(d,s)=>`Hello Muhammad, I checked ${d} on your Email Fraud Check. Result: ${s}. Can you help us fix it?`,good:(d,s)=>`Hello Muhammad, I checked ${d} on your Email Fraud Check. Result: ${s}. Tell me about the monthly watch.`},
 nx:["We couldn't find that website","Check the spelling, or type the part after the @ in your work email."],
 report:{title:"EMAIL FRAUD CHECK",date:"Checked"}
},
ar:{
 ui:{checking:"جارٍ الفحص…",run:"افحص شركتي",invalid:"اكتب موقع شركتك، مثل yourcompany.com",dnsErr:"تعذّر الوصول إلى دليل Google العام. تحقق من الإنترنت وحاول مجددًا.",copied:"تم نسخ الرابط",checkingFor:"نفحص"},
 steps:["نبحث عن مزود البريد لشركتك","نفحص حجب الرسائل المزيفة","نفحص قائمة المرسلين المعتمدين","نبحث عن توقيع البريد","نبحث عن النطاقات المقلّدة"],
 status:{bad:["غير محمي",d=>`حاليًا، يستطيع أي شخص إرسال بريد يبدو أنه صادر من @${d}.`,["يستطيع محتال مراسلة عملائك وطلب الدفع إلى حساب بنكي «جديد».","سيرى عملاؤك عنوان شركتك الحقيقي على الرسالة.","لا شيء في إعداداتك يطلب من Gmail أو Outlook إيقافها."]],
         warn:["محمي جزئيًا",d=>`الرسائل المزيفة التي تنتحل @${d} تذهب إلى البريد العشوائي، لكنها لا تُرفض.`,["الرسائل المزيفة تصل إلى العشوائي بدل صندوق الوارد.","العميل الذي ينتظر فاتورة قد يفتح العشوائي ويصدقها.","خطوة واحدة إضافية تجعلها تُرفض بالكامل."]],
         good:["محمي",d=>`الرسائل المزيفة التي تنتحل @${d} يرفضها Gmail وOutlook وغيرهما.`,["Gmail وOutlook يرفضان البريد المزوّر باسمك.","تبقى الحماية فعّالة ما دامت هذه الإعدادات في مكانها.","تغيير الاستضافة قد يعطّلها، لذا تستحق المتابعة."]],
         shield:{bad:"يمكن انتحال شركتك",warn:"يمكن انتحال شركتك جزئيًا",good:"شركتك محمية"}},
 names:{dm:["حجب الرسائل المزيفة","DMARC"],spf:["قائمة المرسلين المعتمدين","SPF"],dk:["توقيع البريد","DKIM"],mx:["مزود البريد","MX"],ll:["النطاقات المقلّدة","lookalikes"]},
 dm:{missing:["غير مفعّل","غير مُعدّ. لا يملك Gmail وOutlook أي تعليمات لحجب الرسائل المزيفة التي تستخدم عنوانك."],broken:["معطّل","مُعدّ مرتين بالخطأ، لذا يُتجاهل ولا يُحجب شيء."],none:["مراقبة فقط","مفعّل، لكنه مضبوط على المراقبة فقط. الرسائل المزيفة ما زالت تصل إلى صندوق الوارد."],quarantine:["البريد العشوائي","الرسائل المزيفة تذهب إلى العشوائي. أفضل، لكن الناس يفتحون العشوائي حين ينتظرون فاتورة."],rejectPartial:[p=>`مفعّل جزئيًا (${p}%)`,p=>`تُرفض ${p}% فقط من الرسائل المزيفة.`],reject:["مفعّل","الرسائل المزيفة التي تستخدم عنوانك تُرفض. هذه أقوى حماية."]},
 spf:{missing:["غير موجودة","لا توجد قائمة بمن يُسمح له بإرسال بريد شركتك."],broken:["معطّلة",n=>`توجد ${n} قوائم بدل قائمة واحدة، فتتجاهلها خوادم البريد حتى لرسائلك الحقيقية.`],plusall:["غير آمنة","القائمة تسمح لكل أجهزة الإنترنت بالإرسال باسمك."],strict:["موجودة","فقط أنظمتك المعتمدة يمكنها الإرسال باسمك."],soft:["موجودة","أنظمتك المعتمدة مُدرجة. قوية عندما يكون حجب الرسائل المزيفة مفعّلًا."],weak:["ضعيفة","القائمة لا تحدد ما يُفعل بالمرسلين غير المدرجين."],toomany:["طويلة جدًا",n=>`القائمة طويلة جدًا (نحو ${n} عمليات بحث، والحد 10)، فقد تفشل حتى لرسائلك الحقيقية.`]},
 dk:{found:["موجود",s=>`رسائلك تحمل توقيعًا رقميًا (${s}) يثبت أنها غير مزوّرة.`],notfound:["غير موجود","لم نجد توقيعًا بالأسماء المعتادة. قد يستخدم مزودك اسمًا مخصصًا، أو أنه غير مفعّل."]},
 mx:{provider:["موجود",p=>`بريدك يعمل عبر ${p}.`],host:["موجود",h=>`بريدك يعمل عبر ${h}.`],nomail:["لا يوجد","هذا النطاق لا يستقبل بريدًا، لكن يمكن انتحاله، لذا يحتاج إلى تفعيل الحجب أيضًا."]},
 ll:{none:["لا يوجد",n=>`جرّبنا ${n} نسخة قريبة من اسمك (أخطاء إملائية، حروف مبدّلة، امتدادات أخرى). لا يملك أيًا منها شخص آخر حاليًا.`],some:[k=>`${k} موجودة`,(k,n)=>`من بين ${n} نسخة قريبة جرّبناها، ${k} مسجّلة لدى آخرين. معظمها غير ضار، لكن أيًا منها يمكن أن يرسل فواتير مزيفة تشبه فواتيرك.`],mine:"هذه تبدو لك (نفس الخوادم):"},
 tech:"التفاصيل التقنية",
 score:["درجة الحماية","تقييمنا لإعداداتك العامة، من 100."],
 sim:{title:"البريد المزيف الذي يستطيع غريب إرساله باسمك اليوم",src:"غريب",dst:"عميلك",subject:"الفاتورة 2291: تغيّرت بياناتنا البنكية",body:"عزيزي العميل، يرجى استخدام حسابنا الجديد لهذه الدفعة. الحساب القديم مُغلق.",stamp:{bad:"وصلت إلى الوارد",warn:"ذهبت إلى العشوائي",good:"مرفوضة"},note:{bad:"لا شيء في إعداداتك يطلب من خدمة بريد عميلك إيقاف هذه الرسالة.",warn:"تصل إلى العشوائي. بعض العملاء يفتحونه حين ينتظرون فاتورة.",good:"خدمة بريد عميلك تتحقق من إعداداتك وترفضها. لن يراها أبدًا."}},
 cta:{badH:d=>`احمِ ${d}`,badP:"نُعدّها معك على مراحل حتى تستمر رسائلك الحقيقية بالوصول. لا تدفع إلا بعد أن تظهر هذه الصفحة باللون الأخضر.",badWa:"أصلحها مع محمد عبر واتساب",goodH:"أنت محمي. حافظ على ذلك.",goodP:"الإعدادات تتعطل عند تغيير الاستضافة. المتابعة الشهرية تعيد الفحص عنك وتنبهك عبر واتساب يوم ظهور نطاق مقلّد.",goodWa:"اسأل عن المتابعة الشهرية",save:"احفظ كصورة",copy:"انسخ الرابط",again:"افحص شركة أخرى"},
 wa:{main:"مرحبًا محمد، أريد فحص بريد شركتي وحمايته.",bad:(d,s)=>`مرحبًا محمد، فحصت ${d} على أداة فحص احتيال البريد. النتيجة: ${s}. هل يمكنك مساعدتنا في الإصلاح؟`,good:(d,s)=>`مرحبًا محمد، فحصت ${d} على أداة فحص احتيال البريد. النتيجة: ${s}. أخبرني عن المتابعة الشهرية.`},
 nx:["لم نجد هذا الموقع","تحقق من الكتابة، أو اكتب الجزء الذي بعد @ في بريد عملك."],
 report:{title:"فحص احتيال البريد الإلكتروني",date:"تاريخ الفحص"}
},
sw:{
 ui:{checking:"Inakagua…",run:"Kagua kampuni yangu",invalid:"Andika tovuti ya kampuni yako, mfano kampuniyako.co.tz",dnsErr:"Imeshindikana kufikia orodha ya umma ya Google. Hakiki intaneti yako ujaribu tena.",copied:"Kiungo kimenakiliwa",checkingFor:"Tunakagua"},
 steps:["Tunatafuta mtoa huduma wa barua pepe wako","Tunakagua kizuizi cha barua bandia","Tunakagua orodha ya watumaji walioidhinishwa","Tunatafuta sahihi ya barua pepe","Tunatafuta domain za kuiga"],
 status:{bad:["Haijalindwa",d=>`Kwa sasa, mtu yeyote anaweza kutuma barua pepe inayoonekana imetoka @${d}.`,["Tapeli anaweza kuwaandikia wateja wako akiomba walipe kwenye akaunti “mpya” ya benki.","Wateja wako wataona anwani halisi ya kampuni yako kwenye barua hiyo.","Hakuna kitu kwenye mipangilio yako kinachoziambia Gmail au Outlook kuizuia."]],
         warn:["Imelindwa kiasi",d=>`Barua bandia zinazojifanya @${d} zinaenda spam, lakini hazikataliwi.`,["Barua bandia zinafika spam badala ya inbox.","Mteja anayesubiri ankara anaweza kufungua spam na kuiamini.","Hatua moja zaidi inazifanya zikataliwe kabisa."]],
         good:["Imelindwa",d=>`Barua bandia zinazojifanya @${d} zinakataliwa na Gmail, Outlook na nyinginezo.`,["Gmail na Outlook zinakataa barua za kughushi kwa jina lako.","Ulinzi unadumu mradi mipangilio hii ipo.","Kubadilisha hosting kunaweza kuiharibu, kwa hiyo inafaa kufuatiliwa."]],
         shield:{bad:"Kampuni yako inaweza kuigwa",warn:"Kampuni yako inaweza kuigwa kiasi",good:"Kampuni yako imelindwa"}},
 names:{dm:["Kizuizi cha barua bandia","DMARC"],spf:["Orodha ya watumaji walioidhinishwa","SPF"],dk:["Sahihi ya barua pepe","DKIM"],mx:["Mtoa huduma wa barua","MX"],ll:["Domain za kuiga","lookalikes"]},
 dm:{missing:["Haijawashwa","Haijawekwa. Gmail na Outlook hazina maelekezo ya kuzuia barua bandia zinazotumia anwani yako."],broken:["Imeharibika","Imewekwa mara mbili kwa makosa, kwa hiyo inapuuzwa na hakuna kinachozuiwa."],none:["Uangalizi tu","Imewashwa, lakini imewekwa kuangalia tu. Barua bandia bado zinafika inbox."],quarantine:["Spam","Barua bandia zinapelekwa spam. Ni bora, lakini watu hufungua spam wanaposubiri ankara."],rejectPartial:[p=>`Imewashwa kiasi (${p}%)`,p=>`Ni ${p}% tu ya barua bandia zinazokataliwa.`],reject:["Imewashwa","Barua bandia zinazotumia anwani yako zinakataliwa. Huu ndio ulinzi imara zaidi."]},
 spf:{missing:["Haipo","Hakuna orodha ya wanaoruhusiwa kutuma barua za kampuni yako."],broken:["Imeharibika",n=>`Kuna orodha ${n} badala ya moja, kwa hiyo seva za barua zinazipuuza, hata kwa barua zako halali.`],plusall:["Si salama","Orodha inaruhusu kila kompyuta duniani kutuma kwa jina lako."],strict:["Ipo","Mifumo yako iliyoidhinishwa pekee ndiyo inaweza kutuma kwa jina lako."],soft:["Ipo","Mifumo yako iliyoidhinishwa imeorodheshwa. Imara kizuizi cha barua bandia kikiwashwa."],weak:["Dhaifu","Orodha haisemi nini kifanyike kwa watumaji wasio kwenye orodha."],toomany:["Ndefu mno",n=>`Orodha ni ndefu mno (takriban maombi ${n}, kikomo ni 10), kwa hiyo inaweza kushindwa hata kwa barua zako halali.`]},
 dk:{found:["Ipo",s=>`Barua zako zina sahihi ya kidijitali (${s}) inayothibitisha hazikughushiwa.`],notfound:["Haipo","Hatukupata sahihi kwa majina ya kawaida. Mtoa huduma wako anaweza kutumia jina maalum, au imezimwa."]},
 mx:{provider:["Ipo",p=>`Barua pepe zako zinaendeshwa na ${p}.`],host:["Ipo",h=>`Barua pepe zako zinaendeshwa kwenye ${h}.`],nomail:["Hakuna","Domain hii haipokei barua pepe, lakini bado inaweza kughushiwa, kwa hiyo nayo inahitaji kizuizi."]},
 ll:{none:["Hakuna",n=>`Tumejaribu nakala ${n} zinazokaribiana na jina lako (makosa ya tahajia, herufi zilizobadilishana, viambishi vingine). Hakuna inayomilikiwa na mtu mwingine kwa sasa.`],some:[k=>`${k} zimepatikana`,(k,n)=>`Kati ya nakala ${n} tulizojaribu, ${k} zimesajiliwa na watu wengine. Nyingi hazina madhara, lakini yoyote inaweza kutuma ankara bandia zinazofanana na zako.`],mine:"Hizi zinaonekana ni zako (seva zilezile):"},
 tech:"Maelezo ya kiufundi",
 score:["Alama ya ulinzi","Tathmini yetu ya mipangilio yako ya umma, kati ya 100."],
 sim:{title:"Barua bandia ambayo mgeni anaweza kutuma kwa jina lako leo",src:"Mgeni",dst:"Mteja wako",subject:"Ankara 2291: taarifa zetu za benki zimebadilika",body:"Mpendwa mteja, tafadhali tumia akaunti yetu mpya kwa malipo haya. Ile ya zamani imefungwa.",stamp:{bad:"IMEFIKA INBOX",warn:"IMEENDA SPAM",good:"IMEKATALIWA"},note:{bad:"Hakuna kitu kwenye mipangilio yako kinachoiambia huduma ya barua ya mteja wako isimamishe barua hii.",warn:"Inafika spam. Baadhi ya wateja huifungua wanaposubiri ankara.",good:"Huduma ya barua ya mteja wako inakagua mipangilio yako na kuikataa. Mteja wako haioni kamwe."}},
 cta:{badH:d=>`Linda ${d}`,badP:"Tunaweka pamoja nawe kwa hatua ili barua zako halali ziendelee kufika. Unalipa tu baada ya ukurasa huu kuonyesha kijani.",badWa:"Rekebisha na Muhammad kupitia WhatsApp",goodH:"Umelindwa. Ibaki hivyo.",goodP:"Mipangilio huharibika kampuni zikibadilisha hosting. Uangalizi wa kila mwezi unakagua upya kwa niaba yako na kukujulisha WhatsApp siku domain ya kuiga ikionekana.",goodWa:"Uliza kuhusu uangalizi wa kila mwezi",save:"Hifadhi kama picha",copy:"Nakili kiungo",again:"Kagua kampuni nyingine"},
 wa:{main:"Habari Muhammad, nataka barua pepe za kampuni yangu zikaguliwe na kulindwa.",bad:(d,s)=>`Habari Muhammad, nimekagua ${d} kwenye Email Fraud Check yako. Matokeo: ${s}. Unaweza kutusaidia kurekebisha?`,good:(d,s)=>`Habari Muhammad, nimekagua ${d} kwenye Email Fraud Check yako. Matokeo: ${s}. Nieleze kuhusu uangalizi wa kila mwezi.`},
 nx:["Hatukupata tovuti hiyo","Hakiki tahajia, au andika sehemu iliyo baada ya @ kwenye barua pepe ya kazini."],
 report:{title:"UKAGUZI WA UTAPELI WA BARUA PEPE",date:"Imekaguliwa"}
}};
const T=I18N[LANG]||I18N.en;
const v=(x,...a)=>typeof x==="function"?x(...a):x;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const waLink=t=>`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;
$$("[data-wa-main]").forEach(a=>a.href=waLink(T.wa.main));
const yr=$("#yr"); if(yr) yr.textContent=new Date().getFullYear();

/* ---------- ambient UI ---------- */
const nav=$("nav"); const onScroll=()=>nav.classList.toggle("solid",scrollY>20); addEventListener("scroll",onScroll,{passive:true}); onScroll();
document.addEventListener("pointermove",e=>{const el=e.target.closest&&e.target.closest(".spot");if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty("--mx",(e.clientX-r.left)+"px");el.style.setProperty("--my",(e.clientY-r.top)+"px");},{passive:true});
const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.14}):null;
$$(".rv").forEach(el=>io?io.observe(el):el.classList.add("in"));
$$("[data-focus]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();scrollTo({top:0,behavior:reduced?"auto":"smooth"});setTimeout(()=>input.focus(),reduced?0:500);}));

/* live mock: the visitor's own domain appears in the fake email as they type */
const input=$("#d"), form=$("#f"), go=$("#go");
let flashT;
input.addEventListener("input",()=>{const d=clean(input.value)||(input.value.trim()?input.value.trim().toLowerCase().replace(/^https?:\/\//,"").replace(/^www\./,"").split(/[\/?#\s@]/).filter(Boolean).pop():"");const shown=d||$("#mockDefault").textContent;
  $$(".mockdom").forEach(s=>{s.textContent=shown;s.classList.add("flash");});clearTimeout(flashT);flashT=setTimeout(()=>$$(".mockdom").forEach(s=>s.classList.remove("flash")),350);});

/* ---------- DNS ---------- */
const MULTI=["co.tz","or.tz","ac.tz","go.tz","ne.tz","com.om","co.om","net.om","org.om","co.ae","net.ae","org.ae","com.sa","net.sa","co.uk","org.uk","com.my","co.ke","or.ke","com.qa","com.bh","com.kw","co.za","com.au","co.in","com.eg","co.ug","co.rw"];
function clean(s){s=(s||"").trim().toLowerCase();if(s.includes("@"))s=s.split("@").pop();s=s.replace(/^[a-z]+:\/\//,"").split(/[\/?#:\s]/)[0].replace(/^www\./,"").replace(/\.$/,"");return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s)?s:null;}
function splitDomain(d){for(const m of MULTI)if(d.endsWith("."+m)){const l=d.slice(0,-(m.length+1));if(!l.includes("."))return[l,m];}const p=d.split(".");return[p.slice(0,-1).join("."),p[p.length-1]];}
async function dns(name,type){const r=await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,{headers:{accept:"application/dns-json"}});if(!r.ok)throw new Error("dns");return r.json();}
const txts=j=>(j.Answer||[]).filter(a=>a.type===16).map(a=>a.data.replace(/^"|"$/g,"").replace(/"\s*"/g,""));
const PROVIDERS=[[/protection\.outlook\.com|outlook\.com/,"Microsoft 365"],[/google\.com|googlemail\.com/,"Google Workspace"],[/zoho\./,"Zoho Mail"],[/hostinger/,"Hostinger"],[/titan\.email/,"Titan"],[/secureserver\.net/,"GoDaddy"],[/mimecast/,"Mimecast"],[/pphosted/,"Proofpoint"],[/emailsrvr/,"Rackspace"],[/yandex/,"Yandex"],[/icewarp/,"IceWarp"],[/barracuda/,"Barracuda"],[/mailgun/,"Mailgun"],[/websitewelcome|hostgator/,"HostGator"],[/bluehost/,"Bluehost"],[/privateemail|registrar-servers|jellyfish\.systems/,"Namecheap"],[/emirates\.net\.ae|etisalat/,"Etisalat"],[/omantel/,"Omantel"]];
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

/* ---------- analysis ---------- */
function analyze(d,r){
  const A={d};
  if(r.dmarc.length>1)A.dm={k:"broken",cls:"bad",pts:0};
  else if(r.dmarc.length===1){const t=r.dmarc[0];const m=t.match(/(?:^|;)\s*p\s*=\s*(\w+)/i);const pol=m?m[1].toLowerCase():"none";const pm=t.match(/pct\s*=\s*(\d+)/i);const pct=pm?+pm[1]:100;
    if(pol==="reject"&&pct>=100)A.dm={k:"reject",cls:"good",pts:50};else if(pol==="reject")A.dm={k:"rejectPartial",cls:"warn",pts:40,arg:pct};else if(pol==="quarantine")A.dm={k:"quarantine",cls:"warn",pts:32};else A.dm={k:"none",cls:"bad",pts:8};A.dm.raw=t;}
  else A.dm={k:"missing",cls:"bad",pts:0};
  if(r.spf.length>1)A.spf={k:"broken",cls:"bad",pts:0,arg:r.spf.length,raw:r.spf.join("\n")};
  else if(r.spf.length===1){const s=r.spf[0];const n=(s.match(/(?:^|\s)[+\-~?]?(include:|a(?=[\s:\/]|$)|mx(?=[\s:\/]|$)|ptr|exists:|redirect=)/gi)||[]).length;
    if(/(^|\s)\+?all\b/i.test(s)&&!/[-~?]all\b/i.test(s))A.spf={k:"plusall",cls:"bad",pts:0};else if(n>10)A.spf={k:"toomany",cls:"bad",pts:6,arg:n};else if(/-all\b/i.test(s))A.spf={k:"strict",cls:"good",pts:20};else if(/~all\b/i.test(s))A.spf={k:"soft",cls:"good",pts:20};else A.spf={k:"weak",cls:"warn",pts:10};A.spf.raw=s;}
  else A.spf={k:"missing",cls:"bad",pts:0};
  A.dk=r.dkim.length?{k:"found",cls:"good",pts:15,arg:r.dkim.join(", ")}:{k:"notfound",cls:"info",pts:6};
  const prov=[...new Set(r.mxs.map(providerOf).filter(Boolean))];
  A.mx=!r.mxs.length?{k:"nomail",cls:"warn"}:prov.length?{k:"provider",cls:"info",arg:prov.join(", "),raw:r.mxs.join("\n")}:{k:"host",cls:"info",arg:r.mxs[0],raw:r.mxs.join("\n")};
  A.others=r.found.filter(f=>!f.mine);A.mine=r.found.filter(f=>f.mine);A.checked=r.checked;
  const k=A.others.length;A.ll=k?{k:"some",cls:k>3?"bad":"warn",pts:k>3?4:9}:{k:"none",cls:"good",pts:15};
  A.v=A.dm.cls==="good"?"good":A.dm.cls==="warn"?"warn":"bad";
  A.score=Math.min(A.dm.pts+A.spf.pts+A.dk.pts+A.ll.pts,{bad:35,warn:75,good:100}[A.v]);
  return A;
}
const pill=(g,o)=>v(T[g][o.k][0],o.arg);
const text=(g,o)=>v(T[g][o.k][1],o.arg);

/* ---------- run ---------- */
const steps=$$("#chk li"), bar=$("#pbar");
function step(i,state,small){const li=steps[i];li.className=state;if(small!==undefined)li.querySelector(".sm").textContent=small;}
let busy=false;
form.addEventListener("submit",e=>{e.preventDefault();run();});
async function run(){
  if(busy)return;
  const d=clean(input.value);
  if(!d){input.value="";input.placeholder=T.ui.invalid;input.focus();return;}
  busy=true;go.disabled=true;go.querySelector("span").textContent=T.ui.checking;
  try{history.replaceState(null,"","?d="+d);}catch(e){}
  input.dispatchEvent(new Event("input"));
  const R=$("#results");R.style.display="block";
  ["#status","#sim","#rows","#cta"].forEach(s=>$(s).style.display="none");
  $("#runDom").textContent=d;
  steps.forEach((li,i)=>step(i,"",""));bar.style.width="0";
  $("#run").scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"});
  try{
    step(0,"on");
    const [ns,mx,txt,dm]=await Promise.all([dns(d,"NS"),dns(d,"MX"),dns(d,"TXT"),dns("_dmarc."+d,"TXT")]);
    await sleep(500);
    if(ns.Status===3){step(0,"bad","NXDOMAIN");bar.style.width="100%";showNX(d);return;}
    const mxs=(mx.Answer||[]).filter(a=>a.type===15).map(a=>a.data.split(" ").pop().replace(/\.$/,"").toLowerCase());
    const prov=[...new Set(mxs.map(providerOf).filter(Boolean))];
    step(0,mxs.length?"ok":"warn",prov[0]||mxs[0]||"—");bar.style.width="20%";
    step(1,"on");await sleep(550);
    const dmarc=txts(dm).filter(t=>/^v=dmarc1/i.test(t));
    const spf=txts(txt).filter(t=>/^v=spf1/i.test(t));
    const pdm=analyze(d,{mxs,spf,dmarc,dkim:[],found:[],checked:0}).dm;
    step(1,pdm.cls==="good"?"ok":pdm.cls,pill("dm",pdm));bar.style.width="38%";
    step(2,"on");await sleep(450);
    const pspf=analyze(d,{mxs,spf,dmarc,dkim:[],found:[],checked:0}).spf;
    step(2,pspf.cls==="good"?"ok":pspf.cls,pill("spf",pspf));bar.style.width="52%";
    step(3,"on");
    const sels=["selector1","selector2","google","default","k1","s1","s2","dkim","mail","zmail","titan1","hostingermail1","mxvault"];
    const dk=await Promise.all(sels.map(s=>dns(s+"._domainkey."+d,"TXT").then(j=>((j.Answer||[]).some(a=>/p=|v=dkim1/i.test(a.data)||a.type===5))?s:null).catch(()=>null)));
    const dkim=dk.filter(Boolean);
    step(3,dkim.length?"ok":"warn",dkim.length?T.dk.found[0]:T.dk.notfound[0]);bar.style.width="62%";
    step(4,"on");
    const [label,tld]=splitDomain(d);const vs=variants(label,tld);const found=[],q=[...vs];let done=0;
    async function worker(){while(q.length){const c=q.shift();try{const j=await dns(c,"NS");if(j.Status===0&&(j.Answer||[]).length)found.push({v:c,ns:(j.Answer||[]).map(a=>a.data.toLowerCase()).join(" ")});}catch(e){}done++;steps[4].querySelector(".sm").textContent=`${done}/${vs.length}`;bar.style.width=(62+Math.round(38*done/vs.length))+"%";}}
    await Promise.all(Array.from({length:6},worker));
    const myNs=(ns.Answer||[]).map(a=>a.data.toLowerCase());found.forEach(f=>f.mine=myNs.some(n=>f.ns.includes(n)));
    const A=analyze(d,{mxs,spf,dmarc,dkim,found,checked:vs.length});
    step(4,A.ll.cls==="good"?"ok":A.ll.cls,v(T.ll[A.ll.k][0],A.others.length));
    await sleep(500);
    showStatus(A);
    await simulate(A);
    showRows(A);
  }catch(err){$("#runNote").textContent=T.ui.dnsErr;}
  finally{busy=false;go.disabled=false;go.querySelector("span").textContent=T.ui.run;}
}
function showNX(d){const S=$("#status");S.style.display="";S.className="status spot warn";$("#ringWrap").style.display="none";
  $("#stShield").textContent="?";$("#stH").textContent=T.nx[0];$("#stLead").textContent=T.nx[1];$("#stList").innerHTML="";}
function countTo(el,to){if(reduced){el.textContent=to;return;}const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/1400);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f);})(t0);}
function showStatus(A){
  const S=$("#status");S.style.display="";S.className="status spot "+A.v;$("#ringWrap").style.display="";
  const st=T.status[A.v];
  $("#stShield").textContent=T.status.shield[A.v];$("#stH").textContent=st[0];$("#stLead").textContent=st[1](A.d);
  $("#stList").innerHTML=st[2].map(x=>`<li>${esc(x)}</li>`).join("");
  const col={bad:"#ff5470",warn:"#ffb340",good:"#34d399"}[A.v],ring=$("#ring"),C=2*Math.PI*74;
  ring.style.stroke=col;ring.style.strokeDasharray=C;ring.style.transition="none";ring.style.strokeDashoffset=C;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ring.style.transition=reduced?"none":"stroke-dashoffset 1.5s cubic-bezier(.2,.8,.2,1)";ring.style.strokeDashoffset=C*(1-A.score/100);}));
  countTo($("#scoreNum"),A.score);
  S.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
}
async function simulate(A){
  const S=$("#sim");S.style.display="";
  const mail=$("#mail"),stamp=$("#stamp");
  $("#simFrom").textContent=`Accounts <accounts@${A.d}>`;
  stamp.className="stamp";stamp.textContent=T.sim.stamp[A.v];$("#simNote").textContent="";
  mail.style.transition="none";mail.style.insetInlineStart="0px";mail.classList.remove("refused");mail.style.transform="translateY(-50%)";
  await sleep(reduced?30:900);
  mail.style.transition="";
  const track=$("#track"),target=Math.max(0,track.clientWidth-mail.offsetWidth);
  mail.style.insetInlineStart=(A.v==="good"?target*.55:target)+"px";
  await sleep(reduced?30:1700);
  if(A.v==="good"){mail.style.transform="translateY(-50%) scale(.94)";mail.classList.add("refused");}
  stamp.classList.add("on",A.v);$("#simNote").textContent=T.sim.note[A.v];
  await sleep(reduced?30:1100);
}
function showRows(A){
  const row=(g,o,extra)=>{const n=T.names[g];const raw=o.raw?`<details><summary>${esc(T.tech)}</summary><code class="raw">${esc(o.raw).replace(/\n/g,"<br>")}</code></details>`:"";
    return `<div class="row"><h4>${esc(n[0])} <em>${esc(n[1])}</em></h4><span class="pill ${o.cls}">${esc(g==="ll"?v(T.ll[o.k][0],A.others.length):pill(g,o))}</span><p>${esc(g==="ll"?v(T.ll[o.k][1],o.k==="some"?A.others.length:A.checked,A.checked):text(g,o))}</p>${extra||""}${raw}</div>`;};
  const chips=(A.others.length?`<div class="chips">${A.others.slice(0,30).map(f=>`<span>${esc(f.v)}</span>`).join("")}</div>`:"")+(A.mine.length?`<p style="font-size:13.5px">${esc(T.ll.mine)}</p><div class="chips">${A.mine.map(f=>`<span class="mine">${esc(f.v)}</span>`).join("")}</div>`:"");
  const Rw=$("#rows");Rw.style.display="";
  Rw.innerHTML=row("dm",A.dm)+row("spf",A.spf)+row("dk",A.dk)+row("mx",A.mx)+row("ll",A.ll,chips);
  [...Rw.children].forEach((c,i)=>setTimeout(()=>c.classList.add("show"),reduced?0:120*i));
  const sum=`${T.status[A.v][0]} · ${T.names.dm[0]}: ${pill("dm",A.dm)} · ${T.names.spf[0]}: ${pill("spf",A.spf)} · ${T.names.ll[0]}: ${v(T.ll[A.ll.k][0],A.others.length)} · ${T.score[0]} ${A.score}/100`;
  const good=A.v==="good",C=$("#cta");C.style.display="";
  C.innerHTML=`<div><h3>${esc(good?T.cta.goodH:T.cta.badH(A.d))}</h3><p>${esc(good?T.cta.goodP:T.cta.badP)}</p></div><div class="bt"><a class="btn wa" target="_blank" rel="noopener" href="${waLink(good?T.wa.good(A.d,sum):T.wa.bad(A.d,sum))}">${icWa}<span>${esc(good?T.cta.goodWa:T.cta.badWa)}</span></a><button class="btn g" id="save" type="button">${esc(T.cta.save)}</button><button class="btn g" id="copy" type="button">${esc(T.cta.copy)}</button></div>`;
  $("#save").onclick=()=>saveReport(A);
  $("#copy").onclick=e=>{const b=e.currentTarget;(navigator.clipboard?navigator.clipboard.writeText(location.href):Promise.reject()).then(()=>b.textContent=T.ui.copied).catch(()=>{});};
}
const icWa=`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>`;

/* ---------- report image ---------- */
function saveReport(A){
  const W=1200,H=630,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const fam=getComputedStyle(document.body).fontFamily;
  x.fillStyle="#07080b";x.fillRect(0,0,W,H);
  const g1=x.createRadialGradient(260,-40,10,260,-40,620);g1.addColorStop(0,"rgba(110,90,255,.45)");g1.addColorStop(1,"rgba(110,90,255,0)");x.fillStyle=g1;x.fillRect(0,0,W,H);
  const g2=x.createRadialGradient(1050,120,10,1050,120,520);g2.addColorStop(0,"rgba(0,166,214,.3)");g2.addColorStop(1,"rgba(0,166,214,0)");x.fillStyle=g2;x.fillRect(0,0,W,H);
  const col={bad:"#ff5470",warn:"#ffb340",good:"#34d399"}[A.v];
  x.direction=RTL?"rtl":"ltr";const L=RTL?W-72:72;x.textAlign=RTL?"right":"left";
  x.fillStyle="#a6adbf";x.font=`500 22px ${fam}`;x.fillText(T.report.title,L,84);
  x.fillStyle="#f4f5f8";x.font=`600 50px ${fam}`;x.direction="ltr";x.fillText(A.d,L,148);x.direction=RTL?"rtl":"ltr";
  x.fillStyle=col;x.font=`600 64px ${fam}`;x.fillText(T.status[A.v][0],L,240);
  const rows=[["dm",pill("dm",A.dm),A.dm.cls],["spf",pill("spf",A.spf),A.spf.cls],["dk",pill("dk",A.dk),A.dk.cls],["ll",v(T.ll[A.ll.k][0],A.others.length),A.ll.cls]];
  const cm={bad:"#ff5470",warn:"#ffb340",good:"#34d399",info:"#4fd1ff"};
  rows.forEach((r,i)=>{const y=330+i*56;x.fillStyle="#a6adbf";x.font=`500 25px ${fam}`;x.fillText(T.names[r[0]][0],L,y);x.fillStyle=cm[r[2]];x.font=`600 25px ${fam}`;x.fillText(r[1],RTL?L-470:L+470,y);});
  const gx=RTL?200:W-200,gy=300,R=112;x.lineWidth=16;x.strokeStyle="rgba(255,255,255,.08)";x.beginPath();x.arc(gx,gy,R,0,Math.PI*2);x.stroke();
  x.strokeStyle=col;x.lineCap="round";x.beginPath();x.arc(gx,gy,R,-Math.PI/2,-Math.PI/2+Math.PI*2*A.score/100);x.stroke();
  x.textAlign="center";x.direction="ltr";x.fillStyle="#f4f5f8";x.font=`600 66px ${fam}`;x.fillText(String(A.score),gx,gy+22);x.fillStyle="#6e7689";x.font=`500 18px ${fam}`;x.fillText("/ 100",gx,gy+52);
  x.textAlign=RTL?"right":"left";x.direction=RTL?"rtl":"ltr";x.fillStyle="#6e7689";x.font=`500 20px ${fam}`;x.fillText(`${T.report.date} ${new Date().toISOString().slice(0,10)} · ${SITE}`,L,H-52);
  c.toBlob(b=>{const f=new File([b],`email-fraud-check-${A.d}.png`,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[f]})&&matchMedia("(pointer:coarse)").matches){navigator.share({files:[f],title:T.report.title}).catch(()=>{});return;}
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);},"image/png");
}

const qs=location.search;if(qs)$$(".lang a").forEach(a=>a.href=a.getAttribute("href").split("?")[0]+qs);
const pre=new URLSearchParams(qs).get("d");if(pre){input.value=pre;input.dispatchEvent(new Event("input"));setTimeout(run,500);}
})();
