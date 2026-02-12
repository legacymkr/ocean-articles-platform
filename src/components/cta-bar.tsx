import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Sparkles, ArrowRight, Brain, Zap } from "lucide-react";

interface CTABarProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  variant?: "primary" | "secondary" | "ai";
  icon?: "sparkles" | "brain" | "zap" | "arrow";
  className?: string;
}

export function CTABar({
  title,
  description,
  buttonText,
  buttonHref,
  onButtonClick,
  variant = "primary",
  icon = "sparkles",
  className = "",
}: CTABarProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20";
      case "ai":
        return "bg-gradient-to-r from-primary/15 to-secondary/15 border-primary/30";
      default:
        return "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20";
    }
  };

  const getIcon = () => {
    switch (icon) {
      case "brain":
        return <Brain className="mr-2 h-5 w-5" />;
      case "zap":
        return <Zap className="mr-2 h-5 w-5" />;
      case "arrow":
        return <ArrowRight className="mr-2 h-5 w-5" />;
      default:
        return <Sparkles className="mr-2 h-5 w-5" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "secondary":
        return "bg-secondary hover:bg-secondary/90 text-secondary-foreground";
      case "ai":
        return "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  return (
    <ScrollReveal>
      <section className={`py-16 px-4 border-t border-b ${getVariantStyles()} ${className}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-glow-primary">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground font-body mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {buttonHref ? (
              <Button
                asChild
                size="lg"
                className={`text-lg px-8 py-6 ripple-effect ${getButtonVariant()}`}
              >
                <a href={buttonHref}>
                  {getIcon()}
                  {buttonText}
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={onButtonClick}
                className={`text-lg px-8 py-6 ripple-effect ${getButtonVariant()}`}
              >
                {getIcon()}
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
