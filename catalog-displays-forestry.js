// Original illustrative cab readouts. Coordinates follow each LCD's native aspect.
(() => {
  const W = 500;
  const family = '"Segoe UI", Arial, sans-serif';

  function box(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  }

  function type(c, text, x, y, size, color, weight = 600, align = "left") {
    c.font = weight + " " + size + "px " + family;
    c.textAlign = align;
    c.textBaseline = "alphabetic";
    c.fillStyle = color;
    c.fillText(text, x, y);
  }

  function line(c, points, color, thickness = 2, close = false) {
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    if (close) c.closePath();
    c.strokeStyle = color;
    c.lineWidth = thickness;
    c.stroke();
  }

  function polygon(c, points, color) {
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }

  function ring(c, x, y, radius, color, thickness, start = 0, end = Math.PI * 2) {
    c.beginPath();
    c.arc(x, y, radius, start, end);
    c.strokeStyle = color;
    c.lineWidth = thickness;
    c.stroke();
  }

  function pine(c, x, y, size, ink) {
    const silhouette = [[0,-1],[.48,-.31],[.24,-.31],[.63,.24],[.16,.24],[.16,.54],[-.16,.54],[-.16,.24],[-.63,.24],[-.24,-.31],[-.48,-.31]];
    polygon(c, silhouette.map(([a,b]) => [x+a*size,y+b*size]), ink);
  }

  function ruler(c, x, y, width, intervals, ink, height) {
    box(c, x, y, width, 2, ink);
    for (let i=0; i<=intervals; i++)
      box(c, x + width * i / intervals - 1, y + 2, 2, i % 5 === 0 ? height : height * .48, ink);
  }

  function maxiXT(c) {
    const red = "#9c2c48", gold = "#ffc95b", paper = "#ebedeb";
    box(c, 0, 0, W, 380, "#1c2028");
    box(c, 0, 0, W, 30, "#15171c");
    type(c, "MaxiXT", 12, 21, 17, paper, 700);
    type(c, "Заготовка", 93, 21, 14, "#b3b7c1");
    type(c, "20 °C    14:07", 487, 21, 13, "#c8cad2", 600, "right");

    // The operator reads measured length and diameter while the center holds the cut prescription.
    const readings = [[7, "ДЛИНА · СМ", "64,5"], [338, "ДИАМЕТР · ММ", "432"]];
    for (const [x, label, value] of readings) {
      box(c, x, 39, 155, 115, "#282c3a");
      box(c, x, 39, 155, 3, "#555462");
      type(c, label, x + 8, 61, 13, "#bcc0ca");
      type(c, value, x + 76, 125, 53, gold, 700, "center");
    }
    const job = [[40, "ПОРОДА", "Сосна"], [91, "СОРТИМЕНТ", "3 / Karm"], [142, "ЗАДАНО · СМ", "50,0"]];
    for (const [y, label, value] of job) {
      box(c, 171, y, 158, 47, red);
      box(c, 171, y, 4, 47, "#c75d6d");
      type(c, label, 185, y + 15, 11, "#f5c2c9", 700);
      type(c, value, 250, y + 38, 22, "#fff3ed", 600, "center");
    }
    type(c, "ПЛАН РАСКРОЯ", 13, 216, 12, "#bebdc6", 700);
    const lengths = [70, 88, 88, 80, 90, 60];
    let x = 14;
    lengths.forEach((width, i) => {
      const color = i < 4 ? "#a94358" : "#c5a345";
      polygon(c, [[x+3,229],[x+width-2,229],[x+width-8,258],[x,258]], color);
      type(c, ["405","375","345","345","433","—"][i], x + width*.5, 250, 15, "#fff4db", 700, "center");
      x += width;
    });
    polygon(c, [[25,221],[35,221],[30,228]], "#faf1df");

    box(c, 8, 272, 484, 55, "#292d38");
    const totals = [["ОБЪЁМ, М³","0,00"],["СТВОЛЫ","0"],["СРЕДНИЙ Ø","0"]];
    totals.forEach(([label, value], i) => {
      const tx = 134 + i*119;
      box(c, tx-11, 280, 1, 39, "#434751");
      type(c, label, tx, 291, 10, "#babdc5");
      type(c, value, tx, 315, 21, paper);
    });
    ring(c, 32, 300, 11, "#cdb57c", 2);
    line(c, [[16,300],[26,300],[31,294],[36,305],[45,300]], "#cdb57c", 2);
    ring(c, 74, 300, 14, "#cdb57c", 2);
    line(c, [[67,307],[75,298],[84,295]], "#e1c684", 2);
    box(c, 0, 335, W, 45, "#14181d");
    // Machine indicators: rotation, brake, feed rollers, articulated head and oil.
    ring(c, 24, 357, 8, "#d3b879", 2, -.8, 4.7);
    polygon(c, [[28,347],[34,348],[31,354]], "#d3b879");
    ring(c, 76, 357, 7, "#cc8979", 2);
    ring(c, 76, 357, 12, "#cc8979", 2, 1.95, 4.34);
    ring(c, 76, 357, 12, "#cc8979", 2, -.99, 1.10);
    for (const x of [122,132]) for (const y of [353,362]) ring(c, x,y,3,"#8fbdad",2);
    line(c, [[172,365],[176,355],[182,349],[190,352],[191,362]], "#9cbab3", 2.5);
    ring(c, 181, 359, 4, "#9cbab3", 2);
    line(c, [[224,363],[224,352],[235,352],[237,357],[242,357],[239,363],[224,363]], "#91ad96", 2);
    for (let i=0; i<4; i++) box(c, 267+i*5, 364-i*3, 3, 4+i*3, "#819a86");
    type(c, "1600", 434, 364, 22, gold, 700, "right");
    type(c, "об/мин", 485, 362, 13, "#c6c8c0", 600, "right");
  }

  function timberMatic(c) {
    const dark = "#063e30", green = "#0e5842", paper = "#f4f4eb", ink = "#161d1a";
    box(c, 0, 0, W, 302, dark);
    box(c, 0, 0, W, 27, green);
    type(c, "TimberMatic", 10, 19, 16, "#fcfbe7", 700);
    type(c, "10:46", 485, 19, 14, "#e1e9d8", 600, "right");
    const keys = ["I", "II", "III", "IV"];
    keys.forEach((name, i) => {
      const x = 7 + i*96;
      box(c, x, 33, 91, 39, i===1 ? "#83c548" : "#67ad41");
      box(c, x+1, 33, 89, 2, "#acd872");
      type(c, name, x+45, 59, 15, "#356425", 700, "center");
    });
    box(c, 7, 78, 380, 191, paper);
    type(c, "ДИАМЕТР", 19, 104, 13, "#56665b");
    type(c, "ДЛИНА", 369, 104, 13, "#56665b", 600, "right");
    box(c, 135, 122, 102, 99, "#e4e6de");
    box(c, 139, 126, 94, 91, "#f9faf3");
    type(c, "СОРТИМЕНТ", 186, 152, 10, "#69756d", 700, "center");
    type(c, "NONE", 186, 186, 23, "#465149", 600, "center");
    type(c, "25", 69, 196, 66, ink, 700, "center");
    type(c, "см", 69, 219, 14, "#47584a", 600, "center");
    type(c, "692", 311, 196, 63, ink, 700, "center");
    type(c, "см", 310, 219, 14, "#47584a", 600, "center");
    line(c, [[17,249],[370,249]], "#cbd2c8");
    ruler(c, 20, 248, 94, 15, "#6a8769", 7);
    type(c, "Измерение", 367, 263, 10, "#5b685c", 600, "right");

    type(c, "МАШИНА", 445, 55, 12, "#dce9be", 700, "center");
    const telemetry = [["900","rpm"],["47","°C"],["28,4","V"],["42","%"],["46","%"],["45","%"]];
    telemetry.forEach(([value, unit], i) => {
      const tx = 394+(i%2)*51, ty = 80+Math.floor(i/2)*61;
      box(c, tx, ty, 47, 55, i%2 ? "#164e3e" : "#104938");
      type(c, value, tx+23, ty+26, 19, "#f2f4dc", 700, "center");
      type(c, unit, tx+31, ty+44, 10, "#cbdbcb", 600, "center");
      const ox=tx+12, oy=ty+39, ink="#c7d794";
      if (i===0) {
        ring(c, ox,oy,5,ink,1.5,-3.5,.4);
        line(c,[[ox,oy],[ox+3,oy-4]],ink,1.4);
      } else if (i===1) {
        line(c,[[ox,oy+1],[ox,oy-5]],ink,2);
        ring(c,ox,oy+3,2.4,ink,1.4);
      } else if (i===2) {
        line(c,[[ox-5,oy-3],[ox+5,oy-3],[ox+5,oy+4],[ox-5,oy+4]],ink,1.4,true);
        box(c,ox-3,oy-5,2,2,ink); box(c,ox+2,oy-5,2,2,ink);
      } else if (i===3) {
        line(c,[[ox-4,oy+5],[ox-4,oy-4],[ox+2,oy-4],[ox+2,oy+5]],ink,1.4);
        line(c,[[ox+3,oy-2],[ox+5,oy],[ox+5,oy+3]],ink,1.4);
      } else {
        for(let j=0;j<3;j++) box(c,ox-5+j*3,oy+1-j*2,2,3+j*2,ink);
      }
    });
    box(c, 0, 276, W, 26, "#0b4e3b");
    ring(c, 16, 289, 4, "#d8d85c", 2);
    type(c, "H-16", 28, 294, 12, "#e1ead5", 700);
    type(c, "11 °C", 481, 294, 12, "#d1e4ce", 600, "right");
  }

  function timberRite(c) {
    const dark = "#075040", lime = "#92c83c", light = "#f1f3eb";
    box(c, 0, 0, W, 305, dark);
    box(c, 0, 0, W, 26, "#11653e");
    type(c, "TimberRite", 11, 19, 16, light, 700);
    type(c, "H-16    9:24", 486, 18, 13, "#e0e9c9", 600, "right");
    for (let i=0; i<4; i++) {
      const x=8+i*98;
      box(c, x, 31, 93, 47, i===2 ? "#9dd044" : lime);
      box(c, x+2, 32, 89, 2, "#b3df76");
      for(let j=0; j<=i; j++) box(c, x+12+j*4, 62-j*2, 2, 4+j*2, "#649631");
    }

    box(c, 7, 85, 390, 185, "#34343f");
    type(c, "ИЗМЕРЕНИЕ", 17, 106, 11, "#b3b9c3", 700);
    type(c, "—", 41, 167, 28, "#d4d7d4", 600, "center");
    type(c, "—", 41, 203, 19, "#a9afad", 600, "center");
    box(c, 77, 117, 153, 113, "#78838e");
    box(c, 81, 120, 145, 106, "#9ca7ae");
    type(c, "FIR", 154, 151, 28, "#313e47", 700, "center");
    pine(c, 155, 183, 15, "#687e7c");
    type(c, "ПОРОДА", 154, 214, 11, "#374451", 600, "center");

    const gx=314, gy=177;
    ring(c, gx, gy, 59, "#757982", 4, Math.PI*.66, Math.PI*2.35);
    for(let i=0;i<7;i++) {
      const angle=Math.PI*(.73+i*.26);
      line(c, [[gx+54*Math.cos(angle),gy+54*Math.sin(angle)],
        [gx+59*Math.cos(angle),gy+59*Math.sin(angle)]], "#979da3", 1.7);
    }
    type(c, "38.5″", gx, gy+7, 39, "#f5f4ed", 700, "center");
    type(c, "37.5″", gx, gy+34, 18, "#c8cdd0", 600, "center");
    type(c, "ДЛИНА", gx, 254, 11, "#c4c9c8", 600, "center");
    const panelX=407;
    box(c,panelX,32,85,42,"#146849");
    pine(c,panelX+43,57,14,"#d1d681");
    for(let row=0;row<3;row++) for(let col=0;col<2;col++) {
      const x=panelX+col*44, y=86+row*55;
      box(c,x,y,40,49,"#0b5b4a");
      if(row===2 && col===1) {
        ring(c,x+21,y+25,6,"#d5d784",2);
        line(c,[[x+21,y+16],[x+21,y+22]],"#d5d784",2);
      }
    }
    box(c,0,277,W,28,"#0b654c");
    type(c,"Головка",11,297,13,"#e1ead1",700);
    type(c,"TimberRite",484,296,12,"#c0d8c6",600,"right");
  }

  function opti(c) {
    const amber = "#ffcf3d", white = "#edf1ea", muted = "#bac4c3";
    box(c, 0, 0, W, 284, "#13191b");
    box(c, 0, 0, W, 41, "#252c30");
    type(c, "Opti 5G", 17, 29, 22, white, 700);
    pine(c, 418, 23, 12, amber);
    type(c, "Ель", 441, 28, 18, white);
    type(c, "ДЛИНА", 18, 78, 16, muted);
    type(c, "431", 12, 151, 87, white, 700);
    type(c, "см", 166, 147, 26, amber);
    box(c, 239, 62, 2, 96, "#485053");
    type(c, "ДИАМЕТР", 266, 78, 16, muted);
    type(c, "152", 260, 145, 71, white, 600);
    type(c, "мм", 397, 143, 25, amber);
    box(c, 0, 177, W, 107, "#20282b");
    type(c, "СОРТИМЕНТ", 18, 199, 13, muted, 700);
    type(c, "ДЛИНА, СМ", 222, 199, 13, muted, 700);
    type(c, "ДИАМЕТР, ММ", 365, 199, 13, muted, 700);
    box(c,12,206,476,35,"#243952");
    box(c,12,206,4,35,"#709ee5");
    for (const [y,name,length,diameter] of [[231,"Пиловочник","430","152"],[266,"Баланс","340","106"]]) {
      type(c,name,24,y,20,white);
      type(c,length,258,y,23,white,650,"center");
      type(c,diameter,407,y,23,white,650,"center");
    }
  }

  function herman(c) {
    const ink = "#222723", muted = "#4e5950";
    box(c,0,0,W,375,"#f5f5ee");
    box(c,0,0,W,45,"#e0e4db");
    type(c,"ИЗМЕРЕНИЕ СТВОЛА",17,31,21,ink,700);
    type(c,"12:33",481,31,21,muted,600,"right");
    type(c,"ДЛИНА, СМ",18,90,20,muted);
    type(c,"ДИАМЕТР, ММ",271,90,20,muted);
    box(c,247,62,2,135,"#abb2a9");
    type(c,"416",14,181,89,ink,700);
    type(c,"284",266,181,89,ink,700);
    box(c,14,209,472,2,"#a1a99e");
    pine(c,35,245,18,"#557249");
    type(c,"Сосна",57,256,26,ink);
    type(c,"Пиловочник",482,256,25,ink,600,"right");
    box(c,0,278,W,97,"#e7eae1");
    type(c,"ДЛИНА РЕЗА",18,307,16,muted);
    type(c,"КОЛИЧЕСТВО",269,307,16,muted);
    type(c,"3,20 м",16,350,34,ink,700);
    type(c,"1 шт.",266,350,34,ink,700);
  }

  const panels = {
    "MaxiXT": [380, maxiXT],
    "TimberMatic H-16": [302, timberMatic],
    "TimberRite H-16": [305, timberRite],
    "Opti 8X": [284, opti],
    "2040 · 4W Herman": [375, herman],
  };
  window.drawForestryDisplay = (ctx, profile, width, height) => {
    const panel = panels[profile?.model];
    if (!panel) return false;
    ctx.save();
    ctx.scale(width/W,height/panel[0]);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    panel[1](ctx);
    ctx.restore();
    return true;
  };
})();
