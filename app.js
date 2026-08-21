const DATA_URL="data/Monitoring-AHI.csv";
let raw=[],filtered=[],page=1,pageSize=10;
const TYPES=["Power Transformer","Current Transformer","Potential Transformer","Circuit Breaker","Disconnecting Switch","Lightning Arrester","Neutral Grounding Resistance","Reactor","Capacitor"];
const AHI=[["1 - Very Good","c1"],["2 - Good","c2"],["3 - Fair","c3"],["4 - Poor","c4"],["5 - Critical","c5"]];
const AGE_RULES={"Power Transformer":[19,30],"Reactor":[19,30],"Neutral Grounding Resistance":[19,30],"Current Transformer":[14,25],"Potential Transformer":[14,25],"Capacitor":[14,25],"Circuit Breaker":[14,20],"Disconnecting Switch":[14,20],"Lightning Arrester":[9,15]};
const cols=["Unit Induk","Unit Pelaksana","Ultg","Gardu Induk","Bay","Penempatan","Phasa","Techidentno","Jenis Aset","Merk","Serial ID","Status Asset","Tipe Aset","Tegangan","Tahun Buat","Usia Aset","Kategori Umur","AHI","Parameter Pemicu"];
const $=id=>document.getElementById(id);
function parseCSV(t){let rows=[],row=[],cell="",q=false;for(let i=0;i<t.length;i++){let c=t[i];if(c=='"'){if(q&&t[i+1]=='"'){cell+='"';i++}else q=!q}else if(c==";"&&!q){row.push(cell);cell=""}else if((c=="\n"||c=="\r")&&!q){if(c=="\r"&&t[i+1]=="\n")i++;row.push(cell);if(row.some(x=>x.trim()!=""))rows.push(row);row=[];cell=""}else cell+=c}if(cell!=""||row.length){row.push(cell);rows.push(row)}let h=rows.shift().map(x=>x.replace(/^\uFEFF/,"").trim());return rows.map(a=>Object.fromEntries(h.map((k,i)=>[k,(a[i]??"").trim()])));}
function num(v){let m=String(v||"").replace(",",".").match(/-?\d+(\.\d+)?/);return m?Number(m[0]):null}
function voltageGroup(v){let n=num(v);return n!==null&&n<30?"incoming":n!==null&&n>=70&&n<=500?"70-500":"other"}
function age(r){let y=num(r["Tahun Buat"]);return y?new Date().getFullYear()-y:null}
function ageCat(r){let a=age(r),rule=AGE_RULES[r["Jenis Aset"]];if(a===null||!rule)return"—";return a<=rule[0]?"Muda":a<=rule[1]?"Tua":"Sangat Tua"}
function fmt(n){return Number(n||0).toLocaleString("id-ID")}
function pct(n,d){return d?((n/d)*100).toFixed(1).replace(".",",")+"%":"0,0%"}
function fill(id,values){let s=$(id);s.innerHTML='<option value="">Semua</option>'+values.map(v=>`<option>${v}</option>`).join("")}
function unique(f){return [...new Set(raw.map(r=>r[f]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"id"))}
function populate(){fill("unitInduk",unique("Unit Induk"));fill("upt",unique("Unit Pelaksana"));fill("ultg",unique("Ultg"));fill("gi",unique("Gardu Induk"));fill("bay",unique("Bay"));fill("phasa",unique("Phasa"));fill("jenis",TYPES);fill("ahi",AHI.map(x=>x[0]))}
function apply(){let vg=$("voltageGroup").value,v={unitInduk:$("unitInduk").value,upt:$("upt").value,ultg:$("ultg").value,gi:$("gi").value,bay:$("bay").value,phasa:$("phasa").value,jenis:$("jenis").value,ahi:$("ahi").value};filtered=raw.filter(r=>TYPES.includes(r["Jenis Aset"])&&voltageGroup(r.Tegangan)===vg&&(!v.unitInduk||r["Unit Induk"]===v.unitInduk)&&(!v.upt||r["Unit Pelaksana"]===v.upt)&&(!v.ultg||r.Ultg===v.ultg)&&(!v.gi||r["Gardu Induk"]===v.gi)&&(!v.bay||r.Bay===v.bay)&&(!v.phasa||r.Phasa===v.phasa)&&(!v.jenis||r["Jenis Aset"]===v.jenis)&&(!v.ahi||r.AHI===v.ahi));page=1;render()}
function render(){kpis();assetAhiVisual();ageDonut();ageBars();table()}
function kpis(){let valid=filtered.filter(r=>/^([1-5]) - /.test(r.AHI)),total=valid.length,counts=AHI.map(([n])=>valid.filter(r=>r.AHI===n).length),arr=[["TOTAL ASET",total,"100%","total"],...AHI.map((a,i)=>[a[0],counts[i],pct(counts[i],total),["good","good2","fair","poor","critical"][i]])];$("kpis").innerHTML=arr.map(x=>`<div class="kpi ${x[3]}"><div class="label">${x[0]}</div><div class="num">${fmt(x[1])}</div><div class="pct">${x[2]}</div></div>`).join("")}
function donut(id,items,total){let colors=["#20a46b","#f2b400","#f07800","#e53935","#111"],sum=items.reduce((a,x)=>a+x.v,0)||1,acc=0;let bg=items.map((x,i)=>{let s=acc/sum*360;acc+=x.v;return `${colors[i]} ${s}deg ${acc/sum*360}deg`}).join(",");$(id).innerHTML=`<div><div class="donut" style="background:conic-gradient(${bg})"><div class="donut-inner">${fmt(total)}<small>Total</small></div></div><div class="legend">${items.map((x,i)=>`<div><i class="dot" style="background:${colors[i]}"></i>${x.n} &nbsp; ${fmt(x.v)} (${pct(x.v,total)})</div>`).join("")}</div></div>`}
function ahiDonut(){donut("ahiDonut",AHI.map(([n])=>({n,v:filtered.filter(r=>r.AHI===n).length})),filtered.filter(r=>/^([1-5]) - /.test(r.AHI)).length)}
function assetAhiVisual(){
  const colors=["#20a46b","#f2b400","#f07800","#e53935","#111"];
  const rows=TYPES.map(t=>{
    const a=filtered.filter(r=>r["Jenis Aset"]===t);
    const total=a.length||0;
    const vals=AHI.map(([n])=>a.filter(r=>r.AHI===n).length);
    const segments=vals.map((v,i)=>`<div class="asset-seg" style="width:${total?(v/total*100):0}%;background:${colors[i]}" title="${AHI[i][0]}: ${fmt(v)} (${pct(v,total)})"></div>`).join("");
    return `<div class="asset-ahi-row">
      <div class="asset-ahi-name"><span>${t}</span><b>${fmt(total)}</b></div>
      <div class="asset-ahi-track">${segments || '<div class="asset-empty"></div>'}</div>
      <div class="asset-ahi-legend">
        ${AHI.map(([n],i)=>`<span><i style="background:${colors[i]}"></i>${fmt(vals[i])} <em>${pct(vals[i],total)}</em></span>`).join("")}
      </div>
    </div>`;
  }).join("");
  $("assetAhiVisual").innerHTML=rows;
}
function ageDonut(){let a=["Muda","Tua","Sangat Tua"].map(n=>({n,v:filtered.filter(r=>ageCat(r)===n).length}));donut("ageDonut",a,a.reduce((s,x)=>s+x.v,0))}
function ageBars(){$("ageBars").innerHTML=TYPES.map(t=>{let a=filtered.filter(r=>r["Jenis Aset"]===t),n=a.length||1,v=["Muda","Tua","Sangat Tua"].map(c=>a.filter(r=>ageCat(r)===c).length);return`<div class="age-row"><span>${t}</span><div class="bar"><i class="muda" style="width:${v[0]/n*100}%">${pct(v[0],a.length)}</i><i class="tua" style="width:${v[1]/n*100}%">${pct(v[1],a.length)}</i><i class="sangat" style="width:${v[2]/n*100}%">${pct(v[2],a.length)}</i></div></div>`}).join("")}
function table(){let q=$("search").value.toLowerCase(),rows=filtered.filter(r=>cols.some(c=>String(c==="Usia Aset"?age(r):c==="Kategori Umur"?ageCat(r):r[c]||"").toLowerCase().includes(q))),pages=Math.max(1,Math.ceil(rows.length/pageSize));if(page>pages)page=pages;let view=rows.slice((page-1)*pageSize,page*pageSize);$("assetTable").querySelector("thead").innerHTML="<tr>"+cols.map(c=>`<th>${c}</th>`).join("")+"</tr>";$("assetTable").querySelector("tbody").innerHTML=view.map(r=>"<tr>"+cols.map(c=>{let v=c==="Usia Aset"?age(r):c==="Kategori Umur"?ageCat(r):r[c]||"—";if(c==="AHI"){let k=String(v).charAt(0);return`<td><span class="ahi-badge ${({"1":"c1","2":"c2","3":"c3","4":"c4","5":"c5"})[k]||""}>${v}</span></td>`}return`<td>${v}</td>`}).join("")+"</tr>").join("");$("resultCount").textContent=`Menampilkan ${fmt(Math.min(rows.length,(page-1)*pageSize+1))}–${fmt(Math.min(rows.length,page*pageSize))} dari ${fmt(rows.length)} data`;$("pageInfo").textContent=`Halaman ${page} / ${pages}`}
async function updateDate(){
  try{
    const u="https://api.github.com/repos/harquijbb16/dashboardahiuitjbb/commits?path=data/Monitoring-AHI.csv&per_page=1";
    const r=await fetch(u,{headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
    if(!r.ok) throw Error("GitHub API");
    const j=await r.json();
    const d=j[0]?.commit?.committer?.date || j[0]?.commit?.author?.date;
    if(!d) throw Error("No commit date");
    const s=new Date(d).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"});
    $("lastDate").textContent=s;
    $("sideDate").textContent=s;
  }catch(e){
    $("lastDate").textContent="21 Agustus 2026";
    $("sideDate").textContent="21 Agustus 2026";
  }
}

$("applyBtn").onclick=apply;$("resetBtn").onclick=()=>{document.querySelectorAll("select").forEach(s=>s.value="");$("voltageGroup").value="70-500";apply()};$("voltageGroup").onchange=apply;$("search").oninput=()=>{page=1;table()};$("pageSize").onchange=e=>{pageSize=+e.target.value;page=1;table()};$("prev").onclick=()=>{if(page>1){page--;table()}};$("next").onclick=()=>{let n=filtered.length;if(page<Math.ceil(n/pageSize)){page++;table()}};$("exportBtn").onclick=()=>{let out=cols.join(";")+"\n"+filtered.map(r=>cols.map(c=>c==="Usia Aset"?age(r):c==="Kategori Umur"?ageCat(r):r[c]||"").map(x=>`"${String(x).replaceAll('"','""')}"`).join(";")).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+out],{type:"text/csv"}));a.download="AHI_Power_Inspect_Filtered.csv";a.click()};
Promise.all([fetch(DATA_URL+"?v="+Date.now(),{cache:"no-store"}).then(r=>r.text()),updateDate()]).then(([t])=>{raw=parseCSV(t);populate();apply()}).catch(()=>{document.body.innerHTML="<div style='padding:40px;font-family:Arial'><h2>CSV belum terbaca</h2><p>Pastikan file <b>data/Monitoring-AHI.csv</b> ada di repository.</p></div>"});
