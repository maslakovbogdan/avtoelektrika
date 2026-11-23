// External reconstructions from the manufacturers' product views and dimension sheets.
// The front prints are rectified from each catalogue illustration. All casings,
// connectors, keys, mounting hardware and exposed backs are part of the rotating mesh.
window.drawRoadInstrument = function drawRoadInstrument(m, profile) {
  const name = profile.model;
  const graphite = "#282b2d", rubber = "#1c2021", metal = "#b7c2c6", silver = "#afb5b3";

  // Place physical parts and individual printed surfaces in the elevation of a photographed face.
  function face(width, height, px, py) {
    const X = p => (p / px - .5) * width, Y = p => (.5 - p / py) * height;
    const W = p => p / px * width, H = p => p / py * height;
    function print(l,t,r,b,z,finish="label",stock=graphite) {
      m.decal(X((l+r)/2),Y((t+b)/2),z,W(r-l),H(b-t),"@photo-screen",stock,"front",finish,
        [l/px,t/py,(r-l)/px,(b-t)/py]);
    }
    function display(l,t,r,b,z) {
      m.decal(X((l+r)/2),Y((t+b)/2),z,W(r-l),H(b-t),"@display","#18282c","front","lcd");
    }
    function plate(l,t,r,b,z,d,color,cut=.025) {
      m.plate(X((l+r)/2),Y((t+b)/2),z,W(r-l),H(b-t),d,color,cut);
    }
    function shape(points,z,depth,color) {
      m.solid(0,0,z,depth,points.map(([x,y])=>[X(x),Y(y)]).reverse(),color);
    }
    return { X,Y,W,H,print,display,plate,shape };
  }

  function circularSocket(x,y,z,r,pins,side) {
    m.disc(x,y,z,r,.07,metal,side,24);
    // Orient the insert and pin rings together on the chosen housing face.
    m.transform((a,b,c) => side==="bottom" ? [x+a,y-c,z+b] : [x+a,y+c,z-b], () => {
      m.disc(0,0,.052,r*.91,.06,silver,"front",24);
      m.disc(0,0,.089,r*.76,.025,rubber,"front",24);
      for (let i=0;i<pins;i++) {
        const inner = pins>8 && i>=pins-4;
        const count = pins>8 ? inner ? 4 : pins-4 : pins;
        const angle = 2*Math.PI*i/count;
        const radius = r*(inner ? .28 : .56);
        m.disc(Math.cos(angle)*radius,Math.sin(angle)*radius,.106,r*.066,.015,"#b8a47a","front",8);
      }
    });
  }

  function topcon() {
    const gx55 = name==="GX-55";
    const w=3.12, h=gx55 ? 2.40 : 2.25, faceHeight=gx55 ? 500 : 480;
    const f=face(w,h,660,faceHeight), gold="#e9b64d", gray="#4c4e4e";
    m.plate(0,0,-.045,w*.985,h*.98,.31,graphite,.145,"front",.01);
    m.plate(0,0,.099,w,h,.115,gold,.15,"front",.012);
    m.plate(0,0,-.205,w*.963,h*.954,.064,"#ab873e",.13,"back",.015);
    const left=gx55?35:23, bottom=gx55?483:460, knee=gx55?557:575, right=gx55?654:637;
    // The fascia narrows over the speaker. Each horizontal band remains convex.
    const bands=[[24,left+15,right-16],[41,left,right],[252,left,right],[274,left,right-4],
      [339,left,knee+4],[353,left,knee],[bottom-14,left,knee],[bottom,left+14,knee-12]];
    for (let i=1;i<bands.length;i++) {
      const [top,l1,r1]=bands[i-1],[base,l2,r2]=bands[i];
      f.shape([[l1,top],[r1,top],[r2,base],[l2,base]],.161,.016,gray);
    }
    const lcd=gx55 ? [78,72,518,437] : [56,62,545,430];
    const [l,t,r,b]=lcd;
    f.plate(l-9,t-9,r+10,b+10,.179,.025,"#daa942",.042);
    f.plate(l-2,t-2,r+2,b+2,.199,.018,rubber,.026);
    f.display(l,t,r,b,.209);
    const strips=gx55 ? [[74,36,526,51],[45,65,58,443],[540,65,556,445],[251,449,348,476]]
      : [[48,34,552,51],[29,56,45,437],[559,56,573,436],[252,437,348,459]];
    for (const rect of strips) f.print(...rect,.174);
    const cx=gx55?598:602, size=gx55?27:18, centers=gx55?[77,140,202,265]:[78,126,173,220];
    for (const y of centers) {
      m.disc(f.X(cx),f.Y(y),.178,f.W(size),.015,"#cecec9","front",28);
      m.disc(f.X(cx),f.Y(y),.1865,f.W(size-2.7),.013,gray,"front",28);
      const ink=size*.64;
      f.print(cx-ink,y-ink,cx+ink,y+ink,.194);
    }
    // The triangular perforation pattern and rubber USB flap sit in the exposed yellow corner.
    const grille=gx55 ? [581,307,644,397] : [591,311,638,394];
    f.print(...grille,.1578);
    const cap=gx55?[584,405,642,498]:[594,401,635,477];
    f.plate(...cap,.173,.038,gray,.035);
    f.print(cap[0]+4,cap[1]+4,cap[2]-4,cap[3]-3,.193);
    // Back view in the Topcon GX-55/GX-75 Quick Start Guide, figure 1.
    for (const x of [-1.25,-.53,.39,1.30]) for (const sign of [-1,1])
      m.screw(x,sign*(h*.441),-.24,"back",.027);
    for (const sign of [-1,1]) m.screw(sign*1.43,.04,-.24,"back",.027);
    m.plate(.42,-.22,-.267,1.24,.70,.074,"#ad8841",.12,"back");
    m.plate(.44,-.22,-.356,1.15,.52,.15,"#a38344",.10,"back");
    for (const y of [-.40,-.32,-.24])
      m.plate(.42,y,-.436,.93,.018,.02,"#7f672f",.008);
    for (const y of [-.48,.04]) for (const x of [.05,.51])
      m.screw(x,y,-.311,"back",.032);
    m.disc(.99,-.22,-.356,.186,.19,"#a3854b","right",24);
    m.disc(1.09,-.22,-.356,.157,.028,silver,"right",24);
    m.disc(1.106,-.22,-.356,.076,.01,graphite,"right",20);
    circularSocket(.60,.072,-.342,.105,19,"top");
    m.decal(-.74,-.61,-.241,.48,.20,"TOPCON\n"+name,"#c0bb9d","back");
  }

  function matic() {
    const w=1.04,h=2.86,f=face(w,h,232,650),gold="#ecbb32";
    const outline=[[-.50,-1.34],[-.47,-1.43],[.47,-1.43],[.50,-1.34],[.51,-.14],
      [.52,1.26],[.506,1.34],[.47,1.385],[.31,1.414],[0,1.44],[-.31,1.414],[-.47,1.385],
      [-.506,1.34],[-.52,1.26],[-.51,-.14]];
    m.casting(outline,[[-.215,.955,graphite],[-.184,1,"#4f4b39"],[-.154,1,"#c3a548"],
      [.162,1,gold],[.199,.991,gold]]);
    f.plate(10,18,222,641,.204,.016,"#292928",.055);
    f.plate(10.8,441,221.2,640.4,.213,.015,"#a09e9c",.027);
    f.print(22,51,213,142,.214);
    f.plate(34,156,199,430,.217,.015,"#93979b",.025);
    f.plate(38,160,195,425,.228,.015,graphite,.023);
    f.display(43,165,190,351,.239);
    for (const [l,t,r,b] of [[43,379,84,417],[95,379,138,417],[149,379,191,417],
      [42,468,113,535],[121,468,191,535],[42,543,113,610],[121,543,191,610]]) {
      f.plate(l-1,t-1,r+1,b+1,.241,.021,rubber,.019);
      f.plate(l,t,r,b,.259,.025,gold,.019);
      f.print(l+3,t+3,r-3,b-3,.272);
    }
    m.plate(0,.01,-.222,.86,2.60,.045,"#454749",.066,"back");
    for (const y of [-1.12,1.10]) for (const x of [-.33,.33]) m.screw(x,y,-.247,"back",.023);
    m.plate(0,.10,-.279,.44,.74,.08,graphite,.061,"back");
    m.plate(0,.09,-.332,.34,.59,.041,"#56595a",.035,"back");
    m.decal(0,-.76,-.246,.48,.21,"MOBA\nMOBA-matic II","#a69f8c","back");
    for (const [x,r,pins] of [[-.216,.142,12],[.206,.119,7]]) {
      m.disc(x,-1.452,-.009,r*1.12,.06,"#a3a29b","bottom",12);
      m.disc(x,-1.510,-.009,r,.068,"#a7a7a0","bottom",22);
      circularSocket(x,-1.554,-.009,r,pins,"bottom");
    }
  }

  function gdc() {
    const w=2.03,h=2.19,f=face(w,h,430,480);
    m.plate(0,0,-.025,w,h,.62,"#343638",.195,"front",.025);
    m.plate(0,0,.294,w*.99,h*.986,.09,graphite,.17,"front",.025);
    f.plate(7,31,365,433,.344,.024,"#373839",.043);
    f.plate(62,80,308,285,.360,.025,"#737878",.028);
    f.plate(67,85,304,281,.376,.015,rubber,.013);
    f.display(80,94,296,275,.386);
    f.print(12,382,357,429,.358);
    for (const [left,right] of [[59,134],[148,222],[238,311]]) {
      f.plate(left,296,right,379,.373,.05,rubber,.028);
      f.plate(left+1,307,right-1,375,.414,.04,"#e7bc39",.021);
      f.print(left+5,311,right-6,371,.435);
    }
    for (const [x,y] of [[195,16],[392,245],[190,457]]) m.screw(f.X(x),f.Y(y),.339,"front",.047);
    // Right-hand grip surrounds the adjustment shaft, with flutes along the axis.
    m.disc(1.046,-.16,-.02,.37,.09,graphite,"right",32);
    m.disc(1.122,-.16,-.02,.35,.10,"#414346","right",32);
    m.disc(1.273,-.16,-.02,.34,.24,"#302f30","right",32);
    for (let i=0;i<16;i++) {
      const a=i*Math.PI/8;
      m.disc(1.269,-.16+Math.cos(a)*.333,-.02+Math.sin(a)*.333,.027,.207,graphite,"right",6);
    }
    m.disc(1.401,-.16,-.02,.255,.018,"#444444","right",28);
    m.plate(0,0,-.356,1.78,1.97,.065,"#3d3f40",.16,"back",.02);
    for (const y of [-.80,.80]) for (const x of [-.66,.66]) m.screw(x,y,-.391,"back",.027);
    m.decal(.12,.28,-.393,.60,.25,"MOBA\nGDC-320","#b0b1a6","back");
    circularSocket(-.39,-1.097,-.072,.125,8,"bottom");
  }

  function mpc() {
    const w=2.66,d=2.25,aluminum="#b5bdbe";
    m.plate(0,-.168,0,w,d,.065,metal,.096,"top");
    m.plate(0,.025,0,2.52,2.11,.335,aluminum,.066,"top");
    m.plate(0,.213,0,w,1.63,.081,silver,.045,"top");
    // Bent end tabs leave a stamped relief in the lid ahead of and behind the ribbed panel.
    for (const sign of [-1,1]) {
      for (const x of [-.954,.954]) {
        m.plate(x,.213,sign*.948,.745,.264,.080,silver,.036,"top");
        m.screw(x+Math.sign(x)*.25,.255,sign*.987,"top",.041);
        m.disc(x+Math.sign(x)*.27,-.128,sign*1.052,.058,.013,rubber,"top",16);
      }
    }
    for (let row=0; row<12; row++) {
      const z=-.77+row*.14;
      if (Math.abs(z)<.44) {
        for (const x of [-.837,.837]) m.plate(x,.265,z,.92,.032,.025,silver,.014,"top");
      } else m.plate(0,.265,z,2.59,.032,.025,silver,.014,"top");
    }
    m.plate(-.058,.257,-.018,.79,.80,.015,"#bcc1bf",.035,"top");
    m.decal(-.058,.266,-.018,.77,.77,"@photo-screen",silver,"top","label",[203/600,145/485,169/600,174/485]);
    // A broad sealed plug and its latch project from the forward edge.
    m.plate(.08,.02,1.117,1.45,.32,.26,graphite,.053);
    m.plate(.08,.055,1.291,1.33,.269,.20,"#202222",.05,"front",.014);
    m.plate(.08,.206,1.202,.27,.11,.14,"#454747",.026);
    m.plate(0,-.205,0,2.27,1.77,.021,"#929b9b",.063,"bottom");
    for (const x of [-.99,.99]) for (const z of [-.72,.72]) m.screw(x,-.217,z,"bottom",.034);
  }

  function danfoss() {
    // Danfoss mounting elevations AI152986480953 and AI152886480719.
    const fifty=name.startsWith("MC050"),u=.019;
    const w=(fifty?159.7:158.2)*u, depth=(fifty?193.8:142)*u;
    const green="#52605d", lip="#4e5858", core="#555e5c";
    const back=-depth/2, front=depth/2, railFront=front-.64, half=w/2;
    m.plate(0,.006,(back+railFront)/2,w*.68,railFront-back-.028,.47,core,.048,"top");
    m.plate(0,-.06,railFront+.14,w*.91,.81,.55,lip,.096,"front",.02);
    m.plate(0,-.035,railFront+.43,w*.876,.79,.17,green,.102,"front",.017);
    m.plate(0,.317,railFront+.047,w*.968,.254,.245,green,.03,"top",.009);
    // The two deep side scallops and the lower shelves are part of the H-shaped casting.
    for (const sign of [-1,1]) {
      const sections=[[back,half-.054],[back+.078,half],[back+.204,half],
        [back+.61,half*.48],[railFront-.54,half*.48],[railFront-.15,half],[railFront-.055,half],[railFront,half-.05]];
      for (let i=1;i<sections.length;i++) {
        const [start,a]=sections[i-1],[end,b]=sections[i];
        let rim=[[half*.202,-end],[b,-end],[a,-start],[half*.202,-start]].map(([x,z])=>[x*sign,z]);
        if(sign<0) rim.reverse();
        m.solid(0,-.015,0,.89,rim,green,"top");
      }
      m.plate(sign*half*.57,-.19,(back+railFront)/2,half*.55,railFront-back-.095,.21,core,.028,"top");
      for (const z of [back+.145,railFront-.137]) {
        const cx=sign*(half-.13);
        m.disc(cx,.433,z,.082,.01,"#65706c","top",20);
        m.disc(cx,.440,z,.058,.008,"#242b29","top",18);
        m.disc(cx,-.465,z,.059,.011,rubber,"bottom",16);
      }
      const z=back+.30;
      m.plate(sign*half*.94,-.079,z,.20,.31,.16,lip,.018,"right");
      m.disc(sign*(half*.94+.085),-.078,z,.057,.015,rubber,sign<0?"left":"right",16);
    }
    const fz=railFront+.516;
    if (fifty) {
      const cx=-.14;
      m.socket(cx,-.017,fz,1.36,.56,"front",graphite,0,0);
      for (const sign of [-1,1]) {
        const x=cx+sign*.30;
        m.plate(x,-.018,fz+.025,.425,.375,.029,"#7b4734",.019);
        for(let row=0;row<5;row++) for(let col=0;col<5;col++)
          m.disc(x+(col-2)*.072,-.017+(row-2)*.064,fz+.056,.015,.034,"#b89a6b","front",8);
      }
      m.plate(cx,-.018,fz+.029,.16,.374,.043,"#898d87",.014);
      m.disc(cx,-.015,fz+.056,.050,.020,"#ad9066","front",12);
      m.disc(cx,-.015,fz+.07,.027,.012,rubber,"front",12);
    } else {
      for(const x of [-.56,.56]) m.socket(x,-.034,fz,.84,.40,"front",lip,6,2);
    }
    for (const x of [.91,1.02]) m.disc(x,.125,fz+.004,.026,.008,rubber,"front",12);
    m.decal(0,-.231,(back+railFront)*.43,.71,.26,"Danfoss   PLUS+1\n"+name.split(" ")[0],"#8b928a","bottom");
  }

  if(profile.brand==="Topcon") topcon();
  else if(profile.brand==="Danfoss") danfoss();
  else if(name==="MOBA-matic II") matic();
  else if(name==="GDC-320") gdc();
  else mpc();
};
