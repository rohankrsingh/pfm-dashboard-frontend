import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#0e0f0c",
          border: "1px solid rgba(14,15,12,0.10)",
          borderRadius: "16px",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "13px",
          fontWeight: "600",
          padding: "14px 16px",
          boxShadow: "0 4px 24px rgba(14,15,12,0.08), 0 1px 4px rgba(14,15,12,0.04)",
        },
        classNames: {
          toast: "group/toast",
          title: "font-bold text-[13px] text-foreground",
          description: "text-muted-foreground text-xs mt-0.5",
          closeButton:
            "!bg-muted !border-border !text-muted-foreground hover:!text-foreground hover:!bg-background rounded-full cursor-pointer",
          success:
            "!border-l-4 !border-l-[#2ead4b]",
          error:
            "!border-l-4 !border-l-[#d03238]",
          warning:
            "!border-l-4 !border-l-[#ffd11a]",
          info:
            "!border-l-4 !border-l-[#38c8ff]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

