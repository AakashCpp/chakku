import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

/**
 * A photograph rendered as a plane with a custom vertex shader
 * that simulates paper: wind ripples, mouse curl at corners,
 * and a subtle scroll-driven bend. On "shatter" the fragment
 * shader displaces along faux-voronoi cells until the image
 * dissolves into fragments.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;      // normalized -1..1
  uniform float uHover;     // 0..1
  uniform float uScroll;    // -1..1
  uniform float uShatter;   // 0..1
  varying vec2 vUv;
  varying float vBend;
  varying float vShatter;

  // simplex-ish noise (cheap)
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // wind ripple
    float w = noise(uv * 3.2 + uTime * 0.25) - 0.5;
    float w2 = noise(uv * 6.0 - uTime * 0.15) - 0.5;
    float wind = w * 0.08 + w2 * 0.04;

    // scroll-driven overall bend (as if held by fingertips)
    float scrollBend = uScroll * (uv.x - 0.5) * (uv.y - 0.5) * 1.2;

    // mouse curl at corners
    float dx = uv.x - (uMouse.x * 0.5 + 0.5);
    float dy = uv.y - (uMouse.y * 0.5 + 0.5);
    float d = length(vec2(dx,dy));
    float curl = smoothstep(0.6, 0.0, d) * uHover * 0.12;

    pos.z += wind + scrollBend + curl;

    // shatter — displace along random directions per faux cell
    if (uShatter > 0.0) {
      vec2 cell = floor(uv * 22.0);
      float r1 = hash(cell);
      float r2 = hash(cell + 3.7);
      vec3 dir = normalize(vec3(r1 - 0.5, r2 - 0.5, 0.4 + hash(cell + 1.1) * 0.6));
      pos += dir * uShatter * (0.8 + r1 * 1.4);
    }

    vBend = pos.z;
    vShatter = uShatter;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uShatter;
  uniform float uTime;
  varying vec2 vUv;
  varying float vBend;
  varying float vShatter;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Chromatic sway based on bend (paper feel)
    float ca = vBend * 0.35;
    vec3 col;
    col.r = texture2D(uTex, uv + vec2(ca, 0.0)).r;
    col.g = texture2D(uTex, uv).g;
    col.b = texture2D(uTex, uv - vec2(ca, 0.0)).b;

    // paper warmth / grain
    float grain = (hash(uv * 800.0 + uTime) - 0.5) * 0.06;
    col += grain;

    // subtle vignette on photo
    float vig = smoothstep(0.9, 0.35, distance(uv, vec2(0.5)));
    col *= 0.85 + vig * 0.25;

    // fade fragments during shatter
    vec2 cell = floor(vUv * 22.0);
    float r = hash(cell);
    float alpha = 1.0 - smoothstep(0.0, 0.9, vShatter - r * 0.5);
    if (alpha <= 0.01) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;

function Photo({
  url,
  scrollProgress,
  shatter,
}: {
  url: string;
  scrollProgress: React.MutableRefObject<number>;
  shatter: React.MutableRefObject<number>;
}) {
  const tex = useTexture(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));
  const hover = useRef(0);
  const hoverTarget = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect?.();
      const w = rect?.width ?? size.width;
      const h = rect?.height ?? size.height;
      const x = rect ? (e.clientX - rect.left) / w : e.clientX / size.width;
      const y = rect ? (e.clientY - rect.top) / h : e.clientY / size.height;
      target.current.set(x * 2 - 1, -(y * 2 - 1));
      hoverTarget.current = 1;
    };
    const onLeave = () => (hoverTarget.current = 0);
    const canvas = document.querySelectorAll("canvas");
    canvas.forEach((c) => {
      c.addEventListener("pointermove", onMove as unknown as EventListener);
      c.addEventListener("pointerleave", onLeave);
    });
    return () => {
      canvas.forEach((c) => {
        c.removeEventListener("pointermove", onMove as unknown as EventListener);
        c.removeEventListener("pointerleave", onLeave);
      });
    };
  }, [size]);

  useFrame((state, dt) => {
    if (!mat.current) return;
    mouse.current.lerp(target.current, Math.min(1, dt * 4));
    hover.current += (hoverTarget.current - hover.current) * Math.min(1, dt * 3);
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uMouse.value.copy(mouse.current);
    mat.current.uniforms.uHover.value = hover.current;
    mat.current.uniforms.uScroll.value = scrollProgress.current;
    mat.current.uniforms.uShatter.value = shatter.current;
    if (mesh.current) {
      mesh.current.rotation.x = mouse.current.y * 0.06 + scrollProgress.current * 0.15;
      mesh.current.rotation.y = mouse.current.x * 0.08;
    }
  });

  // Fit plane inside viewport (portrait-ish aspect)
  const aspect = 0.72;
  const height = Math.min(viewport.height * 0.86, viewport.width * 0.86 / aspect);
  const width = height * aspect;

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uHover: { value: 0 },
      uScroll: { value: 0 },
      uShatter: { value: 0 },
    }),
    [tex]
  );

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[width, height, 64, 64]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function PaperPhoto({
  url,
  scrollProgress,
  shatter,
}: {
  url: string;
  scrollProgress: React.MutableRefObject<number>;
  shatter: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.2], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.9} />
      <Suspense fallback={null}>
        <Photo url={url} scrollProgress={scrollProgress} shatter={shatter} />
      </Suspense>
    </Canvas>
  );
}
