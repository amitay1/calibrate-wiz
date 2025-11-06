import { motion } from "framer-motion";

interface ProgressHeaderProps {
  completionPercent: number;
  requiredFieldsComplete: number;
  totalRequiredFields: number;
}

export const ProgressHeader = ({ 
  completionPercent, 
  requiredFieldsComplete, 
  totalRequiredFields 
}: ProgressHeaderProps) => {
  const fillHeight = Math.max(0, Math.min(100, completionPercent));
  
  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">Completion Status</span>
        <span className="text-2xl font-bold text-primary">{Math.round(completionPercent)}%</span>
      </div>
      
      {/* Test Tube Container */}
      <div className="flex justify-center items-end mb-4">
        <div className="relative w-24 h-64 flex flex-col items-center">
          {/* Test tube cap */}
          <div className="w-16 h-4 bg-gradient-to-b from-muted to-muted-foreground/20 rounded-t-lg border-2 border-border" />
          
          {/* Test tube body */}
          <div className="relative w-20 h-56 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm rounded-b-3xl border-4 border-border shadow-inner overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute left-1 top-0 w-2 h-full bg-gradient-to-r from-white/40 to-transparent rounded-l-full pointer-events-none" />
            
            {/* Liquid fill with animation */}
            <motion.div
              className="absolute bottom-0 w-full bg-gradient-to-t from-primary via-primary/90 to-primary/70 rounded-b-3xl"
              initial={{ height: 0 }}
              animate={{ height: `${fillHeight}%` }}
              transition={{ 
                duration: 1.2, 
                ease: [0.4, 0, 0.2, 1],
                type: "spring",
                stiffness: 50
              }}
            >
              {/* Liquid surface wave */}
              <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-primary-foreground/20 to-transparent" />
              
              {/* Bubbles animation */}
              {fillHeight > 10 && (
                <>
                  <motion.div
                    className="absolute bottom-[20%] left-[30%] w-2 h-2 bg-white/40 rounded-full"
                    animate={{
                      y: [0, -60],
                      opacity: [0.6, 0],
                      scale: [1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                  />
                  <motion.div
                    className="absolute bottom-[30%] right-[30%] w-1.5 h-1.5 bg-white/30 rounded-full"
                    animate={{
                      y: [0, -50],
                      opacity: [0.5, 0],
                      scale: [1, 0.4]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                </>
              )}
            </motion.div>
            
            {/* Measurement lines */}
            <div className="absolute inset-y-0 left-0 w-full pointer-events-none">
              {[25, 50, 75].map((mark) => (
                <div key={mark} className="absolute left-0 w-full flex items-center" style={{ bottom: `${mark}%` }}>
                  <div className="w-2 h-0.5 bg-muted-foreground/30" />
                  <span className="ml-1 text-[8px] text-muted-foreground/50">{mark}%</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Test tube base */}
          <div className="w-24 h-3 bg-gradient-to-b from-muted-foreground/20 to-muted rounded-b-lg border-2 border-t-0 border-border mt-0.5" />
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {requiredFieldsComplete} of {totalRequiredFields} fields completed
      </p>
    </div>
  );
};
