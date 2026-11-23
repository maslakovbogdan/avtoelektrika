// CPU 315-2 PN/DP, operator layout and enclosure, Siemens manual A5E00105475-12, p. 50.
// ET 200M: seven-slot station shown in the Siemens PCS 7 catalogue, page 421.
window.drawSimatic = function drawSimatic(mesh, model) {
  const u = .025;
  const caseGray = "#50575a", graphite = "#3e4548", cover = "#596164";
  const recess = "#1f2425", ink = "#b9c3bd", teal = "#087d80";
  const lens = "#718071";

  function box(x, y, z, width, height, depth, color) {
    const a = width*u/2, b = height*u/2;
    mesh.solid(x*u,y*u,z*u,depth*u,[[-a,-b],[a,-b],[a,b],[-a,b]],color);
  }
  function mark(x, y, z, width, height, color, side = "front") {
    mesh.mark(x*u,y*u,z*u,width*u,height*u,color,side);
  }
  function print(x, y, z, width, height, text, stock, side = "front") {
    mesh.decal(x*u,y*u,z*u,width*u,height*u,text,stock,side);
  }
  function lid(x, y, z, width, height, depth, color) {
    mesh.plate(x*u,y*u,z*u,width*u,height*u,depth*u,color,.65*u,"front",.01);
  }
  function brand(x, y, z, width = 23) {
    print(x,y,z,width,5.5,"SIEMENS",teal);
  }
  function indicator(x, y, z, lit = false) {
    mark(x,y,z,1.9,2.1,recess);
    mark(x,y,z+.035,1.15,1.46,lit ? "#98ae7f" : lens);
  }

  // The head and I/O cartridges hook over a folded rail at the rear. The nose
  // above the wiring cavity continues forward of the lower half of the case.
  function cartridge(x, width, depth, vented) {
    const rear = -depth/2, nose = depth/2;
    const shell = [
      [rear+3,-60],[nose-20,-60],[nose-18,-57],[nose-18,59],
      [nose-21,61],[rear+4,61],[rear+2,59],[rear+2,-57],
    ];
    // At the left side u points forward along +Z and v points up.
    mesh.solid(x*u,0,0,(width-.6)*u,shell.map(([z,y])=>[z*u,y*u]),caseGray,"left");
    box(x,25,nose-10,width-.6,73,18,caseGray);
    // Side cheeks enclose the wiring behind the closed, hinged front cover.
    box(x,-31.4,nose-9.5,width-1.4,58.4,17.8,graphite);
    box(x,60,nose-9,width-.6,4.6,17,caseGray);
    box(x,52,rear+1.5,width-2,15,3,graphite);
    box(x,-42,rear+1.5,width-2,14,3,graphite);
    box(x,-49,rear+2,width*.64,2.6,5,graphite);
    if (vented) {
      const start = rear+8, end = nose-9;
      const grilleWidth = width-5;
      box(x,61.07,(start+end)/2,grilleWidth+.40,.32,end-start+.40,recess);
      // Separate transverse bridges sit above the recessed vent bed.
      const count = Math.floor((end-start)/6.7);
      for (let row=0; row<=count; row++) {
        const z=start+(end-start)*row/count;
        box(x,61.8,z,grilleWidth,1.15,1.5,caseGray);
      }
      for (const dx of [-grilleWidth/2,0,grilleWidth/2])
        box(x+dx,61.85,(start+end)/2,1.45,1.28,end-start,caseGray);
    }
    return nose;
  }

  function cpu() {
    const z=cartridge(0,40,130,true);
    lid(0,31,z-1.6,39.7,61.5,2.3,cover);
    const face=z-.4;
    brand(7,56.6,face);
    // Visible edge and ejector of the Micro Memory Card.
    mark(-6.8,36,face,3.8,41,recess);
    box(-6.8,37,face+.45,.85,37.4,.75,"#4c8c8a");
    box(-6.8,16.3,face+.25,2.6,3.7,1.2,graphite);
    const lights=["SF","BF1","BF2","MAINT","DC5V","FRCE","RUN","STOP"];
    lights.forEach((name,i)=>{
      const y=55.5-i*4.4;
      indicator(-17.5,y,face,i===4||i===6);
      print(-13,y,face,6.6,3,name,cover);
    });
    print(1.7,16.3,face,9,3.6,"PUSH",cover);
    mark(-11.1,7.2,face,4.9,9.3,recess);
    box(-11.1,7.8,face+.6,2.9,4.1,1.15,graphite);
    print(-3.3,7.1,face,9.2,8.5,"RUN\nSTOP\nMRES",cover);
    // Removable, full-width lower flap over PROFINET and MPI/DP sockets.
    lid(0,-31.2,z-1.2,39.8,61.5,2.4,cover);
    print(-3.3,-9.6,z+.04,26,10,"SIMATIC\nS7-300",cover);
    print(-.5,-56.5,z+.04,27,3.6,"CPU 315-2 PN/DP",cover);
    mark(-17,-56.5,z+.045,3.7,4.1,graphite);
    for (const sign of [-1,1])
      box(sign*19.4,-1,z-6.1,1.15,6,9,graphite);
    // Side-facing backplane connector and moulded recess.
    mesh.socket(19.72*u,-24*u,(z-25)*u,13*u,26*u,"right",graphite,2,7);
    print(19.74,20,-21,34,19,"SIMATIC S7-300\nCPU 315-2 PN/DP\n6ES7 315-2EH14",caseGray,"right");
    print(-19.74,-9,4,36,27,"S7-300\nCPU 315-2 PN/DP",caseGray,"left");
  }

  function station() {
    // The seven bay boundaries are measured on the rectified illustration.
    const textureWidth = 1536, textureHeight = 512;
    const boundaries = [0, 287, 454, 603, 752, 899, 1206, textureWidth];
    const width = 400, height = 136, depth = 132;
    const body = "#434b55", lip = "#414955", grille = "#28313a";
    const rail = "#859098", front = depth / 2;

    function panel(left, right, top, bottom, offset) {
      const w = (right - left) * width / textureWidth;
      const h = (bottom - top) * height / textureHeight;
      const x = ((left + right) / (2 * textureWidth) - .5) * width;
      const y = (.5 - (top + bottom) / (2 * textureHeight)) * height;
      const surface = front + offset;
      box(x, y, (front + surface) / 2, w - .26, h - .26, offset, lip);
      const uv = [left / textureWidth, top / textureHeight,
        (right - left) / textureWidth, (bottom - top) / textureHeight];
      mesh.decal(x*u, y*u, (surface+.035)*u, (w-.32)*u, (h-.32)*u,
        "@photo-screen", lip, "front", "label", uv);
    }

    function moduleVent(x, w, slot) {
      const span = w - 4.2;
      const top = height/2, zSpan = depth-10;
      mark(x, top+.06, -1, span, zSpan, grille, "top");
      for (let i=0; i<14; i++)
        box(x, top+.69, -zSpan/2 + i*zSpan/13, span, 1.16, 1.8, lip);
      const ribs = w > 50 ? 4 : 2;
      for (let i=0; i<=ribs; i++)
        box(x-span/2+i*span/ribs, top+.93, 0, 1.35, 1.4, zSpan, body);
      // Snap catches lift out of the front edge of the I/O grille.
      if (slot===2 || slot===4)
        box(x+.4, top+2.35, front-15, 12.5, 3.8, 8, "#59616c");
    }

    box(0, 0, -front-1.5, width-3, 85, 3, rail);
    for (const y of [-42,42])
      box(0, y, -front-4.2, width-3, 2.4, 2.4, "#a3afb4");
    for (const x of [-176, -90, 0, 90, 176]) {
      mesh.plate(x*u, 0, (-front-3.1)*u, 7*u, 3.8*u, .15*u, grille, 1.65*u, "back");
    }

    boundaries.slice(1).forEach((right, slot) => {
      const left = boundaries[slot];
      const x = ((left + right) / (2 * textureWidth) - .5) * width;
      const w = (right - left) * width / textureWidth;
      box(x, 0, 0, w-.55, height, depth, body);
      moduleVent(x, w, slot);
      box(x, -49, -front-1.25, w*.5, 6, 2.5, "#303841");
      if (slot < 2) {
        const seam = slot===0 ? 287 : 245;
        panel(left, right, 0, seam, 1.5);
        panel(left, right, seam, textureHeight, 1.85);
      } else {
        const seam = right - (slot < 5 ? 49 : 115);
        panel(left, seam, 0, textureHeight, 2.2);
        panel(seam, right, 0, textureHeight, 1.45);
      }
    });
    // Clip openings on the PSU cheek are visible from the catalogue angle.
    const end = width/2 - .25;
    for (const y of [-56, 51])
      mark(-end, y, front-12, 4.8, 7.3, grille, "left");
    for (const y of [-45, 37]) {
      box(-end+.15, y, -front+4, 1.5, 10.2, 9.4, lip);
      mark(-end-.62, y, -front+4, 5.2, 5.7, grille, "left");
    }
    mark(end, 0, 14, .8, height-6, "#343b43", "right");
    mark(end, -46.5, -12, 49.5, .8, "#343b43", "right");
  }

  if (/ET\s*200M/i.test(model)) {
    station();
  } else {
    cpu();
  }
};
