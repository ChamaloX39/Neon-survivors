/**
 * NEON SURVIVORS — Procedural dungeon system v0.2
 * Connected 30–50 room maps, room-specific enemy waves, door traversal,
 * progressive difficulty, guardian rooms and final boss.
 */
export function createDungeonSystem({THREE,world,hero,makeEnemy,getEnemies,onRoomChanged=()=>{},roomCount=36,seed=Date.now()}){
 const rand=mulberry32(seed>>>0), S=16, DOOR=3.8, MARGIN=.85;
 const floorMat=new THREE.MeshStandardMaterial({color:0x35495d,metalness:.3,roughness:.75});
 const wallMat=new THREE.MeshStandardMaterial({color:0x263c53,metalness:.55,roughness:.55});
 const trim=new THREE.MeshStandardMaterial({color:0xff8536,metalness:.35,roughness:.36});
 const neon=new THREE.MeshStandardMaterial({color:0x29cfff,emissive:0x0876ff,emissiveIntensity:2});
 const dirs=[{x:0,z:-1,n:"north"},{x:1,z:0,n:"east"},{x:0,z:1,n:"south"},{x:-1,z:0,n:"west"}];
 const key=(x,z)=>`${x},${z}`, total=Math.max(30,Math.min(50,Math.floor(roomCount)));
 const cells=[{x:0,z:0}],used=new Set(["0,0"]);
 while(cells.length<total){
  const candidates=[];
  for(const c of cells)for(const d of dirs){const x=c.x+d.x,z=c.z+d.z,k=key(x,z);if(!used.has(k))candidates.push({x,z,k})}
  const unique=[...new Map(candidates.map(v=>[v.k,v])).values()];
  const next=unique[Math.floor(rand()*unique.length)];
  cells.push({x:next.x,z:next.z});used.add(next.k);
 }
 const rooms=cells.map((c,i)=>({id:i+1,x:c.x,z:c.z,cx:c.x*S,cz:c.z*S,depth:0,type:"combat",connections:[],cleared:false,visited:false,spawned:false,enemyIds:new Set(),rewardClaimed:false}));
 const byCell=new Map(rooms.map(r=>[key(r.x,r.z),r]));
 for(const r of rooms)for(const d of dirs){const n=byCell.get(key(r.x+d.x,r.z+d.z));if(n)r.connections.push({room:n,dir:d.n})}
 const queue=[rooms[0]],seen=new Set([1]);
 while(queue.length){const r=queue.shift();for(const e of r.connections)if(!seen.has(e.room.id)){e.room.depth=r.depth+1;seen.add(e.room.id);queue.push(e.room)}}
 const progression=[...rooms].sort((a,b)=>a.depth-b.depth||a.id-b.id),last=progression[progression.length-1];
 const bossIds=new Set([progression[Math.floor((progression.length-1)*.34)].id,progression[Math.floor((progression.length-1)*.68)].id,last.id]);
 for(const r of rooms){
  if(r.id===1)r.type="start";
  else if(bossIds.has(r.id))r.type=r.id===last.id?"final-boss":"boss";
  else{const v=rand();r.type=v<.10?"rest":v<.21?"treasure":v<.33?"elite":v<.41?"event":"combat"}
 }
 const colors={start:0x23536b,combat:0x35495d,elite:0x57334d,treasure:0x66502a,rest:0x285b4c,event:0x43336b,boss:0x682c36,"final-boss":0x713b16};
 function box(g,x,y,z,w,h,d,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function makeWall(g,r,dir,door){
  const H=2.8, T=.65, half=S/2, cx=r.cx,cz=r.cz, horizontal=dir==="north"||dir==="south";
  if(horizontal){
   const z=cz+(dir==="north"?-half:half);
   if(door){const seg=(S-DOOR)/2;box(g,cx-(DOOR/2+seg/2),H/2,z,seg,H,T,wallMat);box(g,cx+(DOOR/2+seg/2),H/2,z,seg,H,T,wallMat);box(g,cx,H-.18,z,DOOR,.36,T,trim)}
   else box(g,cx,H/2,z,S,H,T,wallMat);
   box(g,cx,H+.08,z,S,.16,T+.12,trim);
  }else{
   const x=cx+(dir==="west"?-half:half);
   if(door){const seg=(S-DOOR)/2;box(g,x,H/2,cz-(DOOR/2+seg/2),T,H,seg,wallMat);box(g,x,H/2,cz+(DOOR/2+seg/2),T,H,seg,wallMat);box(g,x,H-.18,cz,T,.36,DOOR,trim)}
   else box(g,x,H/2,cz,T,H,S,wallMat);
   box(g,x,H+.08,cz,T+.12,.16,S,trim);
  }
 }
 for(const r of rooms){
  const g=new THREE.Group();world.add(g);r.group=g;
  const mat=new THREE.MeshStandardMaterial({color:colors[r.type],metalness:.32,roughness:.72});
  box(g,r.cx,-.18,r.cz,S,.35,S,mat);
  for(const d of dirs)makeWall(g,r,d.n,r.connections.some(e=>e.dir===d.n));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.045,8,28),neon);ring.rotation.x=Math.PI/2;ring.position.set(r.cx,.045,r.cz);g.add(ring);
 }
 function roomAt(x,z){
  const r=byCell.get(key(Math.round(x/S),Math.round(z/S)));
  return r&&Math.abs(x-r.cx)<=S/2+.01&&Math.abs(z-r.cz)<=S/2+.01?r:null;
 }
 function constrainMovement(fromX,fromZ,toX,toZ){
  const current=roomAt(fromX,fromZ);if(!current)return{x:fromX,z:fromZ};
  const dx=toX-current.cx,dz=toZ-current.cz,half=S/2-.05;
  let x=toX,z=toZ;
  if(Math.abs(dx)>half){
   const dir=dx>0?"east":"west",edge=current.connections.some(e=>e.dir===dir);
   if(!edge||Math.abs(dz)>DOOR/2-MARGIN)x=current.cx+Math.sign(dx)*half;
  }
  if(Math.abs(dz)>half){
   const dir=dz>0?"south":"north",edge=current.connections.some(e=>e.dir===dir);
   if(!edge||Math.abs(dx)>DOOR/2-MARGIN)z=current.cz+Math.sign(dz)*half;
  }
  return{x,z};
 }
 function enemiesInRoom(r){return getEnemies().filter(e=>e.roomId===r.id)}
 function spawnRoom(r){
  if(r.spawned||r.cleared)return;
  r.spawned=true;r.visited=true;
  if(r.type==="start"){r.cleared=true;onRoomChanged(r,"ENTRÉE DU DONJON · EXPLOREZ LES SALLES");return}
  if(r.type==="rest"){onRoomChanged(r,"SALLE DE REPOS · INTÉGRITÉ RESTAURÉE");return}
  if(r.type==="treasure"){onRoomChanged(r,"SALLE AU TRÉSOR · RÉCOMPENSE À RÉCUPÉRER");return}
  if(r.type==="event"){onRoomChanged(r,"ÉVÉNEMENT DÉCOUVERT");return}
  const p=r.depth/Math.max(1,last.depth),boss=r.type==="boss"||r.type==="final-boss";
  const count=boss?1:r.type==="elite"?7:4+Math.floor(p*5);
  for(let i=0;i<count;i++){
   const a=rand()*Math.PI*2,rad=2.4+rand()*3.7;
   const e=makeEnemy(r.cx+Math.cos(a)*rad,r.cz+Math.sin(a)*rad,boss);
   if(e){e.roomId=r.id;const mult=1+p*(boss?0:2.15)*(r.type==="elite"?1.25:1);e.max=Math.round(e.max*mult*(r.type==="final-boss"?4.5:r.type==="boss"?2.6:1));e.hp=e.max;e.damage=Math.round(e.damage*(1+p*1.25)*(boss?1.2:1));e.speed*=1+p*.22;r.enemyIds.add(e)}
  }
  onRoomChanged(r,boss?(r.type==="final-boss"?"BOSS FINAL · LE SURVEILLANT":"BOSS GARDIEN"):`${r.type.toUpperCase()} · ${count} ENNEMIS`);
 }
 function claimSpecial(r,state){
  if(r.rewardClaimed)return;
  r.rewardClaimed=true;
  if(r.type==="rest"){state.hp=Math.min(state.maxHp,state.hp+Math.round(state.maxHp*.35));return "REPOS · +35 % INTÉGRITÉ"}
  if(r.type==="treasure"){return "TRÉSOR · BUTIN BONUS"}
  if(r.type==="event"){return "ÉVÉNEMENT · BONUS À DÉCOUVRIR"}
  return null;
 }
 let active=null;
 hero.position.set(0,0,0);
 spawnRoom(rooms[0]);
 return {
  seed,rooms,finalRoomId:last.id,
  get activeRoom(){return active},
  constrainMovement,
  update(state){
   const r=roomAt(hero.position.x,hero.position.z);if(!r)return;
   if(r!==active){
    active=r;spawnRoom(r);
    const special=claimSpecial(r,state);if(special)onRoomChanged(r,special);
   }
   if(r.spawned&&!r.cleared&&["combat","elite","boss","final-boss"].includes(r.type)&&enemiesInRoom(r).length===0){
    r.cleared=true;onRoomChanged(r,r.type==="final-boss"?"DONJON TERMINÉ · VICTOIRE !":"SALLE NETTOYÉE · PASSAGES OUVERTS");
   }
  },
  reset(state){
   for(const e of [...getEnemies()]){if(e.roomId!==undefined){world.remove(e.g);getEnemies().splice(getEnemies().indexOf(e),1)}}
   rooms.forEach(r=>{r.cleared=false;r.visited=false;r.spawned=false;r.rewardClaimed=false;r.enemyIds.clear()});
   active=null;hero.position.set(0,0,0);spawnRoom(rooms[0]);
  },
  getSummary(){return{seed,rooms:rooms.length,cleared:rooms.filter(r=>r.cleared).length,finalRoomId:last.id}}
 };
}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
