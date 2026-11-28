export function createDungeonSystem({THREE,world,hero,makeEnemy,getEnemies,onRoomChanged=()=>{},roomCount=36,seed=Date.now()}){
 const rand=mulberry32(seed>>>0), S=16, H=2.8, D=3.4;
 const floorMat=new THREE.MeshStandardMaterial({color:0x35495d,metalness:.3,roughness:.75});
 const wallMat=new THREE.MeshStandardMaterial({color:0x263c53,metalness:.55,roughness:.55});
 const trim=new THREE.MeshStandardMaterial({color:0xff8536,metalness:.35,roughness:.36});
 const glow=new THREE.MeshStandardMaterial({color:0x29cfff,emissive:0x0876ff,emissiveIntensity:2});
 const dirs=[{x:0,z:-1,n:"north"},{x:1,z:0,n:"east"},{x:0,z:1,n:"south"},{x:-1,z:0,n:"west"}], key=(x,z)=>x+","+z;
 const cells=[{x:0,z:0}], used=new Set(["0,0"]);
 while(cells.length<Math.max(30,Math.min(50,roomCount))){
  const opts=[];for(const c of cells)for(const d of dirs){const x=c.x+d.x,z=c.z+d.z,k=key(x,z);if(!used.has(k))opts.push({x,z,k})}
  const uniq=[...new Map(opts.map(o=>[o.k,o])).values()],n=uniq[Math.floor(rand()*uniq.length)];
  cells.push({x:n.x,z:n.z});used.add(n.k);
 }
 const rooms=cells.map((c,i)=>({id:i+1,x:c.x,z:c.z,cx:c.x*S,cz:c.z*S,depth:0,type:"combat",connections:[],cleared:false,visited:false,spawned:false}));
 const map=new Map(rooms.map(r=>[key(r.x,r.z),r]));
 for(const r of rooms)for(const d of dirs){const n=map.get(key(r.x+d.x,r.z+d.z));if(n)r.connections.push({room:n,dir:d.n})}
 const q=[rooms[0]],seen=new Set([1]);while(q.length){const r=q.shift();for(const e of r.connections)if(!seen.has(e.room.id)){e.room.depth=r.depth+1;seen.add(e.room.id);q.push(e.room)}}
 const order=[...rooms].sort((a,b)=>a.depth-b.depth||a.id-b.id),last=order.at(-1);
 const bossIds=new Set([order[Math.floor((order.length-1)*.34)].id,order[Math.floor((order.length-1)*.68)].id,last.id]);
 for(const r of rooms){if(r.id===1)r.type="start";else if(bossIds.has(r.id))r.type=r.id===last.id?"final-boss":"boss";else{const v=rand();r.type=v<.1?"rest":v<.21?"treasure":v<.33?"elite":v<.41?"event":"combat"}}
 function box(g,x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function wall(g,cx,cz,dir,door){
  const horizontal=dir==="north"||dir==="south", z=cz+(dir==="north"?-S/2:S/2), x=cx+(dir==="west"?-S/2:S/2);
  if(horizontal){if(door){const seg=(S-D)/2;box(g,cx-(D/2+seg/2),H/2,z,seg,H,.65,wallMat);box(g,cx+(D/2+seg/2),H/2,z,seg,H,.65,wallMat);box(g,cx,H-.18,z,D,.36,.65,trim)}else box(g,cx,H/2,z,S,H,.65,wallMat);box(g,cx,H+.08,z,S,.16,.8,trim)}
  else{if(door){const seg=(S-D)/2;box(g,x,H/2,cz-(D/2+seg/2),.65,H,seg,wallMat);box(g,x,H/2,cz+(D/2+seg/2),.65,H,seg,wallMat);box(g,x,H-.18,cz,.65,.36,D,trim)}else box(g,x,H/2,cz,.65,H,S,wallMat);box(g,x,H+.08,cz,.8,.16,S,trim)}
 }
 const colors={start:0x23536b,combat:0x35495d,elite:0x57334d,treasure:0x66502a,rest:0x285b4c,event:0x43336b,boss:0x682c36,"final-boss":0x713b16};
 for(const r of rooms){const g=new THREE.Group();world.add(g);r.group=g;const fm=new THREE.MeshStandardMaterial({color:colors[r.type],metalness:.3,roughness:.7});box(g,r.cx,-.18,r.cz,S,.35,S,fm);
  for(const d of dirs)wall(g,r.cx,r.cz,d.n,r.connections.some(e=>e.dir===d.n));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,.045,8,28),glow);ring.rotation.x=Math.PI/2;ring.position.set(r.cx,.05,r.cz);g.add(ring);
 }
 function at(x,z){const r=map.get(key(Math.round(x/S),Math.round(z/S)));return r&&Math.abs(x-r.cx)<=S/2&&Math.abs(z-r.cz)<=S/2?r:null}
 function spawn(r){if(r.spawned||r.cleared)return;r.spawned=r.visited=true;
  if(["rest","treasure","event"].includes(r.type)){onRoomChanged(r,r.type==="rest"?"Salle de repos":r.type==="treasure"?"Salle au trésor":"Événement découvert");return}
  const p=r.depth/Math.max(1,last.depth),boss=r.type==="boss"||r.type==="final-boss",count=boss?1:r.type==="elite"?7:4+Math.floor(p*5);
  for(let i=0;i<count;i++){const a=rand()*Math.PI*2,rad=2.5+rand()*3.5,e=makeEnemy(r.cx+Math.cos(a)*rad,r.cz+Math.sin(a)*rad,boss);if(e){const mult=1+p*(boss?0:2);e.max=Math.round(e.max*mult*(r.type==="final-boss"?4.5:r.type==="boss"?2.5:1));e.hp=e.max;e.damage=Math.round(e.damage*(1+p*1.2))}}
  onRoomChanged(r,boss?(r.type==="final-boss"?"BOSS FINAL":"GARDIEN DU DONJON"):`${r.type.toUpperCase()} · ${count} ENNEMIS`);
 }
 let active=null;hero.position.set(0,0,0);spawn(rooms[0]);
 return {seed,rooms,finalRoomId:last.id,get activeRoom(){return active},update(){const r=at(hero.position.x,hero.position.z);if(!r)return;if(r!==active){active=r;spawn(r)}if(r.spawned&&!r.cleared&&["combat","elite","boss","final-boss"].includes(r.type)&&getEnemies().length===0){r.cleared=true;onRoomChanged(r,r.type==="final-boss"?"DONJON TERMINÉ !":"SALLE NETTOYÉE")}},getSummary(){return{seed,rooms:rooms.length,cleared:rooms.filter(r=>r.cleared).length,finalRoomId:last.id}}};
}
function mulberry32(a){return()=>{let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
