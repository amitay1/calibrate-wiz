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
      setTimeout(onComplete, 800);
    }, 5000);

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
                  {/* Logo container - circular radar style */}
                  <motion.div
                    className="relative overflow-hidden rounded-full p-16"
                    style={{
                      background: 'radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 50%, transparent 100%)',
                    }}
                  >
                    {/* Advanced Ultrasonic Scan Lines - Multiple Layers */}
                    {/* Fast scan lines */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={`fast-scan-${i}`}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                        style={{
                          filter: 'blur(2px)',
                          boxShadow: '0 0 15px rgba(74, 144, 226, 0.9)',
                        }}
                        animate={{
                          y: [-30, 340],
                          opacity: [0, 0.8, 1, 0.8, 0],
                          scaleX: [0.5, 1, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                    
                    {/* Slow powerful scan lines */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`slow-scan-${i}`}
                        className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
                        style={{
                          filter: 'blur(3px)',
                          boxShadow: '0 0 20px rgba(255, 215, 0, 1)',
                        }}
                        animate={{
                          y: [-20, 340],
                          opacity: [0, 1, 1, 0],
                          scaleX: [0.8, 1.2, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 4.5,
                          delay: i * 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                    
                    {/* Radar sweep effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(74, 144, 226, 0.3) 30deg, transparent 60deg)',
                        filter: 'blur(4px)',
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    
                    {/* Data points scanning effect */}
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={`data-point-${i}`}
                        className="absolute w-1 h-1 bg-primary rounded-full"
                        style={{
                          left: `${(i * 8.33)}%`,
                          filter: 'blur(0.5px)',
                          boxShadow: '0 0 4px rgba(74, 144, 226, 1)',
                        }}
                        animate={{
                          y: [-10, 330],
                          opacity: [0, 1, 1, 0],
                          scale: [0, 1.5, 1, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          delay: i * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                    
                    {/* Horizontal interference lines */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={`interference-${i}`}
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                        style={{
                          top: `${25 * (i + 1)}%`,
                        }}
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                          scaleX: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                    
                    {/* Wave propagation effect */}
                    <motion.div
                      className="absolute left-0 right-0 h-24"
                      style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(74, 144, 226, 0.2), transparent)',
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        y: [-50, 350],
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    
                    {/* Logo with enhanced SM highlight and sharpness */}
                    <div className="relative z-10">
                      <motion.img
                        src={scanMasterLogo}
                        alt="Scan Master Logo"
                        className="w-64 h-auto"
                        initial={{ filter: 'brightness(0.5) contrast(1) drop-shadow(0 0 0px rgba(74, 144, 226, 0))' }}
                        animate={{ 
                          filter: [
                            'brightness(1.3) contrast(1.3) saturate(1.2) drop-shadow(0 0 30px rgba(74, 144, 226, 1)) drop-shadow(0 0 15px rgba(74, 144, 226, 0.8))',
                            'brightness(1.6) contrast(1.4) saturate(1.3) drop-shadow(0 0 50px rgba(74, 144, 226, 1.2)) drop-shadow(0 0 25px rgba(74, 144, 226, 1))',
                            'brightness(1.3) contrast(1.3) saturate(1.2) drop-shadow(0 0 30px rgba(74, 144, 226, 1)) drop-shadow(0 0 15px rgba(74, 144, 226, 0.8))',
                          ]
                        }}
                        transition={{ 
                          delay: 1, 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          imageRendering: 'crisp-edges',
                        }}
                      />
                      
                      {/* Additional SM glow overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
                        animate={{
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          mixBlendMode: 'screen',
                        }}
                      />
                    </div>
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
