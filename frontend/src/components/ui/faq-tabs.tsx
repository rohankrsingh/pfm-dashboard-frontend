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
        "relative overflow-hidden bg-card px-6 py-20 text-foreground border-t border-border/50",
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
    <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary-neutral/30 rounded-full px-3.5 py-1 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      <span className="text-[10px] font-bold text-success uppercase tracking-wider">
        {subtitle}
      </span>
    </div>
    <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
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
          "relative overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 border border-border/50",
          selected === key
            ? "bg-primary text-white"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
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
        "rounded-2xl border border-border/50 transition-all duration-300",
        isOpen ? "bg-primary/20/35 border-primary-neutral/40" : "bg-[#FAFBF9]/40 hover:bg-[#FAFBF9]/80"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left group"
      >
        <span
          className={cn(
            "text-base font-bold tracking-tight transition-colors",
            isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
              isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[95%]">{answer}</p>
      </motion.div>
    </motion.div>
  );
};