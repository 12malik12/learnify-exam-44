
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  className,
  iconClassName,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-xl border p-6 transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-1",
        className
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20",
          iconClassName
        )}
      >
        <Icon className="size-6" />
      </div>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
