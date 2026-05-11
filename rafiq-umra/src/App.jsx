import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════
const USERS = {
  "agency@demo.com":  { password:"123456", role:"agency",  name:"وكالة النور للسياحة" },
  "guide@demo.com":   { password:"123456", role:"guide",   name:"الأستاذ كمال المرافق" },
  "pilgrim@demo.com": { password:"123456", role:"pilgrim", name:"الحاج محمد بن سالم", pilgrimId:"p1" },
};

const INIT_PILGRIMS = [
  { id:"p1", name:"الحاج محمد بن سالم",   age:72, phone:"+216 98 123 456", familyPhone:"+216 71 111 222", familyName:"ابنه سالم",   room:"214", lat:21.4225, lng:39.8262, status:"safe"    },
  { id:"p2", name:"الحاجة فاطمة الزهراء", age:68, phone:"+216 97 234 567", familyPhone:"+216 71 222 333", familyName:"زوجها عمر",   room:"215", lat:21.4231, lng:39.8275, status:"safe"    },
  { id:"p3", name:"الحاج عبد الرحمن",     age:75, phone:"+216 96 345 678", familyPhone:"+216 71 333 444", familyName:"ابنته نور",   room:"312", lat:21.4198, lng:39.8301, status:"warning" },
  { id:"p4", name:"الحاجة خديجة نور",     age:65, phone:"+216 95 456 789", familyPhone:"+216 71 444 555", familyName:"أخوها يوسف", room:"118", lat:21.4245, lng:39.8255, status:"safe"    },
  { id:"p5", name:"الحاج يوسف المنصور",   age:70, phone:"+216 94 567 890", familyPhone:"+216 71 555 666", familyName:"زوجته أمال", room:"220", lat:21.4180, lng:39.8320, status:"danger"  },
  { id:"p6", name:"الحاجة مريم العلوي",   age:63, phone:"+216 93 678 901", familyPhone:"+216 71 666 777", familyName:"ابنها كريم", room:"309", lat:21.4228, lng:39.8268, status:"safe"    },
];

const INIT_FLIGHTS = [
  { id:"f1", type:"departure", flightNo:"TU721", airline:"Tunisair",         from:"تونس قرطاج (TUN)", to:"جدة (JED)",          date:"2025-03-15", scheduled:"23:45", estimated:"23:45", terminal:"A", gate:"12", status:"scheduled", notes:"" },
  { id:"f2", type:"arrival",   flightNo:"SV507", airline:"الخطوط السعودية", from:"جدة (JED)",         to:"تونس قرطاج (TUN)",  date:"2025-03-28", scheduled:"07:20", estimated:"07:20", terminal:"B", gate:"8",  status:"scheduled", notes:"" },
];

const INIT_SCHEDULE = [
  { id:"s1", time:"06:30", title:"صلاة الفجر في المسجد الحرام",  icon:"🕌", done:true,  active:false, day:1 },
  { id:"s2", time:"08:00", title:"التجمع في لوبي الفندق",         icon:"🏨", done:true,  active:false, day:1 },
  { id:"s3", time:"09:30", title:"الطواف حول الكعبة المشرفة",     icon:"🕋", done:false, active:true,  day:1 },
  { id:"s4", time:"11:00", title:"السعي بين الصفا والمروة",       icon:"🚶", done:false, active:false, day:1 },
  { id:"s5", time:"13:00", title:"الغداء في الفندق",              icon:"🍽️", done:false, active:false, day:1 },
  { id:"s6", time:"16:00", title:"زيارة بئر زمزم",               icon:"💧", done:false, active:false, day:1 },
  { id:"s7", time:"19:30", title:"صلاة المغرب والعشاء",           icon:"🌙", done:false, active:false, day:1 },
  { id:"s8", time:"09:00", title:"زيارة المدينة المنورة",         icon:"🌹", done:false, active:false, day:2 },
  { id:"s9", time:"11:00", title:"زيارة المسجد النبوي الشريف",    icon:"🕌", done:false, active:false, day:2 },
];

const INIT_GUIDES = [
  { id:"g1", name:"الأستاذ كمال المرافق",  email:"guide@demo.com",  group:"مجموعة 7", count:6, active:true  },
  { id:"g2", name:"الأستاذة سلمى النجار",  email:"guide2@demo.com", group:"مجموعة 8", count:8, active:true  },
];

// ── helpers ──────────────────────────────────────────
const GLAT = 21.4225, GLNG = 39.8262;
const calcDist = (la1,lo1,la2,lo2) => {
  const R=6371000,dL=(la2-la1)*Math.PI/180,dG=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dG/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
};
const sColor = s => s==="danger"?"#ef4444":s==="warning"?"#fbbf24":"#22c55e";
const sBg    = s => s==="danger"?"rgba(239,68,68,0.12)":s==="warning"?"rgba(251,191,36,0.10)":"rgba(34,197,94,0.08)";
const sLabel = s => s==="danger"?"خطر":s==="warning"?"تحذير":"آمن";
const fColor = s => s==="delayed"?"#f97316":s==="cancelled"?"#ef4444":"#22c55e";
const fLabel = s => s==="delayed"?"متأخر":s==="cancelled"?"ملغاة":"في الموعد";
const now    = () => new Date().toLocaleTimeString("ar",{hour:"2-digit",minute:"2-digit"});

// ══════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  if (!user) return <Login onLogin={u=>{setLoggingIn(true);setTimeout(()=>{setUser(u);setLoggingIn(false);},900);}} loading={loggingIn}/>;
  if (user.role==="pilgrim") return <PilgrimView user={user} onLogout={()=>setUser(null)}/>;
  if (user.role==="guide")   return <GuideView   user={user} onLogout={()=>setUser(null)}/>;
  if (user.role==="agency")  return <AgencyView  user={user} onLogout={()=>setUser(null)}/>;
}

