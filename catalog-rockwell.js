// One-slot ControlLogix cassettes. Coordinates are in millimetres, with +Z at the front.
window.drawRockwell = function drawRockwell(mesh, name) {
  const cpu = name === "ControlLogix L7x";
  const u = .022;
  const cover = cpu ? "#deddd0" : "#dfded9";
  const edge = "#aaa9a1", chassis = "#383939", frame = "#202223", black = "#111516";
  function box(x, y, z, w, h, d, color, radius = .5) {
    mesh.plate(x*u,y*u,z*u,w*u,h*u,d*u,color,radius*u);
  }
  function ink(x, y, z, w, h, color, side = "front") {
    mesh.mark(x*u,y*u,z*u,w*u,h*u,color,side);
  }
  function print(x, y, z, w, h, text, stock, side = "front") {
    mesh.decal(x*u,y*u,z*u,w*u,h*u,text,stock,side);
  }
  function circle(x, y, z, r, d, color, side = "front") {
    mesh.disc(x*u,y*u,z*u,r*u,d*u,color,side,24);
  }
  // A cross-section swept across the width, with independently sloping front and rear edges.
  function slab(x, width, lo, hi, rearLo, rearHi, noseLo, noseHi, color) {
    const section = [[-noseLo,lo],[-rearLo,lo],[-rearHi,hi],[-noseHi,hi]];
    mesh.solid(x*u,0,0,width*u,section.map(([a,b]) => [a*u,b*u]),color,"right");
  }
  function usb(x, y, z) {
    // The amber USB-B insert has two clipped corners and a central black tongue.
    box(x,y,z+.23,10.6,12.4,.46,"#7f7970");
    const contour = [[-4.2,-4.2],[-2.8,-5.5],[2.8,-5.5],[4.2,-4.2],[4.2,5.3],[-4.2,5.3]];
    mesh.solid(x*u,y*u,(z+.6)*u,.66*u,contour.map(([a,b])=>[a*u,b*u]),"#d96925");
    ink(x,y+.42,z+.95,5.5,8.2,"#5e331c");
    box(x,y+.65,z+1.1,2.25,6.1,.5,"#e8863d",.35);
  }
  function backplane() {
    box(1,.5,-64.7,25,118,2.3,"#38503a");
    box(1,8,-66.8,19.5,60,2.1,frame);
    mesh.socket(u,8*u,-67.8*u,15*u,53*u,"back",chassis,3,14);
    box(0,66,-.6,22,3.8,121,frame,1);
    box(0,68.45,40,23,2.4,23,chassis);
    // At the toe only the latch projects beneath the two sloping cable entries.
    box(0,-65,cpu ? 0 : 43,22,3.8,cpu ? 115 : 17,frame,1);
    box(0,-67.45,39,23,2.4,16,chassis);
  }
  function sideLabel(x, z, model, left) {
    const side = left ? "left" : "right";
    const sign = left ? -1 : 1;
    const stock = "#d2d3c8", outward = x + sign*.06;
    // Two small printed stock labels on the bridge; one tall label on the processor.
    ink(x,10,z,39,66,stock,side);
    print(outward,38,z,34,4.4,"Allen-Bradley",stock,side);
    print(outward,32,z,34,3.8,model,stock,side);
    print(outward,26.5,z,34,2.8,"ControlLogix",stock,side);
    ink(outward,22.4,z,34,.5,chassis,side);
    for(let i=0;i<9;i++) {
      const length = 30 - i%4*3;
      ink(outward,19-i*2.35,z+sign*(34-length)/2,length,.46,"#666960",side);
    }
    for (let i=0;i<22;i++) {
      const shift = -sign*(i-10.5)*1.4;
      ink(outward,-12,z+shift,(i%3+1)*.31,7.3,"#454a45",side);
    }
    if (!left) {
      ink(x,9,z+38,23,64,"#b8bbb4",side);
      for (let y=-18;y<39;y+=4) ink(outward,y,z+38,17,.42,"#666960",side);
    }
  }
  function upperDisplay() {
    box(0,51.25,54.1,34,32.5,20.8,edge,1);
    box(0,51.25,65.35,33.85,32.4,2.2,frame,.85);
    // Keep the factory legends around the four-character window. The active
    // emitters themselves use a separately rendered matrix in the recessed seat.
    const fw=32.15, fh=30.9;
    const left=cpu ? .085 : .09, right=cpu ? .695 : .65;
    const top=cpu ? .35 : .335, bottom=cpu ? .69 : .638;
    function surround(l,t,r,b) {
      mesh.decal(((l+r)/2-.5)*fw*u,(51.25+(.5-(t+b)/2)*fh)*u,66.48*u,
        (r-l)*fw*u,(b-t)*fh*u,"@photo-screen",black,"front","label",[l,t,r-l,b-t]);
    }
    surround(0,0,1,top);surround(0,bottom,1,1);
    surround(0,top,left,bottom);surround(right,top,1,bottom);
    mesh.decal(((left+right)/2-.5)*fw*u,(51.25+(.5-(top+bottom)/2)*fh)*u,66.48*u,
      (right-left)*fw*u,(bottom-top)*fh*u,"@display",black,"front","lcd");
    box(0,69,46,26.8,2.5,29.3,frame,.6);
  }
  function l73() {
    slab(0,32.5,-63.5,-43,-50,-62.2,46,46,chassis);
    slab(0,32.5,-43,66.5,-62.2,-62.2,46,46,chassis);
    // The metal cheek stops before the ivory door and detachable memory module.
    slab(-15.98,1.15,-56.6,63,-52,-58,42.6,42.6,"#696963");
    sideLabel(-16.60,-28,"1756-L73",true);
    for (const z of [-49,37]) for (const y of [-47,54]) {
      mesh.screw(-16.62*u,y*u,z*u,"left",1.3*u);
      mesh.screw(16.32*u,y*u,z*u,"right",1.3*u);
    }
    upperDisplay();
    box(0,1.0,56.15,34,67.1,19.3,cover,1);
    for (const y of [-24.8,-17.5,-10.0, -2.6]) ink(0,y,65.83,32.4,.31,edge);
    // The selector is empty in the reference; the removable SD door sits next to it.
    circle(-3.3,19.8,66.20,8.8,.90,"#777971");
    circle(-3.3,19.8,66.91,7.99,.60,frame);
    circle(-3.3,19.8,67.41,6.65,.43,"#444642");
    ink(-3.3,19.8,67.66,1.25,4.0,black);
    ink(-2.70,21.5,67.67,1.05,1.1,black);
    print(-3.4,30.7,65.84,16.3,2.60,"RUN   REM   PROG",cover);
    box(11.9,18.55,66.19,7.85,31.3,1.36,"#cdcdc2",1);
    box(11.9,18.63,66.93,7.3,29.5,.57,cover,.9);
    ink(11.9,5.8,67.24,4.8,.45,edge);
    print(11.7,9.8,67.25,4.4,2.4,"SD",cover);
    // The L73 front breaks away around its energy-storage release and recessed USB.
    box(0,-43.1,56.1,33.4,20.85,19,cover,.75);
    box(-9.8,-54.4,56.1,12.6,11.3,18.3,cover,1.9);
    box(-9.8,-53.55,65.8,7.4,12.3,2.4,"#3e403d",1.4);
    ink(-9.8,-52.60,67.03,4.8,.65,"#a1a198");
    usb(6,-45.9,65.67);
    slab(0,28.8,-69.4,-53.7,-42,-48,59.7,59.7,frame);
    for (let i=0;i<9;i++) ink((i%3-1)*6.7,66.64,-48+Math.floor(i/3)*14,2.6,8.2,black,"top");
  }
  function ethernetPort(lo, hi, frontLo, frontHi) {
    // Four pieces leave an actual opening through each sloping section of the nose.
    const noseAt = y => frontLo + (frontHi-frontLo)*(y-lo)/(hi-lo);
    function piece(x,w,low,high) {
      slab(x,w,low,high,38,38,noseAt(low),noseAt(high),cover);
    }
    piece(-11.25,11.5,lo,hi);
    piece(13.45,7.1,lo,hi);
    piece(2.2,15.4,lo,lo+2);
    piece(2.2,15.4,hi-2.6,hi);
    const mid = (lo+hi)/2;
    const recess = Math.min(frontLo,frontHi) - 1.15;
    box(2.2,mid,recess-2.6,15.1,hi-lo-3.1,5.2,"#252724",.7);
    ink(2.2,mid-.3,recess+.035,12.3,7.4,black);
    for(let i=0;i<8;i++) ink(2.2+(i-3.5)*1.15,mid+1.85,recess+.07,.50,2.3,"#a38c53");
  }
  function en2tr() {
    slab(5.5,20,-55.5,65.2,-61,-61,47.5,47.5,frame);
    // Cast black fins stand proud of the left wall, with daylight between their edges.
    for(let i=0;i<10;i++) {
      const z = -60.5 + 10.7*i;
      slab(-9.8,12.8,-54.2,65.1,z,z,z+1.75,z+1.75,"#373737");
      ink(-16.24,5.45,z+.98,.55,117.9,"#545453","left");
    }
    slab(16.0,1.35,-54.2,64.9,-60,-60,47,47,"#454746");
    sideLabel(16.72,-15,"1756-EN2TR",false);
    for(const z of [-54,37]) for(const y of [-49,59])
      mesh.screw(16.73*u,y*u,z*u,"right",1.4*u);
    upperDisplay();
    box(0,15.7,55.55,34,37.9,20.65,cover,.8);
    box(0,-19.05,55.5,34,31,20.9,cover,.75);
    for(const y of [26,17.2,8.4,-19.9,-28.0])
      ink(0,y,66.01,32.8,.29,edge);
    usb(6.6,-12.1,65.98);
    print(-6.2,-11.8,65.99,10.8,4,"USB",cover);
    ethernetPort(-48.7,-34.55,59.9,66);
    ethernetPort(-63.25,-48.7,53.8,59.9);
    box(0,-66,46.6,33.1,5.5,14.4,cover,.55);
    print(0,-65.7,53.84,18.1,3.7,"EtherNet/IP",cover);
  }
  backplane();
  if (cpu) l73();
  else en2tr();
};
