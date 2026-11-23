// ОВЕН ПЛК110-60 [М02]. Exterior drawn in millimetres from the OEM envelope
// and terminal positions: https://owen.ru/product/plk110_m02/ddm
window.drawOwen110 = function drawOwen110(m) {
  const unit = 3.2 / 208.5;
  const housing = "#cbc9bd", lid = "#dbd9ce", trim = "#aaa99f";
  const black = "#242626", socket = "#333636", steel = "#687983";
  function box(x, y, z, w, h, d, color, radius = .6, bevel = 0) {
    m.plate(x*unit, y*unit, z*unit, w*unit, h*unit, d*unit, color, radius*unit, "front", bevel);
  }
  function face(x, y, z, w, h, color, side = "front") {
    m.mark(x*unit, y*unit, z*unit, w*unit, h*unit, color, side);
  }
  function disc(x, y, z, r, d, color, edges = 8) {
    m.disc(x*unit, y*unit, z*unit, r*unit, d*unit, color, "front", edges);
  }
  function lettering(x, y, z, w, h, text, color = lid) {
    m.decal(x*unit, y*unit, z*unit, w*unit, h*unit, text, color);
  }

  // Full-width stepped body. Only the two diagonal mounting ears extend past the case.
  // The enclosure back is recessed from the mounting ears and the DIN clips.
  box(0,0,-19.7,208.5,94,39.4,housing,1.3,.008);
  box(0,0,9,208,92,18,housing,.9);
  box(-88.3,0,25.5,31.7,93,15,trim,.7);
  box(15.7,0,24,176,54,22,lid,1.2,.008);
  for (const sign of [-1,1]) {
    const x = sign*99.25, y = -sign*51;
    box(x,y,-35.875,10,12,7.75,housing,1.1);
    disc(x,y,-31.85,2.4,.15,black,14);
    // The pair of DIN-rail retainers sits on the rear ledge.
    box(sign*50,0,-38.5,14,100,3,trim,1.2);
    face(sign*50,0,-40.05,9,35,black,"back");
  }
  for (const sign of [-1,1]) {
    const y = sign*38.3, x = 16.7;
    box(x,y,11.5,171,18.3,39,socket,.9);
    for (let row=0; row<2; row++) {
      const cy = y+(row-.5)*8.2, z = 31.7-row*.45;
      box(x,cy,z-1.6,169.5,7.9,3.2,"#494a47",.4);
      for (let i=0; i<22; i++) {
        const cx = x+(i-10.5)*7.59+(row-.5)*1.8;
        // A moulded cell around each captive screw leaves visible divisions even edge-on.
        face(cx,cy,z+.10,6.6,6.65,black);
        disc(cx,cy,z+.26,1.97,.28,steel);
        face(cx,cy,z+.43,2.8,.52,black);
        face(cx,cy,z+.46,.52,2.3,black);
      }
    }
    for (const cap of [-1,1]) box(x+cap*86,y,15,2.1,19.5,35,black,.4);
  }

  // Three modular jacks on the left, right-angle USB connectors and recessed mode switch on the right.
  for (const [cy, name] of [[17,"RS-232"],[0,"Ethernet"],[-17,"DEBUG"]]) {
    box(-82.5,cy,32,17.4,15.9,9.3,trim,1);
    m.socket(-82.5*unit,cy*unit,36.8*unit,12.4*unit,12.3*unit,"front",black,8,1);
    lettering(-95,cy,33.2,8.5,3.3,name,trim);
  }
  box(90.5,16.3,35.6,14.4,7.1,1.3,steel,1.6);
  face(90.5,16.3,36.35,12.3,4.9,black);
  face(90.5,15.5,36.41,9.6,1.35,trim);
  box(91.4,-14.8,35.5,10,4.8,1.4,steel,1.9);
  face(91.4,-14.8,36.3,8.2,2.5,black);
  box(92.6,1.5,36,6.9,12.5,2,"#a4a49a",1);
  disc(92.6,2.3,38.5,2.25,3,black,12);
  lettering(78,2,35.1,14,10,"РАБОТА\nСТОП\nСБРОС");
  lettering(-53,7.4,35.1,26,10,"ОВЕН");
  lettering(-51,-1,35.1,29,5.8,"ПЛК110-60");

  // The status strips are printed on the lid, with individual apertures for the LEDs.
  for (const [start, count, y] of [[-8,34,24],[27,23,-23]]) {
    for (let i=0; i<count; i++) {
      const x = start+i*3.09;
      face(x,y,35.12,1.35,2.1,black);
      if (i%4 === 0) face(x,y+1.9,35.13,1.7,.45,trim);
    }
  }
  for (let i=0;i<4;i++) face(-8+i*6.4,-23,35.13,1.4,2.1,black);
  lettering(-.2,-17.2,35.1,24,4.4,"RUN     PWR     COM");
  m.label(0,0,-39.48*unit,.54,"back");
};

