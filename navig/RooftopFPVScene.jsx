import React, { useMemo, useState } from "react";
import MultimeterTool from "../components/MultimeterTool";
import { FAULTS } from "../physics/multimeterPhysics";
import StepProgressBar, { gateProps, LockTooltip } from "../components/StepProgressBar";
import MeasurementResultPanel from "../components/MeasurementResultPanel";
import { STEPS, computeCurrentStep, isStepUnlocked, prevStepLabel } from "components/navig/steps/RooftopSteps";

/* ============================================================================
 *  NAVIG · RooftopFPVScene.jsx   (Batch 1: gating + DC labels + wynik)
 *  --------------------------------------------------------------------------
 *  Widok 1. osoby przy module PV ze ścisłą PROCEDURĄ (step-gating):
 *    krok 0: weź śrubokręt → 1: otwórz puszkę → 2: weź multimetr
 *          → 3: sonda + na DC+ → 4: sonda − na DC−
 *  Element jest WIZUALNIE ZABLOKOWANY (opacity .35, not-allowed) dopóki
 *  poprzedni krok nie jest spełniony — zła kolejność = błąd szkoleniowy.
 *
 *  Puszka to skrzynka DC: żyły DC+ (czerwony) / DC− (czarny) / PE (żół-ziel).
 *  Po pomiarze pojawia się pełny panel "Wynik pomiaru".
 *
 *  Propsy: { onHit, completedSteps, activeId, onExit, scenario,
 *            enableMultimeter, showScenarioSwitch }
 * ========================================================================== */

const C = {
  sky: "#ffe6b3", sky2: "#ffc861", tile: "#8a4b2a", tileDark: "#6d3a20", tileLine: "#aa6038",
  frame: "#c9ccd2", frameDark: "#8d9097", glass: "#0f2350", glass2: "#0a1838",
  jbBody: "#161616", jbCover: "#242424",
  DCplus: "#cc2200", DCminus: "#111111", PE: "#3ba35a", PEy: "#e7d23a",
  steel: "#cfd3d8", hi: "#ffd23a",
};

const SCENARIOS = {
  healthy: { label: "Sprawny string", env: { G: 950, Tamb: 22 }, fault: FAULTS.NONE, live: true, nModules: 8 },
  cold: { label: "Mróz −10°C (Voc rośnie!)", env: { G: 700, Tamb: -10 }, fault: FAULTS.NONE, live: true, nModules: 8 },
  open: { label: "Przerwa (MC4 niewpięte)", env: { G: 950, Tamb: 22 }, fault: FAULTS.OPEN_STRING, live: true, nModules: 8 },
  reverse: { label: "Odwrócona polaryzacja", env: { G: 950, Tamb: 22 }, fault: FAULTS.REVERSE_WIRING, live: true, nModules: 8 },
  ground: { label: "Doziemienie (zła izolacja)", env: { G: 950, Tamb: 22 }, fault: FAULTS.GROUND_FAULT, live: true, nModules: 8 },
};

