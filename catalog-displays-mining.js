// Illustrated operating states for the catalogue. The drawings are independent
// of the product photographs used for the bezels and their printed legends.
(() => {
  const white = "#fbfcf4", ink = "#183239", muted = "#4e696b";
  const teal = "#087967", amber = "#cc7b1d", charge = "#a9bc30";

  function rect(c,x,y,w,h,color) {
    c.fillStyle=color;
    c.fillRect(x,y,w,h);
  }
  function shape(c,points,fill,edge,width=1,closed=true) {
    c.beginPath();
    points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y));
    if(closed) c.closePath();
    if(fill) { c.fillStyle=fill; c.fill(); }
    if(edge) { c.lineWidth=width; c.strokeStyle=edge; c.stroke(); }
  }
  function line(c,x1,y1,x2,y2,color,width=2) {
    shape(c,[[x1,y1],[x2,y2]],null,color,width,false);
  }
  function round(c,x,y,r,color) {
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=color; c.fill();
  }
  function label(c,value,x,y,size,color=ink,weight=600,align="left") {
    c.font=weight+" "+size+"px 'Segoe UI', Arial, sans-serif";
    c.textAlign=align; c.textBaseline="middle"; c.fillStyle=color;
    c.fillText(value,x,y);
  }
  function gradual(c,x1,y1,x2,y2,stops) {
    const fill=c.createLinearGradient(x1,y1,x2,y2);
    stops.forEach(([offset,color])=>fill.addColorStop(offset,color));
    return fill;
  }
  function belt(c,x,y,length,rise,thickness,color) {
    c.save(); c.translate(x,y); c.rotate(-Math.atan2(rise,length));
    const span=Math.hypot(length,rise);
    c.lineCap="round";
    line(c,0,0,span,0,color,thickness);
    line(c,0,0,span,0,"#a4b8af",thickness*.64);
    for(let i=0;i<5;i++) round(c,i*span/4,0,thickness*.24,color);
    c.restore();
  }
  function rocks(c,x,y,scale) {
    c.save(); c.translate(x,y); c.scale(scale,scale);
    const data=[[-35,3,11],[-16,11,8],[-1,-1,13],[15,11,8],[32,4,11],[-17,-10,8],[16,-14,10]];
    data.forEach(([dx,dy,r],i)=>shape(c,[[dx-r,dy],[dx-r*.4,dy-r],[dx+r*.6,dy-r*.6],
      [dx+r,dy+r*.45],[dx+r*.1,dy+r*.8]],i%2?"#8b8b73":"#ac9c7d","#6c7163",1.3));
    c.restore();
  }
  function jaw(c,x,y,scale) {
    c.save(); c.translate(x,y); c.scale(scale,scale);
    shape(c,[[-45,-44],[33,-44],[12,37],[-8,37]],charge);
    shape(c,[[-65,-88],[-46,-88],[-9,40],[-24,55]],"#788887",ink,3);
    shape(c,[[21,-85],[66,-39],[35,52],[13,50],[34,-25]],"#9eb4ab",ink,3);
    shape(c,[[20,-60],[40,-29],[19,41],[15,40],[31,-26]],teal);
    shape(c,[[-51,-72],[-9,36],[-2,33],[-43,-78]],"#d5d9c9");
    for(let i=0;i<7;i++) {
      const t=i/7;
      line(c,-49+t*35,-67+t*90,-42+t*35,-74+t*90,ink,2.4);
    }
    round(c,53,-42,18,ink); round(c,53,-42,11,"#bcc8bc");round(c,53,-42,4,teal);
    shape(c,[[-31,54],[30,54],[18,72],[-20,72]],"#657d78",ink,2);
    rocks(c,-12,-64,.60);
    shape(c,[[-12,75],[-4,83],[5,75],[1,90],[-5,99]],amber);
    c.restore();
  }
  function cone(c,x,y,scale) {
    c.save();c.translate(x,y);c.scale(scale,scale);
    shape(c,[[-80,-72],[80,-72],[69,-50],[54,-33],[38,27],[56,36],[72,45],[55,60],[-57,60],
      [-73,45],[-48,28],[-57,-27],[-72,-46]],"#869c96",ink,4);
    shape(c,[[-65,-52],[65,-52],[45,-26],[25,23],[0,38],[-27,22],[-47,-27]],"#eef0df",ink,2.5);
    shape(c,[[-54,-34],[54,-34],[43,-24],[25,22],[0,37],[-26,21],[-46,-25]],charge);
    shape(c,[[-48,35],[-26,10],[-7,-23],[0,-30],[9,-24],[27,8],[47,34],[28,44],[-28,44]],teal,ink,3);
    shape(c,[[-8,44],[8,44],[13,68],[-13,68]],"#b5c3b4",ink,3);
    line(c,-62,-65,62,-65,"#e3ea86",5); rocks(c,2,-64,.75);
    for(const sx of [-1,1]) shape(c,[[sx*59,-9],[sx*55,-4],[sx*44,18],[sx*39,19]],amber);
    c.restore();
  }
  function header(c,title) {
    rect(c,0,0,720,432,"#f1f2ed");
    rect(c,0,0,720,49,"#e4e9e3");
    line(c,0,49,720,49,"#9ba9a5",2);
    rect(c,14,13,8,22,teal);
    label(c,title,36,25,23,ink,650);
    round(c,609,24,6,"#91ad39");label(c,"AUTO",625,25,18,muted,650);
  }
  function controlStrip(c,caption) {
    rect(c,0,370,720,62,"#dce4df");
    rect(c,0,371,720,2,"#a3b2ac");
    // Generic hardware-page pictograms: level, a shaft drive, and its instrument trend.
    for(let i=0;i<3;i++) rect(c,14+i*78,380,67,43,i===0?"#146b5d":"#28524c");
    for(let i=0;i<3;i++) rect(c,31+i*10,409-i*6,6,6+i*6,white);
    c.beginPath();c.arc(124,402,10,0,2*Math.PI);c.strokeStyle=white;c.lineWidth=3;c.stroke();
    line(c,105,402,113,402,white,3);line(c,135,402,143,402,white,3);
    shape(c,[[180,409],[191,400],[200,402],[214,389]],null,white,3,false);
    round(c,274,401,6,"#819d2c");label(c,caption,290,402,18,ink,650);
  }
  function sensor(c,x,y,caption,value) {
    rect(c,x,y,155,60,"#e0e5df");
    rect(c,x,y,5,60,teal);
    label(c,caption,x+15,y+16,15,muted);
    label(c,value,x+15,y+41,25,ink,700);
  }
  function fillLine(c,x,y,width,value) {
    line(c,x,y,x+width,y,"#677872",2);
    shape(c,[[x+width,y-5],[x+width+9,y],[x+width,y+5]],teal);
    label(c,value,x+width+15,y,20,ink,700);
  }
  function dial(c,x,y,r,title,value,maximum,unit) {
    const start=Math.PI*.77, sweep=Math.PI*1.46;
    function arc(from,to,color,width,radius) {
      c.beginPath();c.arc(x,y,radius,start+sweep*from,start+sweep*to);
      c.strokeStyle=color;c.lineWidth=width;c.stroke();
    }
    round(c,x,y,r+3,"#e3e7df");round(c,x,y,r-4,"#f9faf3");
    c.save();c.lineCap="butt";
    arc(0,1,"#a2aaa0",7,r-11);
    arc(.77,.90,"#ddb85c",7,r-11);arc(.90,1,"#bf684a",7,r-11);
    for(let i=0;i<=12;i++) {
      const angle=start+sweep*i/12,cos=Math.cos(angle),sin=Math.sin(angle);
      const inner=r-(i%3===0?29:22);
      line(c,x+(r-15)*cos,y+(r-15)*sin,x+inner*cos,y+inner*sin,"#4c5753",2);
    }
    const angle=start+sweep*value/maximum,dx=Math.cos(angle),dy=Math.sin(angle);
    shape(c,[[x+dy*5,y-dx*5],[x+dx*(r-21),y+dy*(r-21)],[x-dy*5,y+dx*5]],ink);
    round(c,x,y,9,teal);c.restore();
    label(c,title,x,y-r-23,19,muted,650,"center");
    label(c,value+" "+unit,x,y+r*.48,27,ink,700,"center");
  }
  function trend(c,x,y,w,h,points,color=teal) {
    for(let i=0;i<4;i++) line(c,x,y+i*h/3,x+w,y+i*h/3,"#bdcbc3",1.5);
    const path=points.map((v,i)=>[x+i*w/(points.length-1),y+h*(1-v)]);
    shape(c,[[x,y+h],...path,[x+w,y+h]],"#c4dcd0");
    shape(c,path,null,color,3.8,false);
    round(c,x+w,path.at(-1)[1],4,color);
  }
  function overview(c) {
    header(c,"Feed circuit");
    // Cone chamber downstream of a short feeder, isolated drive and level pick-off.
    label(c,"Vibrating feeder",28,82,20,muted,650);
    shape(c,[[30,123],[193,109],[217,118],[199,140],[49,154]],"#848e88",ink,3);
    shape(c,[[42,123],[191,112],[205,118],[70,135]],"#485451");
    rocks(c,119,118,.70);
    belt(c,65,161,120,14,13,ink);
    shape(c,[[210,154],[243,153],[243,145],[264,158],[243,173],[243,165],[210,166]],teal);
    cone(c,369,207,1.39);
    fillLine(c,299,157,144,"65%");
    label(c,"Set level",284,317,18,muted);label(c,"70%",370,317,23,ink,700);
    sensor(c,28,234,"Feed rate","82%");
    sensor(c,535,89,"Drive power","168 kW");
    sensor(c,535,169,"Oil supply","41 °C");
    for(let i=0;i<5;i++) rect(c,538+i*27,273,19,23,i<4?charge:"#cbd1c5");
    controlStrip(c,"Automatic feed regulation");
  }
  function jawFeeder(c) {
    header(c,"Jaw chamber");
    label(c,"Feeder drive",27,90,20,muted);
    belt(c,42,150,122,8,18,ink);
    shape(c,[[177,140],[225,140],[225,132],[244,146],[225,159],[225,152],[177,152]],"#758980");
    round(c,58,204,11,"#85a830");label(c,"RUN",82,204,20,ink,700);
    sensor(c,28,257,"Frequency","38 Hz");
    // A cross-section and its level pick-off share the same vertical coordinate.
    jaw(c,375,207,1.42);
    fillLine(c,309,146,153,"42%");
    label(c,"Fill target",523,86,17,muted);label(c,"70%",522,115,31,ink,700);
    line(c,537,174,537,306,"#adb8ad",4);
    for(let i=0;i<6;i++) {
      const by=298-i*21;
      rect(c,549,by,27,13,i<3?charge:"#d4dacf");
    }
    label(c,"Level",594,284,17,muted);
    controlStrip(c,"Crusher ready   /   Feeder on");
  }
  function coneLoad(c) {
    header(c,"Cone load monitor");
    dial(c,136,208,102,"Pressure",17,30,"bar");
    dial(c,584,208,102,"Motor power",179,225,"kW");
    cone(c,360,219,1.14);
    rect(c,327,107,66,33,"#dbe3bf");label(c,"62%",360,123,20,ink,700,"center");
    line(c,49,342,671,342,"#c7cfc4",2);
    round(c,246,382,6,"#85a830");label(c,"Crusher operating",265,381,21,teal,650);
  }
  function coneStation(c) {
    header(c,"Crushing station");
    // The full circuit shows both conveyors and the auxiliary oil unit.
    belt(c,90,119,129,20,17,ink);rocks(c,137,100,.66);
    shape(c,[[226,112],[250,124],[249,116],[266,136],[243,133],[249,129],[222,120]],teal);
    cone(c,317,194,1.11);belt(c,301,302,193,35,18,ink);
    rect(c,63,254,96,59,"#b3bcb3");
    rect(c,71,245,79,12,"#5a6c68");
    for(let i=0;i<7;i++) line(c,74+i*11,268,74+i*11,291,"#7f8e84",3);
    round(c,179,262,16,"#778984");round(c,179,262,7,teal);
    shape(c,[[159,281],[201,281],[201,240],[266,240]],null,"#5f716d",4,false);
    label(c,"Oil unit",71,334,17,muted);
    const channels=[["Chamber","64%"],["Gap","26 mm"],["Motor","72%"]];
    for(const [i,[name,value]] of channels.entries()) {
      const sy=84+i*63;
      shape(c,[[371,142+i*36],[426,142+i*36],[460,sy+19],[485,sy+19]],null,"#9ba79c",2,false);
      rect(c,486,sy,183,43,"#e0e5df");round(c,502,sy+21,5,"#9cb638");
      label(c,name,517,sy+22,16,muted);label(c,value,655,sy+22,19,ink,700,"right");
    }
    controlStrip(c,"Oil pump on   /   Discharge running");
  }
  function tanaHydraulics(c) {
    // The console's pressure page is a tabular readout on a blue LCD.
    // The orange right-hand strip belongs to the machine's page-selection keys.
    rect(c,0,0,720,432,"#384b68");
    rect(c,0,0,720,56,"#2b3a56");
    label(c,"Pressure monitor",23,28,25,"#f2f1e2",650);
    label(c,"bar",476,28,18,"#c8d4de",600);
    const channels=[["Rotor forward",238],["Rotor reverse",0],["Feed circuit",162],
      ["Discharge belt",84],["Return line",8]];
    for(const [i,[name,value]] of channels.entries()) {
      const y=70+i*59;
      rect(c,17,y,511,49,i%2?"#344761":"#40536c");
      round(c,41,y+24,10,"#73899a");round(c,41,y+24,4,value?"#e9c987":"#475d71");
      label(c,name,67,y+24,21,"#e3e9e9",550);
      const start=311;
      rect(c,start,y+21,73,6,"#293e56");
      rect(c,start,y+21,73*value/260,6,"#94b1ba");
      label(c,String(value),499,y+24,26,"#f6edd2",700,"right");
    }
    rect(c,555,65,148,291,"#bf6650");
    const keys=[[101,"Pages"],[181,"Status"],[261,"Service"]];
    for (const [cy,name] of keys) {
      rect(c,565,cy-24,127,51,"#a95343");
      label(c,name,630,cy,18,"#fff0de",650,"center");
    }
    rect(c,18,382,684,33,"#2b3d55");
    round(c,35,398,5,"#b4ce8d");label(c,"Hydraulics online",51,398,16,"#dae3e0",550);
  }

  function furnace(c) {
    rect(c,0,0,720,432,"#e6edf2");
    rect(c,0,0,720,53,"#254555");label(c,"Вакуумная печь",24,26,25,white,650);
    rect(c,563,0,157,53,"#365c6e");label(c,"ЦИКЛ  04",643,26,18,"#d4e4e6",700,"center");
    label(c,"ТЕМПЕРАТУРА",30,88,17,muted,650);label(c,"822",25,151,73,ink,700);
    label(c,"°С",172,171,24,teal);label(c,"Уставка   830 °С",31,218,19,muted,600);
    // Double-shell chamber with heater banks, charge and temperature probe.
    c.lineJoin="round";
    shape(c,[[395,112],[426,86],[610,86],[648,112],[648,184],[613,212],[431,212],[395,181]],
      "#85969d","#47606b",4);
    shape(c,[[414,122],[438,104],[601,104],[629,123],[629,173],[605,192],[439,192],[414,174]],"#412f2e");
    for(const y of [114,178]) {
      const pts=Array.from({length:18},(_,i)=>[438+i*9.5,y+(i%2?7:0)]);
      shape(c,pts,null,"#f0a340",4,false);
    }
    for(const x of [459,496,533]) rect(c,x,139,32,28,"#bc8360");
    shape(c,[[588,76],[588,128],[561,146]],null,"#c8dce2",5,false);
    rect(c,23,258,674,112,"#d9e3e7");
    label(c,"НАГРЕВ",38,281,15,"#456171",650);
    trend(c,147,275,514,70,[.04,.08,.13,.2,.29,.43,.57,.60,.67,.68,.72,.76,.76,.78,.79,.80,.80]);
    rect(c,0,390,720,42,"#244454");round(c,36,412,6,"#8cd097");
    label(c,"Выдержка",54,411,18,white);label(c,"Зона 1",689,411,18,"#bfd4db",650,"right");
  }
  // Four physical character cells, drawn as discrete dot-matrix emitters.
  const glyphs={
    R:["11110","10001","10001","11110","10100","10010","10001"],
    U:["10001","10001","10001","10001","10001","10001","01110"],
    N:["10001","11001","11001","10101","10011","10011","10001"],
    L:["10000","10000","10000","10000","10000","10000","11111"],
    I:["11111","00100","00100","00100","00100","00100","11111"],
    K:["10001","10010","10100","11000","10100","10010","10001"]
  };
  function matrix(c,value) {
    rect(c,0,0,304,94,"#141d17");
    for(let cell=0;cell<4;cell++) {
      const pattern=glyphs[value[cell]];
      rect(c,7+cell*74,8,66,79,"#20241c");
      for(let row=0;row<7;row++) for(let col=0;col<5;col++) {
        const on=pattern?.[row][col]==="1";
        rect(c,13+cell*74+col*11,13+row*10,8,7,on?"#ffc364":"#38392a");
      }
    }
  }
  function serviceMonitor(c) {
    rect(c,0,0,288,208,"#202a26");
    rect(c,0,0,288,208,gradual(c,0,0,288,208,[[0,"#25342d"],[.6,"#17231c"],[1,"#151d19"]]));
    label(c,"КАНАЛ   03",23,37,23,"#a3bc9c",600);
    line(c,22,61,267,61,"#54705c",2);
    c.font="600 57px monospace";c.textAlign="left";c.fillStyle="#c1d8ac";c.fillText("0164",22,103);
    label(c,"ЦИКЛ",23,167,21,"#a3bc9c",600);
    rect(c,102,159,9,15,"#a1bb94");
  }
  const panels={
    "IC™ Crusher Automation":[720,432,overview],
    IC10C:[720,432,jawFeeder], IC50C:[720,432,coneLoad], IC70C:[720,432,coneStation],
    "TANA Control System":[720,432,tanaHydraulics],
    "СПК207":[720,432,furnace], "ЭК-1000":[288,208,serviceMonitor],
    "ControlLogix L7x":[304,94,c=>matrix(c,"RUN ")], "1756-EN2TR":[304,94,c=>matrix(c,"LINK")]
  };
  window.drawMiningDisplay=function drawMiningDisplay(ctx,profile,width,height) {
    const panel=panels[profile.model];
    if(!panel) return false;
    const [w,h,draw]=panel;
    ctx.save();ctx.scale(width/w,height/h);
    ctx.lineJoin="round";ctx.lineCap="round";
    draw(ctx);ctx.restore();
    return true;
  };
})();
