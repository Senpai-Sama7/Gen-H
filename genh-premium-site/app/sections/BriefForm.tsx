"use client";

import { useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLocalStorage, useIsMobile, usePrefersReducedMotion } from "@/app/hooks/useMousePosition";
import { MagneticButton } from "@/app/components/MagneticButton";
import { cn } from "@/app/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  User,
  Mail,
  Building,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";

const briefSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().min(1, "Please select a budget range"),
  launchDate: z.string().min(1, "Please select a launch target"),
  bottleneck: z
    .string()
    .min(20, "Please describe your current bottleneck (at least 20 characters)"),
});

type BriefFormData = z.infer<typeof briefSchema>;

const projectTypes = [
  { value: "redesign", label: "Website Redesign" },
  { value: "new-build", label: "New Build" },
  { value: "lead-gen", label: "Lead Gen System" },
];

const budgetRanges = [
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k+", label: "$50,000+" },
];

const steps = [
  { id: 1, title: "Basics", icon: User },
  { id: 2, title: "Scope", icon: FileText },
  { id: 3, title: "Timeline", icon: Calendar },
  { id: 4, title: "Review", icon: Check },
];

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex-1">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              index + 1 <= currentStep
                ? "bg-primary"
                : "bg-surface-highlight"
            )}
          />
        </div>
      ))}
    </div>
  );
}

function Step1Basics({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<BriefFormData>>["register"];
  errors: Record<string, { message?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold text-text-primary">
        Let&apos;s start with basics
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Your Name
          </label>
          <input
            {...register("name")}
            placeholder="John Smith"
            className={cn(
              "input-field",
              errors.name && "border-error focus:border-error focus:ring-error"
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Company
          </label>
          <input
            {...register("company")}
            placeholder="Acme HVAC"
            className={cn(
              "input-field",
              errors.company && "border-error focus:border-error focus:ring-error"
            )}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-error">{errors.company.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="john@acmehvac.com"
            className={cn(
              "input-field",
              errors.email && "border-error focus:border-error focus:ring-error"
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Step2Scope({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<BriefFormData>>["register"];
  errors: Record<string, { message?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold text-text-primary">
        Project scope
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Project Type
          </label>
          <select
            {...register("projectType")}
            className={cn(
              "input-field appearance-none cursor-pointer",
              errors.projectType && "border-error focus:border-error focus:ring-error"
            )}
          >
            <option value="">Select a project type</option>
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.projectType && (
            <p className="mt-1 text-sm text-error">
              {errors.projectType.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Budget Range
          </label>
          <select
            {...register("budget")}
            className={cn(
              "input-field appearance-none cursor-pointer",
              errors.budget && "border-error focus:border-error focus:ring-error"
            )}
          >
            <option value="">Select a budget range</option>
            {budgetRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          {errors.budget && (
            <p className="mt-1 text-sm text-error">{errors.budget.message}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Step3Timeline({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<BriefFormData>>["register"];
  errors: Record<string, { message?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold text-text-primary">
        Timeline & Details
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Launch Target
          </label>
          <input
            {...register("launchDate")}
            type="date"
            className={cn(
              "input-field",
              errors.launchDate && "border-error focus:border-error focus:ring-error"
            )}
          />
          {errors.launchDate && (
            <p className="mt-1 text-sm text-error">
              {errors.launchDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-secondary uppercase tracking-wider mb-2">
            Current Bottleneck
          </label>
          <textarea
            {...register("bottleneck")}
            rows={4}
            placeholder="We're getting traffic but no qualified calls. Need a system that screens leads automatically."
            className={cn(
              "input-field resize-none",
              errors.bottleneck && "border-error focus:border-error focus:ring-error"
            )}
          />
          {errors.bottleneck && (
            <p className="mt-1 text-sm text-error">
              {errors.bottleneck.message}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Step4Review({ data }: { data: BriefFormData }) {
  const projectLabel =
    projectTypes.find((t) => t.value === data.projectType)?.label ||
    data.projectType;
  const budgetLabel =
    budgetRanges.find((r) => r.value === data.budget)?.label || data.budget;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold text-text-primary">
        Review & Submit
      </h3>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-surface-highlight border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Name
              </span>
              <p className="text-text-primary">{data.name}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Company
              </span>
              <p className="text-text-primary">{data.company}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Email
              </span>
              <p className="text-text-primary">{data.email}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Project Type
              </span>
              <p className="text-text-primary">{projectLabel}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Budget
              </span>
              <p className="text-text-primary">{budgetLabel}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Launch Target
              </span>
              <p className="text-text-primary">{data.launchDate || "Not specified"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Bottleneck
              </span>
              <p className="text-text-primary">{data.bottleneck}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessState({ briefId }: { briefId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
      >
        <Check className="w-10 h-10 text-success" />
      </motion.div>
      <h3 className="text-2xl font-semibold text-text-primary mb-2">
        Brief Submitted!
      </h3>
      <p className="text-text-secondary mb-4">
        Your brief has been received and is being processed.
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-surface-highlight border border-border">
        <span className="text-sm text-text-muted">Brief ID: </span>
        <span className="text-primary font-mono">{briefId}</span>
      </div>
    </motion.div>
  );
}

export function BriefForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [briefId, setBriefId] = useState("");
  const reducedMotion = usePrefersReducedMotion();

  const [savedData, setSavedData] = useLocalStorage<BriefFormData | null>(
    "brief-form-data",
    null
  );

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: savedData || {
      name: "",
      company: "",
      email: "",
      projectType: "",
      budget: "",
      launchDate: "",
      bottleneck: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<BriefFormData> = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          company: data.company,
          email: data.email,
          phone: "",
          projectType: data.projectType,
          budgetBand: data.budget,
          launchWindow: data.launchDate,
          goals: data.bottleneck,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBriefId(result.id || `GH-${Date.now()}`);
        setIsSuccess(true);

        if (!reducedMotion) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#d4af37", "#b87333", "#10b981"],
          });
        }

        localStorage.removeItem("brief-form-data");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const fallbackId = `GH-${Date.now()}`;
      setBriefId(fallbackId);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof BriefFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["name", "company", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["projectType", "budget"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["launchDate", "bottleneck"];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      const currentData = getValues();
      setSavedData(currentData);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (isSuccess) {
    return (
      <section id="brief" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div className="glass-panel p-8 md:p-12">
            <SuccessState briefId={briefId} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="brief" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="eyebrow">Start Your Brief</span>
          <h2 className="mt-4 text-text-primary">Let&apos;s build something</h2>
          <p className="mt-4 text-text-secondary">
            Tell us about your project and we&apos;ll get back to you within 24
            hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-12"
        >
          <ProgressBar currentStep={currentStep} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <Step1Basics key="step1" register={register} errors={errors} />
              )}
              {currentStep === 2 && (
                <Step2Scope key="step2" register={register} errors={errors} />
              )}
              {currentStep === 3 && (
                <Step3Timeline
                  key="step3"
                  register={register}
                  errors={errors}
                />
              )}
              {currentStep === 4 && (
                <Step4Review key="step4" data={getValues()} />
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="primary-button"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              ) : (
                <MagneticButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Generate Brief ID"
                  )}
                </MagneticButton>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
