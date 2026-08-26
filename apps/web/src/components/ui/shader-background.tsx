"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Campo plasmático em WebGL para as telas de auth.
 *
 * As cores NÃO ficam no GLSL — são lidas de `--primary`, `--background` e
 * `--card` e enviadas como uniforms. Assim o shader acompanha o tema, e a
 * troca claro/escuro não exige recompilar nada.
 *
 * O modo é detectado pela luminância do fundo, não pela classe `.dark`, para
 * não acoplar o componente à implementação do theme provider.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec3  uAccent;
uniform vec3  uBgA;
uniform vec3  uBgB;
uniform float uIntensity;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uLight;

const float gridSmoothWidth  = 0.015;
const float scale            = 5.0;
const float minLineWidth     = 0.012;
const float maxLineWidth     = 0.16;
const float lineFrequency    = 0.2;
const float warpFrequency    = 0.5;
const float offsetFrequency  = 0.5;
const float minOffsetSpread  = 0.6;
const float maxOffsetSpread  = 2.0;
const int   LINES            = 12;

#define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
#define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
#define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

float random(float t) {
  return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
}

float plasmaY(float x, float fade, float offset, float speed) {
  return random(x * lineFrequency + iTime * speed) * fade * uAmplitude + offset;
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 space = (gl_FragCoord.xy - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

  float lineSpeed   = uSpeed;
  float warpSpeed   = uSpeed * 0.2;
  float offsetSpeed = uSpeed * 1.33;

  float hFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
  float vFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

  space.y += random(space.x * warpFrequency + iTime * warpSpeed) * uAmplitude * (0.5 + hFade);
  space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * uAmplitude * hFade;

  float mass = 0.0;
  for (int l = 0; l < LINES; l++) {
    float nIdx = float(l) / float(LINES);
    float oTime = iTime * offsetSpeed;
    float oPos  = float(l) + space.x * offsetFrequency;
    float rnd   = random(oPos + oTime) * 0.5 + 0.5;
    float half_ = mix(minLineWidth, maxLineWidth, rnd * hFade) / 2.0;
    float off   = random(oPos + oTime * (1.0 + nIdx)) * mix(minOffsetSpread, maxOffsetSpread, hFade);
    float lineY = plasmaY(space.x, hFade, off, lineSpeed);

    float line = drawSmoothLine(lineY, half_, space.y) / 2.0
               + drawCrispLine(lineY, half_ * 0.15, space.y);

    // ponto viajando pela linha — a carga percorrendo o cabo
    float cx = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
    vec2  cp = vec2(cx, plasmaY(cx, hFade, off, lineSpeed));
    float dot_ = drawCircle(cp, 0.01, space) * 3.0;

    mass += (line + dot_) * rnd;
  }

  // vinheta forte no escuro, quase nenhuma no claro
  float fadeDark  = mix(0.78, 1.0, vFade);
  float fadeLight = mix(0.98, 1.0, vFade);
  vec3  bg = mix(uBgA, uBgB, uv.x) * mix(fadeDark, fadeLight, uLight);

  float m = clamp(mass * uIntensity, 0.0, 1.6);

  // escuro soma luz; claro tinge o fundo, senão estoura em branco
  vec3 col = uLight > 0.5
    ? mix(bg, uAccent, clamp(m * 0.5, 0.0, 0.78))
    : bg + uAccent * m;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Intensity = "subtle" | "medium" | "strong";

const PRESETS: Record<Intensity, { intensity: number; speed: number; amplitude: number }> = {
  subtle: { intensity: 0.22, speed: 0.14, amplitude: 0.7 },
  medium: { intensity: 0.38, speed: 0.2, amplitude: 1.0 },
  strong: { intensity: 0.6, speed: 0.28, amplitude: 1.25 },
};

type ShaderBackgroundProps = {
  children?: ReactNode;
  className?: string;
  intensity?: Intensity;
};

function parseColor(raw: string): [number, number, number] {
  const s = raw.trim();
  const rgb = s.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const p = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255];
  }
  let hex = s.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length < 6) return [0, 0, 0];
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function luminance([r, g, b]: [number, number, number]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("shader-background:", gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function ShaderBackground({
  children,
  className,
  intensity = "medium",
}: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const presetRef = useRef(PRESETS[intensity]);
  presetRef.current = PRESETS[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { antialias: false, alpha: false }) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    // Sem WebGL o fundo em CSS já cobre a tela — degrada sem quebrar.
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.error("shader-background:", gl.getProgramInfoLog(prog));
      }
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, "aPos");
    const u = {
      res: gl.getUniformLocation(prog, "iResolution"),
      time: gl.getUniformLocation(prog, "iTime"),
      accent: gl.getUniformLocation(prog, "uAccent"),
      bgA: gl.getUniformLocation(prog, "uBgA"),
      bgB: gl.getUniformLocation(prog, "uBgB"),
      intensity: gl.getUniformLocation(prog, "uIntensity"),
      speed: gl.getUniformLocation(prog, "uSpeed"),
      amplitude: gl.getUniformLocation(prog, "uAmplitude"),
      light: gl.getUniformLocation(prog, "uLight"),
    };

    let accent: [number, number, number] = [1, 0.44, 0.23];
    let bgA: [number, number, number] = [0.04, 0.05, 0.05];
    let bgB: [number, number, number] = [0.07, 0.09, 0.1];
    let isLight = 0;

    const readTokens = () => {
      const cs = getComputedStyle(document.documentElement);
      accent = parseColor(cs.getPropertyValue("--primary"));
      bgA = parseColor(cs.getPropertyValue("--background"));
      bgB = parseColor(cs.getPropertyValue("--card"));
      isLight = luminance(bgA) > 0.5 ? 1 : 0;
    };

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width * dpr));
      h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;
    const start = performance.now();

    const frame = (now: number) => {
      const p = presetRef.current;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(u.res, w, h);
      // reduced-motion congela num instante estético, não em t=0
      gl.uniform1f(u.time, reduced.matches ? 12 : (now - start) / 1000);
      gl.uniform3fv(u.accent, accent);
      gl.uniform3fv(u.bgA, bgA);
      gl.uniform3fv(u.bgB, bgB);
      gl.uniform1f(u.intensity, p.intensity);
      gl.uniform1f(u.speed, p.speed);
      gl.uniform1f(u.amplitude, p.amplitude);
      gl.uniform1f(u.light, isLight);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (running) raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (running || reduced.matches || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const once = () => {
      pause();
      frame(performance.now());
    };

    readTokens();
    resize();
    if (reduced.matches) once();
    else play();

    // tema muda → relê tokens e redesenha, mesmo parado
    const themeObs = new MutationObserver(() => {
      readTokens();
      if (!running) once();
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const sizeObs = new ResizeObserver(() => {
      resize();
      if (!running) once();
    });
    sizeObs.observe(canvas);

    const onVisibility = () => (document.hidden ? pause() : play());
    const onMotion = () => (reduced.matches ? once() : play());
    const onLost = (e: Event) => {
      e.preventDefault();
      pause();
    };

    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotion);
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      pause();
      themeObs.disconnect();
      sizeObs.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {/* vinheta: o card nunca perde contraste, faça o campo o que fizer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_56%_46%_at_50%_50%,var(--background)_0%,color-mix(in_srgb,var(--background)_55%,transparent)_46%,transparent_78%)]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default ShaderBackground;
