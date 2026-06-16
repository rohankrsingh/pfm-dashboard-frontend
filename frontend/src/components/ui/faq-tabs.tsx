import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Main reusable FAQ component
export const FAQ = ({ 
  title = "Frequently Asked Questions",
  subtitle = "Support & Help",
  categories,
  faqData,
  showTabs = false,
  className,
  ...props 
}: {
  title?: string;
  subtitle?: string;
  categories?: Record<string, string>;
  faqData: Record<string, Array<{ question: string; answer: string }>> | Array<{ question: string; answer: string }>;
  showTabs?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const categoryKeys = categories ? Object.keys(categories) : [];
  const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0] || "");

  const isFlatArray = Array.isArray(faqData);

  return (
    <section 
      className={cn(
        "relative overflow-hidden bg-white px-6 py-20 text-wise-ink border-t border-wise-ink/5",
        className
      )}
      {...props}
    >
      <FAQHeader title={title} subtitle={subtitle} />
      
      {showTabs && categories && !isFlatArray && (
        <FAQTabs 
          categories={categories}
          selected={selectedCategory} 
          setSelected={setSelectedCategory} 
        />
      )}

      <div className="mx-auto mt-12 max-w-3xl relative z-10">
        {isFlatArray ? (
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {showTabs ? (
              Object.entries(faqData).map(([category, questions]) => {
                if (selectedCategory === category) {
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {questions.map((faq, index) => (
                        <FAQItem key={index} {...faq} />
                      ))}
                    </motion.div>
                  );
                }
                return null;
              })
            ) : (
              <div className="space-y-4">
                {Object.values(faqData).flat().map((faq, index) => (
                  <FAQItem key={index} {...faq} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

const FAQHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="relative z-10 flex flex-col items-center justify-center text-center">
    <div className="inline-flex items-center gap-1.5 bg-wise-green-pale border border-wise-green-neutral/30 rounded-full px-3.5 py-1 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-wise-positive animate-pulse" />
      <span className="text-[10px] font-bold text-wise-positive-deep uppercase tracking-wider">
        {subtitle}
      </span>
    </div>
    <h2 className="text-3xl md:text-5xl font-black text-wise-ink tracking-tight">
      {title}
    </h2>
  </div>
);

const FAQTabs = ({ 
  categories, 
  selected, 
  setSelected 
}: { 
  categories: Record<string, string>; 
  selected: string; 
  setSelected: (key: string) => void 
}) => (
  <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 mt-8">
    {Object.entries(categories).map(([key, label]) => (
      <button
        key={key}
        onClick={() => setSelected(key)}
        className={cn(
          "relative overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 border border-wise-ink/5",
          selected === key
            ? "bg-wise-ink text-white"
            : "bg-wise-canvas-soft/50 text-wise-body hover:bg-wise-canvas-soft hover:text-wise-ink"
        )}
      >
        <span className="relative z-10">{label}</span>
      </button>
    ))}
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className={cn(
        "rounded-2xl border border-wise-ink/5 transition-all duration-300",
        isOpen ? "bg-wise-green-pale/35 border-wise-green-neutral/40" : "bg-[#FAFBF9]/40 hover:bg-[#FAFBF9]/80"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left group"
      >
        <span
          className={cn(
            "text-base font-bold tracking-tight transition-colors",
            isOpen ? "text-wise-ink" : "text-wise-body group-hover:text-wise-ink"
          )}
        >
          {question}
        </span>
        <motion.span
          variants={{
            open: { rotate: "45deg" },
            closed: { rotate: "0deg" },
          }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <Plus
            className={cn(
              "h-4 w-4 transition-colors",
              isOpen ? "text-wise-ink" : "text-wise-body group-hover:text-wise-ink"
            )}
          />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ 
          height: isOpen ? "auto" : "0px", 
          marginBottom: isOpen ? "20px" : "0px" 
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden px-5"
      >
        <p className="text-sm text-wise-body leading-relaxed max-w-[95%]">{answer}</p>
      </motion.div>
    </motion.div>
  );
};