// ══════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════
function Login({ onLogin, loading }) {
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr]           = useState("");

  const tryLogin = () => {
    setErr("");
    const u = USERS[email.trim().toLowerCase()];
    if (u && u.password === pass) onLogin({ email, ...u });
    else setErr("البريد أو كلمة المرور غلط");
  };

  return (
    <Wrap>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32,animation:"fadeUp .5s ease"}}>
          <div style={{width:82,height:82,borderRadius:"50%",background:"linear-gradient(135deg,#D4AF37,#8a6d1a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 14px",boxShadow:"0 0 40px rgba(212,175,55,.35)"}}>🕋</div>
          <div style={{fontSize:26,fontWeight:900,color:"#D4AF37"}}>رفيق العمرة</div>
          <div style={{fontSize:11,color:"#5a7a96",marginTop:3}}>نظام إدارة المعتمرين الذكي</div>
        </div>

        {/* Hint */}
        <div style={{width:"100%",maxWidth:360,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.25)",borderRadius:12,padding:"10px 14px",marginBottom:20,fontSize:11,color:"#93c5fd",lineHeight:1.9}}>
          <b style={{display:"block",marginBottom:2}}>🧪 حسابات التجربة:</b>
          🏢 أجنسية — agency@demo.com / 123456<br/>
          👨‍✈️ مرافق&nbsp;&nbsp; — guide@demo.com / 123456<br/>
          🤲 معتمر&nbsp;&nbsp; — pilgrim@demo.com / 123456
        </div>

        {/* Form */}
        <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:13}}>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input value={email} onChange={setEmail} type="email" placeholder="example@email.com" ltr onEnter={tryLogin}/>
          </div>
          <div>
            <Label>كلمة المرور</Label>
            <div style={{position:"relative"}}>
              <Input value={pass} onChange={setPass} type={showPass?"text":"password"} placeholder="••••••••" ltr onEnter={tryLogin}/>
              <button onClick={()=>setShowPass(v=>!v)} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#5a7a96"}}>
                {showPass?"🙈":"👁️"}
              </button>
            </div>
          </div>
          {err && <ErrBox>{err}</ErrBox>}
          <Btn primary onClick={tryLogin} disabled={loading||!email||!pass}>
            {loading?<Spin/>:"🔐 دخول"}
          </Btn>
        </div>
      </div>
      <div style={{textAlign:"center",padding:12,fontSize:10,color:"#1a3050"}}>رفيق العمرة © 2025</div>
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════
//  PILGRIM VIEW
// ══════════════════════════════════════════════════════
function PilgrimView({ user, onLogout }) {
  const [sharing, setSharing] = useState(false);
  const [status, setStatus]   = useState("safe");
  const [locMsg, setLocMsg]   = useState("");
  const [distance, setDistance] = useState(null);
  const watchRef = useRef(null);
  const today = INIT_SCHEDULE.filter(s=>s.day===1);
  const next  = today.find(s=>!s.done);

  const startGPS = () => {
    if (!navigator.geolocation) { setLocMsg("⚠️ الجهاز لا يدعم GPS"); return; }
    setSharing(true);
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const d = calcDist(GLAT,GLNG,pos.coords.latitude,pos.coords.longitude);
        const st = d>350?"danger":d>200?"warning":"safe";
        setStatus(st); setDistance(d);
        setLocMsg(`📍 موقعك يُرسل للمرافق`);
      },
      () => { setLocMsg("⚠️ تعذّر الموقع — تأكدي من صلاحيات GPS"); },
      { enableHighAccuracy:true, maximumAge:5000 }
    );
  };

  const stopGPS = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    setSharing(false); setLocMsg(""); setDistance(null); setStatus("safe");
  };

  useEffect(()=>()=>{ if(watchRef.current) navigator.geolocation.clearWatch(watchRef.current); },[]);

  return (
    <Wrap>
      <Header title="رفيق العمرة" sub="معتمر" onLogout={onLogout}>
        <Dot color={sColor(status)} pulse={sharing}/>
      </Header>
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:14}}>

        {/* Welcome */}
        <Card gold style={{textAlign:"center",padding:18,animation:"fadeUp .4s ease"}}>
          <div style={{fontSize:34,marginBottom:8}}>🤲</div>
          <div style={{fontSize:16,fontWeight:700,color:"#e2c97e"}}>{user.name}</div>
          <div style={{fontSize:11,color:"#5a7a96",marginTop:3}}>تقبّل الله طاعتك وأتمّ عمرتك</div>
        </Card>

        {/* GPS */}
        <Card style={{textAlign:"center",padding:18,background:sharing?"rgba(34,197,94,.06)":"rgba(15,26,46,.9)",border:`1px solid ${sharing?"rgba(34,197,94,.3)":"rgba(212,175,55,.15)"}`}}>
          <div style={{fontSize:11,color:"#5a7a96",marginBottom:10}}>مشاركة موقعك مع المرافق</div>
          <button onClick={sharing?stopGPS:startGPS}
            style={{padding:"13px 36px",border:"none",borderRadius:24,fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer",
              background:sharing?"linear-gradient(90deg,#ef4444,#dc2626)":"linear-gradient(90deg,#22c55e,#16a34a)",
              color:"white",boxShadow:sharing?"0 0 20px rgba(239,68,68,.3)":"0 0 20px rgba(34,197,94,.3)",
              animation:sharing?"pulse 2s infinite":"none"}}>
            {sharing?"⏹ إيقاف المشاركة":"▶ بدء مشاركة الموقع"}
          </button>
          {locMsg && <div style={{fontSize:12,color:sColor(status),marginTop:10,fontWeight:600}}>{locMsg}</div>}
          {distance!=null && (
            <div style={{marginTop:8,display:"inline-block",padding:"5px 14px",background:sBg(status),borderRadius:12,fontSize:12,color:sColor(status),fontWeight:700}}>
              المسافة: {distance}م · {sLabel(status)}
            </div>
          )}
        </Card>

        {/* Next activity */}
        {next && (
          <Card style={{animation:"fadeUp .5s ease"}}>
            <div style={{fontSize:10,color:"#5a7a96",marginBottom:8}}>🗓️ النشاط القادم</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:30}}>{next.icon}</span>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#D4AF37"}}>{next.title}</div>
                <div style={{fontSize:12,color:"#7ab3d4",marginTop:2}}>⏰ {next.time}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Schedule */}
        <Card style={{animation:"fadeUp .5s ease"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#D4AF37",marginBottom:10}}>📅 برنامج اليوم</div>
          {today.map(it=>(
            <div key={it.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:it.done?.42:1}}>
              <span style={{fontSize:18}}>{it.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:it.active?700:400,color:it.done?"#2a4a6a":it.active?"#D4AF37":"#c8a85a"}}>{it.title}</div>
                {it.active&&<div style={{fontSize:10,color:"#a0832a"}}>● جارٍ الآن</div>}
              </div>
              <span style={{fontSize:11,color:"#5a7a96",direction:"ltr"}}>{it.time}</span>
              {it.done&&<span style={{color:"#22c55e"}}>✓</span>}
            </div>
          ))}
        </Card>

        {/* SOS */}
        <Card style={{background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.2)",textAlign:"center"}}>
          <div style={{fontSize:11,color:"#5a7a96",marginBottom:9}}>في حالة الطوارئ</div>
          <button style={{padding:"11px 28px",border:"none",borderRadius:20,fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",background:"linear-gradient(90deg,#ef4444,#dc2626)",color:"white"}}>
            🆘 اتصل بالمرافق فوراً
          </button>
        </Card>
      </div>
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════
//  GUIDE VIEW
// ══════════════════════════════════════════════════════
function GuideView({ user, onLogout }) {
  const [tab, setTab]           = useState("map");
  const [pilgrims, setPilgrims] = useState(()=>INIT_PILGRIMS.map(p=>({...p,distance:calcDist(GLAT,GLNG,p.lat,p.lng)})));
  const [flights, setFlights]   = useState(INIT_FLIGHTS);
  const [schedule, setSchedule] = useState(INIT_SCHEDULE);
  const [log, setLog]           = useState([
    {id:1,type:"danger", msg:"🚨 الحاج يوسف المنصور ابتعد 450م",             time:"09:42"},
    {id:2,type:"flight", msg:"✈️ تم إشعار عائلات المعتمرين برحلة TU721",    time:"08:00"},
    {id:3,type:"info",   msg:"📱 تذكير الصباح أُرسل لـ6 معتمرين",           time:"06:00"},
  ]);
  const [toast, setToast]       = useState(null);
  const [day, setDay]           = useState(1);
  const [delayModal, setDelayModal] = useState(false);
  const [activeFlight, setActiveFlight] = useState(null);
  const [delayMin, setDelayMin] = useState("");
  const [delayReason, setDelayReason] = useState("");
  const [schedModal, setSchedModal] = useState(false);
  const [newItem, setNewItem]   = useState({time:"",title:"",icon:"📍"});
  const [busy, setBusy]         = useState(false);
  const canvasRef               = useRef(null);

  const toast$ = (msg,type="info") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  const addLog  = (type,msg) => setLog(l=>[{id:Date.now(),type,msg,time:now()},...l]);

  // simulate live movement
  useEffect(()=>{
    const t = setInterval(()=>{
      setPilgrims(ps=>ps.map(p=>{
        const jitter = ()=>(Math.random()-.5)*.0002;
        const nlat=p.lat+jitter(), nlng=p.lng+jitter();
        const d=calcDist(GLAT,GLNG,nlat,nlng);
        const st=d>350?"danger":d>200?"warning":"safe";
        if(st!==p.status&&st==="danger") addLog("danger",`🚨 ${p.name.split(" ")[1]} ابتعد ${d}م — إشعار العائلة تلقائياً`);
        return {...p,lat:nlat,lng:nlng,distance:d,status:st};
      }));
    },4000);
    return ()=>clearInterval(t);
  },[]);

  // canvas
  useEffect(()=>{
    if(tab!=="map") return;
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); let raf;
    const lats=pilgrims.map(p=>p.lat),lngs=pilgrims.map(p=>p.lng);
    const minLa=Math.min(...lats)-.003,maxLa=Math.max(...lats)+.003;
    const minLo=Math.min(...lngs)-.003,maxLo=Math.max(...lngs)+.003;
    const xy=(la,lo)=>[((lo-minLo)/(maxLo-minLo))*(cv.width-80)+40,((maxLa-la)/(maxLa-minLa))*(cv.height-80)+40];
    function draw(t){
      ctx.clearRect(0,0,cv.width,cv.height);
      const bg=ctx.createRadialGradient(cv.width/2,cv.height/2,0,cv.width/2,cv.height/2,cv.width);
      bg.addColorStop(0,"#0d1b2e");bg.addColorStop(1,"#060d1a");
      ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);
      ctx.strokeStyle="rgba(212,175,55,.06)";ctx.lineWidth=1;
      for(let i=0;i<cv.width;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,cv.height);ctx.stroke();}
      for(let i=0;i<cv.height;i+=40){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(cv.width,i);ctx.stroke();}
      const[kx,ky]=xy(GLAT,GLNG);
      pilgrims.forEach(p=>{
        const[px,py]=xy(p.lat,p.lng);
        ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(px,py);
        ctx.strokeStyle=p.status==="danger"?"rgba(239,68,68,.35)":p.status==="warning"?"rgba(251,191,36,.25)":"rgba(34,197,94,.12)";
        ctx.lineWidth=1.5;ctx.setLineDash([4,6]);ctx.stroke();ctx.setLineDash([]);
      });
      pilgrims.filter(p=>p.status!=="safe").forEach(p=>{
        const[px,py]=xy(p.lat,p.lng);
        const a=.25+.2*Math.sin(t*.003);
        ctx.beginPath();ctx.arc(px,py,26+5*Math.sin(t*.004),0,Math.PI*2);
        ctx.strokeStyle=p.status==="danger"?`rgba(239,68,68,${a})`:`rgba(251,191,36,${a})`;
        ctx.lineWidth=2;ctx.stroke();
      });
      ctx.save();ctx.shadowColor="rgba(212,175,55,.7)";ctx.shadowBlur=22;
      ctx.fillStyle="#D4AF37";ctx.beginPath();ctx.arc(kx,ky,14,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.font="14px serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle="#060d1a";ctx.fillText("🕋",kx,ky);ctx.restore();
      pilgrims.forEach(p=>{
        const[px,py]=xy(p.lat,p.lng);const c=sColor(p.status);
        ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);
        ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle="rgba(6,13,26,.85)";ctx.beginPath();ctx.roundRect(px-36,py+13,72,17,3);ctx.fill();
        ctx.fillStyle="#e2c97e";ctx.font="10px 'Cairo',sans-serif";ctx.textAlign="center";
        ctx.fillText(p.name.split(" ").slice(-1)[0],px,py+24);
      });
      raf=requestAnimationFrame(draw);
    }
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[tab,pilgrims]);

  const sendDelay = () => {
    if(!delayMin||!activeFlight) return;
    setBusy(true);
    setTimeout(()=>{
      const [hh,mm] = activeFlight.scheduled.split(":").map(Number);
      const total = hh*60+mm+parseInt(delayMin);
      const nh=String(Math.floor(total/60)).padStart(2,"0"), nm=String(total%60).padStart(2,"0");
      setFlights(fs=>fs.map(f=>f.id===activeFlight.id?{...f,status:"delayed",estimated:`${nh}:${nm}`,notes:delayReason}:f));
      addLog("flight",`✈️ تأخير ${delayMin}د في ${activeFlight.flightNo} — تم إشعار عائلات ${pilgrims.length} معتمرين`);
      setBusy(false);setDelayModal(false);setDelayMin("");setDelayReason("");
      toast$(`✅ تم إشعار ${pilgrims.length} عائلة بالتأخير`,"success");
    },1500);
  };

  const addSched = () => {
    if(!newItem.time||!newItem.title) return;
    setSchedule(s=>[...s,{...newItem,id:"s"+Date.now(),done:false,active:false,day}].sort((a,b)=>a.time.localeCompare(b.time)));
    setSchedModal(false);setNewItem({time:"",title:"",icon:"📍"});
    toast$("✅ تمت الإضافة","success");
  };

  const danger$ = pilgrims.filter(p=>p.status==="danger").length;
  const warn$   = pilgrims.filter(p=>p.status==="warning").length;
  const delay$  = flights.filter(f=>f.status==="delayed").length;

  const TABS=[
    {id:"map",     icon:"🗺️",label:"الخريطة"},
    {id:"pilgrims",icon:"👥",label:"المعتمرون"},
    {id:"flights", icon:"✈️",label:"الرحلات",  badge:delay$},
    {id:"schedule",icon:"📅",label:"البرنامج"},
    {id:"notifs",  icon:"🔔",label:"الإشعارات",badge:log.filter(l=>l.type==="danger").length},
  ];

  return (
    <Wrap>
      {toast && <Toast {...toast}/>}
      <Header title="رفيق العمرة" sub={`مرافق — ${user.name}`} onLogout={onLogout}>
        {danger$>0 && <Badge color="#ef4444">🚨{danger$}</Badge>}
        {delay$>0  && <Badge color="#f97316">✈️تأخير</Badge>}
      </Header>

      {/* stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",background:"#060d1a",borderBottom:"1px solid rgba(212,175,55,.1)"}}>
        {[{l:"الكل",v:pilgrims.length,c:"#7ab3d4",i:"👥"},{l:"آمنون",v:pilgrims.filter(p=>p.status==="safe").length,c:"#22c55e",i:"✅"},{l:"تحذير",v:warn$,c:"#fbbf24",i:"⚠️"},{l:"خطر",v:danger$,c:"#ef4444",i:"🚨"},{l:"رحلات",v:flights.length,c:"#a78bfa",i:"✈️"}].map((s,i)=>(
          <div key={i} style={{padding:"9px 4px",textAlign:"center"}}>
            <div style={{fontSize:14}}>{s.i}</div>
            <div style={{fontSize:17,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:"#3a5a7a"}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto",paddingBottom:72}}>

        {/* ── MAP ── */}
        {tab==="map"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <canvas ref={canvasRef} width={480} height={300} style={{width:"100%",height:265,display:"block"}}/>
            <div style={{padding:"8px 14px",background:"#0a1525",borderTop:"1px solid rgba(212,175,55,.08)",display:"flex",gap:12,flexWrap:"wrap",fontSize:10,color:"#5a7a96"}}>
              {[["#22c55e","آمن"],["#fbbf24",">200م تحذير"],["#ef4444",">350م خطر"]].map(([c,l])=>(
                <span key={l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</span>
              ))}
              <span style={{color:"#a0832a"}}>● يتحرك كل 4 ثواني (محاكاة)</span>
            </div>
            <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:7}}>
              {pilgrims.map(p=>(
                <div key={p.id} className="rh" style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Dot color={sColor(p.status)} size={8}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"#e2c97e"}}>{p.name}</div>
                      <div style={{fontSize:10,color:"#3a5a7a"}}>غرفة {p.room}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:sColor(p.status),background:sBg(p.status),padding:"2px 9px",borderRadius:9}}>{p.distance}م</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PILGRIMS ── */}
        {tab==="pilgrims"&&(
          <div style={{padding:14,display:"flex",flexDirection:"column",gap:10,animation:"fadeUp .3s ease"}}>
            {pilgrims.map(p=>(
              <Card key={p.id} style={{border:`1px solid ${p.status==="danger"?"rgba(239,68,68,.3)":p.status==="warning"?"rgba(251,191,36,.2)":"rgba(212,175,55,.1)"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:`${sColor(p.status)}15`,border:`2px solid ${sColor(p.status)}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👤</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#e2c97e"}}>{p.name}</div>
                      <div style={{fontSize:10,color:"#5a7a96"}}>{p.age}سنة · غرفة {p.room}</div>
                    </div>
                  </div>
                  <div style={{padding:"3px 10px",borderRadius:16,fontSize:11,fontWeight:700,background:sBg(p.status),color:sColor(p.status)}}>{sLabel(p.status)}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
                  <IB label="المسافة"        value={`${p.distance}م`}  color={sColor(p.status)}/>
                  <IB label="جهة الاتصال"    value={p.familyName}       color="#a78bfa"/>
                  <IB label="هاتف المعتمر"   value={p.phone}            color="#7ab3d4" ltr/>
                  <IB label="هاتف العائلة"   value={p.familyPhone}      color="#22c55e" ltr/>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <Btn danger onClick={()=>toast$(`📞 جاري الاتصال بـ${p.name.split(" ")[1]}...`,"info")}>📞 المعتمر</Btn>
                  <Btn gold onClick={()=>{addLog("info",`📲 تم إشعار ${p.familyName} بحالة ${p.name.split(" ")[1]}`);toast$(`✅ تم إشعار ${p.familyName}`,"success");}}>📲 العائلة</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── FLIGHTS ── */}
        {tab==="flights"&&(
          <div style={{padding:14,display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .3s ease"}}>
            {flights.map(fl=>(
              <Card key={fl.id} style={{border:`1px solid ${fl.status==="delayed"?"rgba(249,115,22,.4)":"rgba(212,175,55,.14)"}`,overflow:"hidden",padding:0}}>
                <div style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:20}}>{fl.type==="departure"?"🛫":"🛬"}</span>
                    <div><div style={{fontSize:15,fontWeight:900,color:"#D4AF37"}}>{fl.flightNo}</div><div style={{fontSize:10,color:"#5a7a96"}}>{fl.airline}</div></div>
                  </div>
                  <div style={{padding:"3px 10px",borderRadius:16,fontSize:11,fontWeight:700,background:`${fColor(fl.status)}18`,color:fColor(fl.status),border:`1px solid ${fColor(fl.status)}44`}}>{fLabel(fl.status)}</div>
                </div>
                <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}><div style={{fontSize:9,color:"#3a5a7a"}}>من</div><div style={{fontSize:12,fontWeight:600,color:"#e2c97e"}}>{fl.from}</div></div>
                  <div style={{color:"#D4AF37",fontSize:16}}>→</div>
                  <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:9,color:"#3a5a7a"}}>إلى</div><div style={{fontSize:12,fontWeight:600,color:"#e2c97e"}}>{fl.to}</div></div>
                </div>
                <div style={{padding:"0 14px 10px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                  <IB label="التاريخ"    value={fl.date}       color="#7ab3d4"/>
                  <IB label="المجدول"   value={fl.scheduled}  color="#D4AF37"/>
                  <IB label="المتوقع"   value={fl.estimated}  color={fl.status==="delayed"?"#f97316":"#22c55e"}/>
                </div>
                <div style={{padding:"0 14px 10px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                  <IB label="الصالة"      value={fl.terminal}       color="#a78bfa"/>
                  <IB label="البوابة"     value={fl.gate}           color="#22c55e"/>
                  <IB label="المعتمرون"   value={`${pilgrims.length} 👥`} color="#7ab3d4"/>
                </div>
                {fl.notes&&<div style={{margin:"0 14px 10px",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",borderRadius:8,padding:"6px 10px",fontSize:11,color:"#fb923c"}}>📝 {fl.notes}</div>}
                <div style={{padding:"0 14px 13px",display:"flex",gap:8}}>
                  <Btn danger onClick={()=>{setActiveFlight(fl);setDelayModal(true);}}>⏰ إضافة تأخير</Btn>
                  <Btn gold onClick={()=>{addLog("flight",`📲 تم إشعار عائلات ${pilgrims.length} معتمرين برحلة ${fl.flightNo}`);toast$(`📲 تم إشعار ${pilgrims.length} عائلة`,"success");}}>📲 أشعر العائلات</Btn>
                </div>
              </Card>
            ))}
            <Btn gold onClick={()=>{addLog("info","📡 بث كامل — تم إشعار جميع عائلات المعتمرين ببرنامج الرحلات");toast$("✅ تم الإرسال لجميع العائلات","success");}}>
              📡 أرسل البرنامج الكامل لجميع العائلات
            </Btn>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab==="schedule"&&(
          <div style={{padding:14,animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",gap:7,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
              {[1,2,3,4,5,6,7,8,9,10].map(d=>(
                <button key={d} onClick={()=>setDay(d)} style={{flexShrink:0,padding:"5px 13px",borderRadius:16,border:`1px solid ${day===d?"rgba(212,175,55,.4)":"rgba(255,255,255,.07)"}`,background:day===d?"rgba(212,175,55,.1)":"transparent",color:day===d?"#D4AF37":"#5a7a96",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>يوم {d}</button>
              ))}
            </div>
            <div style={{background:"rgba(59,130,246,.07)",border:"1px solid rgba(59,130,246,.2)",borderRadius:11,padding:"9px 13px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#93c5fd"}}>📱 تذكير اليوم {day}</span>
              <button className="bg" onClick={()=>{addLog("info",`📱 تذكير اليوم ${day} أُرسل لـ${pilgrims.length} معتمرين`);toast$("✅ تم إرسال التذكير","success");}} style={{padding:"5px 12px",border:"1px solid rgba(59,130,246,.3)",borderRadius:16,background:"rgba(59,130,246,.1)",color:"#93c5fd",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>إرسال الآن</button>
            </div>
            {schedule.filter(s=>s.day===day).length===0&&<div style={{textAlign:"center",padding:32,color:"#3a5a7a",fontSize:12}}>لا توجد أنشطة — أضف من الزر أدناه</div>}
            {schedule.filter(s=>s.day===day).map(it=>(
              <div key={it.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 8px",background:it.active?"rgba(212,175,55,.07)":"transparent",borderRadius:9,border:it.active?"1px solid rgba(212,175,55,.16)":"1px solid transparent",opacity:it.done?.42:1,marginBottom:3}}>
                <span style={{minWidth:40,textAlign:"center",fontSize:11,fontWeight:700,color:it.active?"#D4AF37":"#5a7a96"}}>{it.time}</span>
                <div style={{width:2,height:34,background:it.active?"#D4AF37":"rgba(255,255,255,.06)",borderRadius:1}}/>
                <span style={{fontSize:18}}>{it.icon}</span>
                <div style={{flex:1,fontSize:12,fontWeight:it.active?700:400,color:it.done?"#2a4a6a":it.active?"#D4AF37":"#c8a85a"}}>{it.title}</div>
                <button onClick={()=>{addLog("info",`🔔 تذكير: "${it.title}" في ${it.time}`);toast$("✅ تم إرسال التذكير","success");}} style={{background:"rgba(212,175,55,.07)",border:"1px solid rgba(212,175,55,.14)",borderRadius:6,padding:"3px 7px",fontSize:10,color:"#a0832a",cursor:"pointer",fontFamily:"inherit"}}>🔔</button>
                {it.done&&<span style={{color:"#22c55e"}}>✓</span>}
              </div>
            ))}
            <Btn gold onClick={()=>setSchedModal(true)} style={{marginTop:8}}>+ إضافة نشاط جديد</Btn>
          </div>
        )}

        {/* ── NOTIFS ── */}
        {tab==="notifs"&&(
          <div style={{padding:14,animation:"fadeUp .3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[
                {icon:"🌅",label:"تذكير الصباح",color:"#93c5fd",bg:"rgba(59,130,246,.08)"},
                {icon:"📍",label:"طلب موقع",    color:"#22c55e",bg:"rgba(34,197,94,.07)"},
                {icon:"🍽️",label:"تذكير الغداء",color:"#fbbf24",bg:"rgba(251,191,36,.07)"},
                {icon:"🌙",label:"تذكير المساء", color:"#a78bfa",bg:"rgba(167,139,250,.07)"},
              ].map((b,i)=>(
                <button key={i} className="bg" onClick={()=>{addLog("info",`${b.icon} ${b.label} — أُرسل لـ${pilgrims.length} معتمرين`);toast$(`✅ تم إرسال ${b.label}`,"success");}} style={{padding:"10px 6px",border:`1px solid ${b.bg.replace(".07","0.2").replace(".08","0.25")}`,borderRadius:10,background:b.bg,color:b.color,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:3}}>{b.icon}</div>{b.label}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:"#3a5a7a",marginBottom:8}}>سجل الإشعارات ({log.length})</div>
            {log.map(n=>(
              <div key={n.id} style={{display:"flex",gap:9,padding:"9px 11px",background:"rgba(255,255,255,.025)",borderRadius:9,marginBottom:5,border:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:15,marginTop:1}}>{n.type==="danger"?"🚨":n.type==="flight"?"✈️":"📱"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:n.type==="danger"?"#ef4444":n.type==="flight"?"#a78bfa":"#7ab3d4",lineHeight:1.5}}>{n.msg}</div>
                  <div style={{fontSize:10,color:"#3a5a7a",marginTop:2}}>{n.time} · <span style={{color:"#22c55e"}}>✓ أُرسل</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* bottom nav */}
      <BottomNav tabs={TABS} active={tab} onChange={setTab}/>

      {/* delay modal */}
      {delayModal&&activeFlight&&(
        <Modal title={`⏰ تأخير رحلة ${activeFlight.flightNo}`} onClose={()=>setDelayModal(false)}>
          <div style={{fontSize:11,color:"#5a7a96",marginBottom:12}}>الموعد الأصلي: {activeFlight.scheduled}</div>
          <Label>مدة التأخير (دقائق)</Label>
          <Input value={delayMin} onChange={setDelayMin} type="number" placeholder="مثال: 45" ltr style={{marginBottom:10}}/>
          <Label>سبب التأخير</Label>
          <textarea value={delayReason} onChange={e=>setDelayReason(e.target.value)} placeholder="ظروف جوية، ضغط المطار..." rows={2} style={{...inputSt,resize:"none",marginBottom:12}}/>
          <div style={{background:"rgba(249,115,22,.07)",border:"1px solid rgba(249,115,22,.2)",borderRadius:9,padding:"9px 11px",marginBottom:14,fontSize:11,color:"#fb923c"}}>
            📲 سيتم إشعار عائلات {pilgrims.length} معتمرين عبر WhatsApp و SMS
          </div>
          <div style={{display:"flex",gap:9}}>
            <Btn onClick={()=>setDelayModal(false)}>إلغاء</Btn>
            <Btn danger onClick={sendDelay} disabled={busy||!delayMin} style={{flex:2}}>
              {busy?<><Spin/> جاري الإرسال...</>:"✅ تأكيد وإشعار العائلات"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* schedule modal */}
      {schedModal&&(
        <Modal title={`+ إضافة نشاط — يوم ${day}`} onClose={()=>setSchedModal(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><Label>الوقت</Label><input value={newItem.time} onChange={e=>setNewItem(v=>({...v,time:e.target.value}))} type="time" style={inputSt}/></div>
            <div><Label>الأيقونة</Label>
              <select value={newItem.icon} onChange={e=>setNewItem(v=>({...v,icon:e.target.value}))} style={{...inputSt,fontSize:16}}>
                {["🕌","🕋","🚶","🍽️","💧","🌙","🛍️","🚌","🌹","📍","🏨","🤲","⛰️"].map(ic=><option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
          </div>
          <Label>عنوان النشاط</Label>
          <Input value={newItem.title} onChange={v=>setNewItem(n=>({...n,title:v}))} placeholder="مثال: زيارة جبل النور" style={{marginBottom:14}}/>
          <div style={{display:"flex",gap:9}}>
            <Btn onClick={()=>setSchedModal(false)}>إلغاء</Btn>
            <Btn gold onClick={addSched} style={{flex:2}}>✅ إضافة</Btn>
          </div>
        </Modal>
      )}
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════
//  AGENCY VIEW
// ══════════════════════════════════════════════════════
function AgencyView({ user, onLogout }) {
  const [tab, setTab]           = useState("overview");
  const [guides, setGuides]     = useState(INIT_GUIDES);
  const [pilgrims, setPilgrims] = useState(INIT_PILGRIMS);
  const [toast, setToast]       = useState(null);
  const [gModal, setGModal]     = useState(false);
  const [pModal, setPModal]     = useState(false);
  const [newG, setNewG]         = useState({name:"",email:"",password:"",group:""});
  const [newP, setNewP]         = useState({name:"",age:"",phone:"",familyName:"",familyPhone:"",room:""});
  const [busy, setBusy]         = useState(false);

  const toast$ = (msg,type="info")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const addGuide = () => {
    if(!newG.name||!newG.email||!newG.password) return;
    setBusy(true);
    setTimeout(()=>{
      setGuides(g=>[...g,{id:"g"+Date.now(),name:newG.name,email:newG.email,group:newG.group||"مجموعة جديدة",count:0,active:true}]);
      setGModal(false);setNewG({name:"",email:"",password:"",group:""});
      setBusy(false);toast$("✅ تم إضافة المرافق","success");
    },1200);
  };

  const addPilgrim = () => {
    if(!newP.name||!newP.phone) return;
    setBusy(true);
    setTimeout(()=>{
      setPilgrims(p=>[...p,{id:"p"+Date.now(),...newP,lat:GLAT,lng:GLNG,status:"safe",distance:0}]);
      setPModal(false);setNewP({name:"",age:"",phone:"",familyName:"",familyPhone:"",room:""});
      setBusy(false);toast$("✅ تم إضافة المعتمر","success");
    },1000);
  };

  const TABS=[
    {id:"overview",icon:"📊",label:"نظرة عامة"},
    {id:"guides",  icon:"👨‍✈️",label:"المرافقون"},
    {id:"pilgrims",icon:"🤲",label:"المعتمرون"},
    {id:"settings",icon:"⚙️",label:"الإعدادات"},
  ];

  return (
    <Wrap>
      {toast && <Toast {...toast}/>}
      <Header title="رفيق العمرة" sub={`أجنسية — ${user.name}`} onLogout={onLogout}/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#060d1a",borderBottom:"1px solid rgba(212,175,55,.1)"}}>
        {[{l:"مرافقون",v:guides.length,c:"#7ab3d4",i:"👨‍✈️"},{l:"معتمرون",v:pilgrims.length,c:"#D4AF37",i:"🤲"},{l:"مجموعات",v:guides.length,c:"#a78bfa",i:"👥"},{l:"رحلات",v:2,c:"#22c55e",i:"✈️"}].map((s,i)=>(
          <div key={i} style={{padding:"9px 4px",textAlign:"center"}}>
            <div style={{fontSize:14}}>{s.i}</div>
            <div style={{fontSize:17,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:"#3a5a7a"}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto",paddingBottom:72}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{padding:14,display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .3s ease"}}>
            <Card gold><div style={{fontSize:14,fontWeight:700,color:"#D4AF37",marginBottom:3}}>مرحباً بك 👋</div><div style={{fontSize:11,color:"#7a9bc0"}}>{user.name}</div></Card>
            {guides.map(g=>(
              <Card key={g.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👨‍✈️</div>
                    <div><div style={{fontSize:13,fontWeight:700,color:"#e2c97e"}}>{g.name}</div><div style={{fontSize:10,color:"#5a7a96"}}>{g.group}</div></div>
                  </div>
                  <div style={{fontSize:10,padding:"2px 8px",borderRadius:14,background:"rgba(34,197,94,.1)",color:"#22c55e"}}>نشط</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                  <IB label="المعتمرون" value={g.count} color="#D4AF37"/>
                  <IB label="الآمنون"  value={g.count} color="#22c55e"/>
                  <IB label="تنبيهات" value="0"        color="#fbbf24"/>
                </div>
              </Card>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Btn gold onClick={()=>setTab("guides")}>👨‍✈️ إضافة مرافق</Btn>
              <Btn onClick={()=>setTab("pilgrims")} style={{border:"1px solid rgba(122,179,212,.2)",background:"rgba(122,179,212,.06)",color:"#7ab3d4"}}>🤲 إضافة معتمر</Btn>
            </div>
          </div>
        )}

        {/* GUIDES */}
        {tab==="guides"&&(
          <div style={{padding:14,display:"flex",flexDirection:"column",gap:10,animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#5a7a96"}}>المرافقون ({guides.length})</span>
              <Btn gold small onClick={()=>setGModal(true)}>+ إضافة مرافق</Btn>
            </div>
            {guides.map(g=>(
              <Card key={g.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(212,175,55,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>👨‍✈️</div>
                    <div><div style={{fontSize:13,fontWeight:700,color:"#e2c97e"}}>{g.name}</div><div style={{fontSize:10,color:"#5a7a96"}}>{g.email}</div></div>
                  </div>
                  <div style={{fontSize:10,padding:"2px 8px",borderRadius:14,background:"rgba(34,197,94,.1)",color:"#22c55e"}}>نشط</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  <IB label="المجموعة" value={g.group} color="#D4AF37"/>
                  <IB label="المعتمرون" value={g.count} color="#7ab3d4"/>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* PILGRIMS */}
        {tab==="pilgrims"&&(
          <div style={{padding:14,display:"flex",flexDirection:"column",gap:9,animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#5a7a96"}}>جميع المعتمرين ({pilgrims.length})</span>
              <Btn gold small onClick={()=>setPModal(true)}>+ إضافة معتمر</Btn>
            </div>
            {pilgrims.map(p=>(
              <div key={p.id} className="rh" style={{background:"rgba(15,26,46,.95)",border:"1px solid rgba(212,175,55,.08)",borderRadius:12,padding:"11px 13px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:33,height:33,borderRadius:"50%",background:"rgba(212,175,55,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤲</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#e2c97e",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                  <div style={{fontSize:10,color:"#5a7a96"}}>{p.age||"—"}سنة · غرفة {p.room||"—"}</div>
                </div>
                <div style={{fontSize:10,color:sColor(p.status),background:sBg(p.status),padding:"2px 7px",borderRadius:8,fontWeight:600,flexShrink:0}}>{sLabel(p.status)}</div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {tab==="settings"&&(
          <div style={{padding:14,display:"flex",flexDirection:"column",gap:10,animation:"fadeUp .3s ease"}}>
            <Card>
              <div style={{fontSize:13,fontWeight:700,color:"#D4AF37",marginBottom:12}}>⚙️ إعدادات الأجنسية</div>
              {[{l:"الاسم",v:user.name},{l:"البريد",v:user.email},{l:"تنبيه التحذير",v:"200م"},{l:"تنبيه الخطر",v:"350م"}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <span style={{fontSize:12,color:"#5a7a96"}}>{r.l}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#e2c97e"}}>{r.v}</span>
                </div>
              ))}
            </Card>
            <Card style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.18)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#93c5fd",marginBottom:8}}>🔥 ربط Firebase للنظام الحقيقي</div>
              <div style={{fontSize:11,color:"#5a7a96",lineHeight:1.8,marginBottom:8}}>
                1. اذهبي إلى console.firebase.google.com<br/>
                2. أنشئي مشروعاً جديداً<br/>
                3. فعّلي Authentication + Firestore<br/>
                4. ضعي بيانات الاتصال في الكود
              </div>
              <div style={{fontSize:10,background:"rgba(0,0,0,.25)",borderRadius:8,padding:"8px 10px",direction:"ltr",fontFamily:"monospace",color:"#7ab3d4",lineHeight:2}}>
                apiKey: "..."<br/>authDomain: "..."<br/>projectId: "..."<br/>appId: "..."
              </div>
            </Card>
            <button onClick={onLogout} style={{padding:"12px",border:"1px solid rgba(239,68,68,.22)",borderRadius:11,background:"rgba(239,68,68,.05)",color:"#ef4444",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer"}}>🚪 تسجيل الخروج</button>
          </div>
        )}
      </div>

      <BottomNav tabs={TABS} active={tab} onChange={setTab}/>

      {/* Add guide modal */}
      {gModal&&(
        <Modal title="👨‍✈️ إضافة مرافق جديد" onClose={()=>setGModal(false)}>
          {[{l:"الاسم الكامل",k:"name",p:"الأستاذ كمال..."},{l:"البريد الإلكتروني",k:"email",p:"guide@email.com",ltr:true},{l:"كلمة المرور",k:"password",p:"••••••••",ltr:true,type:"password"},{l:"المجموعة",k:"group",p:"مجموعة 9"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <Label>{f.l}</Label>
              <Input value={newG[f.k]} onChange={v=>setNewG(g=>({...g,[f.k]:v}))} type={f.type||"text"} placeholder={f.p} ltr={f.ltr}/>
            </div>
          ))}
          <div style={{display:"flex",gap:9,marginTop:4}}>
            <Btn onClick={()=>setGModal(false)}>إلغاء</Btn>
            <Btn gold onClick={addGuide} disabled={busy} style={{flex:2}}>{busy?<><Spin/> جاري الإنشاء...</>:"✅ إضافة المرافق"}</Btn>
          </div>
        </Modal>
      )}

      {/* Add pilgrim modal */}
      {pModal&&(
        <Modal title="🤲 إضافة معتمر جديد" onClose={()=>setPModal(false)}>
          {[{l:"الاسم الكامل",k:"name",p:"الحاج محمد..."},{l:"العمر",k:"age",p:"70"},{l:"هاتف المعتمر",k:"phone",p:"+216 9X..."},{l:"اسم جهة الاتصال",k:"familyName",p:"ابنه علي"},{l:"هاتف العائلة",k:"familyPhone",p:"+216 7X..."},{l:"رقم الغرفة",k:"room",p:"220"}].map(f=>(
            <div key={f.k} style={{marginBottom:9}}>
              <Label>{f.l}</Label>
              <Input value={newP[f.k]} onChange={v=>setNewP(g=>({...g,[f.k]:v}))} placeholder={f.p}/>
            </div>
          ))}
          <div style={{display:"flex",gap:9,marginTop:4}}>
            <Btn onClick={()=>setPModal(false)}>إلغاء</Btn>
            <Btn gold onClick={addPilgrim} disabled={busy} style={{flex:2}}>{busy?<><Spin/> جاري الإضافة...</>:"✅ إضافة المعتمر"}</Btn>
          </div>
        </Modal>
      )}
    </Wrap>
  );
}

// ══════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ══════════════════════════════════════════════════════
const inputSt = {width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(212,175,55,.2)",borderRadius:9,color:"#e2c97e",fontSize:13,fontFamily:"'Cairo',sans-serif",display:"block"};

function Wrap({children}){ return <div style={{minHeight:"100vh",background:"#060d1a",fontFamily:"'Cairo',sans-serif",direction:"rtl",color:"#e2c97e",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}><style>{CSS}</style>{children}</div>; }

function Header({title,sub,onLogout,children}){
  return(
    <div style={{background:"linear-gradient(135deg,#0f1a2e,#162640)",padding:"13px 16px",borderBottom:"1px solid rgba(212,175,55,.18)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#D4AF37,#a0832a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 0 14px rgba(212,175,55,.3)"}}>🕋</div>
        <div><div style={{fontSize:15,fontWeight:900,color:"#D4AF37"}}>{title}</div><div style={{fontSize:10,color:"#5a7a96"}}>{sub}</div></div>
      </div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>{children}<button onClick={onLogout} style={{background:"none",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#5a7a96",fontSize:11,cursor:"pointer",padding:"5px 9px",fontFamily:"inherit"}}>خروج</button></div>
    </div>
  );
}

function Card({children,style,gold}){
  return <div style={{background:gold?"linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04))":"rgba(15,26,46,.95)",border:gold?"1px solid rgba(212,175,55,.25)":"1px solid rgba(212,175,55,.1)",borderRadius:14,padding:14,...style}}>{children}</div>;
}

function Modal({title,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#0f1a2e",border:"1px solid rgba(212,175,55,.2)",borderRadius:"20px 20px 0 0",padding:18,width:"100%",maxWidth:480,animation:"slideUp .3s ease",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:3,background:"rgba(212,175,55,.3)",borderRadius:2,margin:"0 auto 14px"}}/>
        <div style={{fontSize:15,fontWeight:900,color:"#D4AF37",marginBottom:14}}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function BottomNav({tabs,active,onChange}){
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(6,13,26,.97)",borderTop:"1px solid rgba(212,175,55,.13)",display:"flex",zIndex:100,backdropFilter:"blur(10px)"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:"9px 4px 7px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"inherit",position:"relative"}}>
          <span style={{fontSize:17}}>{t.icon}</span>
          <span style={{fontSize:9,color:active===t.id?"#D4AF37":"#3a5a7a",fontWeight:active===t.id?700:400}}>{t.label}</span>
          {t.badge>0&&<div style={{position:"absolute",top:5,right:"50%",transform:"translateX(7px)",width:15,height:15,borderRadius:"50%",background:"#ef4444",color:"white",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.badge}</div>}
          {active===t.id&&<div style={{position:"absolute",bottom:0,left:"22%",right:"22%",height:2,background:"#D4AF37",borderRadius:1}}/>}
        </button>
      ))}
    </div>
  );
}

function Toast({msg,type}){
  const bg=type==="success"?"linear-gradient(90deg,#166534,#15803d)":type==="danger"?"linear-gradient(90deg,#7f1d1d,#991b1b)":"linear-gradient(90deg,#1e3a5f,#1a4a6e)";
  return <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,color:"white",padding:"9px 18px",borderRadius:22,fontSize:12,fontWeight:700,boxShadow:"0 4px 24px rgba(0,0,0,.5)",animation:"slideDown .3s ease",whiteSpace:"nowrap",maxWidth:"88vw"}}>{msg}</div>;
}

function IB({label,value,color,ltr}){ return <div style={{background:"rgba(255,255,255,.03)",borderRadius:8,padding:"6px 9px"}}><div style={{fontSize:9,color:"#3a5a7a",marginBottom:2}}>{label}</div><div style={{fontSize:12,fontWeight:700,color:color||"#e2c97e",direction:ltr?"ltr":"rtl"}}>{value}</div></div>; }
function Label({children}){ return <label style={{fontSize:11,color:"#7ab3d4",display:"block",marginBottom:5}}>{children}</label>; }
function Input({value,onChange,type="text",placeholder,ltr,onEnter,style}){ return <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} onKeyDown={e=>e.key==="Enter"&&onEnter&&onEnter()} style={{...inputSt,direction:ltr?"ltr":"rtl",...style}}/>; }
function Btn({children,onClick,disabled,gold,danger,small,style}){
  const bg=gold?"linear-gradient(90deg,#D4AF37,#a0832a)":danger?"linear-gradient(90deg,#ef4444,#dc2626)":"transparent";
  const color=gold?"#060d1a":danger?"white":"#5a7a96";
  const border=gold?"none":danger?"none":"1px solid rgba(255,255,255,.09)";
  return <button onClick={onClick} disabled={disabled} className="bg" style={{flex:1,padding:small?"5px 13px":"10px",border,borderRadius:small?16:9,background:disabled?"#1a2a3a":bg,color:disabled?"#3a5a7a":color,fontFamily:"inherit",fontSize:small?11:12,fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,...style}}>{children}</button>;
}
function Dot({color,size=8,pulse}){ return <div style={{width:size,height:size,borderRadius:"50%",background:color,boxShadow:`0 0 ${size}px ${color}`,animation:pulse?"pulse 1.5s infinite":"none",flexShrink:0}}/>; }
function Badge({children,color}){ return <div style={{background:`${color}20`,border:`1px solid ${color}55`,borderRadius:20,padding:"3px 9px",fontSize:11,color,fontWeight:700}}>{children}</div>; }
function Spin(){ return <span style={{animation:"spin .8s linear infinite",display:"inline-block"}}>⏳</span>; }
function ErrBox({children}){ return <div style={{fontSize:12,color:"#ef4444",textAlign:"center",background:"rgba(239,68,68,.08)",padding:"8px",borderRadius:8,border:"1px solid rgba(239,68,68,.2)"}}>{children}</div>; }

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#D4AF37;border-radius:2px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.85}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .rh{transition:background .15s;cursor:pointer}.rh:hover{background:rgba(212,175,55,.06)!important}
  .bg{transition:filter .15s,transform .12s}.bg:hover{filter:brightness(1.15);transform:scale(1.02)}
  input,textarea,select{outline:none}
`;
