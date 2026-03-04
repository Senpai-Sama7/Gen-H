"use client";

import { useRef, useMemo, Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile, usePrefersReducedMotion } from "@/app/hooks/useMousePosition";
import * as THREE from "three";

const funnelSteps = [
  {
    title: "Clarify",
    description: "Make the value obvious in seconds so premium buyers understand what's different, what it costs, and why they should trust it.",
    color: "#71717a",
  },
  {
    title: "Capture",
    description: "Collect intent, budget, timing, and commercial context through one structured brief instead of vague contact requests.",
    color: "#d4af37",
  },
  {
    title: "Convert",
    description: "Use the private admin portal to review every lead, qualify it, assign next actions, and track what's already booked.",
    color: "#10b981",
  },
];

function PipelineScene({ activeStep }: { activeStep: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const tubeRef = useRef<THREE.Mesh>(null);

  const particleCount = 200;
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      positions[i * 3] = (t - 0.5) * 8;
      positions[i * 3 + 1] = Math.sin(t * Math.PI) * 0.5;
      positions[i * 3 + 2] = Math.cos(t * Math.PI) * 0.5;

      let color: THREE.Color;
      if (t < 0.33) {
        color = new THREE.Color("#71717a");
      } else if (t < 0.66) {
        color = new THREE.Color("#d4af37");
      } else {
        color = new THREE.Color("#10b981");
      }
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      speeds[i] = 0.5 + Math.random() * 0.5;
    }

    return { positions, colors, speeds };
  }, []);

  const tubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 0, 0),
      new THREE.Vector3(-1, 0.3, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(4, 0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.3, 16, false);
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount + time * 0.1 * particles.speeds[i]) % 1;
        
        positions[i * 3] = (t - 0.5) * 8;
        positions[i * 3 + 1] = Math.sin(t * Math.PI) * 0.5 + Math.sin(time + i) * 0.1;
        positions[i * 3 + 2] = Math.cos(t * Math.PI) * 0.5;

        const color: THREE.Color = t < 0.33
          ? new THREE.Color("#71717a")
          : t < 0.66
            ? new THREE.Color("#d4af37").multiplyScalar(1 + Math.sin(time * 2) * 0.2)
            : new THREE.Color("#10b981");
        
        if (activeStep === 0 && t > 0.33) continue;
        if (activeStep === 1 && (t < 0.33 || t > 0.66)) continue;
        if (activeStep === 2 && t < 0.66) continue;

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <>
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </>
  );
}

function FunnelCanvas({ activeStep }: { activeStep: number }) {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div className="w-full h-full bg-gradient-to-r from-surface via-surface-highlight to-surface rounded-2xl" />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
        <PipelineScene activeStep={activeStep} />
      </Suspense>
    </Canvas>
  );
}

export function Funnel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const stepProgress = useTransform(scrollYProgress, [0, 1], [0, 2]);

  const handleStepChange = (index: number) => {
    setActiveStep(index);
    const element = document.getElementById(`funnel-step-${index}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      ref={sectionRef}
      id="funnel"
      className="relative min-h-[300vh]"
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="eyebrow">Interactive Funnel</span>
                <h2 className="mt-4 text-text-primary">
                  One public experience, one private workflow.
                </h2>
              </motion.div>

              <div className="space-y-4">
                {funnelSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    id={`funnel-step-${index}`}
                    className={`
                      p-6 rounded-2xl cursor-pointer transition-all duration-300
                      border
                      ${
                        activeStep === index
                          ? "bg-surface border-border-highlight"
                          : "bg-transparent border-transparent hover:bg-surface/50"
                      }
                    `}
                    onClick={() => handleStepChange(index)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{
                          backgroundColor:
                            activeStep === index
                              ? `${step.color}20`
                              : "transparent",
                          color: step.color,
                          border: `1px solid ${step.color}`,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-semibold mb-2 transition-colors ${
                            activeStep === index
                              ? "text-text-primary"
                              : "text-text-muted"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-sm transition-colors ${
                            activeStep === index
                              ? "text-text-secondary"
                              : "text-text-muted"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 h-[400px] lg:h-[600px]">
              <FunnelCanvas activeStep={activeStep} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
