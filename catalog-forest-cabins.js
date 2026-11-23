// Cab terminals with their working screens, and the two separate fanless/onboard PCs.
(() => {
  const black = "#1e1f21", rim = "#292a2b", cast = "#45474a", steel = "#989c9d";

  function face(m, x, y, z, w, h, region, material = "matte") {
    m.decal(x, y, z, w, h, "@photo-screen", black, "front", material, region);
  }

  function lcd(m, x, y, z, w, h) {
    m.decal(x, y, z, w, h, "@display", "#202726", "front", "lcd");
  }

  // An open mounting hole through a rectangular bent-sheet ear, visible from both sides.
  function ear(m, x, y, z, w, h, thickness, radius, side, color) {
    const corners = [], bore = [];
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8;
      const dx = Math.cos(a), dy = Math.sin(a);
      const edge = Math.min(w * .5 / Math.abs(dx), h * .5 / Math.abs(dy));
      corners.push([dx * edge, dy * edge]);
      bore.push([dx * radius, dy * radius]);
    }
    for (let i = 0; i < bore.length; i++) {
      const next = (i + 1) % bore.length;
      m.solid(x, y, z, thickness, [bore[i], corners[i], corners[next], bore[next]], color, side);
    }
  }

  function rearPlug(m, x, y, z, r, capped) {
    m.disc(x, y, z, r, .033, steel, "back", 8);
    m.disc(x, y, z - .023, r * .78, .021, capped ? "#525459" : "#c2c1b6", "back", 12);
    if (capped) {
      m.mark(x, y, z - .036, r * .83, r * .16, black, "back");
    } else {
      m.disc(x, y, z - .036, r * .54, .006, black, "back", 12);
      for (const [u, v] of [[-.19, -.10], [.19, -.10], [0, .20]])
        m.mark(x + r * u, y + r * v, z - .041, r * .15, r * .15, "#b8aa87", "back");
    }
  }

  function rearPanel(m, w, h, back, fan) {
    const heatY = h * .145;
    m.plate(0, heatY, back - .027, w * .92, h * .65, .054, rim, .075, "back");
    for (let i = 0; i < 23; i++) {
      const x = w * ((i / 22) - .5) * .85;
      const nearFan = fan && x < -w * .22;
      const finHeight = h * (nearFan ? .22 : .56);
      const finY = heatY + (nearFan ? h * .18 : 0);
      m.plate(x, finY, back - .083, .034, finHeight, .082, cast, .014, "back", .17);
    }
    if (fan) {
      const fx = -w * .32, fy = heatY - h * .10, radius = h * .12;
      m.plate(fx, fy, back - .076, radius * 2.25, radius * 2.25, .048, "#7b7f81", .027, "back");
      m.disc(fx, fy, back - .104, radius, .012, black, "back", 24);
      for (let i = -3; i <= 3; i++) {
        const dy = i * radius / 4;
        m.plate(fx, fy + dy, back - .116, Math.sqrt(radius * radius - dy * dy) * 1.91,
          .012, .012, "#9d9f9e", .005, "back");
      }
    }
    for (let row = 0; row < 2; row++) {
      const n = row === 0 ? 8 : 7;
      for (let i = 0; i < n; i++)
        rearPlug(m, w * (i / (n - 1) - .5) * (row === 0 ? .79 : .71),
          h * (-.29 - .103 * row), back - .008, h * .037, i >= (fan ? 6 : 5));
    }
    for (const x of [-.22, .22])
      for (const y of [-.09, .27]) {
        m.disc(x * w, y * h, back - .124, .039, .017, rim, "back");
        m.disc(x * w, y * h, back - .138, .018, .003, black, "back", 12);
      }
  }

  function plainRear(m, w, h, back, style) {
    m.plate(0, .015, back - .023, w * .87, h * .84, .047, cast, .085, "back");
    for (const x of [-1, 1]) for (const y of [-1, 1]) {
      m.screw(x * w * .391, y * h * .341, back - .047, "back", .023);
      m.disc(x * .35, y * .34, back - .054, .038, .016, black, "back", 14);
    }
    if (style === "xl5") {
      for (let i = 0; i < 3; i++) {
        const x = -.48 + i * .30;
        m.socket(x, -h * .421, back - .007, .19, .092, "bottom", steel, 0, 0);
        m.mark(x, -h * .433, back + .004, .14, .016, "#356082", "bottom");
      }
    }
    if (style === "opti8") {
      m.plate(0, -h * .20, back - .058, w * .56, h * .23, .052, black, .044, "back");
      for (const x of [-.42, 0, .42]) rearPlug(m, x, -h * .21, back - .094, .066, false);
    }
  }

  function controlColumn(m, x, h, z) {
    const buttonW = .122;
    m.plate(x, h * .315, z, buttonW, .14, .031, black, .034);
    m.disc(x, h * .315, z + .018, .036, .005, "#646967", "front", 14);
    m.disc(x, h * .315, z + .023, .026, .004, black, "front", 14);
    m.mark(x, h * .332, z + .027, .011, .04, "#959b96");
    for (let i = 0; i < 5; i++)
      m.mark(x, h * .045 - i * .029, z + .008, .089, .009, black);
    for (const sign of [-1, 1]) {
      const y = h * -.275 + sign * .081;
      m.plate(x, y, z, buttonW, .137, .031, black, .021);
      m.mark(x, y, z + .018, .041, .009, steel);
      if (sign > 0) m.mark(x, y, z + .019, .009, .04, steel);
    }
  }

  function contactStrip(m, x, h, z) {
    for (let i = 0; i < 3; i++) {
      const y = h * (.265 - .082 * i);
      m.plate(x, y, z, .097, h * .071, .032, "#343538", .018);
      m.disc(x, y, z + .018, .022, .004, i ? "#a4a8a6" : steel, "front", 12);
      m.disc(x, y, z + .021, .015, .003, black, "front", 12);
    }
    for (let i = 0; i < 3; i++) m.mark(x, h * .40 - i * .020, z + .004, .075, .010, black);
    m.disc(x, -h * .296, z + .002, .013, .008, "#7d98af", "front", 12);
    m.disc(x, -h * .363, z + .002, .013, .008, "#b2be71", "front", 12);
  }

  function terminal(m, style) {
    const specs = {
      deere:   [3.12, 2.00, .30, .11],
      timber:  [3.05, 2.00, .31, .12],
      maxixt:  [2.78, 2.18, .16, .048],
      xl4:     [3.00, 2.30, .34, .18],
      xl5:     [3.04, 1.99, .28, .10],
      opti8:   [3.12, 1.92, .21, .075],
    };
    const [w, h, d, radius] = specs[style];
    const back = -d;
    m.plate(0, 0, -d * .55, w * .979, h * .978, d * .9, cast, radius, "back", .028);
    m.plate(0, 0, -.048, w, h, .096, style === "maxixt" ? steel : rim, radius, "front", .009);
    m.plate(0, 0, .013, w - .059, h - .059, .027, black, radius * .85);
    const front = .030;
    if (style === "xl5") {
      // Power/brightness are printed on a physical strip to the left of the LCD.
      const fw = w * .935, fh = h * .925;
      face(m, -fw * .46, 0, front, fw * .08, fh, undefined, "label");
      lcd(m, fw * .047, 0, front, fw * .81, fh * .805);
      plainRear(m, w, h, back, style);
    } else if (style === "opti8") {
      // Only the small manufacturer's badge is on the physical lower bezel.
      const fw = w * .952, fh = h * .925;
      face(m, -fw * .006, -fh * .461, front, fw * .109, fh * .059, undefined, "label");
      lcd(m, 0, fh * .023, front, fw * .915, fh * .834);
      plainRear(m, w, h, back, style);
    } else if (style === "xl4") {
      m.plate(.006, 0, front, w * .813, h * .806, .018, "#555554", .041);
      lcd(m, .006, 0, front + .011, w * .795, h * .778);
      contactStrip(m, -w * .435, h, front + .001);
      rearPanel(m, w, h, back, true);
    } else if (style === "maxixt") {
      lcd(m, 0, .006, front, w * .935, h * .926);
      plainRear(m, w, h, back, style);
      // The factory photograph shows the small swivel foot beneath the monitor.
      m.plate(0, -h * .34, back - .095, .55, .51, .16, cast, .052, "back");
      m.disc(0, -h * .52, back - .10, .145, .43, black, "top", 20);
      m.disc(0, -h * .62, back - .10, .17, .082, rim, "top", 20);
      m.plate(0, -h * .653, back - .10, .47, .39, .061, rim, .081, "top");
    } else {
      const sw = w * .772, sh = h * .748, sx = -w * .032;
      m.plate(sx, 0, front, sw + .052, sh + .058, .018, "#4a4b49", .026);
      lcd(m, sx, 0, front + .011, sw, sh);
      controlColumn(m, w * .422, h, front);
      rearPanel(m, w, h, back, false);
    }
  }

  function optiComputer(m) {
    const w = 3.12, h = 1.34, d = 1.35, z = d / 2;
    const grey = "#767f86";
    m.plate(0, 0, 0, w, h, d, grey, .027);
    // The front plate is photographed orthogonally. Project its raised optical bay
    // and connector shells onto their own cap surfaces, with real side walls.
    const scaleY = 320 / 360;
    face(m, 0, 0, z + .003, w * .998, h * .998, [0, 0, 1, scaleY], "label");
    function raised(u, v, uw, vh, depth, color, radius) {
      const x = w * (u + uw * .5 - .5), y = h * (.5 - v - vh * .5);
      m.plate(x, y, z + depth * .5, w * uw, h * vh, depth, color, radius);
      face(m, x, y, z + depth + .002, w * uw * .985, h * vh * .981,
        [u, v * scaleY, uw, vh * scaleY], "label");
    }
    raised(.416, .149, .56, .561, .082, black, .033);
    raised(.057, .164, .312, .201, .035, steel, .015);
    raised(.026, .655, .064, .35, .162, "#a9a9a3", .03);
    raised(.126, .677, .064, .36, .17, "#9d9e9a", .03);
    raised(.461, .751, .183, .324, .175, "#b4b1a8", .037);
    raised(.330, .749, .047, .147, .055, black, .01);
    for (const x of [w * .345, w * .389]) {
      m.disc(x, -h * .296, z + .038, .039, .076, steel, "front", 12);
      m.disc(x, -h * .296, z + .079, .023, .011, black, "front", 12);
    }
    // Steel flanges are bent from the case: a projecting front foot and rear hanger tabs.
    const footY = -h * .5 - .026, footZ = z + .123;
    m.plate(0, footY, footZ, w * .75, .36, .045, grey, .018, "top");
    for (const side of [-1, 1]) {
      ear(m, side * w * .43, footY, footZ, w * .117, .36, .045, .045, "top", grey);
      const x = side * w * .31;
      ear(m, x, h * .5 + .128, -z + .024, .34, .256, .046, .044, "front", grey);
      m.screw(side * w * .434, h * .38, -z - .006, "back", .029);
      m.screw(side * w * .434, -h * .38, -z - .006, "back", .029);
    }
    for (const x of [-.28, .16]) m.plate(-w * .44, h * .5 + .012, x, .125, .119, .035, black, .015, "top");
  }

  function maxiComputer(m) {
    const w = 3.18, h = .855, d = 1.51, z = d * .5;
    m.plate(0, 0, 0, w, h, d, "#363737", .025);
    face(m, 0, 0, z + .003, w * .994, h * .978, undefined, "label");
    const silver = "#b4b4af";
    // Extruded heat sink: full-depth channels along the upper face, silver saw-cut ends.
    m.plate(0, h * .5 + .018, 0, w * .999, d - .015, .044, silver, .007, "top");
    for (let i = 0; i < 20; i++) {
      const x = w * (i / 19 - .5) * .93;
      m.plate(x, h * .5 + .108, -.004, .049, d * .989, .145, silver, .006, "top", .06);
    }
    // Raised D-sub shells, PS/2, USB and Ethernet retain the colours, legends and pins
    // visible on this model's actual I/O plate.
    const projectedPort = (x, y, pw, ph, depth, color, radius) => {
      const u = (x - 22) / 535, v = (y - 131) / 141;
      const uw = pw / 535, vh = ph / 141;
      const cx = w * (u - .5), cy = h * (.5 - v);
      m.plate(cx, cy, z + depth / 2, w * uw, h * vh, depth, color, radius);
      face(m, cx, cy, z + depth + .002, w * uw * .99, h * vh * .99,
        [u - uw / 2, v - vh / 2, uw, vh], "label");
    };
    for (const x of [80, 227, 317]) for (const y of (x === 80 ? [175, 229] : [166, 212]))
      projectedPort(x, y, x === 80 ? 67 : 45, 24, .061, steel, .039);
    for (const y of [172, 212]) projectedPort(166, y, 24, 23, .035, "#757577", .058);
    for (const x of [391, 448]) {
      projectedPort(x, 169, 31, 25, .03, steel, .01);
      for (const y of [198, 218, 253]) projectedPort(x, y, 31, 15, .034, steel, .009);
    }
    projectedPort(172, 255, 43, 21, .066, "#d4cbb1", .013);
    for (const side of [-1, 1]) {
      for (const y of [-.31, .31])
        m.screw(side * (w * .5 + .005), y, -.51, side > 0 ? "right" : "left", .026);
      for (const depth of [-.54, .52])
        m.plate(side * w * .44, -h * .5 - .025, depth, .18, .22, .05, black, .025, "bottom");
      for (const y of [-.31, .31]) m.screw(side * w * .46, y, -z - .004, "back", .027);
    }
  }

  window.drawForestCabin = (m, profile) => {
    if (profile.model.startsWith("Opti+")) return optiComputer(m);
    if (profile.model === "MaxiPC X20") return maxiComputer(m);
    const style = {
      "TimberMatic H-16": "deere", "Opti 8X": "opti8", "MaxiXT": "maxixt",
      "TimberRite H-16": "timber", "HPC21 (XL5)": "xl5", "XL4 · TimberRite": "xl4",
    }[profile.model];
    terminal(m, style);
  };
})();
