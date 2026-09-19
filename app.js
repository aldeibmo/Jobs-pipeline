const inventory={motors8:6};
let jobs=JSON.parse(localStorage.getItem('ldcJobs'))||[
{name:'R47 / ADWOC19',client:'Waha Oil',service:'DD / MWD',start:'2026-09-18',end:'2026-09-23',status:'Ongoing',motors:2},
{name:'H53I / Al-Laheeb01',client:'AGOCO',service:'DD / MWD',start:'2026-09-20',end:'2026-09-25',status:'Ongoing',motors:2},
{name:'C23HR-47',client:'SOC',service:'DD / MWD',start:'2026-09-21',end:'2026-09-26',status:'Planned',motors:2},
{name:'Gyro Orientation',client:'Operations',service:'Gyro / WL',start:'2026-09-22',end:'2026-09-24',status:'Planned',motors:0}];
const base=new Date('2026-09-18T12:00:00'),days=[...Array(14)].map((_,i)=>{let d=new Date(base);d.setDate(d.getDate()+i);return d});
const iso=d=>d.toISOString().slice(0,10), cls=s=>s==='DD / MWD'?'dd':s==='Gyro / WL'?'gyro':'other';
function conflictJobs(){let set=new Set;days.forEach(d=>{let active=jobs.filter(j=>j.start<=iso(d)&&j.end>=iso(d));if(active.reduce((n,j)=>n+(+j.motors||0),0)>inventory.motors8)active.filter(j=>j.motors).forEach(j=>set.add(j.name))});return set}
function save(){localStorage.setItem('ldcJobs',JSON.stringify(jobs));render()}
function render(){let c=conflictJobs();total.textContent=jobs.length;ongoing.textContent=jobs.filter(j=>j.status==='Ongoing').length;planned.textContent=jobs.filter(j=>j.status==='Planned').length;conflicts.textContent=c.size?1:0;
let h='<div class="timeline"><div class="dates"><div>JOB / WELL</div>'+days.map(d=>'<div>'+d.toLocaleDateString('en',{day:'2-digit',month:'short'})+'</div>').join('')+'</div>';
jobs.forEach((j,i)=>{let s=Math.max(0,days.findIndex(d=>iso(d)>=j.start)),e=days.findIndex(d=>iso(d)>j.end);if(e<0)e=14;h+='<div class="row"><div class="label"><b>'+j.name+'</b><small>'+j.client+' · '+j.status+'</small></div><div draggable="true" data-i="'+i+'" class="bar '+cls(j.service)+(c.has(j.name)?' conflict':'')+'" style="grid-column:'+(s+2)+' / span '+Math.max(1,e-s)+'">'+j.service+'</div></div>'});timeline.innerHTML=h+'</div>';
inventoryEl.innerHTML='<div class="tool"><span>8&quot; Motors</span><span class="'+(c.size?'bad':'ok')+'">'+inventory.motors8+' available</span></div><div class="tool"><span>Standard DD allocation</span><span>2 motors / job</span></div>';
alerts.innerHTML=c.size?'<div class="alert"><b>8&quot; Motor shortage detected</b><br>Overlapping jobs require more than available inventory. Conflicting jobs are outlined in red.</div>':'<span class="ok">No tool conflicts.</span>';
document.querySelectorAll('.bar').forEach(b=>{b.ondragstart=e=>{window.dragX=e.clientX};b.ondragend=e=>{let shift=Math.round((e.clientX-window.dragX)/55);if(!shift)return;let j=jobs[+b.dataset.i];['start','end'].forEach(k=>{let d=new Date(j[k]+'T12:00:00');d.setDate(d.getDate()+shift);j[k]=iso(d)});save()}})}
const timeline=document.getElementById('timeline'),inventoryEl=document.getElementById('inventory'),alerts=document.getElementById('alerts'),modal=document.getElementById('modal');
add.onclick=()=>modal.showModal();cancel.onclick=()=>modal.close();
form.onsubmit=e=>{e.preventDefault();jobs.push({name:name.value,client:client.value,service:service.value,start:start.value,end:end.value,status:status.value,motors:+motors.value});modal.close();form.reset();save()};render();
