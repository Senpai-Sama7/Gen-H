"use client";

import { useMemo, useState } from "react";

type StageKey = "attract" | "qualify" | "convert";

type Props = {
  trackedCount: number;
  thisWeek: number;
  latestCompanies: string[];
};

const stages: Record<StageKey, { label: string; headline: string; detail: string; metrics: { label: string; value: number }[] }> = {
  attract: {
    label: "Attract",
    headline: "Show where premium demand enters your pipeline.",
    detail: "A clear commercial surface, sharp offer structure, and premium positioning reduce confusion before a prospect ever calls.",
    metrics: [
      { label: "Positioning", value: 86 },
      { label: "Trust", value: 78 },
      { label: "Intent", value: 72 }
    ]
  },
  qualify: {
    label: "Qualify",
    headline: "Separate price shoppers from real buyers.",
    detail: "The site clarifies budget, urgency, and scope so your team sees better conversations instead of weak inbound noise.",
    metrics: [
      { label: "Fit score", value: 74 },
      { label: "Urgency", value: 68 },
      { label: "Clarity", value: 82 }
    ]
  },
  convert: {
    label: "Convert",
    headline: "Move from captured inquiry to booked revenue.",
    detail: "Operators can process demand inside the admin portal instead of juggling inboxes, forms, and ad-hoc notes.",
    metrics: [
      { label: "Follow-up", value: 88 },
      { label: "Close rate", value: 66 },
      { label: "Visibility", value: 91 }
    ]
  }
};

export function RevenueVisualizer({ trackedCount, thisWeek, latestCompanies }: Props) {
  const [activeStage, setActiveStage] = useState<StageKey>("qualify");
  const current = stages[activeStage];

  const liveNames = useMemo(() => latestCompanies.slice(0, 3), [latestCompanies]);

  return (
    <div className="experience-panel">
      <div className="experience-tabs">
        {(Object.keys(stages) as StageKey[]).map((stage) => (
          <button
            key={stage}
            type="button"
            className={`experience-tab ${activeStage === stage ? "active" : ""}`}
            onClick={() => setActiveStage(stage)}
          >
            {stages[stage].label}
          </button>
        ))}
      </div>

      <div className="experience-copy">
        <span className="eyebrow">Interactive funnel</span>
        <h3>{current.headline}</h3>
        <p>{current.detail}</p>
      </div>

      <div className="signal-bars" aria-label="Pipeline visualizer">
        {current.metrics.map((metric) => (
          <div key={metric.label} className="signal-track">
            <div className="signal-track-head">
              <span>{metric.label}</span>
              <strong>{metric.value}%</strong>
            </div>
            <div className="signal-rail">
              <div className="signal-fill" style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="visualizer-foot">
        <div className="visualizer-stat">
          <span>Tracked live</span>
          <strong>{trackedCount.toString().padStart(2, "0")}</strong>
        </div>
        <div className="visualizer-stat">
          <span>This week</span>
          <strong>{thisWeek.toString().padStart(2, "0")}</strong>
        </div>
      </div>

      <div className="visualizer-strip">
        {liveNames.length > 0 ? (
          liveNames.map((company) => <span key={company}>{company}</span>)
        ) : (
          <span>New inquiries land here as soon as the form is submitted.</span>
        )}
      </div>
    </div>
  );
}
