// Separate head and cab modules in the manufacturer's Log Mate 510 hardware photograph.
// Reference: https://logmax.com/en/controlsystem/
(() => {
  const shell = "#383a3b", rubber = "#242a2c", legend = "#303336";
  const metal = "#b7c2c6", alloy = "#88959c", contact = "#bcaa84";

  function circularSocket(m, x, y, z, side, radius) {
    const advance = (offset) => side === "left" ? [x-2.0*offset,y,z] : [x,y,z+offset];
    const disc = (at, r, depth, color, sides) =>
      m.disc(...advance(at*radius), r*radius, depth*radius*(side==="left"?2:1), color, side, sides);
    disc(.14,1.14,.28,alloy,6);
    disc(.40,.91,.29,metal,18);
    // Turned threads and the dark inner insulator are distinct when viewed from the side.
    disc(.729,.73,.508,alloy,18);
    for (const at of [.59,.76,.93]) disc(at,.87,.10,metal,18);
    disc(1.00,.68,.045,rubber,18);
    for (const [u,v] of [[-.27,-.23],[.27,-.23],[-.27,.23],[.27,.23]]) {
      const [cx,cy,cz] = advance(1.04*radius);
      m.disc(cx+(side==="front"?u*radius:0),cy+v*radius,cz+(side==="left"?u*radius:0),
        radius*.08,.006,contact,side,7);
    }
  }

  function head(m) {
    m.plate(0,0,-.08,.91,3.10,.85,shell,.07,"front",.025);
    m.plate(0,0,.346,.89,3.06,.052,rubber,.05);
    m.plate(0,0,.38,.84,3.02,.051,shell,.045,"front",.022);
    m.decal(0,.512,.409,.726,1.76,"@photo-screen",legend);
    m.mark(0,-.66,.407,.81,.016,rubber);
    // Seven threaded M12 sockets run down one flange, with keyed loom sockets opposite.
    for(let i=0;i<7;i++) circularSocket(m,-.448,1.09-i*.358,-.07,"left",.122);
    for(let i=0;i<8;i++) {
      const y=1.16-i*.326;
      const plastic=i===0?"#a8a99d":rubber;
      m.plate(.55,y,-.079,.55,.278,.218,plastic,.022,"right",.025);
      m.socket(.663,y,-.079,.54,.276,"right",plastic,3,2);
      m.plate(.57,y-.125,.078,.115,.066,.24,plastic,.011,"right");
    }
    m.plate(0,0,-.525,.68,2.52,.083,shell,.045,"back");
    for(const y of [-1.22,1.22]) m.screw(0,y,-.569,"back",.055);
  }

  function cab(m) {
    m.plate(0,0,-.02,3.41,.84,.80,alloy,.049,"front",.012);
    m.plate(0,0,.382,3.36,.79,.05,"#a4a7a4",.032);
    m.plate(0,.429,-.014,3.34,.73,.027,legend,.028,"top");
    m.decal(0,.445,-.014,3.30,.706,"@photo-screen",legend,"top");
    for (const x of [-1.20,1.18]) {
      // The two slotted feet project beyond the face. The mounting surface is
      // visible through each slot at oblique angles.
      m.plate(x,-.397,.356,.435,.171,.052,alloy,.034,"top");
      for (let i=0;i<20;i++) {
        const a=i*Math.PI/10, b=(i+1)*Math.PI/10;
        const ring=(angle,rx,ry)=>[Math.cos(angle)*rx,Math.sin(angle)*ry];
        m.solid(x,-.397,.50,.051,[ring(a,.211,.125),ring(b,.211,.125),
          ring(b,.102,.056),ring(a,.102,.056)],alloy,"top");
      }
    }
    // Six USB apertures and three circular connectors occupy the stepped left end.
    for (let row=0;row<3;row++) {
      const y=(1-row)*.238;
      m.plate(-1.43,y,.432,.223,.201,.062,metal,.015);
      for (const offset of [-.045,.045]) {
        m.mark(-1.43,y+offset,.464,.177,.062,rubber);
        m.mark(-1.43,y+offset-.015,.465,.128,.012,contact);
      }
      if (row!==1) circularSocket(m,-1.132,y,.410,"front",.083);
      else {
        m.disc(-1.132,y,.458,.097,.097,metal,"front",16);
        m.disc(-1.132,y,.511,.071,.011,alloy,"front",16);
        m.mark(-1.132,y,.518,.026,.097,rubber);
      }
    }
    const colors=["#bcbbb1",rubber,"#665149","#41715b",rubber,"#757372"];
    for(let i=0; i<colors.length; i++) {
      const x=-.785+i*.267;
      m.socket(x,-.012,.410,.218,.526,"front",colors[i],2,5);
      m.plate(x,.244,.443,.117,.042,.065,shell,.008);
    }
    for (const [x,rows] of [[.98,3],[1.25,10],[1.50,10]]) {
      const h=rows*.064;
      m.socket(x,.308-h/2,.407,.144,h,"front","#a8b7b7",2,rows);
    }
    m.label(0,0,-.424,.52,"back");
  }

  window.drawLogMate = function drawLogMate(mesh, name) {
    if (name.startsWith("LHM")) head(mesh);
    else cab(mesh);
  };
})();