export default function RooftopFPVScene({
  onHit, completedSteps = [], activeId, onExit,
  scenario, enableMultimeter = true, showScenarioSwitch = true,
}) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [tool, setTool] = useState(null);
  const [dmmOpen, setDmmOpen] = useState(false);
  const [scKey, setScKey] = useState("healthy");
  const [lastReading, setLastReading] = useState(null);
  const [lockTip, setLockTip] = useState({ show: false });

  const sc = scenario || SCENARIOS[scKey];
  const isDone = (id) => completedSteps.includes(id);
  const isActive = (id) => activeId === id;
  const hit = (id) => onHit?.(id);

  const currentStep = useMemo(() => computeCurrentStep(completedSteps), [completedSteps]);
  // bramka kroku: zwraca {locked, style, onMouse*}
  const gate = (index) => gateProps(isStepUnlocked(index, currentStep, true), prevStepLabel(index, true), setLockTip);

  const cursor = tool === "screwdriver" ? "crosshair" : "default";

  // klik narzędzia/elementu z respektowaniem blokady
  const doScrewdriver = (g) => { if (g.locked) return; setTool(tool === "screwdriver" ? null : "screwdriver"); hit("screwdriver"); };
  const doCover = (g) => { if (g.locked) return; setCoverOpen((v) => !v); hit("jb-cover"); };
  const doMultimeter = (g) => { if (g.locked) return; setTool("multimeter"); hit("multimeter"); if (enableMultimeter) setDmmOpen(true); };

  const gSd = gate(0), gCov = gate(1), gMm = gate(2);

  return (
    <div data-testid="rooftop-fpv-scene" style={{ position: "relative", width: "100%", cursor }}>
      <StepProgressBar currentStep={currentStep} done={completedSteps} />
      <LockTooltip tip={lockTip} />

      <svg viewBox="0 0 1000 620" width="100%" style={{ display: "block", fontFamily: "ui-sans-serif, system-ui" }}>
        <defs>
          <linearGradient id="fpv-sky" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={C.sky} /><stop offset="1" stopColor={C.sky2} /></linearGradient>
          <radialGradient id="fpv-sun" cx="0.85" cy="0.18" r="0.5"><stop offset="0" stopColor="#fffbe8" /><stop offset="1" stopColor="#ffd06b" stopOpacity="0" /></radialGradient>
          <linearGradient id="fpv-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1c356e" /><stop offset="0.5" stopColor={C.glass} /><stop offset="1" stopColor={C.glass2} /></linearGradient>
          <linearGradient id="fpv-frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.frame} /><stop offset="1" stopColor={C.frameDark} /></linearGradient>
          <linearGradient id="fpv-pe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.PE} /><stop offset="0.5" stopColor={C.PEy} /><stop offset="1" stopColor={C.PE} /></linearGradient>
          <style>{`
            @keyframes fpvPulse { 0%,100%{opacity:.2} 50%{opacity:.85} }
            .fpv-ring { animation: fpvPulse 1.3s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* NIEBO + SŁOŃCE */}
        <rect x="0" y="0" width="1000" height="620" fill="url(#fpv-sky)" />
        <circle cx="860" cy="120" r="220" fill="url(#fpv-sun)" />
        <circle cx="860" cy="120" r="42" fill="#fff7df" opacity="0.9" />

        {/* DACH */}
        <polygon points="0,300 1000,250 1000,620 0,620" fill={C.tile} />
        {Array.from({ length: 9 }).map((_, r) => { const y = 320 + r * 34 + r * r * 2.4; return <line key={r} x1="0" y1={y} x2="1000" y2={y - 30} stroke={C.tileLine} strokeWidth="2" opacity="0.5" />; })}
        {Array.from({ length: 16 }).map((_, c) => <line key={c} x1={c * 70} y1="300" x2={c * 64 + 30} y2="620" stroke={C.tileDark} strokeWidth="1.5" opacity="0.35" />)}

        {/* CIEŃ panelu */}
        <polygon points="150,360 660,318 700,470 175,520" fill="#000" opacity="0.20" />

        {/* MODUŁ PV */}
        <g data-testid="fpv-panel" style={{ cursor: "pointer" }} onClick={() => hit("pv-module")}>
          <polygon points="120,330 640,288 648,322 128,366" fill={C.frameDark} />
          <polygon points="110,210 650,150 660,300 122,360" fill="url(#fpv-frame)" stroke="#6b6e74" strokeWidth="2" />
          <polygon points="130,224 632,168 640,286 142,342" fill="url(#fpv-glass)" />
          {Array.from({ length: 9 }).map((_, i) => { const f = (i + 1) / 10; return <line key={"v" + i} x1={130 + (632 - 130) * f} y1={224 - (224 - 168) * f} x2={142 + (640 - 142) * f} y2={342 - (342 - 286) * f} stroke="#0a1838" strokeWidth="1.4" />; })}
          {Array.from({ length: 4 }).map((_, i) => { const f = (i + 1) / 5; return <line key={"h" + i} x1={130 + (142 - 130) * f} y1={224 + (342 - 224) * f} x2={632 + (640 - 632) * f} y2={168 + (286 - 168) * f} stroke="#0a1838" strokeWidth="1.4" />; })}
          <polygon points="430,196 560,178 470,300 360,318" fill="#cfe0ff" opacity="0.10" />
          <text x="150" y="250" fill="#9fc0ff" fontSize="13" fontWeight="700" opacity="0.7">Moduł PV · 410 Wp · string 1</text>
        </g>

        {/* PUSZKA PRZYŁĄCZENIOWA DC */}
        <g data-testid="fpv-junction-box">
          <rect x="610" y="360" width="250" height="170" rx="10" fill={C.jbBody} stroke="#333" strokeWidth="3" />
          <rect x="610" y="360" width="250" height="24" rx="10" fill="#0d0d0d" />
          <text x="735" y="377" textAnchor="middle" fontSize="12" fill="#8a9099" fontWeight="700">JUNCTION BOX · DC</text>

          <g style={{ opacity: coverOpen ? 1 : 0.25, transition: "opacity .35s" }}>
            <rect x="624" y="392" width="222" height="126" rx="6" fill="#0c0c0c" />
            <rect x="640" y="470" width="190" height="34" rx="5" fill="#1d1d1d" stroke="#333" />
            {/* ŻYŁY DC: DC+ czerwony · DC− czarny · PE żółto-zielony */}
            <Wire id="wire-DCplus" x={690} color={C.DCplus} label="DC+" active={isActive("wire-DCplus")} done={isDone("wire-DCplus")} onHit={hit} />
            <Wire id="wire-DCminus" x={740} color={C.DCminus} label="DC−" active={isActive("wire-DCminus")} done={isDone("wire-DCminus")} onHit={hit} />
            <Wire id="wire-PE" x={790} color="url(#fpv-pe)" label="PE ⏚" active={isActive("wire-PE")} done={isDone("wire-PE")} onHit={hit} />
            {/* legenda */}
            <text x="735" y="516" textAnchor="middle" fontSize="9" fill="#94a3b8">DC+ czerwony · DC− czarny · PE żółto-zielony</text>
          </g>

          {/* POKRYWA (gating: krok 1) */}
          <g
            data-testid="fpv-jb-cover"
            onClick={() => doCover(gCov)}
            onMouseEnter={gCov.onMouseEnter} onMouseMove={gCov.onMouseMove} onMouseLeave={gCov.onMouseLeave}
            style={{ ...gCov.style, transformBox: "fill-box", transformOrigin: "610px 384px", transform: coverOpen ? "perspective(600px) rotateY(-78deg)" : "none", transition: "transform .45s ease" }}
          >
            <rect x="612" y="386" width="246" height="138" rx="8" fill={C.jbCover} stroke="#3a3a3a" strokeWidth="2" />
            <circle cx="735" cy="455" r="10" fill="#3a3a3a" />
            <text x="735" y="430" textAnchor="middle" fontSize="11" fill="#8a9099">{coverOpen ? "" : gCov.locked ? "🔒 najpierw śrubokręt" : "▼ kliknij: otwórz pokrywę"}</text>
            {isActive("jb-cover") && <rect className="fpv-ring" x="612" y="386" width="246" height="138" rx="8" fill="none" stroke={C.hi} strokeWidth="4" />}
          </g>
          {isDone("jb-cover") && <circle cx="850" cy="372" r="9" fill="#22c55e" stroke="#fff" strokeWidth="2" />}
        </g>

        {/* ŚRUBOKRĘT (gating: krok 0) */}
        <g
          data-testid="fpv-screwdriver"
          onClick={() => doScrewdriver(gSd)}
          onMouseEnter={gSd.onMouseEnter} onMouseMove={gSd.onMouseMove} onMouseLeave={gSd.onMouseLeave}
          style={{ ...gSd.style, transform: tool === "screwdriver" ? "translateY(-6px) rotate(-4deg)" : "none", transformBox: "fill-box", transformOrigin: "center", transition: "transform .2s" }}
        >
          <rect x="150" y="545" width="120" height="16" rx="8" fill="#d33b2e" transform="rotate(-8 210 553)" />
          <rect x="262" y="546" width="70" height="9" rx="4" fill={C.steel} transform="rotate(-8 297 550)" />
          <rect x="328" y="547" width="14" height="6" fill="#9aa0a6" transform="rotate(-8 335 550)" />
          {tool === "screwdriver" && <text x="150" y="535" fill="#fff" fontSize="12" fontWeight="700">✓ śrubokręt w ręku (kursor: celownik)</text>}
          {isActive("screwdriver") && <circle className="fpv-ring" cx="210" cy="553" r="40" fill="none" stroke={C.hi} strokeWidth="3" />}
        </g>

        {/* MULTIMETR (gating: krok 2) */}
        <g
          data-testid="fpv-multimeter"
          onClick={() => doMultimeter(gMm)}
          onMouseEnter={gMm.onMouseEnter} onMouseMove={gMm.onMouseMove} onMouseLeave={gMm.onMouseLeave}
          style={gMm.style}
        >
          <rect x="380" y="528" width="120" height="74" rx="10" fill="#f4a13d" stroke="#b9791f" strokeWidth="3" />
          <rect x="394" y="540" width="92" height="28" rx="4" fill="#0a1f0a" />
          <text x="440" y="560" textAnchor="middle" fontSize="13" fill="#7CFC9A" fontWeight="700">DMM</text>
          <circle cx="440" cy="585" r="11" fill="#222" stroke="#111" strokeWidth="2" />
          <text x="440" y="617" textAnchor="middle" fontSize="11" fill="#3b2a12" fontWeight="700">{gMm.locked ? "🔒 najpierw puszka" : "kliknij: multimetr"}</text>
          {isActive("multimeter") && <circle className="fpv-ring" cx="440" cy="565" r="58" fill="none" stroke={C.hi} strokeWidth="3" />}
        </g>

        {/* POWRÓT */}
        <g data-testid="fpv-exit" style={{ cursor: "pointer" }} onClick={() => onExit?.()}>
          <rect x="24" y="22" width="190" height="40" rx="20" fill="#0b1220" opacity="0.88" />
          <text x="46" y="47" fill="#dbeafe" fontSize="15" fontWeight="700">← Wróć na dach</text>
        </g>

        {/* ZADANIE */}
        <g>
          <rect x="640" y="24" width="336" height="58" rx="12" fill="#0b1220" opacity="0.85" />
          <text x="658" y="48" fill="#fde68a" fontSize="13" fontWeight="700">Krok {Math.min(currentStep + 1, STEPS.length)}/{STEPS.length}: {STEPS[Math.min(currentStep, STEPS.length - 1)].instr}</text>
          <text x="658" y="68" fill="#93c5fd" fontSize="11">Wykonuj w kolejności — to procedura bezpieczeństwa.</text>
        </g>
      </svg>

      {/* PANEL WYNIKU (pod SVG, nad przełącznikiem scen) */}
      <MeasurementResultPanel reading={lastReading} scenario={sc} onClose={() => setLastReading(null)} />

      {/* przełącznik scenariuszy (demo) */}
      {showScenarioSwitch && (
        <div data-testid="fpv-scenario-switch" style={SW.bar}>
          <span style={SW.label}>scenariusz:</span>
          {Object.entries(SCENARIOS).map(([k, v]) => (
            <button key={k} data-testid={`fpv-sc-${k}`} onClick={() => setScKey(k)} style={{ ...SW.btn, ...(scKey === k ? SW.btnOn : {}) }}>{v.label}</button>
          ))}
        </div>
      )}

      {/* MULTIMETR — realna fizyka */}
      {enableMultimeter && dmmOpen && (
        <div style={OV.backdrop} data-testid="fpv-dmm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDmmOpen(false); }}>
          <MultimeterTool
            env={sc.env} fault={sc.fault} live={sc.live} nModules={sc.nModules}
            onClose={() => setDmmOpen(false)}
            onReading={(r) => {
              setLastReading(r);
              // zakończ kroki sond po wykonaniu pomiaru DC
              if ((r.unit || "V") === "V") { hit("probe-red"); hit("probe-black"); }
              hit(`dmm:${r.feedback?.code || r.status}`);
            }}
          />
        </div>
      )}
    </div>
  );
}

/* żyła DC w puszce — klikalna */
function Wire({ id, x, color, label, active, done, onHit }) {
  return (
    <g data-testid={`fpv-${id}`} style={{ cursor: "pointer" }} onClick={() => onHit?.(id)}>
      <path d={`M ${x} 410 C ${x - 18} 440, ${x + 18} 455, ${x} 486`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
      <rect x={x - 9} y={486} width="18" height="20" rx="3" fill="#3a3a3a" />
      <circle cx={x} cy={410} r="6" fill={color} />
      <text x={x} y={400} textAnchor="middle" fontSize="10" fill="#cbd5e1" fontWeight="700">{label}</text>
      {active && <circle className="fpv-ring" cx={x} cy={448} r="26" fill="none" stroke="#ffd23a" strokeWidth="3" />}
      {done && <circle cx={x + 16} cy={406} r="6" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />}
    </g>
  );
}

const SW = {
  bar: { position: "absolute", left: 24, bottom: 14, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", background: "rgba(11,18,32,.86)", padding: "8px 10px", borderRadius: 12 },
  label: { color: "#64748b", fontSize: 11, fontFamily: "ui-monospace, monospace" },
  btn: { fontSize: 11, padding: "5px 9px", borderRadius: 8, border: "1px solid #1f2937", background: "#0f172a", color: "#94a3b8", cursor: "pointer" },
  btnOn: { background: "#1d4ed8", borderColor: "#3b82f6", color: "#fff" },
};
const OV = { backdrop: { position: "absolute", inset: 0, background: "rgba(2,6,14,.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30 } };
