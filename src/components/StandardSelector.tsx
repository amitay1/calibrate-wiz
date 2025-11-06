import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardType } from "@/types/techniqueSheet";
import { Lock, Check } from "lucide-react";
import { useStandardAccess } from "@/hooks/useStandardAccess";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface StandardSelectorProps {
  value: StandardType;
  onChange: (value: StandardType) => void;
}

const standards = [
  { 
    value: "AMS-STD-2154E", 
    label: "AMS-STD-2154E (Revision E)", 
    description: "Aerospace Materials Specification - Ultrasonic Inspection" 
  },
  { 
    value: "ASTM-A388", 
    label: "ASTM A388/A388M", 
    description: "Ultrasonic Examination of Heavy Steel Forgings" 
  },
] as const;

export const StandardSelector = ({ value, onChange }: StandardSelectorProps) => {
  const navigate = useNavigate();
  const { hasAccess, isLoading } = useStandardAccess(value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground uppercase tracking-wide">Standard</label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full bg-card border-border text-sm">
          <SelectValue placeholder="Select standard..." />
        </SelectTrigger>
        <SelectContent>
          {standards.map((standard) => {
            const isCurrentStandard = standard.value === value;
            const isLocked = isCurrentStandard && !hasAccess && !isLoading;
            const hasCurrentAccess = isCurrentStandard && hasAccess;
            
            return (
              <SelectItem 
                key={standard.value} 
                value={standard.value}
                disabled={isLocked}
                className="py-2"
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="flex flex-col flex-1 gap-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-xs truncate">{standard.label}</span>
                      {isLocked && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                      {hasCurrentAccess && <Check className="h-3 w-3 text-success flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                      {standard.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <AnimatePresence mode="wait">
        {!hasAccess && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-md border">
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    delay: 0.2,
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </motion.div>
                <span className="text-xs text-muted-foreground">
                  Locked - Purchase to unlock
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => navigate('/standards')}
                  className="w-full text-xs h-7"
                >
                  Unlock
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
