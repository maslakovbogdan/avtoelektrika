/* Studio materials for the fixed-camera catalog preview. */
(() => {
  const rigs = new WeakMap();
  // Studio Small 03 by Greg Zaal, CC0. Five prefiltered lobes in log radiance.
  // https://polyhaven.com/a/studio_small_03
  const environmentURL = new URL(
    "img/catalog/studio-light.png",
    document.currentScript.src,
  );
  let environmentImage;
  function loadEnvironment() {
    if (!environmentImage) {
      const source = new Image();
      source.src = environmentURL;
      environmentImage = source
        .decode()
        .then(() => source)
        .catch(() => null);
    }
    return environmentImage;
  }
  const vertex = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 position;
    layout(location=1) in vec3 normal;
    layout(location=2) in vec3 color;
    layout(location=3) in vec3 finish;
    layout(location=4) in vec3 uvLayer;
    uniform vec4 turn;
    uniform vec2 projection;
    out vec3 n, albedo, surface;
    out vec3 texcoord;
    vec3 rotatePart(vec3 p) {
      vec3 q = vec3(turn.x*p.x + turn.y*p.z, p.y, -turn.y*p.x + turn.x*p.z);
      return vec3(q.x, turn.z*q.y - turn.w*q.z, turn.w*q.y + turn.z*q.z);
    }
    void main() {
      vec3 world = rotatePart(position);
      n = rotatePart(normal);
      albedo = color;
      surface = finish;
      texcoord = uvLayer;
      gl_Position = vec4(world.xy * projection + vec2(0., .04), -world.z / 4., 1.);
    }`;
  const fragment = `#version 300 es
    precision highp float;
    in vec3 n, albedo, surface;
    in vec3 texcoord;
    uniform highp sampler2DArray decals;
    uniform sampler2D environment;
    uniform bool hasEnvironment;
    out vec4 pixel;
    const vec3 lamp = vec3(-.4815, .7223, .4965);
    float softbox(vec3 r, vec3 axis, float softness, float size) {
      float d = dot(r, normalize(axis));
      return smoothstep(1.-size-softness, 1.-size+softness, d);
    }
    vec3 studioReflection(vec3 r, float roughness) {
      float u = fract(atan(r.z,r.x) * .15915494 + .38);
      float v = clamp(.5 - asin(clamp(r.y,-1.,1.)) * .31830989, .004, .996);
      float level = clamp(roughness * 4., 0., 4.);
      vec3 a = texture(environment,vec2(u,(floor(level)+v)/5.)).rgb;
      vec3 b = texture(environment,vec2(u,(ceil(level)+v)/5.)).rgb;
      return min(mix(exp2(a*7.),exp2(b*7.),fract(level))-1.,vec3(16.));
    }
    void main() {
      vec3 normal = normalize(n);
      vec3 reflected = reflect(vec3(0.,0.,-1.),normal);
      float metal = surface.x, rough = surface.y;
      float front = max(normal.z,0.);
      float hemi = normal.y*.5+.5;
      float direct = max(0.,dot(normal,lamp));
      vec3 base = albedo;
      if(texcoord.z>=0.){
        vec4 printInk = texture(decals,texcoord);
        base = mix(base,pow(printInk.rgb,vec3(2.2)),printInk.a);
      }
      vec3 bounce = mix(vec3(.32,.33,.36),vec3(.82,.88,.94),hemi);
      vec3 diffuse = base * (bounce + direct*vec3(.97,.90,.80));
      float sideBox = softbox(reflected,vec3(-.66,.35,.60),rough*.25+.012,.27);
      float topBox = softbox(reflected,vec3(.22,.84,.42),rough*.22+.025,.25);
      float strip = softbox(reflected,vec3(.81,.02,.55),rough*.17+.008,.075);
      vec3 studio = vec3(.12,.15,.18) + sideBox*vec3(1.3,1.35,1.42)
        + topBox*vec3(1.7,1.55,1.36) + strip*vec3(1.15,1.25,1.45);
      if(hasEnvironment) {
        // A broad rough reflection cannot reproduce the peak of a bare lamp.
        vec3 reflection = studioReflection(reflected,rough);
        float shoulder = mix(.05,.35,rough);
        studio = studio*.28 + reflection/(1.+reflection*shoulder);
        diffuse *= .76 + min(studioReflection(normal,1.),vec3(2.))*.24;
      }
      float dielectric = mix(.045, .018, smoothstep(.90, .97, rough));
      vec3 f0 = mix(vec3(dielectric),base,metal);
      vec3 fresnel = f0 + (max(vec3(1.-rough),f0)-f0)*pow(1.-front,5.);
      vec3 c = diffuse*(1.-metal*.65) + studio*fresnel*(1.-rough*.62);
      c += base*surface.z;
      pixel = vec4(pow(c/(1.+c*.25),vec3(1./2.2)),1.);
    }`;

  function drawReadout(ctx, w, h) {
    ctx.fillStyle = "#200e12";
    ctx.fillRect(0, 0, w, h);
    ctx.scale(w / 210, h / 90);
    const segments = [
      [
        [6, 2],
        [38, 2],
        [33, 7],
        [11, 7],
      ],
      [
        [39, 3],
        [39, 30],
        [34, 26],
        [34, 9],
      ],
      [
        [39, 35],
        [39, 62],
        [34, 57],
        [34, 40],
      ],
      [
        [37, 64],
        [6, 64],
        [11, 59],
        [32, 59],
      ],
      [
        [4, 62],
        [4, 35],
        [9, 40],
        [9, 57],
      ],
      [
        [4, 30],
        [4, 3],
        [9, 9],
        [9, 26],
      ],
      [
        [6, 33],
        [11, 30],
        [32, 30],
        [37, 33],
        [32, 36],
        [11, 36],
      ],
    ];
    for (const x of [49, 111]) {
      segments.forEach((vertices, i) => {
        ctx.fillStyle = i === 6 ? "#441c20" : "#ff554b";
        ctx.beginPath();
        vertices.forEach(([px, py], j) =>
          j ? ctx.lineTo(x + px, 11 + py) : ctx.moveTo(x + px, 11 + py),
        );
        ctx.fill();
      });
    }
    ctx.fillStyle = "#ff554b";
    ctx.fillRect(97, 70, 5, 5);
  }

  function drawOperatorScreen(ctx, profile, w, h) {
    ctx.scale(w / 400, h / 240);
    const brand = profile.brand || "";
    ctx.fillStyle = "#c6d2d3";
    ctx.fillRect(0, 0, 400, 240);
    ctx.fillStyle = "#20343b";
    ctx.fillRect(0, 0, 400, 35);
    ctx.font = "bold 17px system-ui";
    ctx.fillStyle = "#e8f4f3";
    ctx.fillText(brand, 12, 24, 205);
    ctx.font = "14px monospace";
    ctx.fillText("08:42", 342, 23);
    ctx.strokeStyle = "#527478";
    ctx.lineWidth = 3;
    if (/topcon|komatsu|trimble|waratah|hits/i.test(brand)) {
      // Original topographic traces for positioning and harvesting displays.
      ctx.fillStyle = "#b3c5a1";
      ctx.fillRect(9, 45, 277, 182);
      ctx.save();
      ctx.beginPath();
      ctx.rect(9, 45, 277, 182);
      ctx.clip();
      ctx.strokeStyle = "#738f6c";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.ellipse(70, 173, 25 + i * 18, 12 + i * 11, -0.45, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "#f4e3a8";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(11, 218);
      ctx.bezierCurveTo(68, 164, 188, 183, 246, 45);
      ctx.stroke();
      ctx.fillStyle = "#204953";
      ctx.beginPath();
      ctx.moveTo(163, 133);
      ctx.lineTo(164, 154);
      ctx.lineTo(146, 146);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#405c65";
      ctx.fillRect(295, 45, 95, 182);
      ctx.fillStyle = "#edf7f0";
      ctx.font = "bold 19px monospace";
      ["+0.12", "−0.04", "1.8°"].forEach((value, i) =>
        ctx.fillText(value, 307, 85 + i * 54),
      );
    } else {
      // Machine overview with two instrument dials and a small set of channel levels.
      for (const [cx, value] of [
        [85, 0.63],
        [231, 0.34],
      ]) {
        ctx.lineWidth = 12;
        ctx.strokeStyle = "#899fa0";
        ctx.beginPath();
        ctx.arc(cx, 126, 49, 0.78 * Math.PI, 2.22 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = "#167971";
        const angle = (0.78 + 1.44 * value) * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, 126, 49, 0.78 * Math.PI, angle);
        ctx.stroke();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#263f43";
        ctx.beginPath();
        ctx.moveTo(cx, 126);
        ctx.lineTo(cx + Math.cos(angle) * 38, 126 + Math.sin(angle) * 38);
        ctx.stroke();
        ctx.fillStyle = "#233d42";
        ctx.font = "bold 18px monospace";
        ctx.fillText(Math.round(value * 100) + "%", cx - 19, 171);
      }
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "#859b9d";
        ctx.fillRect(326, 69 + i * 29, 56, 11);
        ctx.fillStyle = "#29827b";
        ctx.fillRect(326, 69 + i * 29, [37, 50, 18, 42][i], 11);
      }
      ctx.fillStyle = "#577175";
      ctx.fillRect(12, 199, 376, 25);
      ctx.fillStyle = "#e0e9e9";
      ctx.font = "14px monospace";
      ctx.fillText("I/O", 24, 216);
    }
  }

  const photographedScreens = new WeakMap();
  const displayImages = new WeakMap();
  function loadDecalImage(cache, profile, url, crop) {
    // Both renderers retain the same surface, including when a failed image
    // request is retried the next time this catalogue item is opened.
    let screen = cache.get(profile);
    if (!screen) {
      const canvas = document.createElement("canvas");
      canvas.width = crop?.[2] ?? 2;
      canvas.height = crop?.[3] ?? 2;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#19242a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      screen = { canvas, loaded: false, loading: null };
      cache.set(profile, screen);
    }
    if (screen.loaded || screen.loading) return screen;
    const image = new Image();
    image.src = url;
    screen.loading = image.decode().then(() => {
      const [x, y, width, height] = crop || [0, 0, image.naturalWidth, image.naturalHeight];
      screen.canvas.width = width;
      screen.canvas.height = height;
      screen.canvas.getContext("2d").drawImage(image, x, y, width, height, 0, 0, width, height);
      screen.loaded = true;
      return true;
    }).catch(() => false).finally(() => { screen.loading = null; });
    return screen;
  }
  function getCatalogScreen(profile) {
    return profile?.screenCrop ? loadDecalImage(photographedScreens, profile, profile.screenImage || profile.image, profile.screenCrop) : null;
  }
  function getDisplayImage(profile) {
    return profile?.displayImage ? loadDecalImage(displayImages, profile, profile.displayImage) : null;
  }
  window.getCatalogScreen = getCatalogScreen;
  function getCatalogImages(profile, usesPhoto) {
    return [usesPhoto && getCatalogScreen(profile), getDisplayImage(profile)].filter(Boolean);
  }
  window.getCatalogImages = getCatalogImages;

  function makeCatalogDecal(text, profile, aspect = 2.8, stock = "#d6dbd6") {
    if (text === "@photo-screen" && profile.screenCrop) return getCatalogScreen(profile).canvas;
    if (text === "@display" && profile.displayImage) return getDisplayImage(profile).canvas;
    const canvas = document.createElement("canvas");
    if (text === "@display" || text.startsWith("@display:")) {
      // Draw the pixels of the LCD head-on. Only the mesh supplies its perspective.
      canvas.width = Math.max(1, Math.round(768 * Math.min(aspect, 1)));
      canvas.height = Math.max(1, Math.round(768 / Math.max(aspect, 1)));
      const ctx = canvas.getContext("2d");
      const variant = text.slice(9);
      const painters = [window.drawForestryDisplay, window.drawMiningDisplay, window.drawRoadDisplay];
      if (!painters.some(draw => draw?.(ctx, profile, canvas.width, canvas.height, variant))) {
        drawOperatorScreen(ctx, profile, canvas.width, canvas.height);
      }
      return canvas;
    }
    canvas.width = 512;
    canvas.height = Math.round(512 / Math.max(0.85, Math.min(7, aspect)));
    const ctx = canvas.getContext("2d");
    const w = canvas.width,
      h = canvas.height;
    if (text === "@digits") {
      drawReadout(ctx, w, h);
    } else if (text === "@screen") {
      drawOperatorScreen(ctx, profile, w, h);
    } else {
      const lines = text.split("\n");
      ctx.fillStyle = stock;
      ctx.fillRect(0, 0, w, h);
      const channels = stock
        .match(/[\da-f]{2}/gi)
        .map((value) => parseInt(value, 16));
      const luminance =
        channels[0] * 0.21 + channels[1] * 0.72 + channels[2] * 0.07;
      ctx.fillStyle = luminance > 120 ? "#253034" : "#edefe7";
      ctx.textBaseline = "middle";
      lines.forEach((line, i) => {
        const size = Math.round(Math.min(w * 0.2, h / (lines.length + 1)));
        ctx.font =
          (i === 0 ? "bold " : "") +
          size +
          "px " +
          (i === 0 ? "system-ui" : "monospace");
        ctx.fillText(
          line,
          w * 0.065,
          (h * (i + 0.58)) / lines.length,
          w * 0.87,
        );
      });
    }
    return canvas;
  }
  window.makeCatalogDecal = makeCatalogDecal;

  const finishes = {
    metal: [0.82, 0.29, 0],
    cast: [0.61, 0.62, 0],
    pin: [0.87, 0.22, 0],
    steel: [0.78, 0.32, 0],
    rubber: [0, 0.9, 0],
    plastic: [0.015, 0.48, 0],
    matte: [0, 0.97, 0],
    glass: [0.08, 0.085, 0],
    screen: [0.04, 0.15, 0.12],
    lcd: [0, 0.96, 0.17],
    label: [0, 0.73, 0],
    led: [0.04, 0.12, 0.32],
  };
  function unitNormal(a, b, c) {
    const u = b.map((x, i) => x - a[i]),
      v = c.map((x, i) => x - a[i]);
    const n = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const length = Math.hypot(...n);
    return length < 1e-10 ? null : n.map((x) => x / length);
  }

  function buildSurface(faces, profile) {
    const prints = [];
    const data = [];
    // Vertices on rounded castings share a normal across shallow bevels. Edges
    // between caps and walls keep their sharp machined highlights.
    const normals = new Map(),
      adjacent = new Map();
    for (const face of faces) {
      const n = unitNormal(...face.points.slice(0, 3));
      if (!n) continue;
      normals.set(face, n);
      for (const point of face.points) {
        if (!adjacent.has(point)) adjacent.set(point, []);
        adjacent.get(point).push(n);
      }
    }
    for (const face of faces) {
      const pts = face.points;
      const n = normals.get(face);
      if (!n) continue;
      const vertexNormals = pts.map((point) => {
        const total = [...n];
        for (const v of adjacent.get(point)) {
          if (v !== n && v[0] * n[0] + v[1] * n[1] + v[2] * n[2] > 0.83) {
            for (let axis = 0; axis < 3; axis++) total[axis] += v[axis];
          }
        }
        const length = Math.hypot(...total);
        return total.map((value) => value / length);
      });
      const color = face.color
        .match(/[\da-f]{2}/gi)
        .map((v) => (parseInt(v, 16) / 255) ** 2.2);
      const finish = finishes[face.material] || finishes.plastic;
      let uv;
      if (face.decal) {
        const side = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
        const stamp = makeCatalogDecal(
          face.decal,
          profile,
          side(pts[0], pts[1]) / side(pts[0], pts[3]),
          face.color,
        );
        // Several front plates can sample different rectangles of one product photo.
        let layer = prints.indexOf(stamp);
        if (layer < 0) layer = prints.push(stamp) - 1;
        const [left, top, width, height] = face.textureRegion || [0, 0, 1, 1];
        uv = [
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ].map(([u, v]) => [left + u * width, top + v * height, layer]);
      }
      for (let j = 1; j < pts.length - 1; j++) {
        for (const i of [0, j, j + 1])
          data.push(
            ...pts[i],
            ...vertexNormals[i],
            ...color,
            ...finish,
            ...(uv?.[i] || [0, 0, -1]),
          );
      }
    }
    return { vertices: new Float32Array(data), prints };
  }

  function buildRig(gl) {
    const program = gl.createProgram();
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program));
    const uniforms = {};
    for (const name of [
      "turn",
      "projection",
      "decals",
      "environment",
      "hasEnvironment",
    ])
      uniforms[name] = gl.getUniformLocation(program, name);
    const environment = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, environment);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      1,
      1,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      new Uint8Array(3),
    );
    for (const mode of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
      gl.texParameteri(gl.TEXTURE_2D, mode, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { program, uniforms, environment, lit: false };
  }

  window.createBlockStudio = function (canvas, profile, requestDraw) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return null;
    const faces = window.makeBlockGeometry(profile);
    const { vertices, prints } = buildSurface(faces, profile);
    const images = getCatalogImages(profile, faces.some(face => face.decal === "@photo-screen"));
    const hasDisplay = faces.some(face => face.material === "lcd");
    let rig,
      buffer,
      texture,
      active = true;
    function upload() {
      rig = rigs.get(canvas);
      if (!rig || !gl.isProgram(rig.program)) {
        rig = buildRig(gl);
        rigs.set(canvas, rig);
      }
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      // Isolated mip chains keep tiny legends from sampling a neighbouring screen or label at grazing angles.
      const target = gl.TEXTURE_2D_ARRAY;
      const tile = document.createElement("canvas");
      tile.width = tile.height = hasDisplay || images.length ? 512 : 256;
      const ink = tile.getContext("2d");
      gl.bindTexture(target, texture);
      gl.texStorage3D(target, 1 + Math.log2(tile.width), gl.RGBA8, tile.width, tile.height, Math.max(1, prints.length));
      function uploadLayer(stamp, layer) {
        ink.clearRect(0, 0, tile.width, tile.height);
        ink.drawImage(stamp, 0, 0, tile.width, tile.height);
        gl.texSubImage3D(target, 0, 0, 0, layer, tile.width, tile.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, tile);
      }
      prints.forEach(uploadLayer);
      gl.generateMipmap(target);
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      for (const axis of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(target, axis, gl.CLAMP_TO_EDGE);
      const filtering = gl.getExtension("EXT_texture_filter_anisotropic");
      if (filtering) gl.texParameterf(target, filtering.TEXTURE_MAX_ANISOTROPY_EXT,
        Math.min(4, gl.getParameter(filtering.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      const selectedTexture = texture;
      for (const screen of images) {
        const layer = prints.indexOf(screen.canvas);
        if (layer < 0 || !screen.loading) continue;
        screen.loading.then(loaded => {
          if (!loaded || !active || gl.isContextLost() || texture !== selectedTexture) return;
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(target, texture);
          uploadLayer(screen.canvas, layer);
          gl.generateMipmap(target);
          requestDraw?.();
        });
      }
      if (!rig.lit)
        loadEnvironment().then((source) => {
          if (!source || !active || gl.isContextLost() || rig.lit) return;
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, rig.environment);
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            source,
          );
          rig.lit = true;
          requestDraw();
        });
    }
    upload();
    function lost(event) {
      event.preventDefault();
      rigs.delete(canvas);
    }
    function restored() {
      upload();
      requestDraw?.();
    }
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return {
      draw(yaw, pitch, width, height, dpr) {
        if (gl.isContextLost()) return;
        const w = Math.round(width * dpr),
          h = Math.round(height * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const scale = window.blockStudioScale(width, height);
        const cy = Math.cos(yaw),
          sy = Math.sin(yaw),
          cp = Math.cos(pitch),
          sp = Math.sin(pitch);
        const { uniforms: u } = rig;
        gl.useProgram(rig.program);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const sizes = [3, 3, 3, 3, 3];
        let offset = 0;
        sizes.forEach((size, i) => {
          gl.enableVertexAttribArray(i);
          gl.vertexAttribPointer(i, size, gl.FLOAT, false, 60, offset * 4);
          offset += size;
        });
        gl.uniform4f(u.turn, cy, sy, cp, sp);
        gl.uniform2f(u.projection, (2 * scale) / width, (2 * scale) / height);
        gl.uniform1i(u.decals, 1);
        gl.uniform1i(u.environment, 2);
        gl.uniform1i(u.hasEnvironment, rig.lit);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, rig.environment);
        gl.viewport(0, 0, w, h);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 15);
      },
      dispose() {
        active = false;
        canvas.removeEventListener("webglcontextlost", lost);
        canvas.removeEventListener("webglcontextrestored", restored);
        gl.deleteBuffer(buffer);
        gl.deleteTexture(texture);
      },
    };
  };
})();
