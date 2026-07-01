"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "motion/react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icons?: boolean;
  href?: string;
  feature?:
    | "chart"
    | "counter"
    | "code"
    | "timeline"
    | "spotlight"
    | "icons"
    | "typing"
    | "metrics";
  spotlightItems?: string[];
  timeline?: Array<{ year: string; event: string }>;
  code?: string;
  codeLang?: string;
  typingText?: string;
  metrics?: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
  statistic?: {
    value: string;
    label: string;
    start?: number;
    end?: number;
    suffix?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "plaid",
    title: "Secure Plaid Account Syncing",
    description:
      "Connect checking, savings, and credit card accounts securely in a sandbox environment. The token exchange flow links institutions in seconds.",
    href: "#",
    feature: "spotlight",
    spotlightItems: [
      "Sandbox credential linking flow",
      "Secure public_token exchange flow",
      "Access token database encryption",
      "Real-time ledger balance syncing",
      "Multi-institution account matching",
    ],
    size: "lg",
  },
  {
    id: "auth",
    title: "JWT & Password Encryption",
    description:
      "All user credentials are encrypted on the backend, and endpoints are protected via JWT-based authentication middleware.",
    href: "#",
    feature: "encryption",
    size: "md",
  },
  {
    id: "recharts",
    title: "Recharts Visualizations",
    description:
      "Generate dynamic insights on category spending percentages and monthly income vs. expense breakdowns.",
    href: "#",
    feature: "metrics",
    metrics: [
      { label: "Housing & Rent", value: 40, color: "violet" },
      { label: "Groceries & Food", value: 25, color: "emerald" },
      { label: "Utilities", value: 15, color: "blue" },
      { label: "Entertainment", value: 10, color: "amber" },
    ],
    size: "md",
  },
  {
    id: "categorization",
    title: "Smart Merchant Parsing",
    description:
      "Automatically categorize transactions (e.g. utilities, dining, rent, shopping) based on Plaid merchant name mappings.",
    href: "#",
    feature: "counter",
    statistic: {
      value: "98.4",
      label: "Automated Category Matching Accuracy",
      start: 0,
      end: 98.4,
      suffix: "%",
    },
    size: "md",
  },
  {
    id: "roadmap",
    title: "PFM Milestone Roadmap",
    description:
      "Our week-by-week timeline of deliverables and integrations developed for the final showcase.",
    href: "#",
    feature: "timeline",
    timeline: [
      { year: "Week 1", event: "Express server layout, User Model, JWT Authentication" },
      { year: "Week 2", event: "Plaid Link setup, Sandbox token exchanges, Balance endpoint" },
      { year: "Week 3", event: "Recharts Pie/Bar graphs, Auto-categorization, Limits setup" },
      { year: "Week 4", event: "Manual transaction overrides, testing suite, UI/UX polish" },
    ],
    size: "sm",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const SpotlightFeature = ({ items }: { items: string[] }) => (
  <ul className="mt-2 space-y-1.5 text-left">
    {items.map((item, index) => (
      <motion.li
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
        transition={{ delay: 0.1 * index }}
      >
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
        <span className="text-muted-foreground text-sm font-semibold">
          {item}
        </span>
      </motion.li>
    ))}
  </ul>
);

const CounterAnimation = ({
  start,
  end,
  suffix = "",
}: {
  start: number;
  end: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easedProgress = 1 - (1 - progress) ** 3;
      const current = start + (end - start) * easedProgress;

      setCount(Math.min(current, end));

      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [start, end]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="font-black text-3xl text-foreground">
        {count.toFixed(1).replace(/\.0$/, "")}
      </span>
      <span className="font-semibold text-foreground text-xl">
        {suffix}
      </span>
    </div>
  );
};

const TimelineFeature = ({
  timeline,
}: {
  timeline: Array<{ year: string; event: string }>;
}) => (
  <div className="relative mt-3 text-left">
    <div className="absolute top-0 bottom-0 left-[9px] w-[2px] bg-primary/10" />
    {timeline.map((item) => (
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="relative mb-3 flex gap-3"
        initial={{ opacity: 0, x: -10 }}
        key={`timeline-${item.year}-${item.event
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
        transition={{
          delay: 0.1,
        }}
      >
        <div className="z-10 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 border-border bg-primary/20" />
        <div>
          <div className="font-bold text-foreground text-sm">
            {item.year}
          </div>
          <div className="text-muted-foreground text-xs">
            {item.event}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const EncryptionFeature = () => {
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border border-border/50 bg-[#FAFBF9]/65 p-4 text-left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Password Hashing</span>
          <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Secure</span>
        </div>
        <div className="font-mono text-[11px] text-foreground truncate bg-card rounded-lg p-2.5 border border-border/50">
          $2b$12$K8xJ7rM2e9...9zP1qW
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-[#FAFBF9]/65 p-4 text-left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Access Token</span>
          <span className="text-[10px] font-bold text-success bg-primary/20 px-2 py-0.5 rounded-full">JWT Signed</span>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground truncate bg-card rounded-lg p-2.5 border border-border/50 flex items-center justify-between">
          <span className="text-success font-semibold">bearer.token.sig</span>
          <span className="text-[9px] font-bold text-muted-foreground">Expires 15m</span>
        </div>
      </div>
    </div>
  );
};

const MetricsFeature = ({
  metrics,
}: {
  metrics: Array<{
    label: string;
    value: number;
    suffix?: string;
    color?: string;
  }>;
}) => {
  const getColorClass = (color = "emerald") => {
    const colors = {
      emerald: "bg-emerald-500",
      blue: "bg-cyan-500",
      violet: "bg-violet-500",
      amber: "bg-amber-500",
      rose: "bg-rose-500",
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="mt-3 space-y-3 text-left">
      {metrics.map((metric, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
          initial={{ opacity: 0, y: 10 }}
          key={`metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}
          transition={{ delay: 0.15 * index }}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
              {metric.label === "Uptime" && <Clock className="h-3.5 w-3.5" />}
              {metric.label === "Response time" && (
                <Zap className="h-3.5 w-3.5" />
              )}
              {metric.label === "Cost reduction" && (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {metric.label}
            </div>
            <div className="font-bold text-muted-foreground">
              {metric.value}
              {metric.suffix || "%"}
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f4f5f3]">
            <motion.div
              animate={{
                width: `${Math.min(100, metric.value)}%`,
              }}
              className={`h-full rounded-full ${getColorClass(metric.color)}`}
              initial={{ width: 0 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.15 * index,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

function ManualTransactionQuickAdder() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [transactions, setTransactions] = useState([
    { description: "Coffee Shop", amount: 4.5, category: "Food" },
    { description: "Gym Membership", amount: 45.0, category: "Utilities" },
  ]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    setTransactions([
      { description, amount: parseFloat(amount), category },
      ...transactions,
    ]);
    setDescription("");
    setAmount("");
  };

  return (
    <div className="w-full mt-3 flex flex-col md:flex-row gap-4 text-left">
      <form
        onSubmit={handleAdd}
        className="flex-1 flex flex-col gap-2 bg-[#F3F4F6] p-3 rounded-2xl border border-border/50"
      >
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-card border-none outline-none text-xs text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-xl text-left shadow-sm"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Amount ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-card border-none outline-none text-xs text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-xl text-left shadow-sm"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-card border-none outline-none text-xs text-muted-foreground px-3 py-2 rounded-xl text-left shadow-sm appearance-none cursor-pointer"
          >
            <option value="Food">Food</option>
            <option value="Housing">Housing</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-primary text-white text-xs font-bold py-2 rounded-xl hover:bg-primary/90/90 active:scale-[0.97] transition-all cursor-pointer text-center shadow-sm"
        >
          + Add Transaction
        </button>
      </form>
      <div className="flex-1 flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
        {transactions.map((tx, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-xs bg-card border border-border/50 rounded-xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <div className="flex flex-col">
              <span className="font-bold text-foreground">{tx.description}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                {tx.category}
              </span>
            </div>
            <span className="font-black text-destructive">
              -${tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetLimitsProgress() {
  const budgets = [
    { category: "Groceries", limit: 300, spent: 270, color: "bg-warning" },
    { category: "Dining Out", limit: 200, spent: 110, color: "bg-primary" },
    {
      category: "Entertainment",
      limit: 150,
      spent: 145,
      color: "bg-destructive animate-pulse",
    },
  ];

  return (
    <div className="w-full mt-3 flex flex-col gap-3 text-left">
      <div className="space-y-3">
        {budgets.map((b, i) => {
          const percent = Math.min(100, (b.spent / b.limit) * 100);
          const isWarning = percent >= 90;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isWarning ? "bg-destructive" : "bg-primary"
                    }`}
                  />
                  {b.category}
                </span>
                <span className="font-semibold text-muted-foreground">
                  ${b.spent}{" "}
                  <span className="text-muted-foreground">/ ${b.limit}</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f4f5f3]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${b.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {isWarning && (
                <p className="text-[9px] font-bold text-destructive flex items-center gap-1 leading-none mt-1">
                  ⚠️ Limit Warning: {b.category} is almost depleted!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BentoCard = ({ item }: { item: BentoItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      className="h-full"
      onHoverEnd={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      variants={fadeInUp}
      whileHover={{ y: -5 }}
    >
      <Link
        aria-label={`${item.title} - ${item.description}`}
        className="group relative flex h-full flex-col gap-4 rounded-3xl border border-border/50 bg-gradient-to-b from-white to-[#F9FAF8] p-6 shadow-[0_4px_20px_rgba(14,15,12,0.02)] backdrop-blur-[4px] transition-all duration-500 ease-out before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/10 before:via-white/20 before:to-transparent before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-0 after:z-[-1] after:rounded-3xl after:bg-card hover:border-border hover:bg-gradient-to-b hover:from-white hover:to-[#F3F4F1] hover:shadow-[0_8px_30px_rgba(14,15,12,0.05)] hover:backdrop-blur-[6px]"
        href={item.href || "#"}
        tabIndex={0}
      >
        <div
          className="relative z-10 flex h-full flex-col gap-3"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex flex-1 flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xl tracking-tight transition-colors duration-300 group-hover:text-success">
                {item.title}
              </h3>
              <div className="text-success opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <p className="text-muted-foreground text-sm tracking-tight font-medium text-left">
              {item.description}
            </p>

            {/* Feature specific content */}
            {item.feature === "spotlight" && item.spotlightItems && (
              <SpotlightFeature items={item.spotlightItems} />
            )}

            {item.feature === "counter" && item.statistic && (
              <div className="mt-auto pt-3 text-left">
                <span className="font-semibold text-muted-foreground text-xs block mb-1">
                  {item.statistic.label}
                </span>
                <CounterAnimation
                  end={item.statistic.end || 100}
                  start={item.statistic.start || 0}
                  suffix={item.statistic.suffix}
                />
              </div>
            )}

            {item.feature === "timeline" && item.timeline && (
              <TimelineFeature timeline={item.timeline} />
            )}

            {item.feature === "encryption" && (
              <EncryptionFeature />
            )}

            {item.feature === "metrics" && item.metrics && (
              <MetricsFeature metrics={item.metrics} />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function BentoGrid() {
  return (
    <section className="relative overflow-hidden bg-card py-20 border-t border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary-neutral/30 rounded-full px-3.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">
              Project Deliverables
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Engineered for Cash Flow Clarity
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            A comprehensive overview of our functional personal finance dashboard, database architecture, and integration layers.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          className="grid gap-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true }}
          whileInView="visible"
        >
          {/* Row 1: Plaid sync (spans 2) & JWT Security (spans 1) */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div className="md:col-span-2" variants={fadeInUp}>
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>

          {/* Row 2: Recharts Visualizations (spans 1), Merchant Parsing (spans 1), Milestone Roadmap (spans 1) */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[2]} />
            </motion.div>
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[3]} />
            </motion.div>
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[4]} />
            </motion.div>
          </div>

          {/* Row 3: Manual Ledger Control (spans 2) & Custom Category Budgets (spans 1) */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-white to-[#F9FAF8] p-6 shadow-[0_4px_20px_rgba(14,15,12,0.02)] backdrop-blur-[4px] hover:border-border hover:bg-gradient-to-b hover:from-white hover:to-[#F3F4F1] hover:shadow-[0_8px_30px_rgba(14,15,12,0.05)] md:col-span-2 text-left"
              variants={fadeInUp}
            >
              <div className="flex flex-col h-full justify-between gap-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-black text-foreground text-xl tracking-tight">
                      Manual Ledger Controls
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm tracking-tight font-medium">
                    Add custom manual transactions to override or complement bank-synced transactions. Type details below to update the demo ledger.
                  </p>
                </div>
                <ManualTransactionQuickAdder />
              </div>
            </motion.div>

            <motion.div
              className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-white to-[#F9FAF8] p-6 shadow-[0_4px_20px_rgba(14,15,12,0.02)] backdrop-blur-[4px] hover:border-border hover:bg-gradient-to-b hover:from-white hover:to-[#F3F4F1] hover:shadow-[0_8px_30px_rgba(14,15,12,0.05)] md:col-span-1 text-left"
              variants={fadeInUp}
            >
              <div className="flex flex-col h-full justify-between gap-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-black text-foreground text-xl tracking-tight">
                      Monthly Budget Limits
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm tracking-tight font-medium">
                    Monitor budget consumption by category. The PFM tracks spent-to-limit ratios and raises warnings for over-limit risks.
                  </p>
                </div>
                <BudgetLimitsProgress />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
