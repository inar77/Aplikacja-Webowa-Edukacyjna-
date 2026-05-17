
Action: file_editor create /app/frontend/src/navig/MissionBriefingSketch.jsx --file-text "import React from \"react\";
import { motion, AnimatePresence } from \"framer-motion\";
import { X, Play } from \"lucide-react\";
import OrganicProgressBar from \"./OrganicProgressBar\";
import HandDrawnArrow from \"./HandDrawnArrow\";

/**
 * MissionBriefingSketch
 * ------------------------------------------------------------
 * Modal \"briefingu misji\" w stylu szkicu starego mistrza:
 * – ciemne tło z subtelnymi promieniami,
 * – wektorowy zarys obiektu (rozdzielnia/puszka),
 * – odręczne strzałki rysują się \"na żywo\",
 * – pismo Caveat dla notatek mistrza.
 *
 * Props:
 *   open, onClose, onStart
 *   mission = { title, kind, xp, time, hints: [{x,y,rotation,length,label}] }
 */
export default function MissionBriefingSketch({ open, onClose, onStart, mission }) {
  if (!mission) return null;

  const defaultHints = [
    { x: 60, y: 70, rotation: 25, length: 110, label: \"Tu podepnij fazę\" },
    { x: 360, y: 90, rotation: 155, length: 110, label: \"Uwaga – PE\" },
    { x: 140, y: 280, rotation: -25, length: 130, label: \"Sprawdź multimetrem\" },
  ];
  const hints = mission.hints || defaultHints;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid=\"mission-briefing-overlay\"
          className=\"fixed inset-0 z-50 flex items-center justify-center p-4\"
          style={{ background: \"rgba(8,10,18,0.78)\", backdropFilter: \"blur(6px)\" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            data-testid=\"mission-briefing-card\"
            onClick={(e) => e.stopPropagation()}
            className=\"relative w-full max-w-[920px] overflow-hidden rounded-[14px]\"
            style={{
              background:
                \"radial-gradient(ellipse at 50% 30%, #1b2236 0%, #0f1422 60%, #0a0e1a 100%)\",
              border: \"1px solid rgba(120,140,180,0.25)\",
              boxShadow:
                \"0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)\",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: \"spring\", stiffness: 200, damping: 24 }}
          >
            {/* subtelne promienie + siatka */}
            <div
              aria-hidden
              className=\"pointer-events-none absolute inset-0\"
              style={{
                background:
                  \"repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 64px)\",
              }}
            />
            <div
              aria-hidden
              className=\"pointer-events-none absolute inset-0 opacity-40\"
              style={{
                background:
                  \"conic-gradient(from 220deg at 50% 35%, rgba(244,161,61,0.10), rgba(95,179,255,0.06), rgba(244,161,61,0.10))\",
                maskImage:
                  \"radial-gradient(circle at 50% 35%, black 0%, transparent 65%)\",
              }}
            />

            {/* close */}
            <button
              data-testid=\"mission-briefing-close\"
              onClick={onClose}
              className=\"absolute right-4 top-4 z-10 rounded-full p-2 text-[#c8d2e6]/70 transition hover:bg-white/5 hover:text-white\"
              aria-label=\"Zamknij\"
            >
              <X size={20} />
            </button>

            <div className=\"relative grid grid-cols-1 gap-6 p-7 md:grid-cols-[1.15fr_1fr]\">
              {/* LEWA: szkic */}
              <div className=\"relative h-[360px] overflow-hidden rounded-[10px] border border-white/5 bg-[#0a0f1c]/60\">
                {/* odręczny tytuł \"BRIEFING\" */}
                <div
                  className=\"absolute left-4 top-3 z-10\"
                  style={{
                    fontFamily: \"'Caveat', cursive\",
                    fontSize: \"1.8rem\",
                    color: \"#f4ecd8\",
                    textShadow: \"0 0 10px rgba(0,0,0,0.6)\",
                  }}
                >
                  Briefing
                  <span
                    className=\"ml-2 text-[0.95rem] uppercase tracking-[0.25em] opacity-60\"
                    style={{ fontFamily: \"'JetBrains Mono', monospace\" }}
                  >
                    #{String(mission.id || 1).padStart(2, \"0\")}
                  </span>
                </div>

                {/* SVG szkic obiektu – uproszczona \"rozdzielnia\" */}
                <svg
                  className=\"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2\"
                  width=\"320\"
                  height=\"260\"
                  viewBox=\"0 0 320 260\"
                >
                  <defs>
                    <filter id=\"chalk-sketch\">
                      <feTurbulence baseFrequency=\"0.7\" numOctaves=\"2\" seed=\"5\" />
                      <feDisplacementMap in=\"SourceGraphic\" scale=\"1.4\" />
                    </filter>
                  </defs>
                  {/* obudowa */}
                  <motion.rect
                    x=\"60\"
                    y=\"40\"
                    width=\"200\"
                    height=\"180\"
                    rx=\"6\"
                    stroke=\"#f4ecd8\"
                    strokeWidth=\"2.2\"
                    fill=\"none\"
                    filter=\"url(#chalk-sketch)\"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 0.9 }}
                    style={{ filter: \"drop-shadow(0 0 3px rgba(244,236,216,0.35))\" }}
                  />
                  {/* szyna */}
                  <motion.line
                    x1=\"78\"
                    y1=\"86\"
                    x2=\"242\"
                    y2=\"86\"
                    stroke=\"#f4ecd8\"
                    strokeWidth=\"1.6\"
                    filter=\"url(#chalk-sketch)\"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                  {/* bezpieczniki */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.rect
                      key={i}
                      x={86 + i * 32}
                      y=\"92\"
                      width=\"20\"
                      height=\"50\"
                      rx=\"2\"
                      stroke=\"#f4ecd8\"
                      strokeWidth=\"1.6\"
                      fill=\"none\"
                      filter=\"url(#chalk-sketch)\"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.85 }}
                      transition={{ duration: 0.35, delay: 0.7 + i * 0.08 }}
                    />
                  ))}
                  {/* \"zaznaczenie\" – niedomknięte kółko wokół bezpiecznika */}
                  <motion.path
                    d=\"M 142 96 C 162 90, 168 122, 156 142 C 144 158, 124 152, 122 134 C 121 122, 128 102, 140 96\"
                    stroke=\"#f4a13d\"
                    strokeWidth=\"2.2\"
                    fill=\"none\"
                    filter=\"url(#chalk-sketch)\"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 1.4 }}
                    style={{ filter: \"drop-shadow(0 0 5px rgba(244,161,61,0.6))\" }}
                  />
                  {/* przewody na dole */}
                  <motion.path
                    d=\"M 90 220 C 130 235, 180 210, 230 225\"
                    stroke=\"#f4ecd8\"
                    strokeWidth=\"1.4\"
                    fill=\"none\"
                    filter=\"url(#chalk-sketch)\"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 1.0 }}
                    opacity=\"0.7\"
                  />
                </svg>

                {/* odręczne strzałki – affordances */}
                {hints.map((h, i) => (
                  <HandDrawnArrow
                    key={i}
                    x={h.x}
                    y={h.y}
                    rotation={h.rotation}
                    length={h.length}
                    label={h.label}
                    delay={1.6 + i * 0.25}
                  />
                ))}
              </div>

              {/* PRAWA: meta + notatki mistrza */}
              <div className=\"flex flex-col\">
                <div
                  className=\"text-[0.72rem] uppercase tracking-[0.28em] text-[#5fb3ff]\"
                  style={{ fontFamily: \"'JetBrains Mono', monospace\" }}
                >
                  Misja · {mission.kind || \"warsztat\"}
                </div>
                <h2
                  className=\"mt-1 text-[2.1rem] leading-[1.05] text-[#f4ecd8]\"
                  style={{ fontFamily: \"'Caveat', cursive\" }}
                >
                  {mission.title}
                </h2>
                {mission.subtitle && (
                  <p className=\"mt-1 text-[0.95rem] text-[#c8d2e6]/80\">
                    {mission.subtitle}
                  </p>
                )}

                {/* notatka mistrza */}
                <div
                  className=\"relative mt-5 rounded-[8px] border border-[#f4ecd8]/15 p-4\"
                  style={{
                    background:
                      \"linear-gradient(180deg, rgba(244,236,216,0.04), rgba(244,236,216,0.01))\",
                  }}
                >
                  <div
                    className=\"absolute -top-3 left-3 bg-[#0f1422] px-2 text-[0.7rem] uppercase tracking-[0.25em] text-[#f4ecd8]/60\"
                    style={{ fontFamily: \"'JetBrains Mono', monospace\" }}
                  >
                    notatka mistrza
                  </div>
                  <p
                    className=\"text-[1.15rem] leading-[1.35] text-[#f4ecd8]/90\"
                    style={{ fontFamily: \"'Caveat', cursive\" }}
                  >
                    {mission.note ||
                      \"Najpierw odłącz napięcie. Sprawdź multimetrem czy faza puściła. Dopiero potem ruszaj zacisk.\"}
                  </p>
                </div>

                {/* meta: xp / czas */}
                <div className=\"mt-5 grid grid-cols-2 gap-3\">
                  <Meta label=\"Nagroda\" value={`+${mission.xp || 220} XP`} accent=\"#9af2b9\" />
                  <Meta label=\"Czas\" value={mission.time || \"12 min\"} accent=\"#f4a13d\" />
                </div>

                {/* pasek przygotowania */}
                <div className=\"mt-5\">
                  <OrganicProgressBar
                    value={mission.readiness ?? 60}
                    label=\"Gotowość do misji\"
                  />
                </div>

                {/* CTA */}
                <motion.button
                  data-testid=\"mission-briefing-start\"
                  onClick={() => onStart?.(mission)}
                  className=\"mt-6 flex items-center justify-center gap-2 rounded-[8px] px-6 py-3 text-[0.95rem] uppercase tracking-[0.22em] text-[#0a0e1a] transition\"
                  style={{
                    background:
                      \"linear-gradient(180deg, #f4a13d 0%, #d8862a 100%)\",
                    boxShadow:
                      \"0 8px 28px rgba(244,161,61,0.35), inset 0 1px 0 rgba(255,255,255,0.3)\",
                    fontFamily: \"'JetBrains Mono', monospace\",
                  }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play size={16} />
                  Wchodzę na robotę
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Meta({ label, value, accent }) {
  return (
    <div
      className=\"rounded-[6px] border border-white/5 px-3 py-2\"
      style={{ background: \"rgba(255,255,255,0.02)\" }}
    >
      <div
        className=\"text-[0.65rem] uppercase tracking-[0.22em] text-[#c8d2e6]/60\"
        style={{ fontFamily: \"'JetBrains Mono', monospace\" }}
      >
        {label}
      </div>
      <div
        className=\"mt-0.5 text-[1.1rem]\"
        style={{ color: accent, fontFamily: \"'JetBrains Mono', monospace\" }}
      >
        {value}
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/navig/MissionBriefingSketch.jsx
