import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background"
        >
          <div className="relative">
            {/* Animated background circles */}
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0.1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <div className="absolute inset-0 rounded-full bg-primary blur-3xl" />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
            >
              <div className="absolute inset-0 rounded-full bg-accent blur-2xl" />
            </motion.div>

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              {/* Logo */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="relative inline-block"
              >
                <div className="relative">
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Logo container */}
                  <div className="relative bg-gradient-to-br from-primary to-accent p-8 rounded-2xl shadow-2xl">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="space-y-2"
                    >
                      <div className="text-5xl font-bold text-white tracking-tight">
                        SCAN
                      </div>
                      <div className="text-3xl font-semibold text-white/90">
                        MASTER
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-semibold text-foreground">
                  Inspection Pro
                </h2>
                <p className="text-muted-foreground text-sm">
                  Professional Ultrasonic Inspection System
                </p>
              </motion.div>

              {/* Loading indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="flex justify-center pt-4"
              >
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