// СПК207 panel, front/side elevation and rear connector layout in figures А.1 and 3.2.
// https://owen.ru/uploads/re_spc2xx_2231.pdf
window.drawOwen207 = function drawOwen207(m) {
  const u = 3.2 / 227;
  const ivory = "#c8c8bf", shell = "#b2b2a8", seam = "#797c76", steel = "#9caaaf";
  const dark = "#272a29", blue = "#33516b", green = "#568270";
  function box(x, y, z, w, h, d, color, radius = 1, side = "front", bevel = 0) {
    m.plate(x*u, y*u, z*u, w*u, h*u, d*u, color, radius*u, side, bevel);
  }
  function mark(x, y, z, w, h, color, side = "back") {
    m.mark(x*u, y*u, z*u, w*u, h*u, color, side);
  }
  function legend(x, y, z, w, h, text) {
    m.decal(x*u, y*u, z*u, w*u, h*u, text, shell, "back");
  }

  // The drawing shows a shallow front flange and a stepped electronics housing.
  box(0, 0, 26.9, 227, 152, 5.4, ivory, 3.7, "front", .008);
  box(0, 0, 23.8, 217, 143, 1.4, seam, 2.8);
  box(0, 0, 2.5, 211.2, 131.8, 43.1, shell, 2.4);
  box(0, 14.7, -23.6, 210.4, 101.8, 10.1, shell, 2, "back", .006);

  // Only the membrane outside the glass uses the photographed indicator legends and keys.
  function film(left, top, right, bottom, depth) {
    const w = right-left, h = bottom-top;
    m.decal(((left+w/2)/342-.5)*227*u, (.5-(top+h/2)/230)*152*u, depth*u,
      w/342*227*u, h/230*152*u, "@photo-screen", ivory, "front",
      "label", [left/342, top/230, w/342, h/230]);
  }
  const left = 39, right = 268, top = 50, bottom = 187;
  film(14, 11, 328, top, 30.16);
  film(14, bottom, 328, 219, 30.16);
  film(14, top, left, bottom, 30.16);
  film(right, top, 328, bottom, 30.16);
  box(-11.6, -2.31, 29.92, 152.8, 91.6, .35, blue, .5);
  m.decal((((left+right)/2)/342-.5)*227*u,(.5-(top+bottom)/460)*152*u,30.11*u,
    (right-left)/342*227*u,(bottom-top)/230*152*u,"@display",dark,"front","lcd");

  // Coordinates below are mirrored into the rear elevation of the original drawing.
  const rear = -28.65, tray = -19.05;
  for (const x of [-99,99]) {
    m.screw(x*u, 60*u, rear*u, "back", 1.65*u);
    m.screw(x*u, -60*u, tray*u, "back", 1.65*u);
  }
  box(30, 17, -29, 61, 40, .9, seam, 1.6, "back");
  box(30, 17, -29.48, 59.8, 38.8, .25, shell, 1.2, "back");
  for (let row=0; row<3; row++) for (let i=0; i<8; i++) {
    mark(-67-i*4.25, 34-row*10, rear-.11, 1.9, 6.7, dark);
  }
  m.disc(-29*u, 9.5*u, (rear-.25)*u, 2.35*u, .7*u, dark, "back", 14);
  legend(-29, 4, rear-.15, 11, 3, "СБРОС");
  box(-46, -21, rear-.65, 10.5, 16, 1.8, seam, 2.3, "back");
  box(-46, -21, rear-1.6, 6.4, 11.8, 1.7, dark, 1.1, "back");
  legend(-46, -10.6, rear-.14, 14, 3.1, "РАБОТА");

  function socket(x, width, height, pins, color = steel) {
    m.socket(x*u, -51*u, tray*u, width*u, height*u, "back", color, pins, 1);
  }
  socket(88, 14, 7.3, 4);                     // USB-A and USB-B
  socket(72.5, 10, 10.5, 2);
  socket(57.5, 13.5, 13, 6);
  socket(41.8, 14.8, 14, 8);
  const dsub = [[-8.2,-4], [8.2,-4], [10,3.8], [-10,3.8]];
  box(12, -51, tray-.7, 28.7, 10.6, 1.7, steel, 1.4, "back");
  m.solid(12*u, -51*u, (tray-2.0)*u, 1.1*u, dsub.map(([x,y])=>[x*u,y*u]), dark, "back");
  for (let row=0; row<2; row++) for (let i=0; i<5-row; i++)
    m.disc((12+(i-(4-row)/2)*3.1)*u, (-49.5-row*3)*u, (tray-2.6)*u, .63*u, .45*u, steel, "back", 8);
  socket(-52, 14.8, 14, 8);
  socket(-70, 14.8, 14, 8);
  for (const [cx,count] of [[-23.4,6],[-89.1,3]]) {
    box(cx, -51, tray-2.2, count*4.7, 9, 4.8, green, .5, "back");
    for (let i=0; i<count; i++) {
      const x = cx+(i-(count-1)/2)*4.7;
      m.disc(x*u, -51*u, (tray-4.72)*u, 1.35*u, .45*u, steel, "back", 9);
      mark(x,-51,tray-4.98,1.7,.45,dark);
    }
  }
  legend(64, -32.5, rear-.14, 67, 3.6, "USB HOST       USB       DEBUG       LAN");
  legend(-34, -32.5, rear-.14, 137, 3.6, "COM1                CAN     RS-485          COM2     COM3         24B");
  // SD opening and retaining screw on the right-hand cheek of the flush-mount case.
  mark(105.75, 29, 1, 2.5, 21, dark, "right");
  m.screw(105.6*u, -25*u, 1*u, "right", 2.2*u);
};
