import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import scanMasterLogo from '@/assets/scan-master-logo.png';

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
                initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative inline-block"
              >
                <div className="relative">
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute -inset-8 rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ filter: 'blur(20px)' }}
                  />
                  
                  {/* Inner pulse effect */}
                  <motion.div
                    className="absolute -inset-4 rounded-full bg-primary/30"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Logo container with glass effect */}
                  <motion.div
                    className="relative bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-primary/30"
                    animate={{
                      boxShadow: [
                        '0 0 30px rgba(74, 144, 226, 0.3)',
                        '0 0 60px rgba(74, 144, 226, 0.6)',
                        '0 0 30px rgba(74, 144, 226, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.img
                      src={scanMasterLogo}
                      alt="Scan Master Logo"
                      className="w-64 h-auto"
                      initial={{ filter: 'brightness(0.5)' }}
                      animate={{ filter: 'brightness(1)' }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    />
                  </motion.div>

                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      initial={{ 
                        x: 0, 
                        y: 0,
                        opacity: 0 
                      }}
                      animate={{
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 100],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 100],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: 1 + i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                    />
                  ))}
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
