// Exterior geometry for the road instruments photographed in the repair catalog.
window.drawRoadControl = function drawRoadControl(m, item) {
  const u = .015;
  const black = "#242525", gasket = "#42423f", steel = "#a9aeae";
  const brass = "#ada17e", alloy = "#b8b9b1", ivory = "#d5d3c4";
  function box(x,y,z,w,h,d,color,r=1,side="front",bevel=0) {
    m.plate(x*u,y*u,z*u,w*u,h*u,d*u,color,r*u,side,bevel);
  }
  function disc(x,y,z,r,d,color,side="front",edges=20) {
    m.disc(x*u,y*u,z*u,r*u,d*u,color,side,edges);
  }
  function print(x,y,z,w,h,color,material="label",uv) {
    m.decal(x*u,y*u,z*u,w*u,h*u,"@photo-screen",color,"front",material,uv);
  }
  // Keep the original legends around the viewing windows. Only the surrounding
  // strips sample the fascia photograph; each opening has its own generated LCD.
  function fasciaWithDisplays(x,y,z,w,h,top,screenHeight,windows,color) {
    function fascia(left,t,width,height) {
      if(width<=0 || height<=0) return;
      print(x+(left+width/2-.5)*w,y+(.5-t-height/2)*h,z,w*width,h*height,
        color,"label",[left,t,width,height]);
    }
    fascia(0,0,1,top);
    fascia(0,top+screenHeight,1,1-top-screenHeight);
    let edge=0;
    for (const [left,width,display] of windows) {
      fascia(edge,top,left-edge,screenHeight);
      m.decal((x+(left+width/2-.5)*w)*u,(y+(.5-top-screenHeight/2)*h)*u,z*u,
        w*width*u,h*screenHeight*u,display,"#26322c","front","lcd");
      edge=left+width;
    }
    fascia(edge,top,1-edge,screenHeight);
  }
  function screws(xs,ys,z,side="back",r=1.5) {
    for (const x of xs) for (const y of ys) m.screw(x*u,y*u,z*u,side,r*u);
  }
  function connector(x,y,z,r,d,color=steel) {
    disc(x,y,z,r+1.5,2.4,color,"bottom");
    disc(x,y-d/2-1,z,r,d,color,"bottom");
    for (const t of [.22,.42,.62,.82])
      disc(x,y-1-d*t,z,r+.32,.6,color,"bottom",20);
    disc(x,y-d-1.3,z,r*.80,.55,black,"bottom");
  }
  function frontButton(x,y,z,r,cap="#a69b7a") {
    disc(x,y,z+.45,r,1.3,steel);
    disc(x,y,z+1.48,r*.86,1.6,brass);
    disc(x,y,z+2.42,r*.76,.6,cap);
  }
  function pcu() {
    // Manufacturer's elevation: near-square front, 3 mode and 6 burner pushbuttons.
    const w=160, h=160, front=24;
    box(0,0,-1.7,w,h,49.5,ivory,3.8,"front",.009);
    box(0,0,22.9,w-1,h-1,2.1,gasket,3.0);
    box(0,0,23.72,w-2.0,h-2.0,1.5,ivory,2.5);
    const fw=154.8, fh=154.5, fz=front+.51;
    fasciaWithDisplays(0,0,fz,fw,fh,.095,.147,[[.285,.430,"@display"]],ivory);
    for (const [cx,cy] of [[.335,.579],[.506,.579],[.678,.579],
      [.072,.888],[.244,.875],[.416,.874],[.585,.873],[.759,.873],[.925,.894]]) {
      frontButton((cx-.5)*fw,(.5-cy)*fh,fz,fw*.0615, cx<.1 ? "#b9b7aa" : "#a69b7a");
    }
    for (const x of [-23,21]) connector(x,-80,-.5,9.1,13.8);
    screws([-70,70],[-69,69],-26.49);
  }
  function burner() {
    // The PCB enclosure, gland, threaded circular connector and attached loom are
    // separate volumes. The cover print is rectified from the original service passport.
    box(0,0,-.8,62,132,34.4,ivory,1.6);
    box(0,0,16.3,62.4,132.5,2.4,alloy,1.7);
    box(0,0,17.4,61.8,131.7,1.4,ivory,1.25);
    print(0,0,18.16,60.9,129.9,ivory);
    box(0,66.4,0,26,14.4,2.2,black,1.6,"top");
    box(0,70.2,0,19.5,10.2,6.6,gasket,2,"top",.06);
    connector(18.5,-66,0,8.2,15);
    connector(-16.5,-66,0,6.6,12.7,black);
    screws([-25,25],[-57,57],-18.06);
    // Shared sleeving exits near the upper left and opens into individual leads.
    const tube = (points,r,color) => m.tube(points.map(p=>p.map(v=>v*u)),r*u,color);
    tube([[-30,41,0],[-36,41,0],[-42,40,0],[-45,38,0],[-46,33,0],[-46,26,0]],2.15,ivory);
    const wires=[
      ["#c34540",-49,-64,-49,-72],["#deded6",-46.5,-65,-43,-74],
      ["#496a46",-44.8,-67,-38,-74],["#333638",-43,-67,39,-93],
      ["#a13e37",-41.5,-68,37,-90],["#31598b",-42.3,-70,24,-104],
      ["#e6e3d6",-40.6,-71,40,-101]
    ];
    for (const [i,[col,midX,midY,endX,endY]] of wires.entries()) {
      const z=4+i*.44;
      const path=[[-46,27,.05*i],[-46.6+i*.34,17,1],[-46.5+i*.62,-6,1.6],
        [midX+.3,-36,2.8],[midX,midY,z]];
      if (endX>0) path.push([midX+4,midY-6,z+1],[midX+12,midY-11,z+1.7],
        [0,endY+5,z+2.5],[endX-10,endY+.6,z+3.1]);
      path.push([endX,endY,z+3.4]);
      tube(path,.85,col);
      if (i<3) {
        box(endX,endY-2,z+3.4,4.0,7,3.8,"#b93237",.8);
      } else if (i>=5) {
        box(endX+2,endY,z+3.4,6,3.8,3.7,"#27548a",.8);
        disc(endX+7,endY,z+3.4,2.65,1.15,steel);
        disc(endX+7,endY,z+4.04,1.12,.15,black);
      }
    }
    box(41,-91.5,9,13.1,7.8,7.7,"#dedbc8",.7);
  }
  function horizon() {
    const yellow="#eac727", orange="#e76916", w=65,h=200,front=14;
    box(0,0,-1,w,h,29,yellow,2.8,"front",.017);
    box(0,0,13.5,w-2.6,h-2.2,1.7,yellow,2);
    const fw=52.8,fh=192.3,z=front+.41;
    fasciaWithDisplays(-.5,.1,z,fw,fh,.287,.302,[[.131,.73,"@display"]],yellow);
    // The orange visor is a folded U. Its tapered cheeks end below the LED array.
    for(const x of [-29.4,29.4]) {
      const cheek=[[-27,50],[-18,14],[-14,12],[-14,98],[-27,98]];
      m.solid(x*u,0,0,2.7*u,cheek.map(([a,b])=>[a*u,b*u]),orange,"right");
    }
    box(0,98,20.2,61.4,3.4,15.2,orange,1.4);
    box(0,0,-16,48.5,177,3.2,gasket,2,"back");
    screws([-20,20],[-80,80],-17.63);
    connector(0,-100,0,5.9,9.5,black);
  }
  function sauro() {
    const w=264,h=106;
    box(0,0,-1.5,w,h,61,alloy,2.3,"front",.008);
    box(0,0,29.6,w-1.0,h-.8,2.1,gasket,1.6);
    box(0,0,30.72,w-3.1,h-3,1.6,alloy,1.35);
    const fw=w-7,fh=h-6,fz=31.58;
    const at = (u,v) => [(u-.5)*fw,(.5-v)*fh];
    fasciaWithDisplays(0,0,fz,fw,fh,.261,.225,
      [[.073,.219,"@display:slope"],[.354,.201,"@display:height"]],"#5e6267");
    function toggle(cx,cy,dx,dy) {
      const [x,y]=at(cx,cy);
      disc(x,y,fz+.7,5.75,1.6,"#9f9784","front",6);
      disc(x,y,fz+1.72,3.95,1.3,black);
      // Socket head and cylindrical lever lean out of the plane of the face.
      m.tube([[x,y,fz+2],[x+dx*.38,y+dy*.38,fz+5],[x+dx,y+dy,fz+9.3]].map(p=>p.map(v=>v*u)),1.6*u,steel);
    }
    for (const [x,y,dx,dy] of [[.67,.253,3.8,-3.3],[.67,.51,3.9,-4.0],[.945,.244,5.1,1.6],
      [.217,.836,1.9,-4.8],[.41,.84,2.1,-4.8],[.57,.832,5.2,.9],[.666,.836,5.2,1.3]]) toggle(x,y,dx,dy);
    for(const [x,y] of [[.046,.825],[.142,.838],[.31,.84],[.486,.84],[.772,.521],[.947,.521],[.772,.837],[.948,.84]])
      frontButton(...at(x,y),fz,5.8,"#d9c9a1");
    for(const y of [.52,.836]) for(const x of [.835,.896]) {
      const [px,py]=at(x,y);disc(px,py,fz+.6,3.9,1.3,steel);
      disc(px,py,fz+1.5,3.08,.9,"#60382e");
    }
    connector(77,-53,-6.8,10.6,13,gasket);
    for (const x of [-81,81]) {
      box(x,0,-34.2,16.5,68,4.3,alloy,2.1,"back");
      for (const y of [-26,26]) disc(x,y,-36.42,3.1,.14,black,"back");
    }
  }
  function hits() {
    // Both product pages specify the same 274 × 173 × 100 mm enclosure.
    const w=173,h=274;
    box(0,0,-6,w-6,h-7,87,"#303232",6.4,"front",.012);
    box(0,0,37.5,w-2,h-2,5.6,gasket,8.3);
    box(0,0,44.1,w,h,12,"#d1d1cf",8.5,"front",.019);
    print(-7,0,50.16,46,49,"#ba6419");
    for(const x of [-53,0,53]) {
      disc(x,136,18,6.65,6,black,"top");
      disc(x,141,18,5.8,7,"#414240","top");
      disc(x,242,18,5.45,196,"#323331","top");
      disc(x,340.7,18,5.2,1.4,"#373836","top");
    }
    for (const x of [-65,65]) screws([x],[-117,117],-49.53,"back",1.9);
    // Coax and power connectors sit on the underside of the weatherproof housing.
    for(const x of [-54,-34,-14,6,26]) connector(x,-134,-11,3.7,5.7);
    connector(55,-134,-11,6.2,8,gasket);
  }
  if(item.brand==="HITS") hits();
  else if(item.brand==="Грин-Тех") horizon();
  else if(item.brand==="Белгидросила-Групп") sauro();
  else if(item.model.startsWith("ПЦУ")) pcu();
  else burner();
};
