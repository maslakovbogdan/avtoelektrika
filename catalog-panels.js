// Exterior geometry follows the front elevations in the corresponding catalog photographs.
(() => {
  const plastic = "#323538", gasket = "#1e2021", ink = "#d5d9d4";

  // The IC touch panel has bowed upper and lower edges and a small asymmetric badge.
  const silhouette = [
    [0,-.50],[.27,-.492],[.44,-.473],[.475,-.463],[.490,-.447],[.499,-.422],
    [.5,-.385],[.5,.385],[.499,.422],[.490,.447],[.475,.463],[.44,.473],
    [.27,.492],[0,.50],[-.27,.492],[-.44,.473],[-.475,.463],[-.490,.447],
    [-.499,.422],[-.5,.385],[-.5,-.385],[-.499,-.422],[-.490,-.447],
    [-.475,-.463],[-.44,-.473],[-.27,-.492]
  ];

  function display(m, x, y, z, w, h, tag = "metso") {
    const outline = silhouette.map(([u,v]) => [u*w,v*h]);
    m.solid(x,y,z,.076,outline,plastic,"front",.01);
    const sw=w*.851, sh=h*.723;
    m.plate(x,y,z+.042,sw+.024,sh+.023,.014,gasket,.012);
    m.decal(x,y,z+.051,sw,sh,"@display","#354148","front","lcd");
    const badgeX=x+w*.292, badgeY=y-h*.395;
    m.plate(badgeX,badgeY,z+.039,w*.236,h*.052,.006,"#d8dad5",.012);
    m.decal(badgeX,badgeY,z+.044,w*.218,h*.044,tag,"#d8dad5");
  }

  function handheldMetso(m) {
    // The gasket seats behind the overhanging moulded front.
    const width=3.12, height=2.22;
    m.plate(0,0,-.17,2.77,1.90,.34,"#424548",.11,"front",.025);
    m.plate(0,0,.014,2.96,2.06,.049,gasket,.125);
    display(m,0,0,.067,width,height);
    m.label(0,.08,-.344,.47,"back");
    for (const x of [-1.23,1.23]) for(const y of [-.80,.80]) m.screw(x,y,-.342,"back",.029);
  }

  // A coordinate system in reference-photo pixels keeps all six operators aligned
  // with the display and the keyed cabinet latch. All dimensions below are exterior.
  function cabinet70(m) {
    const scale=3.2/712, X=(x)=>(x-356)*scale, Y=(y)=>(267-y)*scale;
    function plate(x,y,z,w,h,d,color,r=2) {
      m.plate(X(x),Y(y),z,w*scale,h*scale,d,color,r*scale);
    }
    function dot(x,y,z,r,d,col) {
      m.disc(X(x),Y(y),z,r*scale,d,col,"front",24);
    }
    function stroke(x1,y1,x2,y2,weight,z,color) {
      const dx=X(x2)-X(x1),dy=Y(y2)-Y(y1),length=Math.hypot(dx,dy);
      const u=-dy/length*weight*scale/2, v=dx/length*weight*scale/2;
      m.solid(0,0,z,.001,[[X(x1)+u,Y(y1)+v],[X(x1)-u,Y(y1)-v],
        [X(x2)-u,Y(y2)-v],[X(x2)+u,Y(y2)+v]],color);
    }
    function sign(x,y,shape) {
      const z=.101,c="#b7c8aa";
      if(shape==="square"||shape==="cross") {
        stroke(x-9,y-8,x+9,y-8,1.5,z,c);stroke(x+9,y-8,x+9,y+8,1.5,z,c);
        stroke(x+9,y+8,x-9,y+8,1.5,z,c);stroke(x-9,y+8,x-9,y-8,1.5,z,c);
      } else {
        stroke(x-10,y-6,x+10,y-6,1.7,z,c);stroke(x+10,y-6,x,y+9,1.7,z,c);
        stroke(x,y+9,x-10,y-6,1.7,z,c);
      }
      if(shape==="cross") {
        stroke(x-13,y-12,x+13,y+12,1.35,z+.001,c);
        stroke(x-13,y+12,x+13,y-12,1.35,z+.001,c);
      }
    }
    m.plate(0,0,-.34,3.14,2.34,.64,"#a3a6a7",.034,"front",.012);
    m.plate(0,0,-.004,3.15,2.35,.040,"#4b4d4c",.03);
    // Keep the large powder-coated door face planar even under grazing light.
    m.plate(0,0,.048,3.2,2.4,.082,"#c9cbcd",.045);
    // The IC70C uses a square-sided HMI surround mounted into a full cabinet door.
    plate(303,268,.110,348,244,.054,"#404041",5);
    plate(303,268,.144,312,213,.021,"#343637",6);
    plate(303,268,.157,280,170,.010,gasket,1.6);
    m.decal(X(303),Y(268),.164,275*scale,165*scale,"@display","#36434b","front","lcd");
    m.decal(X(408),Y(364),.156,67*scale,11*scale,"Metso:Outotec","#d5d7d0");

    plate(595,265,.092,177,362,.011,"#b6b2a1",5);
    plate(595,252,.099,170,331,.003,"#075951",3);
    plate(640,358,.103,74,112,.004,"#dcb811",1.3);
    m.decal(X(595),Y(427),.101,80*scale,13*scale,"Metso:Outotec","#b6b2a1");
    for(const [x,y,shape] of [[550,111,"square"],[639,111,"cross"],[537,226,"square"],
      [639,222,"triangle"],[541,327,"triangle"]]) sign(x,y,shape);
    stroke(626,315,654,315,2,.108,"#ae3027"); stroke(654,315,640,338,2,.108,"#ae3027");
    stroke(640,338,626,315,2,.108,"#ae3027");
    for(const [x,y,col] of [[550,161,"#72ad78"],[639,161,"#bf4f43"],[550,267,"#3b3d3d"],
      [639,267,"#9f332b"],[550,375,"#3c9fcb"],[640,375,"#bd4b3b"]]) {
      const z = y===375&&x===640 ? .108 : .102;
      dot(x,y,z+.010,25,.024,(y===161||x===550&&y===375)?"#b8c2bd":"#202725");
      dot(x,y,z+.027,22,.020,col);
      if(x===550&&y===267) stroke(x-10,y-10,x+12,y+10,5,z+.039,ink);
    }
    dot(80,268,.092,23,.016,"#939b9c");dot(80,268,.105,19,.016,"#d3d5d5");
    dot(80,268,.116,9,.008,gasket);
    stroke(80,255,80,281,3.0,.121,"#242829");
    m.label(0,-.7,-.662,.46,"back");
  }

  function wingman(m) {
    // The handheld receiver stands in portrait orientation with a recessed display
    // and a continuous elastomer bumper. The photograph shows no front keys.
    m.plate(0,0,-.074,2.19,3.18,.23,"#262b2c",.168,"front",.018);
    m.plate(0,0,.052,2.14,3.11,.047,"#293131",.145,"front",.022);
    m.plate(0,0,.078,1.89,2.83,.012,"#181d1e",.066);
    m.decal(0,0,.086,1.79,2.72,"@photo-screen","#26343a","front","screen");
    m.plate(0,0,-.195,1.96,2.94,.027,"#333a3a",.124,"back",.018);
    for(const x of [-.83,.83])for(const y of [-1.32,1.32])m.screw(x,y,-.210,"back",.022);
  }

  window.drawCatalogPanel = (mesh, profile) => {
    if (profile.brand === "TANA") wingman(mesh);
    else if (profile.model === "IC70C") cabinet70(mesh);
    else handheldMetso(mesh);
  };
})();
