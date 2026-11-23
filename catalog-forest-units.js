// The two motomit cab modules have different drilled faceplates and connector fields.
// Face coordinates follow their upright, near-orthographic product illustrations.
window.drawForestUnit = function drawForestUnit(m, profile) {
  const keyboard = profile.model.endsWith("MCKC");
  const [width,height] = keyboard ? [1035,1250] : [1250,1000];
  const u = 3.2 / Math.max(width,height);
  const shell = "#282a2b", rim = "#373737", shadow = "#151818";
  const silver = "#b1af9e", green = "#478b52", black = "#242424";
  const x = px => (px-width/2)*u;
  const y = py => (height/2-py)*u;
  function box(l,t,r,b,back,front,color,radius=3) {
    m.plate(x((l+r)/2),y((t+b)/2),(front+back)*u/2,(r-l)*u,(b-t)*u,(front-back)*u,
      color,radius*u);
  }
  function photo(l,t,r,b,z,material="label") {
    m.decal(x((l+r)/2),y((t+b)/2),z*u,(r-l)*u,(b-t)*u,"@photo-screen",shell,"front",
      material,[l/width,t/height,(r-l)/width,(b-t)/height]);
  }
  function circle(cx,cy,z,r,d,col,edges=14) {
    m.disc(x(cx),y(cy),z*u,r*u,d*u,col,"front",edges);
  }
  function fix(cx,cy) {
    circle(cx,cy,55,26,4,shadow);
    circle(cx,cy,57.4,22,3,silver);
    photo(cx-16,cy-16,cx+16,cy+16,59.15,"metal");
  }
  function terminals(l,t,r,b,orientation,contacts,tint) {
    const vertical=orientation==="vertical", across=vertical ? r-l : b-t;
    box(l-2,t-2,r+2,b+2,46,57,shadow,4);
    box(l,t,r,b,55,89,tint,4);
    // The moulded ridge runs parallel to the screws. Its print has its own depth.
    photo(l+1,t+1,r-1,b-1,89.3);
    const spacing=(vertical ? b-t : r-l)/contacts;
    for (let i=0;i<contacts;i++) {
      const cx=vertical?l+across*.47:l+(i+.5)*spacing;
      const cy=vertical?t+(i+.5)*spacing:t+across*.61;
      const point=vertical?y(cy):x(cx);
      // Cable openings on the outer face are visible when the terminal is rotated.
      if (vertical) {
        const left=l<width/2;
        m.mark(x(left?l-.25:r+.25),point,72*u,12*u,18*u,shadow,left?"left":"right");
      } else {
        const top=t<height/2;
        m.mark(point,y(top?t-.25:b+.25),72*u,18*u,12*u,shadow,top?"top":"bottom");
      }
    }
  }
  function dSub(l,t,r,b,vertical,pins) {
    box(l-3,t-3,r+3,b+3,47,57,shadow,7);
    box(l,t,r,b,53,64,silver,7);
    // Connector flange markings, including the two jack screws, come from the same unit.
    photo(l+1,t+1,r-1,b-1,64.4,"metal");
    const w=r-l,h=b-t, cx=(l+r)/2,cy=(t+b)/2;
    const span=(vertical?h:w)*.346, half=(vertical?w:h)*.36;
    const contour=[[-span+.11*half,-half],[span-.11*half,-half],[span+.27*half,-.6*half],
      [span,.64*half],[span-.33*half,half],[-span+.33*half,half],[-span,.64*half],[-span-.27*half,-.6*half]];
    const outline=contour.map(([a,b])=>vertical?[-b*u,a*u]:[a*u,b*u]);
    m.solid(x(cx),y(cy),69*u,11*u,outline,silver);
    m.solid(x(cx),y(cy),74.7*u,1.3*u,outline.map(([a,b])=>[a*.9,b*.9]),black);
    for (let row=0; row<2; row++) {
      const count=Math.ceil(pins/2)-row;
      for (let i=0;i<count;i++) {
        const along=((i+.5)/count-.5)*span*1.72;
        const cross=(row-.5)*half*.70;
        circle(cx+(vertical?cross:along),cy+(vertical?along:cross),75.55,Math.min(3.9,span/count*.48),.55,shadow,8);
      }
    }
  }

  const [l,t,r,b] = keyboard ? [88,57,954,1178] : [56,55,1194,944];
  // Shallow thermoplastic tray, recessed back and the thin joint below the cover.
  box(l+13,t+12,r-13,b-12,-76,-58,rim,27);
  box(l,t,r,b,-62,32,shell,26);
  box(l+3,t+3,r-3,b-3,32,37,shadow,23);
  box(l+5,t+5,r-5,b-5,37,51,rim,21);
  box(l+13,t+13,r-13,b-13,47,52,shell,15);
  for (const [cx,cy] of [[l+55,t+53],[r-50,t+53],[r-50,b-49],[l+50,b-49]]) {
    m.screw(x(cx),y(cy),-76*u,"back",11*u);
  }

  if (keyboard) {
    // MCKC03 has four uninterrupted strips and a printed green daughterboard at the corner.
    box(186,187,827,1051,52,54,"#156650",7);
    photo(202,182,821,1045,54.4);
    photo(185,262,201,968,54.4);
    terminals(188,108,807,172,"horizontal",16,black);
    terminals(55,254,179,969,"vertical",18,black);
    terminals(823,260,941,984,"vertical",17,green);
    terminals(166,1057,803,1190,"horizontal",17,green);
    for (const [cx,cy] of [[135,114],[897,115],[111,1127],[900,1131]]) fix(cx,cy);
  } else {
    // MCI has four D-sub sockets around a printed light-status matrix.
    box(218,173,1029,772,51.3,53.8,"#3e3a37",6);
    photo(220,175,1027,767,54.15);
    for (const [cx,cy] of [[494,308],[561,308],[900,308],[969,308],[901,463],[968,463],
      [900,541],[969,541],[900,594],[969,594],[900,646],[969,646],[900,691],[969,691],
      [494,660],[561,660]]) {
      circle(cx,cy,55.25,17.2,2.4,shadow);
      circle(cx,cy,57.5,13.3,2.6,"#391c21");
    }
    terminals(177,70,432,169,"horizontal",7,green);
    terminals(477,70,770,169,"horizontal",7,green);
    terminals(819,70,1061,169,"horizontal",6,green);
    terminals(120,641,190,758,"vertical",3,green);
    terminals(1065,532,1168,721,"vertical",5,green);
    dSub(123,221,214,620,true,25);
    dSub(1045,272,1134,502,true,9);
    dSub(306,777,719,884,false,25);
    dSub(759,777,1007,884,false,9);
    for (const [cx,cy] of [[112,112],[1140,113],[1139,874],[110,871]]) fix(cx,cy);
  }
};
