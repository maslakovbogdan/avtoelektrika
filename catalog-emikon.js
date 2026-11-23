// ЭМИКОН's archive shows an open cabinet for the ЭК-1000 and a set of loose
// plug-in cards for the ЭК-2000. The photo atlases are rectified face prints.
window.drawEmikon = function drawEmikon(m, model) {
  const steel = "#b7c2c6", charcoal = "#292a2b";
  function box(x, y, z, width, height, thickness, color) {
    const w = width / 2, h = height / 2;
    m.solid(x, y, z, thickness, [[-w,-h],[w,-h],[w,h],[-w,h]], color);
  }
  function photo(x, y, z, width, height, crop, side = "front") {
    m.decal(x,y,z,width,height,"@photo-screen","#8d9189",side,"label",crop);
  }
  // Place an extruded part with its local Z axis along a cable or connector.
  function between(start, end, drawPart) {
    const v = end.map((n,i) => n - start[i]), length = Math.hypot(...v);
    const [dx,dy,dz] = v.map(n => n/length), planar = Math.hypot(dx,dy);
    const ux = planar ? -dy/planar : 1, uy = planar ? dx/planar : 0;
    const vx = -dz*uy, vy = dz*ux, vz = dx*uy-dy*ux;
    m.transform((x,y,z) => [
      start[0]+x*ux+y*vx+z*dx, start[1]+x*uy+y*vy+z*dy, start[2]+y*vz+z*dz
    ], () => drawPart(length));
  }
  function cable(path, radius, color) {
    const [a,b,c,d] = path;
    let last = a;
    for (let i=1;i<=9;i++) {
      const t=i/9, k=1-t;
      const next=a.map((v,j) => v*k*k*k+3*b[j]*k*k*t+3*c[j]*k*t*t+d[j]*t*t*t);
      between(last,next,len => m.disc(0,0,len/2,radius,len+.12,color,"front",7));
      last=next;
    }
  }
  function screw(x,y,z,size) {
    m.disc(x,y,z,size,.6,"#81837e","front",8);
    m.mark(x,y,z+.33,size*1.25,size*.24,"#383b3c");
  }

  if (model === "ЭК-2000") {
    // Locations are measured on the photographic fan, from left to right.
    // Each print is attached to one board; the reverse has its own copper pattern.
    const boards = [
      {top:[21,88], tilt:36.4, green:"#106346", chips:[[13,19,21,12],[13,44,21,12],[13,70,21,12],[13,97,21,12],[7,124,11,8]]},
      {top:[114,35], tilt:17.2, green:"#0d5133", chips:[[40,19,12,8],[35,33,8,7],[20,44,8,7]]},
      {top:[207,20], tilt:0, green:"#159357", chips:[[39,18,19,16],[18,37,5,7],[24,98,5,7]]},
      {top:[300,22], tilt:-14.3, green:"#159256", chips:[[36,24,5,35],[35,65,6,36],[29,99,6,37]]},
      {top:[400,55], tilt:-31.9, green:"#235c45", chips:[[30,10,12,11],[13,42,12,16],[42,103,18,16],[19,128,20,7],[40,132,21,8]]}
    ];
    boards.forEach(({top,tilt,green,chips}, n) => {
      const radians=tilt*Math.PI/180, cos=Math.cos(radians), sin=Math.sin(radians);
      const zBase=(n-2)*7.2;
      const pose=(x,y,z) => [top[0]+cos*x-sin*y, -top[1]+sin*x+cos*y, zBase+z];
      m.transform(pose, () => {
        const w=58,h=157;
        const uv=(cx,cy,width,height) =>
          [(n+(cx-width/2)/w)/5,(cy-height/2)/h/2,width/w/5,height/h/2];
        box(w/2,-h/2,0,w,h,1.8,green);
        photo(w/2,-h/2,.94,w-.3,h-.3,[n/5,0,.2,.5]);
        photo(w/2,-h/2,-.94,w-.3,h-.3,[n/5,.5,.2,.5],"back");
        for(const [x,y,width,height] of chips) {
          box(x,-y,1.96,width,height,2.1,n===0 ? "#953c43" : "#333638");
          photo(x,-y,3.04,width-.15,height-.15,uv(x,y,width,height));
        }
        // Full-height aluminum guide with returned edge and captive fixing pins.
        box(-3,-78,0,9,180,4.2,"#b8bdbd");
        box(-6.9,-78,2.0,1.5,179.6,5.3,"#d4d7d4");
        for(const y of [5,-161]) {
          m.disc(-3,y,2.9,2,2.2,"#888b84","front",9);
          box(-8.1,y,-1,4.8,1.8,1.8,steel);
        }
        // Multiway ivory edge connector at the top end of each card.
        box(56,-29,2.3,5.7,51,4.6,"#dad9c8");
        for(let i=0;i<16;i++) {
          box(53.3,-5.5-i*3.1,2.7,3.0,1.0,1.35,"#9f977c");
          m.mark(56.5,-5.5-i*3.1,4.64,1.6,.7,"#777969");
        }
      });
      if (!n) return;
      const plug=[[0,0],[185,267],[224,254],[266,258],[289,271]][n];
      const a=pose(-3,-167,1);
      const end=[plug[0],-plug[1],zBase+5];
      cable([a,[a[0]-13,a[1]-31,a[2]+1],[end[0]-40,end[1]+32,end[2]-2],end],2.65,"#343039");
      const dx=n===3 ? 6.5 : 16, dy=n===3 ? -23 : -20;
      between(end,[end[0]+dx,end[1]+dy,end[2]+6],len => {
        m.disc(0,0,2.8,7,5.7,"#645f58","front",10);
        m.disc(0,0,6.6,8.5,2,"#797269","front",12);
        m.disc(0,0,(len+8)/2,9.0,len-8,"#817971","front",16);
        m.disc(0,0,len+.85,9.15,1.8,"#c0b9a2","front",18);
        m.disc(0,0,len+1.84,7.0,.22,"#94726b","front",18);
        for(let j=0;j<7;j++){
          const phi=2*Math.PI*j/7;
          m.disc(Math.cos(phi)*4.5,Math.sin(phi)*4.5,len+2.01,.70,.2,"#50454a","front",6);
        }
      });
    });
    return;
  }

  const skin="#353638", inside="#515354", rail="#afb1ac", board="#55594f";
  // The card cage faces +Z. The control panel occupies the adjoining right wall,
  // with a deep corner post between them, as in the two-face archival view.
  for(const y of [-81,81]) box(0,y,0,161.6,5,151,skin);
  box(-78.4,0,0,4.2,158,151,skin);
  box(78.4,0,0,4.2,158,151,skin);
  box(0,0,-74,156,158,3.5,inside);
  box(0,0,-71,143,134,2.4,board);
  for(const x of [-77.45,77.45]) box(x,0,75.2,6.6,160,6.2,charcoal);
  for(const y of [-79.6,79.6]) box(0,y,75.2,148.28,6,6.2,charcoal);
  for(const x of [-71.4,71.4]) box(x,0,74.9,3.2,150,3.5,rail);
  for(const y of [-73,73]) box(0,y,74.8,141,3.2,3.6,rail);
  for(const x of [-71,71]) for(const y of [-70,0,70]) screw(x,y,77,1.05);
  // Eight withdrawn-card handles, individual boards and a lower loom.
  box(-10,-64.7,51.3,124,7.3,10.5,"#737771");
  const printCenters=[.024,.103,.188,.273,.350,.432,.514,.603];
  for(let n=0;n<8;n++) {
    const x=-63.5+11.35*n;
    box(x,17,5,1.3,100,122,board);
    box(x,17,65.8,8.45,100,3.0,"#a4a59e");
    const crop=[.5+(printCenters[n]-.026)/2,.016,.052/2,.703];
    photo(x,16.9,67.34,8.25,99.5,crop);
    box(x+1.7,63.4,69.1,2.35,6.4,3.4,"#666764");
    m.disc(x+1.7,65.5,70.99,.85,.39,steel,"front",8);
    for(const z of [-38,-15,12,40]) {
      box(x+1.6,20,z,2.3,19,8.4,"#313332");
      box(x+1.9,-14,z+4,3,14,9.2,"#424343");
    }
    box(x,-37.4,62.2,5.3,5.0,5.2,"#858881");
    const dx=n%2 ? 9 : 5;
    cable([[x,-39.8,63],[x-4,-56.1,72],[x-14,-73,73],[x+dx,-66,57]],1.18,"#c2c5bd");
    m.disc(x+dx,-64.7,57,1.9,3.0,rail,"front",10);
  }
  box(-23.6,-34.9,68.9,91,3.2,4.2,rail);
  // One shorter service card and the exposed control/backplane section to its right.
  box(43.2,11.3,58.0,34,113,3.2,board);
  photo(43.2,11.2,59.64,33.8,112.7,[.5+.664/2,.065,.187/2,.741]);
  box(42.4,51,61.5,14.7,22,3.7,"#81827c");
  for(let j=0;j<10;j++) box(42.3,41.8+j*1.95,63.9,14.4,.74,1,"#aeafa7");
  box(66,0,52.4,8.4,108,10.4,"#484949");
  for(let j=0;j<6;j++) {
    box(66,36-j*11,59.1,6.1,4.5,3.6,"#969991");
    box(33+j*5.6,-58,51,2.4,5.8,10.4,rail);
  }
  cable([[60,-42,56],[51,-59,61],[68,-68,58],[67,-62,54]],1.25,"#b5b8af");
  const sidePanel=(x,y,z)=>[80.65+z,y,-x];
  m.transform(sidePanel, () => {
    m.plate(0,0,0,139,145,2.0,"#babcb7",.9);
    function surround(l,t,r,b,depth) {
      photo(((l+r)/2-.5)*138.6,(.5-(t+b)/2)*144.6,depth,
        (r-l)*138.6,(b-t)*144.6,[l/2,t,(r-l)/2,b-t]);
    }
    const lGlass=.710,rGlass=.884,tGlass=.207,bGlass=.336;
    function aroundGlass(l,t,r,b,depth) {
      surround(l,t,r,tGlass,depth);surround(l,bGlass,r,b,depth);
      surround(l,tGlass,lGlass,bGlass,depth);surround(rGlass,tGlass,r,bGlass,depth);
    }
    aroundGlass(0,0,1,1,1.04);
    // The switches and indicators sit on three separately raised metal inserts.
    for(const [l,t,w,h,depth] of [[.118,.145,.45,.75,1.2],[.652,.145,.29,.26,1.9],[.652,.488,.297,.407,1.35]]) {
      const x=(l+w/2-.5)*138.6, y=(.5-t-h/2)*144.6;
      m.plate(x,y,1.05+depth/2,w*138.6-.25,h*144.6-.25,depth,charcoal,1.2);
      if (depth===1.9) {
        aroundGlass(l,t,l+w,t+h,1.10+depth);
        m.decal(((lGlass+rGlass)/2-.5)*138.6,(.5-(tGlass+bGlass)/2)*144.6,1.10+depth,
          (rGlass-lGlass)*138.6,(bGlass-tGlass)*144.6,"@display","#28332d","front","lcd");
      } else {
        photo(x,y,1.10+depth,w*138.6-.5,h*144.6-.5,[l/2,t,w/2,h]);
      }
    }
  });
  for(const x of [-69,69]) for(const y of [-69,69])
    m.disc(x,y,-76.05,1.25,.78,"#747771","back",8);
};
