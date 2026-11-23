/* Illustrative housings for the interactive catalog. Dimensions are drawing units. */
(() => {
  const paint = {
    case: "#52616b",
    lightCase: "#88959c",
    dark: "#2e3b46",
    side: "#40505a",
    rubber: "#24303a",
    black: "#172229",
    metal: "#b7c2c6",
    steel: "#687983",
    screen: "#214351",
    readout: "#9bc5bd",
    faint: "#4b717a",
    accent: "#d99448",
    pin: "#bcaa84",
    ceramic: "#d3d9d4",
  };

  // Quarter-round tool radii give the moulded fronts a curved silhouette even at grazing angles.
  function rounded(w, h, cut) {
    const x = w / 2,
      y = h / 2;
    const r = Math.max(0.001, Math.min(cut, x * 0.87, y * 0.87));
    const steps = r > 0.075 ? 5 : r > 0.028 ? 3 : 2;
    const outline = [];
    for (let corner = 0; corner < 4; corner++) {
      const cx = corner === 0 || corner === 1 ? x - r : -x + r;
      const cy = corner === 1 || corner === 2 ? y - r : -y + r;
      for (let j = 0; j <= steps; j++) {
        const a = ((-1 + corner + j / steps) * Math.PI) / 2;
        outline.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
    return outline;
  }

  const materialFor = new Map([
    [paint.case, "plastic"],
    [paint.lightCase, "cast"],
    [paint.dark, "plastic"],
    [paint.rubber, "rubber"],
    [paint.black, "rubber"],
    [paint.metal, "metal"],
    [paint.steel, "metal"],
    [paint.pin, "pin"],
    [paint.screen, "screen"],
    [paint.readout, "led"],
    [paint.ceramic, "label"],
    ["#a9aeae", "steel"], ["#ada17e", "cast"], ["#a69b7a", "metal"],
    ["#9f9784", "metal"], ["#b9b7aa", "metal"],
    ["#827c79", "cast"],
    ["#777673", "cast"],
    ["#7d8587", "metal"],
    ["#292a2b", "matte"], ["#2e2f30", "matte"], ["#1e1f21", "matte"],
    ["#111214", "matte"], ["#282a2b", "matte"],
  ]);

  function buildMesh(draw, profile) {
    const faces = [];
    const brand = profile?.brand || "";
    const model = profile?.model || (typeof profile === "string" ? profile : "");
    // Extrusions are drawn toward the viewer (+Z), or out of a side of the housing.
    function points(path, cx, cy, cz, depth, side) {
      return path.map(([u, v]) => {
        if (side === "back") return [cx - u, cy + v, cz - depth];
        if (side === "bottom") return [cx + u, cy - depth, cz + v];
        if (side === "top") return [cx + u, cy + depth, cz - v];
        if (side === "left") return [cx - depth, cy + v, cz + u];
        if (side === "right") return [cx + depth, cy + v, cz - u];
        return [cx + u, cy + v, cz + depth];
      });
    }
    function solid(x, y, z, depth, outline, color, side = "front", bevel = 0) {
      const bottom = points(outline, x, y, z, -depth / 2, side);
      const cap = points(
        outline.map(([u, v]) => [u * (1 - bevel), v * (1 - bevel)]),
        x,
        y,
        z,
        depth / 2,
        side,
      );
      faces.push({ points: bottom.slice().reverse(), color });
      function join(start, end) {
        start.forEach((v, i) => {
          const j = (i + 1) % start.length;
          faces.push({ points: [v, start[j], end[j], end[i]], color });
        });
      }
      if (bevel) {
        const shoulder = points(outline, x, y, z, depth * 0.28, side);
        join(bottom, shoulder);
        join(shoulder, cap);
      } else join(bottom, cap);
      faces.push({ points: cap, color });
    }
    // Both halves of a casting meet along the same edge. Drawing their common
    // perimeter as one skin avoids overlapping side walls at the parting line.
    function casting(outline, sections) {
      let previous;
      sections.forEach(([z, scale, color], index) => {
        const ring = outline.map(([x, y]) => [x * scale, y * scale, z]);
        if (previous) {
          for (let i = 0; i < ring.length; i++) {
            const j = (i + 1) % ring.length;
            faces.push({ points: [previous[i], previous[j], ring[j], ring[i]], color });
          }
        } else faces.push({ points: ring.slice().reverse(), color });
        if (index === sections.length - 1) faces.push({ points: ring, color });
        previous = ring;
      });
    }
    function plate(x, y, z, w, h, d, col, cut = 0.06, side = "front", bevel = 0) {
      solid(x, y, z, d, rounded(w, h, cut), col, side, bevel);
    }
    function mark(x, y, z, w, h, col, side = "front") {
      const corners = [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ];
      faces.push({ points: points(corners, x, y, z, 0, side), color: col });
    }
    function disc(x, y, z, r, d, col, side = "front", edges = 8) {
      const ring = Array.from({ length: edges }, (_, i) => {
        const a = (i / edges) * Math.PI * 2;
        return [Math.cos(a) * r, Math.sin(a) * r];
      });
      solid(x, y, z, d, ring, col, side);
    }
    function screw(x, y, z, side = "front", r = 0.044) {
      const offset = (depth) => points([[0, 0]], x, y, z, depth, side)[0];
      disc(x, y, z, r * 1.27, 0.01, paint.dark, side, 12);
      disc(...offset(0.006), r, 0.014, paint.steel, side, 12);
      const face = offset(0.014);
      mark(...face, r * 1.18, r * 0.27, paint.black, side);
      mark(...face, r * 0.27, r * 1.18, paint.black, side);
    }
    // A socket has a deep shadowed well, an insulating wall, a keyed lip and individual contacts.
    function socket(x, y, z, w, h, side = "front", shell = paint.dark, cols = 6, rows = 2, keyed = false) {
      const cast = (poly, depth) => points(poly, x, y, z, depth, side);
      const outer = rounded(w, h, Math.min(w, h) * 0.19);
      const depth = Math.min(w, h) * 0.31;
      const low = cast(outer, -0.015),
        lip = cast(outer, depth);
      const opening = outer.map(([u, v]) => [u * 0.83, v * 0.73]);
      const inner = cast(opening, depth),
        floor = cast(opening, 0.004);
      faces.push({ points: floor, color: paint.black, material: "rubber" });
      for (let i = 0; i < lip.length; i++) {
        const j = (i + 1) % lip.length;
        faces.push({ points: [low[i], low[j], lip[j], lip[i]], color: shell });
        faces.push({ points: [lip[i], lip[j], inner[j], inner[i]], color: shell });
        faces.push({ points: [inner[i], inner[j], floor[j], floor[i]], color: shell });
      }
      if (!cols || !rows) return;
      const pinW = (w * 0.46) / cols,
        pinH = (h * 0.14) / rows;
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
          // The middle contact row of an AMP connector is one position shorter.
          const shortRow = keyed && row === 1 && cols >= rows;
          const shortCol = keyed && col === 1 && rows > cols;
          if ((shortRow && col === cols - 1) || (shortCol && row === rows - 1)) continue;
          const u = ((col + (shortRow ? 1 : 0.5)) / cols - 0.5) * w * 0.73;
          const v = ((row + (shortCol ? 1 : 0.5)) / rows - 0.5) * h * 0.68;
          const pin = [
            [u - pinW / 2, v - pinH / 2],
            [u + pinW / 2, v - pinH / 2],
            [u + pinW / 2, v + pinH / 2],
            [u - pinW / 2, v + pinH / 2],
          ];
          faces.push({ points: cast(pin, depth * 0.53), color: paint.pin, material: "pin" });
        }
    }
    function decal(x, y, z, w, h, text, col = paint.ceramic, side = "front", material = "label", textureRegion) {
      mark(x, y, z, w, h, col, side);
      Object.assign(faces[faces.length - 1], { decal: text, material, textureRegion });
    }
    function label(x, y, z, w, side = "front") {
      decal(x, y, z, w, w * 0.47, [brand, model].filter(Boolean).join("\n"), paint.ceramic, side);
    }
    // Orient subassemblies as a unit, including socket interiors and printed faces.
    function transform(mapPoint, drawParts) {
      const start = faces.length;
      drawParts();
      const vertices = new Set(faces.slice(start).flatMap(face => face.points));
      for (const point of vertices) {
        const [x, y, z] = mapPoint(...point);
        point[0] = x;
        point[1] = y;
        point[2] = z;
      }
    }
    // A continuous cable skin shares its rings through every bend, including the end caps.
    function tube(path, radius, color, sides = 8) {
      let previous;
      path.forEach((point, index) => {
        const a = path[Math.max(0, index - 1)], b = path[Math.min(index + 1, path.length - 1)];
        const tangent = b.map((v, i) => v - a[i]);
        const length = Math.hypot(...tangent);
        const [tx, ty, tz] = tangent.map(v => v / length);
        const xy = Math.hypot(tx, ty);
        const nx = xy ? -ty / xy : 1, ny = xy ? tx / xy : 0;
        const ring = Array.from({ length: sides }, (_, j) => {
          const angle = 2 * Math.PI * j / sides;
          const c = radius * Math.cos(angle), s = radius * Math.sin(angle);
          return [point[0] + nx*c - tz*ny*s, point[1] + ny*c + tz*nx*s, point[2] + xy*s];
        });
        if (previous) {
          ring.forEach((v, j) => {
            const k = (j + 1) % sides;
            faces.push({ points: [previous[j], previous[k], ring[k]], color },
                       { points: [previous[j], ring[k], v], color });
          });
        } else faces.push({ points: ring.slice().reverse(), color });
        if (index === path.length - 1) faces.push({ points: ring, color });
        previous = ring;
      });
    }
    draw({ plate, mark, disc, screw, socket, label, solid, decal, casting, transform, tube });
    for (const face of faces) face.material ??= materialFor.get(face.color) || "plastic";
    const min = [Infinity, Infinity, Infinity],
      max = [-Infinity, -Infinity, -Infinity];
    const vertices = new Set(faces.flatMap((face) => face.points));
    for (const v of vertices)
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], v[i]);
        max[i] = Math.max(max[i], v[i]);
      }
    const scale = 3.2 / Math.max(...max.map((v, i) => v - min[i]));
    for (const v of vertices) for (let i = 0; i < 3; i++) v[i] = (v[i] - (min[i] + max[i]) / 2) * scale;
    return faces;
  }

  function cabinet(m, variant, spec) {
    const bays = spec.bays ?? (variant === "rack" ? 6 : variant === "tall" ? 1 : variant === "rail" ? 3 : 4);
    const w = spec.width ?? (bays === 1 ? 0.96 : 2.9);
    const h = spec.height ?? (bays === 1 ? 2.45 : 1.75);
    const regul = spec.brand === "РЕГЛАБ";
    // Narrow cartridges extend further behind the front panel. Keep the same
    // panel seat for the entire rack so the case never covers the controls.
    const back = bays === 1 ? -0.655 : -0.49;
    const seat = 0.33;
    m.plate(0, 0, (back + seat) / 2, w + 0.17, h + 0.08, seat - back, paint.dark, 0.045);
    // A mounting rail, visible when the assembly is turned around.
    m.plate(0, 0, back - 0.054, w + 0.24, 0.25, 0.13, paint.steel, 0.03, "back");
    for (let i = 0; i < bays; i++) {
      const width = w / bays - 0.035,
        x = -w / 2 + ((i + 0.5) * w) / bays;
      m.plate(
        x,
        0,
        0.13,
        width,
        h,
        0.57,
        regul ? "#333638" : i === 0 ? "#889193" : "#657171",
        0.035,
        "front",
        0.035,
      );
      m.decal(
        x,
        h * 0.32,
        0.417,
        width * 0.81,
        0.12,
        i === 0 ? spec.brand || "PLC" : "I/O",
        regul ? "#363b3e" : "#e6e5d9",
      );
      // A moulded extractor, narrow service window and individual cable ferrules on each bay.
      m.plate(x, h * 0.43, 0.431, width * 0.72, 0.085, 0.047, paint.dark, 0.012);
      for (let v = 0; v < 4; v++) m.mark(x, h * 0.21 - v * 0.045, 0.417, width * 0.61, 0.018, paint.black);
      if (regul && i >= 4) {
        m.plate(x, -h * 0.147, 0.415, width * 0.88, h * 0.62, 0.045, "#2c3032", 0.025, "front", 0.02);
        m.mark(x, -h * 0.431, 0.44, width * 0.49, 0.025, paint.black);
        continue;
      }
      const statusFace = regul ? 0.449 : 0.418;
      if (regul) m.plate(x, h * 0.09, 0.432, width * 0.54, 0.23, 0.03, paint.rubber, 0.022);
      m.mark(x, h * 0.09, statusFace, width * 0.48, 0.18, paint.rubber);
      for (let n = 0; n < 3; n++)
        m.mark(x + (n - 1) * width * 0.16, h * 0.09, statusFace + 0.002, 0.032, 0.055, n === 0 ? paint.readout : paint.steel);
      m.plate(x, -h * 0.23, 0.426, width * 0.8, h * 0.29, 0.065, paint.dark, 0.025);
      for (let k = 0; k < 4; k++) {
        const tx = x + (k - 1.5) * width * 0.165;
        m.mark(tx, -h * 0.31, 0.46, width * 0.095, 0.068, paint.black);
        m.mark(tx, -h * 0.31 + 0.01, 0.462, width * 0.04, 0.027, paint.pin);
      }
      if (spec.network) {
        for (const pos of [-0.105, 0.105]) m.socket(x, -h * 0.23 + pos, 0.47, width * 0.57, 0.17);
      } else {
        m.mark(x - width * 0.14, -h * 0.2, 0.46, width * 0.4, 0.031, paint.lightCase);
      }
      for (let n = 0; n < 3; n++)
        m.mark(x, h / 2 + 0.002, 0.16 - 0.09 * n, width * 0.68, 0.035, paint.black, "top");
    }
  }

  // The Epec 2000 and 3700 families share a cast shell and sealed AMP interface.
  function epecCastUnit(m, model) {
    if (model.startsWith("3724")) return epecCastHousing(m, model);
    // The Epec forestry catalogue photographs the connector face diagonally.
    const roll = model.startsWith("2021") ? .43 : .26;
    const c = Math.cos(roll), s = Math.sin(roll);
    m.transform((x,y,z) => [c*x-s*y, s*x+c*y, z], () => epecCastHousing(m, model));
  }

  function epecCastHousing(m, model) {
    const number = model.slice(0, 4);
    const legacy = number !== "3724";
    const hub = number === "2021";
    const body = [
      [-0.78, -1.23],
      [-0.38, -1.28],
      [0, -1.3],
      [0.38, -1.28],
      [0.78, -1.23],
      [0.98, -1.16],
      [1.0, -1.09],
      [1.0, 1.09],
      [0.98, 1.16],
      [0.78, 1.23],
      [0.38, 1.28],
      [0, 1.3],
      [-0.38, 1.28],
      [-0.78, 1.23],
      [-0.98, 1.16],
      [-1.0, 1.09],
      [-1.0, -1.09],
      [-0.98, -1.16],
    ];
    if (legacy) {
      m.casting(body, [
        [-.315,.986,"#727374"],[-.300,1,"#777879"],[-.14,1,"#747475"],
        [-.129,.996,"#525453"],[-.118,1,"#827c79"],[.044,.98,"#827c79"]
      ]);
      // The teeth at the mounting holes are cut into both ends of this lid.
      // Build the web and individual end sections so the slots have real depth.
      const shoulder=.962, half=.974, front=.245, base=.045;
      m.solid(0,0,(front+base)/2,front-base,
        [[-half,-shoulder],[half,-shoulder],[half,shoulder],[-half,shoulder]],"#827c79");
      const cuts=[-.80,-.71,-.62,-.35,-.26,-.17,.17,.26,.35,.62,.71,.80];
      const edges=[-half,...cuts.flatMap(x=>[x-.021,x+.021]),half];
      for (let i=0;i<edges.length-1;i++) {
        const left=edges[i], right=edges[i+1], slot=i%2===1;
        const end = x => 1.267 - .168 * Math.pow(Math.abs(x) / half, 1.8) - (slot ? .122 : 0);
        const a=end(left), b=end(right);
        m.solid(0,0,(front+base)/2,front-base,
          [[left,shoulder],[right,shoulder],[right,b],[left,a]],"#827c79");
        m.solid(0,0,(front+base)/2,front-base,
          [[left,-a],[right,-b],[right,-shoulder],[left,-shoulder]],"#827c79");
      }
    } else m.casting(body, [
      [-0.315, 0.988, paint.steel],
      [-0.303, 1, paint.steel],
      [-0.137, 1, paint.steel],
      [-0.127, 0.996, paint.steel],
      [-0.117, 1, "#827c79"],
      [0.15, 1, "#827c79"],
      [0.245, 0.94, "#827c79"],
    ]);
    // The asymmetric AMP sockets are closely spaced, with opposite polarising keys.
    m.socket(
      -0.34,
      0.66,
      0.247,
      hub ? 0.4 : 0.75,
      0.42,
      "front",
      hub ? "#302d2c" : "#15549c",
      hub ? 3 : 8,
      3,
      true,
    );
    m.socket(0.53, hub ? 0.66 : 0.43, 0.247, 0.37, hub ? 0.4 : 0.76, "front", "#302d2c", 3, hub ? 3 : 8, true);
    m.socket(-0.34, -0.67, 0.247, 0.73, 0.4, "front", "#d4cbb8", 8, 3, true);
    m.socket(0.53, -0.65, 0.247, 0.37, 0.39, "front", "#302d2c", 3, 3, true);
    if (legacy) {
      if (hub) m.socket(0.53, 0.016, 0.247, 0.37, 0.39, "front", paint.dark, 3, 3, true);
      m.decal(-.19, -.006, .249, 1.0, .51, "@photo-screen", "#827c79", "front", "cast");
    } else {
      m.plate(-0.34, 0.012, 0.245, 0.88, 0.53, 0.012, "#bebbb3", 0.07);
      m.decal(-0.44, 0.012, 0.253, 0.6, 0.44, "Epec\n" + number, "#b5b4ab");
      for (const x of [-0.08, 0.015])
        for (const y of [-0.155, -0.065]) {
          m.disc(x, y, 0.253, 0.028, 0.003, paint.dark, "front", 12);
          m.disc(x, y, 0.255, 0.02, 0.002, paint.lightCase, "front", 12);
        }
    }
    for (const sign of [-1, 1]) {
      m.disc(0, sign * 1.15, 0.236, 0.088, 0.022, paint.steel, "front", 18);
      m.disc(0, sign * 1.15, 0.248, 0.051, 0.003, paint.black, "front", 18);
      if (legacy) {
        // A second row of shallow vents is visible below the mating line.
        for (const x of [-.28,-.19,-.10,.10,.19,.28]) {
          const edge = (1.3-Math.abs(x)*(.02/.38))*sign;
          m.mark(x, edge+sign*.003, -.211, .052, .047, "#393b3b", sign>0?"top":"bottom");
        }
      } else for (let i = 0; i < 6; i++) {
        const x = (i < 3 ? -1 : 1) * (0.25 + (i % 3) * 0.1);
        m.plate(x, sign * (1.17 - 0.045 * (i % 3)), 0.251, 0.037, 0.13, 0.025, paint.steel, 0.013);
      }
    }
    m.label(0, 0, -0.317, 0.72, "back");
  }

  function epec5050(m) {
    const outline = [
      [-1.42, -0.93],
      [1.42, -0.93],
      [1.42, 0.51],
      [1.37, 0.59],
      [1.12, 0.73],
      [0.78, 0.86],
      [0.41, 0.94],
      [0, 0.965],
      [-0.41, 0.94],
      [-0.78, 0.86],
      [-1.12, 0.73],
      [-1.37, 0.59],
      [-1.42, 0.51],
    ];
    m.casting(outline, [
      [-0.275, 0.988, paint.steel],
      [-0.263, 1, paint.steel],
      [-0.083, 1, paint.steel],
      [-0.073, 0.997, paint.steel],
      [-0.063, 1, "#827c79"],
      [0.157, 1, "#827c79"],
      [0.223, 0.955, "#827c79"],
    ]);
    for (const sign of [-1, 1]) {
      for (let i = 0; i < 13; i++) {
        const x = sign * (0.08 + i * 0.093),
          foot = -0.72,
          shoulder = -0.25;
        const tip = 0.7 - Math.abs(5 - i) * 0.094;
        const lean = sign * (0.1 - i * 0.034);
        const poly = [
          [-0.023, foot],
          [0.023, foot],
          [0.023, shoulder],
          [lean + 0.018, tip],
          [lean - 0.018, tip],
          [-0.023, shoulder],
        ];
        // Keep the beveled elbow convex for both renderers.
        m.solid(x, 0, 0.269, 0.092, poly.slice(0, 3).concat([poly[5]]), "#777673");
        m.solid(x, 0, 0.269, 0.092, [poly[5], poly[2], poly[3], poly[4]], "#777673");
      }
    }
    for (let i = -1; i <= 1; i++)
      m.socket(i * 0.82, -0.94, -0.086, 0.73, 0.28, "bottom", i === 1 ? "#173d61" : paint.black, 12, 3, true);
    m.decal(0, 0.67, 0.225, 0.56, 0.23, "Epec\n5050", paint.ceramic);
    m.screw(0, 0.84, 0.225);
    for (const x of [-1.31, 1.31]) m.screw(x, -0.15, 0.225);
    m.label(0, 0, -0.279, 0.65, "back");
  }

  function tanaConsole(m) {
    const w = 3.48,
      h = 1.09;
    m.plate(0, 0, -0.12, w, h, 0.58, paint.rubber, 0.095, "front", 0.036);
    m.plate(0, 0, 0.166, w - 0.12, h - 0.1, 0.082, "#eab626", 0.045);
    // The glazed lid hinges above the panel. Its clear centre shows the backdrop.
    const hingeY = h / 2 + 0.012,
      hingeZ = 0.13;
    function lidRail(x, width, start, end, thickness, color) {
      const point = (along, across) => [-along * 0.54 - across * 0.84, along * 0.84 - across * 0.54];
      const outline = [
        point(start, -thickness / 2),
        point(end, -thickness / 2),
        point(end, thickness / 2),
        point(start, thickness / 2),
      ];
      m.solid(x, hingeY, hingeZ, width, outline, color, "right");
    }
    lidRail(0, w + 0.06, 0, 0.105, 0.07, paint.black);
    lidRail(0, w + 0.06, 0.83, 0.94, 0.06, paint.dark);
    lidRail(0, w - 0.11, 0.103, 0.119, 0.021, "#7d8587");
    lidRail(0, w - 0.11, 0.811, 0.83, 0.021, "#7d8587");
    for (const x of [-1.72, 1.72]) lidRail(x, 0.09, 0.105, 0.83, 0.06, paint.dark);
    for (const x of [-1.17, 1.17]) m.plate(x, hingeY, 0.143, 0.29, 0.097, 0.12, paint.steel, 0.029);
    lidRail(0, 0.086, 0.74, 0.915, 0.073, paint.steel);
    m.plate(0, -h * 0.417, 0.213, w - 0.14, 0.13, 0.024, paint.black, 0.008);
    m.decal(-1.45, -h * 0.418, 0.227, 0.28, 0.098, "TANA", paint.black);
    m.decal(1.38, -h * 0.418, 0.227, 0.33, 0.079, "SHARK", "#c7a746");
    // The D-series LCD sits in a separate flanged bezel behind protective glazing.
    const lcdX = -0.06, lcdY = 0.024;
    m.plate(lcdX, lcdY, 0.225, 1.08, 0.77, 0.055, "#252728", 0.09, "front", 0.018);
    m.plate(lcdX, lcdY, 0.26, 0.91, 0.62, 0.032, "#3b3e40", 0.052, "front", 0.018);
    m.plate(lcdX, lcdY + 0.012, 0.279, 0.751, 0.495, 0.01, paint.black, 0.013);
    m.decal(lcdX, lcdY + 0.012, 0.286, 0.73, 0.469, "@display", paint.screen, "front", "lcd");
    for (const x of [-0.41, 0.41])
      for (const y of [-0.257, 0.257]) m.screw(lcdX + x, lcdY + y, 0.278, "front", 0.016);
    for (const [y, positions] of [[0.22, [-1.45, -1.10, -0.78, 0.80, 1.04, 1.28, 1.51]],
      [-0.15, [-1.45, -1.10, -0.78, 0.56, 0.80, 1.04, 1.28]]]) {
      for (const x of positions) {
        m.disc(x, y, 0.228, 0.102, 0.056, paint.steel, "front", 14);
        m.disc(x, y, 0.277, 0.072, 0.064, paint.black, "front", 16);
        m.mark(x, y + 0.026, 0.31, 0.01, 0.046, paint.ceramic);
      }
    }
    for (const x of [-1.61, 1.61]) for (const y of [-0.42, 0.42]) m.screw(x, y, 0.209);
    m.label(0, 0, -0.414, 0.5, "back");
  }

  function danfossMC024(m) {
    const body = "#536663";
    // Both plug faces point forward. Two hollow mounting lugs run behind the enclosure.
    m.plate(0, 0, 0.4, 2.68, 0.78, 0.85, body, 0.12, "front", 0.04);
    m.plate(0, 0, 0.74, 2.61, 0.71, 0.22, body, 0.112, "front", 0.028);
    for (const sign of [-1, 1]) {
      const x = sign * 0.98;
      m.plate(x, 0, -0.46, 0.63, 0.7, 1.42, body, 0.063, "front", 0.025);
      m.socket(x, 0, -1.17, 0.46, 0.39, "back", body, 0, 0);
      m.disc(x, 0.355, -0.9, 0.091, 0.012, paint.rubber, "top", 16);
    }
    for (const x of [-0.6, 0.6]) m.socket(x, 0, 0.858, 0.91, 0.39, "front", body, 8, 2);
    m.label(0, -0.392, 0.46, 0.47, "bottom");
    for (const x of [-1.19, 1.19]) m.screw(x, -0.22, 0.854);
  }

  function controller(m, variant, spec) {
    const compact = variant === "compact",
      flat = variant === "flat",
      silver = variant === "cast";
    const w = spec.width ?? (compact ? 1.86 : flat ? 2.86 : 2.48);
    const h = spec.height ?? (compact ? 1.44 : flat ? 1.42 : 1.86);
    const body = silver ? paint.lightCase : paint.case;
    m.plate(0, 0, -0.2, w + 0.31, h - 0.29, 0.15, paint.steel, 0.13);
    m.plate(0, 0, -0.005, w, h, 0.52, body, 0.17, "front", 0.042);
    m.plate(0, 0, 0.273, w - 0.15, h - 0.15, 0.065, paint.dark, 0.13);
    m.plate(0, 0, 0.31, w - 0.2, h - 0.2, 0.063, body, 0.12, "front", 0.02);
    for (const x of [-1, 1])
      for (const y of [-1, 1]) {
        m.screw(x * (w / 2 - 0.21), y * (h / 2 - 0.2), 0.343);
        m.screw(x * (w / 2 - 0.12), y * (h / 2 - 0.23), -0.282, "back");
      }
    // Raised cooling fins and keyed sockets remain readable at oblique angles.
    if (spec.faceSockets) {
      // A face-connected unit presents sockets to the technician on the lid.
      for (const x of [-1, 1])
        for (const y of [-1, 1]) {
          m.socket(w * x * 0.25, h * y * 0.23, 0.392, w * 0.33, h * 0.24);
        }
      m.label(-w * 0.19, 0.01, 0.344, 0.32);
      m.mark(w * 0.22, 0.01, 0.344, 0.2, 0.044, paint.accent);
      m.label(0, 0, -0.282, 0.55, "back");
      return;
    }
    const ribCount = spec.ribs ?? (flat ? 5 : 7);
    for (let i = 0; i < ribCount; i++) {
      const rx = -w * 0.32 + i * w * 0.092;
      m.plate(rx, h * 0.18, 0.375, 0.047, h * 0.29, 0.091, body, 0.015);
    }
    m.label(-w * 0.19, -h * 0.1, 0.343, 0.48);
    m.mark(w * 0.14, -h * 0.1, 0.344, 0.2, 0.044, paint.accent);
    const count = spec.sockets ?? (compact ? 2 : silver ? 4 : 3);
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * ((w * 0.77) / count);
      if (silver) m.socket(x, -h * 0.31, 0.37, (w * 0.68) / count, 0.26);
      else m.socket(x, -h / 2, -0.007, (w * 0.67) / count, 0.33, "bottom");
    }
    m.label(0, 0, -0.282, 0.55, "back");
  }

  function display(m, variant, spec) {
    const handheld = variant === "handset",
      keypad = variant === "console",
      wide = variant === "wide";
    const w = spec.width ?? (handheld ? 1.07 : keypad ? 3.13 : wide ? 3.02 : 2.58);
    const h = spec.height ?? (handheld ? 2.65 : keypad ? 1.56 : 1.84);
    const isMetso = spec.brand === "Metso";
    const isTopcon = spec.brand === "Topcon";
    const isPcu = spec.brand === "Радиоавтоматика";
    const isMobaHandset = handheld && spec.brand === "MOBA";
    const isGrader = isTopcon || spec.brand === "MOBA" || spec.brand === "Грин-Тех";
    const pad = handheld ? 0.105 : 0.14;
    const shell = isPcu ? "#d7d4ca" : isGrader ? "#dba928" : "#333b3d";
    const bezel = isPcu ? "#c8c6ba" : "#262e2e";
    const sw = (w - pad * 2) * (isPcu ? 0.64 : isTopcon ? 0.85 : (spec.screenWidth ?? (keypad ? 0.56 : 1)));
    const sh = h * (isPcu ? 0.155 : (spec.screenHeight ?? (handheld ? 0.34 : isMetso ? 0.86 : 0.68)));
    const sx = keypad && !isPcu ? -w * 0.16 : isTopcon ? -w * 0.055 : 0,
      sy = isPcu ? h * 0.28 : handheld ? h * 0.14 : isMetso ? 0 : 0.1;
    m.plate(0, 0, -0.055, w, h, 0.47, paint.rubber, Math.min(w, h) * 0.095, "front", 0.035);
    m.plate(0, 0, 0.184, w + 0.008, h + 0.008, 0.055, paint.black, 0.105);
    m.plate(0, 0, 0.207, w - 0.028, h - 0.028, 0.094, shell, 0.102, "front", 0.024);
    if (isMobaHandset) {
      m.plate(0, h * 0.13, 0.252, w - 0.095, h * 0.694, 0.03, paint.black, 0.067);
      m.plate(0, -h * 0.334, 0.253, w - 0.097, h * 0.272, 0.03, "#9c9b95", 0.022);
      for (const x of [-w * 0.26, w * 0.26]) {
        m.disc(x, -h * 0.5, -0.05, 0.071, 0.18, paint.steel, "bottom", 14);
        m.disc(x, -h * 0.54, -0.05, 0.053, 0.025, paint.black, "bottom", 14);
      }
    }
    m.plate(sx, sy, 0.255, sw + 0.036, sh + 0.036, 0.055, bezel, 0.045);
    m.decal(sx, sy, 0.284, sw * 0.946, sh * 0.928, isPcu ? "@digits" : "@screen", paint.screen, "front", "screen");
    if (isPcu) {
      const group = (x, y, w, h, caption) => {
        m.mark(x, y, 0.256, w, h, paint.dark);
        m.mark(x, y, 0.257, w - 0.016, h - 0.016, shell);
        m.decal(x, y + h * 0.32, 0.258, w * 0.9, h * 0.19, caption, shell);
      };
      m.decal(0, h * 0.071, 0.256, w * 0.73, 0.084, "ПУЛЬТ ЦЕНТРАЛИЗОВАННОГО УПРАВЛЕНИЯ", shell);
      m.decal(0, h * 0.166, 0.256, w * 0.55, 0.054, "1       2       3       4       5       6", shell);
      for (let i = 0; i < 6; i++) {
        const x = (i - 2.5) * w * 0.15;
        group(x, -h * 0.313, w * 0.146, h * 0.251, "ГГУ " + (i + 1));
        m.disc(x, -h * 0.312, 0.26, 0.016, 0.005, paint.black, "front", 10);
        m.disc(x, -h * 0.35, 0.267, 0.102, 0.056, paint.metal, "front", 16);
        m.disc(x, -h * 0.35, 0.309, 0.077, 0.038, "#7f8064", "front", 14);
      }
      ["РЕЖИМ", "ТЕМПЕРАТУРА", "СОСТОЯНИЕ"].forEach((caption, i) => {
        const x = (i - 1) * w * 0.174;
        group(x, -h * 0.084, w * 0.165, h * 0.18, caption);
        m.disc(x, -h * 0.115, 0.264, 0.097, 0.068, "#626d57", "front", 14);
      });
    } else if (isMobaHandset) {
      const yellow = "#eeba31";
      const key = (x, y, width, height, legend) => {
        m.plate(x, y, 0.287, width, height, 0.036, yellow, 0.018, "front", 0.02);
        m.decal(x, y, 0.306, width * 0.85, height * 0.74, legend, yellow);
      };
      ["F1", "F2", "F3"].forEach((caption, i) => key((i - 1) * w * 0.23, -h * 0.12, w * 0.18, h * 0.061, caption));
      ["▲", "%", "▼", "↵"].forEach((caption, i) =>
        key(((i % 2) - 0.5) * w * 0.326, -h * (0.278 + Math.floor(i / 2) * 0.112), w * 0.269, h * 0.095, caption),
      );
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * w * 0.093;
        m.disc(x, h * (0.394 + Math.abs(i - 2) * 0.006), 0.27, 0.01, 0.005, paint.readout, "front", 10);
      }
    } else if (isTopcon) {
      for (let i = 0; i < 5; i++) {
        const x = w * 0.405,
          y = h * (0.31 - i * 0.143);
        m.disc(x, y, 0.259, 0.09, 0.029, paint.steel, "front", 14);
        m.disc(x, y, 0.275, 0.064, 0.023, "#b1aa94", "front", 14);
        m.mark(x, y, 0.289, 0.039, 0.012, paint.black);
      }
    } else if (keypad) {
      for (let row = 0; row < 2; row++)
        for (let col = 0; col < 2; col++) {
          const bx = w * 0.236 + col * 0.32,
            by = (row - 0.5) * 0.49;
          m.disc(bx, by, 0.263, 0.108, 0.038, paint.dark, "front", 14);
          m.disc(bx, by, 0.294, 0.083, 0.045, row === 0 && col === 0 ? paint.accent : paint.rubber, "front", 16);
        }
    } else if (!isMetso) {
      const buttons = spec.keys ?? (handheld ? 3 : 5);
      const pitch = w * (handheld ? 0.22 : 0.13);
      for (let i = 0; i < buttons; i++) {
        const bx = (i - (buttons - 1) / 2) * pitch;
        const by = handheld ? -h * 0.23 : -h * 0.37;
        const bw = w * (handheld ? 0.18 : 0.095),
          bh = h * (handheld ? 0.09 : 0.075);
        m.plate(bx, by, 0.269, bw, bh, 0.053, isGrader ? "#e6b12a" : paint.dark, 0.022, "front", 0.044);
        m.mark(bx, by, 0.296, bw * 0.41, bh * 0.18, isGrader ? paint.black : paint.ceramic);
        if (spec.doubleKeys) {
          m.plate(bx, -h * 0.36, 0.269, bw, bh, 0.053, isGrader ? "#d8a52a" : paint.dark, 0.022, "front", 0.044);
          m.disc(bx, -h * 0.36, 0.297, Math.min(bw, bh) * 0.14, 0.005, paint.dark, "front", 12);
        }
      }
    }
    for (const sign of [-1, 1]) {
      m.screw(sign * (w / 2 - pad * 0.83), h * 0.405, 0.25);
      m.screw(sign * w * 0.36, h * 0.34, -0.25, "back");
      m.screw(sign * w * 0.36, -h * 0.34, -0.25, "back");
    }
    m.plate(0, 0, -0.28, w * 0.6, h * 0.57, 0.16, paint.dark, 0.08, "back");
    m.label(0, 0, -0.362, 0.47, "back");
    if (!isMobaHandset) {
      m.socket(0, -h / 2, -0.035, Math.min(w * 0.5, 0.62), 0.22, "bottom");
    }
  }

  function receiver(m, spec) {
    m.plate(0, -0.16, -0.01, 1.43, 1.91, 0.59, "#333a3b", 0.046, "front", 0.016);
    m.plate(0, -0.16, 0.15, 1.42, 1.9, 0.3, "#e1dfd4", 0.05, "front", 0.017);
    m.plate(0, -0.18, 0.314, 1.33, 1.81, 0.048, "#ebe9e0", 0.037);
    m.decal(0, 0.02, 0.34, 0.41, 0.32, "HITS", "#e7a252");
    m.label(0, -0.53, 0.34, 0.34);
    const antennae = spec.compact
      ? [
          [-0.39, 0.58],
          [0.39, 0.58],
        ]
      : [
          [-0.43, 0.72],
          [0, 0.9],
          [0.43, 0.78],
        ];
    for (const [x, length] of antennae) {
      m.disc(x, 0.82, 0, 0.114, 0.13, paint.dark, "top");
      m.disc(x, 0.88 + length * 0.5, 0, 0.045, length, paint.rubber, "top");
    }
    m.plate(0, -0.16, -0.37, 0.78, 1.7, 0.16, paint.dark, 0.05, "back");
    m.socket(0, -1.13, 0, 0.76, 0.35, "bottom");
  }

  // Named profiles identify a form factor, not a dimensioned replica. More specific
  // models precede their family names so a head controller differs from its cab display.
  const recipes = [
    [/R500 AI/i, "tall", { width: 0.77, height: 2.14 }],
    [/1756-EN2TR/i, "tall", { width: 0.89, height: 2.28, network: true }],
    [/ET 200M/i, "rack", { bays: 5, width: 3.24 }],
    [/СПК207/i, "panel", { width: 2.75, height: 1.87, keys: 0 }],
    [/ЭК-1000/i, "rack", { bays: 7, width: 3.15 }],
    [/MCKC/i, "compact", { width: 1.89, height: 1.68, ribs: 3, sockets: 3 }],
    [/Opti 8X/i, "panel", { width: 2.83, height: 1.87, keys: 0 }],
    [/MaxiPC X20/i, "flat", { width: 2.64, height: 1.82, ribs: 8, sockets: 3 }],
    [/HPC21/i, "panel", { width: 2.75, height: 1.78, keys: 3 }],
    [/XL4/i, "wide", { width: 2.91, keys: 0 }],
    [/MC050/i, "flat", { width: 2.58, height: 1.62, sockets: 2 }],
    [/GX-75/i, "panel", { width: 3.08, height: 1.98, keys: 3 }],
    [/БУ-ГГУ/i, "compact", { width: 1.68, height: 1.96, sockets: 2 }],
    [/DC10/i, "receiver", { compact: true }],
    [/3724/i, "cast", { width: 1.73, height: 2.27, faceSockets: true }],
    [/5050/i, "cast", { width: 2.79, sockets: 3 }],
    [/2040/i, "panel", { width: 2.18, keys: 4 }],
    [/2023/i, "compact", { width: 2.24, sockets: 4 }],
    [/2021/i, "flat", { width: 2.4, ribs: 4, sockets: 4 }],
    [/2020|4W Herman/i, "compact", { width: 1.78, height: 1.8, sockets: 3 }],
    [/motomit|MCI/i, "compact", { width: 2.19, ribs: 3 }],
    [/LHM/i, "compact", { width: 1.9, height: 1.62, ribs: 4 }],
    [/LDM/i, "flat", { width: 2.67, ribs: 3, sockets: 5 }],
    [/MC024/i, "flat", { sockets: 2 }],
    [/MPC-120/i, "flat", { width: 2.32, ribs: 6, sockets: 3 }],
    [/DC12/i, "receiver"],
    [/S7-300/i, "bank"],
    [/R500/i, "rack", { bays: 9, width: 3.22, height: 1.49 }],
    [/ЭК-2000/i, "rack", { bays: 5 }],
    [/ControlLogix/i, "tall"],
    [/ПЛК110/i, "rail"],
    [/TANA Control/i, "console", { width: 3.26, height: 1.45 }],
    [/ПЦУ/i, "console", { width: 2.06, height: 2.19, screenWidth: 0.44 }],
    [/САУРО/i, "console", { width: 2.68, height: 1.77, screenWidth: 0.47 }],
    [/MOBA-matic/i, "handset", { doubleKeys: true }],
    [/Горизонт/i, "handset", { width: 1.47, height: 2.43, screenHeight: 0.34, doubleKeys: true }],
    [/MaxiXT/i, "wide", { width: 3.16, height: 1.73, keys: 4 }],
    [/TimberMatic/i, "wide", { width: 2.92, height: 1.86, keys: 3 }],
    [/TimberRite/i, "wide", { width: 2.66, height: 1.95, keys: 4 }],
    [/Wingman/i, "wide", { width: 2.73, height: 1.76, keys: 0 }],
    [/Opti/i, "wide", { width: 2.73, height: 2.05, keys: 5 }],
    [/IC50C/i, "panel", { width: 2.39, keys: 4 }],
    [/IC70C/i, "panel", { width: 2.63, keys: 3 }],
    [/IC10C/i, "panel", { width: 2.45, keys: 5 }],
    [/IC.*Crusher/i, "panel"],
    [/GX-55/i, "panel", { width: 2.45, height: 2.07, keys: 2 }],
    [/GDC/i, "panel", { width: 2.44, height: 1.58, keys: 4 }],
  ];

  window.makeBlockGeometry = function makeBlockGeometry(profile) {
    const name = typeof profile === "string" ? profile : (profile?.model ?? "ecu");
    const recipe = recipes.find(([pattern]) => pattern.test(name));
    const kind = recipe?.[1] ?? profile?.geometryProfile ?? name;
    const spec = { ...recipe?.[2], brand: profile?.brand, model: name };
    return buildMesh((mesh) => {
      if (spec.brand === "ОВЕН" && /ПЛК110-60/i.test(name) && window.drawOwen110) window.drawOwen110(mesh);
      else if (spec.brand === "ОВЕН" && name === "СПК207") window.drawOwen207(mesh);
      else if (spec.brand === "Allen-Bradley" && ["ControlLogix L7x", "1756-EN2TR"].includes(name))
        window.drawRockwell(mesh, name);
      else if (spec.brand === "ЭМИКОН" && /^ЭК-(1000|2000)$/.test(name)) window.drawEmikon(mesh, name);
      else if (spec.brand === "Mitron") window.drawForestUnit(mesh, profile);
      else if (["Ponsse", "John Deere", "Komatsu Forest", "Waratah"].includes(spec.brand))
        window.drawForestCabin(mesh, profile);
      else if (["MOBA", "Topcon", "Danfoss"].includes(spec.brand)) window.drawRoadInstrument(mesh, profile);
      else if (["Грин-Тех", "Радиоавтоматика", "Белгидросила-Групп", "HITS"].includes(spec.brand))
        window.drawRoadControl(mesh, profile);
      else if (spec.brand === "Siemens" && /S7-300|ET\s*200M/i.test(name) && window.drawSimatic)
        window.drawSimatic(mesh, name);
      else if (spec.brand === "Epec" && /^2040/.test(name) && window.drawHerman) window.drawHerman(mesh);
      else if (spec.brand === "РЕГЛАБ" && window.drawRegul) window.drawRegul(mesh, name);
      else if ((spec.brand === "Metso" || (spec.brand === "TANA" && name === "Wingman")) && window.drawCatalogPanel)
        window.drawCatalogPanel(mesh, profile);
      else if (spec.brand === "Log Max" && /^(LHM|LDM)/.test(name) && window.drawLogMate)
        window.drawLogMate(mesh, name);
      else if (/^3724|^(2020|2021|2023).*4W Herman/.test(name)) epecCastUnit(mesh, name);
      else if (/^5050/.test(name)) epec5050(mesh);
      else if (/^TANA Control/.test(name)) tanaConsole(mesh);
      else if (/^MC024/.test(name)) danfossMC024(mesh);
      else if (["bank", "rack", "tall", "rail", "plc"].includes(kind)) cabinet(mesh, kind, spec);
      else if (["console", "handset", "wide", "panel"].includes(kind)) display(mesh, kind, spec);
      else if (kind === "receiver") receiver(mesh, spec);
      else controller(mesh, kind, spec);
    }, profile);
  };
})();
