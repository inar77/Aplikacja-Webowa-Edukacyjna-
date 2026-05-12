
Action: file_editor create /app/frontend/src/components/fpp/DistributionBoxScene.tsx --file-text "import { motion } from \"framer-motion\";
import { ScrewPoint } from \"./ScrewPoint\";
import { PanelCover } from \"./PanelCover\";
import type { FPPToolTaskApi } from \"@/hooks/useFPPToolTask\";

interface DistributionBoxSceneProps {
  api: FPPToolTaskApi;
}

/**
 * The \"FPP\" stage — wall + recessed distribution box + cover + screws + interior.
 * Layout is in absolute pixels inside a centered box, so the perspective stays
 * consistent. Lighting is faked with multiple gradients + inset shadows.
 */
export function DistributionBoxScene({ api }: DistributionBoxSceneProps) {
  const { screws, phase, coverOffset, coverDragThreshold, tool, beginScrew, beginCoverDrag } = api;

  const activeScrewId = phase === \"engaging-screw\"
    ? screws.find((s) => !s.removed && s.progress > 0 && s.progress < 1)?.id
    : null;

  return (
    <div className=\"absolute inset-0 flex items-center justify-center\">
      {/* Wall background */}
      <div
        className=\"absolute inset-0\"
        style={{
          background:
            \"radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 60%, #000 100%)\",
        }}
      />
      {/* Wall texture */}
      <div
        className=\"absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none\"
        style={{
          backgroundImage:
            \"repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 8px)\",
        }}
      />
      {/* Vignette */}
      <div
        className=\"absolute inset-0 pointer-events-none\"
        style={{
          background:
            \"radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.85) 100%)\",
        }}
      />

      {/* The recessed enclosure (the hole in the wall) */}
      <div
        className=\"relative\"
        style={{
          width: \"min(560px, 78vw)\",
          aspectRatio: \"5 / 4\",
          background:
            \"linear-gradient(180deg, #050505 0%, #0a0a0a 100%)\",
          borderRadius: 10,
          boxShadow:
            \"inset 0 0 0 2px rgba(0,0,0,0.9), inset 0 6px 20px rgba(0,0,0,0.85), 0 30px 60px rgba(0,0,0,0.6)\",
        }}
      >
        {/* Frame highlight */}
        <div
          className=\"absolute -inset-2 rounded-[14px] pointer-events-none\"
          style={{
            background:
              \"linear-gradient(180deg, #2a2a2a 0%, #141414 100%)\",
            zIndex: -1,
            boxShadow:
              \"0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.9), 0 18px 40px rgba(0,0,0,0.7)\",
          }}
        />

        {/* Interior (visible only after cover removed) */}
        <Interior visible={phase === \"completed\"} />

        {/* Cover sits on top of interior */}
        <PanelCover
          phase={phase}
          offset={coverOffset}
          threshold={coverDragThreshold}
          onBeginDrag={beginCoverDrag}
        />

        {/* Screws sit on top of cover until removed */}
        <div className=\"absolute inset-0 pointer-events-none\">
          <div className=\"absolute inset-0 [&>*]:pointer-events-auto\">
            {screws.map((s) => (
              <ScrewPoint
                key={s.id}
                screw={s}
                hasTool={tool === \"screwdriver\"}
                isActive={activeScrewId === s.id}
                onEngage={beginScrew}
              />
            ))}
          </div>
        </div>

        {/* Light flicker over the panel */}
        <motion.div
          className=\"absolute inset-0 pointer-events-none rounded-[10px]\"
          animate={{ opacity: [0.0, 0.08, 0.0, 0.05, 0.0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.1, 0.2, 0.4, 1] }}
          style={{
            background:
              \"linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 40%)\",
          }}
        />
      </div>

      {/* Floating dust */}
      <Dust />
    </div>
  );
}

function Interior({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      className=\"absolute inset-2 rounded-[6px] overflow-hidden\"
      style={{
        background:
          \"radial-gradient(ellipse at 50% 30%, #181818 0%, #0a0a0a 60%, #050505 100%)\",
        boxShadow: \"inset 0 4px 16px rgba(0,0,0,0.95)\",
        opacity: visible ? 1 : 0.85,
        transition: \"opacity 600ms ease\",
      }}
    >
      {/* DIN rail */}
      <div
        className=\"absolute left-4 right-4 top-[42%] h-2 rounded-sm\"
        style={{
          background: \"linear-gradient(180deg, #4a4a4a, #1a1a1a)\",
          boxShadow: \"0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6)\",
        }}
      />
      {/* Breakers */}
      <div className=\"absolute left-4 right-4 top-[14%] flex gap-2\">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className=\"flex-1 rounded-sm h-16 relative\"
            style={{
              background:
                \"linear-gradient(180deg, #d4d4d4 0%, #9a9a9a 50%, #6c6c6c 100%)\",
              boxShadow:
                \"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.4)\",
            }}
          >
            <div className=\"absolute left-1/2 top-2 -translate-x-1/2 w-1.5 h-6 bg-black rounded-sm\" />
            <div className=\"absolute left-1/2 bottom-1 -translate-x-1/2 w-2 h-2 rounded-full bg-red-700 shadow-[0_0_4px_rgba(255,0,0,0.6)]\" />
          </div>
        ))}
      </div>
      {/* Wires bundle */}
      <svg
        className=\"absolute inset-0 w-full h-full\"
        viewBox=\"0 0 100 100\"
        preserveAspectRatio=\"none\"
      >
        <path d=\"M10,70 C30,90 70,55 90,80\" stroke=\"#5a3a18\" strokeWidth=\"2\" fill=\"none\" />
        <path d=\"M10,75 C40,95 65,60 90,85\" stroke=\"#0a4f8a\" strokeWidth=\"2\" fill=\"none\" />
        <path d=\"M12,80 C45,100 60,70 90,90\" stroke=\"#1a7a1a\" strokeWidth=\"2\" fill=\"none\" />
      </svg>
      {/* Inner glow when revealed */}
      {visible && (
        <motion.div
          className=\"absolute inset-0 pointer-events-none\"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            background:
              \"radial-gradient(ellipse at 50% 35%, rgba(255,170,40,0.18) 0%, transparent 70%)\",
          }}
        />
      )}
    </div>
  );
}

function Dust() {
  return (
    <div className=\"absolute inset-0 pointer-events-none\">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={i}
          className=\"absolute rounded-full bg-amber-200/30\"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${(i * 53) % 100}%`,
            top: `${(i * 31) % 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.0, 0.5, 0.0],
          }}
          transition={{
            duration: 6 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/fpp/DistributionBoxScene.tsx
