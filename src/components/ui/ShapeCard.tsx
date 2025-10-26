import { useRef, useState } from "react";
import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import Shape3DViewer from "@/components/3d/Shape3DViewer";
import "./shape-card.css";

type Props = {
  title: string;
  description?: string;
  partType: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function ShapeCard({
  title,
  description,
  partType,
  color,
  isSelected,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // pointer → motion with faster spring when deactivating
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springConfig = isActive 
    ? { stiffness: 180, damping: 24 }
    : { stiffness: 400, damping: 40 }; // Faster return to center
  const sMx = useSpring(mx, springConfig);
  const sMy = useSpring(my, springConfig);

  // tilt
  const rotX = useTransform(sMy, (v) => (v - 0.5) * 16);
  const rotY = useTransform(sMx, (v) => (0.5 - v) * 16);

  // Parallax - lock at 0 when active
  const px6 = useTransform(sMx, (v) => isActive ? 0 : (v - 0.5) * 6);
  const py6 = useTransform(sMy, (v) => isActive ? 0 : (v - 0.5) * 6);
  const pxShadow = useTransform(sMx, (v) => isActive ? 0 : (v - 0.5) * -10);
  const pyShadow = useTransform(sMy, (v) => isActive ? 0 : (v - 0.5) * 8);

  // Force reset when becoming inactive
  React.useEffect(() => {
    if (!isActive) {
      mx.jump(0.5);
      my.jump(0.5);
    }
  }, [isActive, mx, my]);

  function onMove(e: React.MouseEvent) {
    if (!ref.current || isActive) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  
  function reset() { 
    if (isActive) return;
    mx.set(0.5); 
    my.set(0.5);
    setIsHovered(false);
  }
  
  function onHover() {
    if (!isActive) {
      setIsHovered(true);
    }
  }
  
  function handleClick() {
    if (isActive) {
      // Deactivate
      setIsActive(false);
      setIsHovered(false);
      onClick();
    } else {
      // Activate
      setIsActive(true);
      onClick();
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn("shape-card", isSelected && "selected", isActive && "active")}
      style={{ 
        rotateX: isActive ? 0 : rotX, 
        rotateY: isActive ? 0 : rotY, 
        ["--halo" as any]: color,
        position: isActive ? "fixed" : "relative",
        top: isActive ? "50%" : "auto",
        left: isActive ? "50%" : "auto",
        translateX: isActive ? "-50%" : "0",
        translateY: isActive ? "-50%" : "0",
        zIndex: isActive ? 9999 : "auto",
      }}
      onMouseMove={onMove}
      onMouseEnter={onHover}
      onMouseLeave={reset}
      onClick={handleClick}
      whileHover={{ scale: isActive ? 1 : 1.04 }}
      animate={{ 
        scale: isActive ? 1.2 : 1,
        rotateX: isActive ? 0 : undefined,
        rotateY: isActive ? 0 : undefined,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <div className="stage">
        {/* ground shadow */}
        <motion.div
          className="layer shadow"
          style={{ x: pxShadow, y: pyShadow }}
        >
          <div className="shadow-ellip" />
        </motion.div>

        {/* 3D VIEWER - Always visible! */}
        <motion.div
          className="layer z2 shape-3d-container"
          style={{ x: px6, y: py6 }}
          animate={{ 
            scale: isActive ? 1.3 : isHovered ? 1.15 : 1,
            z: isActive ? 100 : isHovered ? 40 : 0,
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <Shape3DViewer
            partType={partType}
            color={color}
            isHovered={isHovered}
            isActive={isActive}
            mouseX={sMx.get()}
            mouseY={sMy.get()}
          />
        </motion.div>
      </div>

      <div className="card-title">{title}</div>
      {description && <div className="card-description">{description}</div>}
      {isSelected && <div className="selected-badge">✓ Selected</div>}
      {isActive && (
        <div className="active-badge">
          🎮 Interactive Mode - Click again to close
        </div>
      )}
    </motion.div>
  );
}
