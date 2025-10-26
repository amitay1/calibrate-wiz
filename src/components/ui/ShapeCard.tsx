import { useRef, useState } from "react";
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

  // pointer → motion
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sMx = useSpring(mx, { stiffness: 180, damping: 24 });
  const sMy = useSpring(my, { stiffness: 180, damping: 24 });

  // tilt
  const rotX = useTransform(sMy, (v) => (v - 0.5) * 16);
  const rotY = useTransform(sMx, (v) => (0.5 - v) * 16);

  // Parallax offsets - disabled when active
  const pxNeg10 = useTransform(sMx, (v) => isActive ? 0 : (v - 0.5) * -10);
  const py8 = useTransform(sMy, (v) => isActive ? 0 : (v - 0.5) * 8);
  const px6 = useTransform(sMx, (v) => isActive ? 0 : (v - 0.5) * 6);
  const py6 = useTransform(sMy, (v) => isActive ? 0 : (v - 0.5) * 6);

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
    setIsHovered(true);
  }
  
  function handleClick() {
    if (isActive) {
      // Deactivate - force immediate reset
      setIsActive(false);
      setIsHovered(false);
      // Force center position immediately
      mx.jump(0.5);
      my.jump(0.5);
      onClick();
    } else {
      // Activate - enter interactive mode
      setIsActive(true);
      onClick();
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn("shape-card", isSelected && "selected", isActive && "active")}
      style={{ rotateX: rotX, rotateY: rotY, ["--halo" as any]: color }}
      onMouseMove={onMove}
      onMouseEnter={onHover}
      onMouseLeave={reset}
      onClick={handleClick}
      whileHover={{ scale: isActive ? 1 : 1.04 }}
      animate={{ 
        scale: isActive ? 1.08 : 1,
        z: isActive ? 50 : 0,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <div className="stage">
        {/* ground shadow */}
        <motion.div
          className="layer shadow"
          style={{ x: pxNeg10, y: py8 }}
        >
          <div className="shadow-ellip" />
        </motion.div>

        {/* 3D VIEWER - Always visible! */}
        <motion.div
          className="layer z2 shape-3d-container"
          style={{ 
            x: isActive ? 0 : px6, 
            y: isActive ? 0 : py6 
          }}
          animate={{ 
            scale: isActive ? 1.3 : isHovered ? 1.15 : 1,
            z: isActive ? 100 : isHovered ? 40 : 0,
            x: isActive ? 0 : undefined,
            y: isActive ? 0 : undefined,
          }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 25,
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
