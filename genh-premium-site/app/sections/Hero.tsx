"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, useInView } from "framer-motion";
import { useIsMobile, usePrefersReducedMotion } from "@/app/hooks/useMousePosition";
import { MagneticButton } from "@/app/components/MagneticButton";
import * as THREE from "three";

function FluidBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: { x: 0, y: 0 } },
      uResolution: { value: { x: viewport.width, y: viewport.height } },
    }),
    [viewport]
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    float fbm(vec2 p) {
      float f = 0.0;
      f += 0.5000 * noise(p); p *= 2.02;
      f += 0.2500 * noise(p); p *= 2.03;
      f += 0.1250 * noise(p); p *= 2.01;
      f += 0.0625 * noise(p);
      return f;
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 mouseInfluence = uMouse * 0.5;
      
      float time = uTime * 0.15;
      
      vec2 q = vec2(0.0);
      q.x = fbm(uv + time * 0.5 + mouseInfluence);
      q.y = fbm(uv + vec2(1.0));
      
      vec2 r = vec2(0.0);
      r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + time * 0.15 + mouseInfluence);
      r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + time * 0.126);
      
      float f = fbm(uv + r);
      
      vec3 color1 = vec3(0.83, 0.69, 0.22); // Gold
      vec3 color2 = vec3(0.72, 0.45, 0.2); // Copper
      vec3 color3 = vec3(0.04, 0.04, 0.05); // Dark
      
      vec3 color = mix(color3, color1, f * f * f + 0.6 * f * f + 0.5 * f);
      color = mix(color, color2, length(q) * 0.5);
      
      float alpha = f * f * 0.4 + 0.1;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uMouse.value.x = (state.pointer.x + 1) / 2;
      material.uniforms.uMouse.value.y = (state.pointer.y + 1) / 2;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[3, 0, 0]}>
      <mesh position={[0, 1, 0]} rotation={[0.5, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.1, 8, 16]} />
        <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh position={[1, -0.5, -0.5]} rotation={[0.3, 0.8, 0.2]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial color="#b87333" wireframe transparent opacity={0.2} />
      </mesh>
      <mesh position={[-0.5, -1, 0.5]} rotation={[0.7, 0.3, 0.5]}>
        <octahedronGeometry args={[0.4]} />
        <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function HeroCanvas() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  if (isMobile || reducedMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <FluidBackground />
          <FloatingShapes />
        </Suspense>
      </Canvas>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <HeroCanvas />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <motion.div
          variants={reducedMotion ? undefined : containerVariants}
          initial="hidden"
          animate={isInView && !reducedMotion ? "visible" : "hidden"}
          className="space-y-8"
        >
          <motion.span
            variants={itemVariants}
            className="eyebrow inline-flex"
          >
            GEN-H Studio
          </motion.span>

          <motion.h1 variants={itemVariants} className="leading-[1.1]">
            <span className="text-text-primary">Premium websites</span>
            <br />
            <span className="gradient-text">that convert</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-text-secondary max-w-2xl"
          >
            Clear offer. Clear action. Premium HVAC growth systems with
            integrated lead qualification.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <MagneticButton onClick={() => document.getElementById("brief")?.scrollIntoView({ behavior: "smooth" })}>
              Start Your Brief
            </MagneticButton>
            <a
              href="#funnel"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              See how it works
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-text-muted/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-2 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
