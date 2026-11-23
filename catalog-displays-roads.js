// Draw a front elevation of the active pixels. Physical keys and lamps belong to the mesh.
(() => {
  function rect(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  }
  function text(c, value, x, baseline, size, color, weight = 600, align = "left") {
    c.font = weight + " " + size + "px Arial, sans-serif";
    c.fillStyle = color;
    c.textAlign = align;
    c.fillText(value, x, baseline);
  }
  function path(c, points, stroke, weight, fill) {
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    if (fill) { c.closePath(); c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = weight; c.stroke(); }
  }
  function circle(c, x, y, r, color) {
    c.fillStyle = color;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }

  function gradeTerminal(c, perspective) {
    const w = 520, h = 400;
    rect(c,0,0,w,h,"#14252c");
    // Two views of a graded surface: a plan with survey stations, or a perspective
    // corridor with narrowing triangles. The road follows its own centreline in each.
    const field = c.createLinearGradient(0,39,0,283);
    field.addColorStop(0,"#424445"); field.addColorStop(1,"#292e31");
    rect(c,0,39,w,246,field);
    c.save();
    c.beginPath(); c.rect(0,39,w,246); c.clip();
    function point(col, row) {
      const t = row / 12;
      const cx = perspective ? 335 - 154*t + 59*Math.sin(3*t) : 341-198*t+18*Math.sin(t*5);
      const half = perspective ? 13 + 168*t*t : 104;
      return [cx+col*half, perspective ? 52+230*t*t+col*(4+17*t) : 37+252*t+col*15];
    }
    for (let row=0; row<12; row++) for (let col=-4; col<4; col++) {
      const u=col/2, v=(col+1)/2;
      const p=point(u,row), q=point(v,row), r=point(v,row+1), s=point(u,row+1);
      const inner=col>=-2 && col<2;
      path(c,[p,q,r,s],inner ? "#77b965" : "#488a66",1.6);
      path(c,[p,r],inner ? "#579a57" : "#467c61",1.2);
    }
    for (const edge of [-1,0,1]) {
      const track=Array.from({length:13},(_,i)=>point(edge,i));
      c.setLineDash(edge ? [] : [8,6]);
      path(c,track,edge ? "#aa83be" : "#dbdb99",edge ? 2.6 : 1.8);
    }
    c.setLineDash([]);
    if (!perspective) {
      for (const row of [2,6,10]) {
        const [x,y]=point(1,row); circle(c,x,y,3.8,"#f1e4af");
        text(c,"ПК "+(10+row/2),x+10,y-2,14,"#d4e4cc",500);
      }
    }
    // Top view of the machine with wheel sets, cab, articulation and mouldboard.
    const [x,y]=point(-.04,perspective ? 9 : 6);
    c.save(); c.translate(x,y); c.rotate(perspective ? .29 : .48);
    for (const ax of [-12,7]) for (const ay of [-20,8,18])
      rect(c,ax,ay,6,9,"#101a1c");
    path(c,[[-4,-27],[4,-27],[4,-6],[8,1],[9,27],[-9,27],[-8,1],[-4,-6]],"#f9c651",2,"#d79e31");
    rect(c,-5,2,10,9,"#35484b");
    path(c,[[-17,-4],[16,-11],[17,-7],[-16,0]],"#f9ca53",2,"#d6a542");
    c.restore(); c.restore();
    if (perspective) {
      const scale=c.createLinearGradient(0,55,0,261);
      scale.addColorStop(0,"#c95742"); scale.addColorStop(.46,"#b69040");
      scale.addColorStop(.52,"#8ab64e"); scale.addColorStop(.58,"#4d9eae"); scale.addColorStop(1,"#3e5e9f");
      rect(c,464,55,10,206,scale);
      for (let i=0;i<11;i++) rect(c,474,55+20.4*i,i%5===0?10:4,1.5,"#dbdedb");
      text(c,"+1",491,65,13,"#e3e7e4"); text(c,"0",491,163,13,"#e3e7e4");
      text(c,"−1",491,263,13,"#e3e7e4");
    } else {
      // Side view of the working tool against the design grade and measured ground.
      rect(c,0,39,165,245,"#34393b");
      text(c,"ПРОФИЛЬ",12,65,14,"#dbe1dc");
      path(c,[[0,215],[30,208],[57,211],[90,201],[119,180],[165,177]],"#a5adaa",2);
      path(c,[[0,204],[88,195],[154,181]],"#d5dfc0",2.4);
      rect(c,14,187,39,7,"#d8a936");
      path(c,[[17,184],[18,177],[26,177],[29,165],[39,165],[42,180],[53,181],[51,185]],"#f9ca57",2,"#d8a936");
      path(c,[[42,179],[60,160],[85,171],[105,182]],"#f5c756",4);
      path(c,[[103,180],[113,185],[111,190],[101,188]],"#f5c756",1.5,"#cc9b2b");
      rect(c,164,39,2,245,"#666e70");
    }
    rect(c,0,0,w,38,"#1c2a30");
    text(c,perspective ? "ПРОЕКТ   /   3D" : "ПЛАН   /   НИВЕЛИРОВАНИЕ",15,26,18,"#e4efee",700);
    circle(c,432,18,5,"#91ce8d"); text(c,"RTK",447,25,17,"#d1ebd8");
    rect(c,0,284,w,57,"#203139");
    text(c,"ПОПЕРЕЧНИК",13,307,12,"#c6dade",600);
    text(c,perspective ? "−0,03 м" : "+0,02 м",13,330,21,"#f3d37e");
    path(c,[[152,325],[188,322],[237,310],[266,317],[301,318],[364,307],[416,306],[487,318]],"#7da3a0",2.5);
    path(c,[[152,320],[316,309],[488,317]],"#97ce80",3);
    path(c,[[266,302],[266,331]],"#e8b94f",2);
    rect(c,0,341,w,59,"#518526");
    text(c,"ОТМЕТКА",13,360,12,"#e3efd7");
    text(c,perspective ? "+1,135 м" : "+0,732 м",13,390,31,"#fbfff4",700);
    rect(c,264,351,1,39,"#8aaf6e");
    text(c,"ДО ПРОЕКТА",283,360,12,"#e3efd7");
    text(c,perspective ? "0,000 м" : "+0,001 м",283,390,31,"#fbfff4",700);
  }

  function mobaMatic(c) {
    rect(c,0,0,250,310,"#e8ecdc");
    rect(c,0,0,250,43,"#273c3c");
    text(c,"НИВЕЛИРОВАНИЕ",13,29,20,"#f7f8e9");
    text(c,"ВЫСОТА",13,79,20,"#3c5252");
    text(c,"+2",122,166,100,"#152a2c",700,"center");
    text(c,"мм",202,163,25,"#395151");
    for(let i=0;i<13;i++) rect(c,18+i*17.1,183,12,16, i===7 ? "#dda72b" : i===6 ? "#538869" : "#b9c9b9");
    path(c,[[123,206],[118,213],[128,213]],null,0,"#274939");
    rect(c,0,228,250,82,"#d1dbcc");
    text(c,"УСТАВКА",14,254,17,"#405857");
    text(c,"0 мм",14,291,32,"#203838");
    text(c,"AUTO",233,288,21,"#1b654e",700,"right");
  }
  function gdc(c) {
    rect(c,0,0,360,278,"#eef1e6");
    rect(c,0,0,360,45,"#253b40");
    text(c,"ТОЛЩИНА СЛОЯ",14,31,21,"#f4f3e7");
    rect(c,12,58,336,133,"#f6d443");
    text(c,"16,0",155,161,96,"#17282d",700,"center");
    text(c,"см",263,160,32,"#273333");
    rect(c,15,222,266,16,"#869288"); rect(c,15,238,266,8,"#b5bbae");
    path(c,[[15,222],[281,222]],"#263a34",2.5);
    path(c,[[297,221],[297,246]],"#374d43",2);
    for (const y of [221,246]) rect(c,290,y,15,2,"#374d43");
  }
  function horizon(c) {
    rect(c,0,0,260,390,"#122a39");
    text(c,"ВЫСОТА",15,40,25,"#c3d6d7");
    path(c,[[16,56],[244,56]],"#527783",2);
    text(c,"+4",126,157,86,"#ffcf68",700,"center");
    text(c,"мм",220,150,22,"#d1dfe0",600,"right");
    for (let i=0;i<11;i++) rect(c,18+i*21,181,14,i===5?29:19,i===6?"#ffd05c":i===5?"#b6d59c":"#426370");
    rect(c,0,228,260,162,"#1b3644");
    text(c,"УКЛОН",16,262,22,"#c3d5d6");
    text(c,"1,8 %",16,328,52,"#f3f5e2");
    path(c,[[22,363],[119,344],[222,344]],"#e9bb54",4);
  }
  // Seven-segment windows on the older controllers have no graphical menu.
  const sections = [
    [[5,2],[27,2],[31,6],[27,9],[7,9],[2,5]],
    [[28,9],[32,5],[32,24],[28,28],[25,24],[27,12]],
    [[27,29],[31,26],[31,47],[27,51],[24,47],[25,33]],
    [[5,47],[24,47],[28,51],[25,54],[4,54],[1,51]],
    [[2,31],[6,28],[8,32],[7,45],[3,50],[1,47]],
    [[3,8],[7,12],[8,24],[5,28],[1,25],[1,10]],
    [[6,25],[25,25],[29,28],[25,31],[6,31],[3,28]],
  ];
  const segments = {"0":"012345","1":"12","2":"01643","3":"01623","4":"5612","5":"05623",
    "6":"056432","7":"012","8":"0123456","9":"012356","U":"12345","H":"12546","t":"3456","-":"6"," ":""};
  function segmented(c, value, isLed, decimalAfter=-1) {
    const active=isLed ? "#ff6552" : "#263129", ghost=isLed ? "#482126" : "#92a087";
    const w=value.length*40+12;
    rect(c,0,0,w,64,isLed?"#30161d":"#a2ae93");
    for(let i=0;i<value.length;i++) {
      c.save(); c.translate(8+i*40,5);
      for(let j=0;j<sections.length;j++)
        path(c,sections[j],null,0,segments[value[i]].includes(String(j))?active:ghost);
      if(i===decimalAfter) circle(c,35,51,2.7,active);
      c.restore();
    }
  }

  const screens = {
    "GX-55": [520,400,c=>gradeTerminal(c,false)],
    "GX-75": [520,400,c=>gradeTerminal(c,true)],
    "MOBA-matic II": [250,310,mobaMatic],
    "GDC-320": [360,278,gdc],
    "Пульт «Горизонт»": [260,390,horizon],
    "ПЦУ-ГГУ-3.01": [252,64,c=>segmented(c,"t1 128",true)],
    "САУРО ИБКС.20.00.000": [172,64,(c,variant)=>variant==="slope"
      ? segmented(c,"U 12",false,2) : segmented(c,"H-60",false)],
  };
  window.drawRoadDisplay = (ctx, profile, width, height, variant) => {
    const screen=screens[profile.model];
    if(!screen) return false;
    const [w,h,draw]=screen;
    ctx.save(); ctx.scale(width/w,height/h);
    ctx.lineJoin="round"; ctx.lineCap="round";
    draw(ctx,variant);
    ctx.restore();
    return true;
  };
})();
