"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { Shield, Zap, BarChart3, CheckCircle2, Lock, Globe } from "lucide-react";
import { cn } from "@/app/lib/utils";

const features = [
  {
    id: "admin-portal",
    type: "large",
    title: "Private Admin Portal",
    description:
      "A login-first dashboard where you control lead statuses, notes, and queue prioritization behind a secure session.",
    icon: Lock,
  },
  {
    id: "qualification",
    type: "stat",
    value: "94%",
    label: "Qualification Rate",
    description: "Average lead qualification rate with structured briefs.",
  },
  {
    id: "routing",
    type: "feature",
    title: "Real-time Routing",
    description: "Instant notifications, smart assignment, status tracking",
    icon: Zap,
    features: [
      "Instant notifications",
      "Smart assignment",
      "Status tracking",
    ],
  },
  {
    id: "security",
    type: "feature",
    title: "Secure by Default",
    description: "SOC 2 compliant, GDPR ready, enterprise-grade security",
    icon: Shield,
    features: ["SOC 2 compliant", "GDPR ready", "Enterprise-grade security"],
  },
  {
    id: "workflow",
    type: "wide",
    title: "The Complete Workflow",
    description:
      "From public page to private dashboard, every step is tracked and optimized.",
    icon: BarChart3,
  },
];

function BentoCard({
  children,
  className,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) * 0.1);
    y.set((e.clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-500 hover:border-primary/30",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function AdminPortalCard() {
  return (
    <BentoCard className="md:col-span-2 p-8 md:p-12" index={0}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            Private Admin Portal
          </h3>
        </div>
        <p className="text-text-secondary mb-8 max-w-md">
          A login-first dashboard where you control lead statuses, notes, and
          queue prioritization behind a secure session.
        </p>
        <div className="bg-surface-highlight rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-error" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-primary/20 rounded w-3/4 animate-pulse" />
            <div className="h-2 bg-primary/10 rounded w-1/2" />
            <div className="h-2 bg-primary/15 rounded w-2/3" />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

function StatCard() {
  return (
    <BentoCard className="p-8 md:p-12" index={1}>
      <div className="relative z-10 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
        <div className="relative">
          <span className="text-6xl font-light text-primary">94%</span>
          <p className="text-text-secondary mt-2">Qualification Rate</p>
          <p className="text-sm text-text-muted mt-4">
            Average lead qualification rate with structured briefs
          </p>
        </div>
      </div>
    </BentoCard>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  features,
  index,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features?: string[];
  index: number;
}) {
  return (
    <BentoCard className="p-8 md:p-10" index={index}>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-text-secondary text-sm mb-4">{description}</p>
        {features && (
          <ul className="space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </BentoCard>
  );
}

function WorkflowCard() {
  return (
    <BentoCard className="md:col-span-3 p-8 md:p-12" index={4}>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                The Complete Workflow
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                From public page to private dashboard
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-2 md:justify-end">
            {["Capture", "Qualify", "Convert"].map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-2"
              >
                <div className="px-4 py-2 rounded-full bg-surface-highlight border border-border text-sm text-text-secondary">
                  {step}
                </div>
                {i < 2 && (
                  <svg
                    className="w-4 h-4 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Features</span>
          <h2 className="mt-4 text-text-primary">
            Everything you need to convert
          </h2>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
            A complete system designed for high-ticket HVAC contractors who need
            clarity, control, and conversion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminPortalCard />
          <StatCard />
          <FeatureCard
            title="Real-time Routing"
            description="Instant notifications with smart assignment and status tracking"
            icon={Zap}
            features={[
              "Instant notifications",
              "Smart assignment",
              "Status tracking",
            ]}
            index={2}
          />
          <FeatureCard
            title="Secure by Default"
            description="Enterprise-grade security with SOC 2 compliance"
            icon={Shield}
            features={[
              "SOC 2 compliant",
              "GDPR ready",
              "Enterprise security",
            ]}
            index={3}
          />
          <WorkflowCard />
        </div>
      </div>
    </section>
  );
}
