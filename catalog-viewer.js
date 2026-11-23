// A static BSP tree preserves the draw order of raised keys and inset front panels
// when the enclosure turns. Geometry is split in model space once per mesh.
(() => {
  const EPSILON = 0.00001;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  function makeFace({ points, color, material, decal, textureRegion }, profile) {
    const [a, b, c] = points;
    const ab = b.map((v, i) => v - a[i]);
    const ac = c.map((v, i) => v - a[i]);
    const cross = [ab[1]*ac[2] - ab[2]*ac[1], ab[2]*ac[0] - ab[0]*ac[2], ab[0]*ac[1] - ab[1]*ac[0]];
    const length = Math.hypot(...cross);
    if (length < 1e-10) return null;
    const normal = cross.map(v => v / length);
    const rgb = color.slice(1).match(/../g).map(channel => parseInt(channel, 16));
    const face = { points, normal, offset: dot(normal, a), rgb, material };
    if (decal && points.length === 4 && window.makeCatalogDecal) {
      const height = Math.hypot(...points[3].map((value, i) => value - a[i]));
      face.texture = window.makeCatalogDecal(decal, profile, Math.hypot(...ab) / height, color);
      face.textureRegion = textureRegion;
      face.corners = points;
    }
    return face;
  }

  function distances(face, plane) {
    return face.points.map(p => dot(p, plane.normal) - plane.offset);
  }

  function choosePlane(faces) {
    let best, lowest = Infinity;
    const count = Math.min(7, faces.length);
    for (let i = 0; i < count; i++) {
      const plane = faces[Math.floor(i * faces.length / count)];
      let front = 0, back = 0, splits = 0;
      for (const face of faces) {
        const d = distances(face, plane);
        const positive = d.some(v => v > EPSILON);
        const negative = d.some(v => v < -EPSILON);
        if (positive) front++;
        if (negative) back++;
        if (positive && negative) splits++;
      }
      const cost = Math.max(front, back) + splits * 4;
      if (cost < lowest) { best = plane; lowest = cost; }
    }
    return best;
  }

  function partition(faces) {
    if (!faces.length) return null;
    const plane = choosePlane(faces);
    const same = [], front = [], back = [];
    for (const face of faces) {
      const d = distances(face, plane);
      const positive = d.some(v => v > EPSILON), negative = d.some(v => v < -EPSILON);
      if (!positive && !negative) { same.push(face); continue; }
      if (!positive) { back.push(face); continue; }
      if (!negative) { front.push(face); continue; }
      const frontPoints = [], backPoints = [];
      face.points.forEach((point, i, points) => {
        if (d[i] >= -EPSILON) frontPoints.push(point);
        if (d[i] <= EPSILON) backPoints.push(point);
        const next = (i + 1) % points.length;
        if ((d[i] > EPSILON && d[next] < -EPSILON) || (d[i] < -EPSILON && d[next] > EPSILON)) {
          const t = d[i] / (d[i] - d[next]);
          const hit = point.map((v, j) => v + t * (points[next][j] - v));
          frontPoints.push(hit);
          backPoints.push(hit);
        }
      });
      front.push({ ...face, points: frontPoints });
      back.push({ ...face, points: backPoints });
    }
    return { plane, same, front: partition(front), back: partition(back) };
  }

  function prepareMesh(profile) {
    const geometry = window.makeBlockGeometry(profile);
    const faces = geometry.map(face => makeFace(face, profile)).filter(Boolean);
    const tree = partition(faces);
    const vertices = [], indices = new Map();
    function index(point) {
      const key = point.map(v => Math.round(v * 1e7)).join("/");
      if (!indices.has(key)) {
        indices.set(key, vertices.length);
        vertices.push(point);
      }
      return indices.get(key);
    }
    function indexPoints(node) {
      if (!node) return;
      for (const face of node.same) {
        face.indices = face.points.map(index);
        if (face.corners) face.uvQuad = face.corners.map(index);
      }
      indexPoints(node.front);
      indexPoints(node.back);
    }
    indexPoints(tree);
    return { tree, vertices, usesPhoto: geometry.some(face => face.decal === "@photo-screen") };
  }

  const meshes = new Map();
  const HOME_YAW = -0.46, HOME_PITCH = 0.28;
  // Every enclosure uses the same fixed orthographic camera. Resizing changes the
  // pixel density of our world units; rotating an object never changes that scale.
  window.blockStudioScale = (width, height) => Math.min(width, height) / 4.6;
  const limitPitch = angle => Math.max(-1.36, Math.min(1.36, angle));

  function render(ctx, mesh, yaw, pitch, width, height, dpr) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // Inverse model rotation of the fixed +Z direction; orthographic rays are parallel.
    const eye = [-cp * sy, sp, cp * cy];
    const scale = window.blockStudioScale(width, height);
    const projected = mesh.vertices.map(([x, y, z]) => {
      const vx = cy*x + sy*z, vz = -sy*x + cy*z;
      const vy = cp*y - sp*vz;
      return [vx * scale, -vy * scale];
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height * .48);
    // A broad softbox above the left shoulder, plus cool fill from the right.
    // Matte elastomers, cast aluminium and the glass window respond differently.
    const materials = {
      cast: [16, .22], metal: [30, .65], steel: [28, .52], pin: [40, .53],
      glass: [65, .75], screen: [55, .28], lcd: [10, .025], led: [20, .15],
      label: [13, .07], rubber: [8, .045], plastic: [20, .19], matte: [6, .025]
    };
    function drawDecal(face) {
      const [bl, br, , tl] = face.uvQuad.map(i => projected[i]);
      const texture = face.texture;
      const dx = (br[0] - bl[0]) / texture.width;
      const dy = (br[1] - bl[1]) / texture.width;
      ctx.save();
      if (face.points !== face.corners) {
        // The BSP may cut one continuous print into many convex fragments. Overlap
        // their antialiased clip edges by one device pixel. drawImage itself still
        // ends at the original four corners, keeping the outer silhouette exact.
        ctx.beginPath();
        const polygon = face.indices;
        for (let i = 0; i < polygon.length; i++) {
          const [x, y] = projected[polygon[i]];
          const [endX, endY] = projected[polygon[(i + 1) % polygon.length]];
          const ex = endX - x, ey = endY - y;
          const length = Math.hypot(ex, ey);
          if (!length) continue;
          const nx = -ey / (length * dpr), ny = ex / (length * dpr);
          ctx.lineTo(x + nx, y + ny);
          ctx.lineTo(endX + nx, endY + ny);
        }
        ctx.closePath();
        ctx.clip();
      }
      ctx.transform(dx, dy, (bl[0] - tl[0]) / texture.height,
        (bl[1] - tl[1]) / texture.height, tl[0], tl[1]);
      if (face.textureRegion) {
        const [x, y, w, h] = face.textureRegion;
        ctx.drawImage(texture, x * texture.width, y * texture.height, w * texture.width, h * texture.height,
          0, 0, texture.width, texture.height);
      } else ctx.drawImage(texture, 0, 0);
      ctx.restore();
    }
    function paint(node) {
      if (!node) return;
      const inFront = dot(eye, node.plane.normal) > 0;
      paint(inFront ? node.back : node.front);
      for (const face of node.same) {
        if (dot(eye, face.normal) <= 0) continue;
        if (face.texture) {
          drawDecal(face);
          continue;
        }
        const [nx, ny, nz] = face.normal;
        const rx = cy*nx + sy*nz, rz = -sy*nx + cy*nz;
        const ry = cp*ny - sp*rz, viewZ = sp*ny + cp*rz;
        const key = Math.max(0, -.49*rx + .73*ry + .48*viewZ);
        const fill = Math.max(0, .8*rx + .19*ry + .56*viewZ);
        const [gloss, strength] = materials[face.material] || materials.plastic;
        const shine = Math.pow(Math.max(0, -.284*rx + .424*ry + .859*viewZ), gloss);
        const rim = Math.pow(1 - Math.max(0, viewZ), 3) * Math.max(0, .75*rx + .45*ry);
        const brightness = .56 + .48 * key + .17 * fill + .08 * ry;
        const reflected = 200 * strength * (shine + rim * .55);
        const [r, g, b] = face.rgb.map(v => Math.min(255, Math.round(v * brightness + reflected)));
        ctx.fillStyle = ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = .34;
        ctx.lineJoin = "round";
        ctx.beginPath();
        face.indices.forEach((index, i) => {
          const [x, y] = projected[index];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      paint(inFront ? node.front : node.back);
    }
    paint(mesh.tree);
  }

  window.mountBlockViewer = function mountBlockViewer(canvas, profile) {
    // Present bottom-entry wiring plugs to the viewer on the first frame.
    const [homeYaw, homePitch] = profile?.previewOrientation ??
      [HOME_YAW, /^(MC050|5050)/i.test(profile?.model || "") ? -.50 : HOME_PITCH];
    let yaw = homeYaw, pitch = homePitch, pointer = null, frame = 0;
    let studio = null;
    try {
      studio = window.createBlockStudio?.(canvas, profile, schedule);
    } catch (error) {
      console.warn("WebGL model preview is unavailable; using the 2D renderer.", error);
    }
    let ctx, mesh, originalCanvas;
    if (!studio) {
      ctx = canvas.getContext("2d");
      if (!ctx) {
        // A driver can grant WebGL but then fail to compile a shader. A canvas
        // with that context cannot switch to 2D; keep the caller's node for reuse.
        originalCanvas = canvas;
        canvas = originalCanvas.cloneNode(false);
        originalCanvas.replaceWith(canvas);
        ctx = canvas.getContext("2d");
        if (!ctx) return () => canvas.replaceWith(originalCanvas);
      }
      const key = typeof profile === "string" ? profile : profile.brand + "/" + profile.model;
      if (!meshes.has(key)) meshes.set(key, prepareMesh(profile));
      mesh = meshes.get(key);
    }
    const events = new AbortController();
    const settings = { signal: events.signal };
    if (mesh) {
      for (const image of window.getCatalogImages?.(profile, mesh.usesPhoto) ?? []) {
        image.loading?.then(loaded => {
          if (loaded && !events.signal.aborted) schedule();
        });
      }
    }
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";
    canvas.tabIndex = 0;
    if (!canvas.hasAttribute("aria-label")) canvas.setAttribute("aria-label", "Трёхмерная модель. Стрелки вращают, Home возвращает исходный вид.");
    canvas.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight ArrowUp ArrowDown Home");

    function draw() {
      frame = 0;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      if (studio) studio.draw(yaw, pitch, rect.width, rect.height, dpr);
      else render(ctx, mesh, yaw, pitch, rect.width, rect.height, dpr);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function release() {
      if (!pointer) return;
      const id = pointer.id;
      pointer = null;
      if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
      canvas.style.cursor = "grab";
    }
    canvas.addEventListener("pointerdown", event => {
      if (pointer || !event.isPrimary || event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
      canvas.style.cursor = "grabbing";
      event.stopPropagation();
    }, settings);
    canvas.addEventListener("pointermove", event => {
      if (pointer?.id !== event.pointerId) return;
      const sensitivity = Math.PI / Math.max(120, Math.min(canvas.clientWidth, canvas.clientHeight));
      yaw += (event.clientX - pointer.x) * sensitivity;
      pitch = limitPitch(pitch + (event.clientY - pointer.y) * sensitivity);
      pointer.x = event.clientX; pointer.y = event.clientY;
      schedule();
    }, settings);
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      canvas.addEventListener(type, event => {
        if (pointer?.id === event.pointerId) release();
      }, settings);
    }
    canvas.addEventListener("keydown", event => {
      switch (event.key) {
        case "ArrowLeft": yaw -= .18; break;
        case "ArrowRight": yaw += .18; break;
        case "ArrowUp": pitch = limitPitch(pitch - .18); break;
        case "ArrowDown": pitch = limitPitch(pitch + .18); break;
        case "Home": yaw = homeYaw; pitch = homePitch; break;
        default: return;
      }
      event.preventDefault();
      event.stopPropagation();
      schedule();
    }, settings);
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    window.addEventListener("resize", schedule, settings);
    window.addEventListener("blur", release, settings);
    schedule();
    return () => {
      events.abort();
      resize.disconnect();
      release();
      cancelAnimationFrame(frame);
      studio?.dispose();
      if (originalCanvas) canvas.replaceWith(originalCanvas);
    };
  };
})();
