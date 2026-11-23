// External case dimensions and front-panel arrangements from REGUL R500 product views.
// The AI insert occupies one 40 × 180 × 145 mm slot.
window.drawRegul = function drawRegul(mesh, model) {
  const u = .016;
  const skin = "#292a2b", cover = "#2e2f30", rim = "#1e1f21";
  const metal = "#777b7b", dark = "#111214", ink = "#acafb0";
  const frontZ = 72.5;

  function plate(x, y, z, width, height, depth, color, radius = .6) {
    mesh.plate(x*u, y*u, z*u, width*u, height*u, depth*u, color, radius*u);
  }
  function mark(x, y, z, w, h, color, side = "front") {
    mesh.mark(x*u, y*u, z*u, w*u, h*u, color, side);
  }
  function text(x, y, z, w, h, lines, stock, material = "label") {
    mesh.decal(x*u, y*u, z*u, w*u, h*u, lines, stock, "front", material);
  }
  function rackNameplate(x, slot) {
    // Each print belongs to its own raised insert. The 570 × 232 front view
    // contains the actual port names and indicator tables for these ten slots.
    const bounds = [[78,114],[119,156],[161,198],[203,240],[245,282],
      [287,324],[329,366],[371,408],[413,450],[455,492]];
    const [left,right] = bounds[slot];
    const crop = [left/570,27/232,(right-left)/570,48/232];
    mesh.decal(x*u,62.2*u,(frontZ+.025)*u,35.6*u,45.4*u,
      "@photo-screen",cover,"front","label",crop);
  }
  function disc(x, y, z, radius, depth, color) {
    mesh.disc(x*u, y*u, z*u, radius*u, depth*u, color, "front", 14);
  }
  function cap(x, low, high, z, depth, color, crownTop, crownBottom) {
    // Moulded module fronts have a shallow arch running across the narrow top and toe.
    const half = 19.65;
    const outline = [
      [-half+.8,low+crownBottom*.65],[-half*.58,low+crownBottom*.18],[0,low],
      [half*.58,low+crownBottom*.18],[half-.8,low+crownBottom*.65],[half,low+crownBottom+.7],
      [half,high-crownTop-.7],[half-.8,high-crownTop*.65],[half*.58,high-crownTop*.18],
      [0,high],[-half*.58,high-crownTop*.18],[-half+.8,high-crownTop*.65],
      [-half,high-crownTop-.7],[-half,low+crownBottom+.7]
    ];
    // Straight seams only need a single corner on each side.
    const clean = outline.filter((p, index) =>
      (crownBottom || ![0,1,3].includes(index)) && (crownTop || ![7,8,10].includes(index)));
    mesh.solid(x*u, (low+high)*.5*u, z*u, depth*u,
      clean.map(([a,b]) => [a*u,(b-(high+low)*.5)*u]), color, "front", .006);
  }
  function port(x,y,w=9,h=12) {
    // Recessed plastic data jack with an inset shield and a row of contacts.
    plate(x,y,frontZ+.34,w,h,1.3,"#535657",.5);
    mark(x,y,frontZ+1.01,w-1.6,h-2.0,dark);
    mark(x,y-h*.35,frontZ+1.03,w*.46,.7,"#777167");
    for(let i=0;i<4;i++) mark(x+(i-1.5)*w*.12,y+h*.27,frontZ+1.04,.4,1.0,"#918875");
  }
  function sideVents(x, side) {
    const right = side === "right";
    // Slots on the cheek face stay within the flat walls of the electronics cassette.
    const sx = x + (right ? 19.13 : -19.13);
    for(const y of [-75,76]) for(let i=0;i<16;i++)
      mark(sx,y,-58+i*7.1,2.1,7.7,"#171819",side);
  }

  function cartridge(x, kind, options = {}) {
    const analog = kind === "AI 16 081";
    const plainCover = analog || options.io;
    // On the loose module the rear socket fits within the 145 mm overall depth.
    const tail = options.single ? -66.5 : -72.5;
    plate(x,0,(tail+64.7)/2,38.2,175.0,64.7-tail,skin,1.3);
    cap(x, -89.6, 90, 66.6, 5.8, rim, 2.4, 2.6);
    cap(x, 37.5, 89.2, 70.7, 3.6, cover, 2.4, 0);
    cap(x, -89, 36.9, 70.7, 3.6, skin, 0, 2.6);
    if(analog) {
      text(x,61.2,frontZ+.025,31.48,44.74,"@photo-screen",cover);
    } else rackNameplate(x, options.slot);
    if(plainCover) {
      for(const y of (analog ? [30.5,23.2,16.0,8.0,1.0] : [22.9,8.1])) {
        mark(x,y,frontZ+.018,37.8,.34,"#202224");
        mark(x,y-.52,frontZ+.018,37.8,.38,"#434446");
      }
      for(const y of [-64.5,-69.4,-74.3]) mark(x-14.4,y,frontZ+.020,8.6,.64,"#464748");
      mark(x+15.0,35.6,frontZ+.022,3.8,2.0,dark);
      mark(x+15.1,-83.3,frontZ+.023,5.1,3.6,rim);
    } else {
      mark(x,-83.4,frontZ+.024,15.2,5.5,dark);
    }
    if(options.left) sideVents(x,"left");
    if(options.right) sideVents(x,"right");
    if(options.single) {
      plate(x,0,-65.8,34,132,2.2,rim,1);
      mesh.socket(x*u,0,-66.9*u,18*u,54*u,"back",dark,3,14);
    }
  }

  if (/AI 16 081/i.test(model)) {
    cartridge(0,"AI 16 081",{single:true,left:true,right:true});
    return;
  }

  // The ten positions in the R500 publicity photograph have five partially
  // exposed communication/power fronts on the left and five closed I/O covers.
  plate(0,0,-74,437,111,8,"#3d4041",2);
  plate(0,0,-80,449,88,4.8,metal,1.2);
  for(const sign of [-1,1]) {
    const x=sign*211.5;
    plate(x,0,-60,22,105,22,"#282a2b",1.3);
    for(const y of [-38,38]) {
      disc(x,y,-48.9,3.0,.65,metal);
      mark(x,y,-48.55,2.2,.55,dark);
    }
    for(const y of [-27,-15]) {
      plate(x,y,-48.8,12.8,10.8,1.1,rim,.4);
      mark(x,y,-48.22,10.6,7.8,dark);
      mark(x,y+2.5,-48.20,7.7,.5,metal);
    }
    mark(x,9.0,-48.96,9,23,dark);
    for(let j=0;j<7;j++)mark(x-2.4,1.5+j*2.3,-48.93,.7,1.05,ink);
  }
  for(let i=0;i<10;i++) {
    const x=(i-4.5)*40;
    cartridge(x,model,{slot:i,io:i>=5,left:i===0,right:i===9});
    if(i===0) {
      disc(x-5,6,frontZ+.45,5.3,1.05,dark);
      plate(x+6.1,-25.5,frontZ+.5,11.8,17,1.4,rim,1.3);
      plate(x+6.1,-25.5,frontZ+1.3,8.1,11,1,"#424445",.5);
      plate(x-5.8,-62.2,frontZ+.5,9.5,25,1.6,"#73b767",.45);
      for(const y of [-56.0,-63.5,-70.0]) mark(x-5.8,y,frontZ+1.32,4,3.8,dark);
    } else if(i===1 || i===3 || i===4) {
      const ys=i===1 ? [-12,-29,-46,-63] : i===3 ? [-17,-50] : [5,-11,-27,-43,-59];
      for(const y of ys)port(x-4.3,y);
      if(i===1) text(x-3.8,15.0,frontZ+.022,13.4,13.4,"RUN\nSTOP",skin);
    } else if(i===2) {
      disc(x+.4,-12,frontZ+.4,5.8,.9,metal);
      for(const y of [-28,-62])port(x+2,y,11.0,9);
      port(x+2,-47,13.5,11.3);
    }
  }
};
