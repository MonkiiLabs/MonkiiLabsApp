import { motion } from "framer-motion";
import { AGENT_STATE_META, stateForPower } from "@/features/monkii/data";

interface PowerMeterProps {
  power: number;
  size?: "sm" | "lg";
  showLabel?: boolean;
}

const PowerMeter = ({ power, size = "sm", showLabel = true }: PowerMeterProps) => {
  const state = stateForPower(power);
  const meta = AGENT_STATE_META[state];
  const fill =
    state === "thriving" ? "bg-human-green" : state === "idle" ? "bg-warning" : "bg-coral";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-extrabold ${meta.text}`}>
            {meta.emoji} {meta.label}
          </span>
          <span className="text-xs font-extrabold text-claw-charcoal tabular-nums">
            {Math.round(power)}% power
          </span>
        </div>
      )}
      <div
        className={`w-full ${size === "lg" ? "h-4" : "h-2.5"} rounded-full bg-cream-dark border-2 border-dashboard-border overflow-hidden`}
        role="progressbar"
        aria-valuenow={Math.round(power)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Agent power level"
      >
        <motion.div
          className={`h-full ${fill} rounded-full`}
          animate={{ width: `${Math.max(2, Math.min(100, power))}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </div>
    </div>
  );
};

export default PowerMeter;
