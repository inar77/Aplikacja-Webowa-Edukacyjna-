// src/pages/inverter/InverterRoomScene.jsx
import React, { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Power, AlertTriangle, Zap, Wifi, Sun, Activity,
  ChevronRight, X, Info, HardHat,
} from "lucide-react";

/* =========================================================================
   PALETA — przemysłowa, ciemnoszary falownik, ciepły blask LED
   ========================================================================= */
const C = {
  // pomieszczenie
  wallPlaster: "#d8cdb8",         // tynk lekko zżółkły
  wallPlasterDark: "#b8ad95",
  wallBrickRed: "#a05848",        // odsłonięta cegła w niektórych miejscach
  floor: "#7e7468",               // wylewka betonowa
  floorJoint: "#3e362c",
  baseboard: "#3a3530",           // cokół
  ceiling: "#c8bea8",
  beam: "#4a3f30",
  // falownik (Huawei SUN2000-style)
  inverterCase: "#2a2e34",        // ciemny przemysłowy RAL 7016
  inverterCaseLight: "#3a3f46",
  inverterPanel: "#1a1d22",
  inverterFins: "#1e2126",        // radiator
  lcdGlass: "#0a1a12",            // ekran LCD
  lcdGlow: "#4ade80",             // zielona poświata LCD
  // hebel DC (czerwony — separator DC)
  switchBodyDC: "#1f2227",
  switchHandleDC: "#cc2820",      // czerwony hebel DC
  switchHandleDCDark: "#8a1810",
  // hebel AC (czarny — wyłącznik AC)
  switchBodyAC: "#2a2d33",
  switchHandleAC: "#1a1d22",
  // kable
  cableDC_plus: "#aa2010",        // DC+ czerwony
  cableDC_minus: "#0a0c10",       // DC- czarny
  cableAC: "#6a6258",             // AC szary
  // akcenty
  ledOn: "#4ade80",
  ledOff: "#3a3530",
  ledWarn: "#f5a623",
  ledFault: "#ef4444",
  hi: "#f5a623",
  // niebo za oknem
  skyDay: "#a8c4d8",
  skyWarm: "#e8d4a8",
};

/* =========================================================================
   WYMIARY POMIESZCZENIA — kotłownia / pomieszczenie techniczne
   ========================================================================= */
const ROOM = {
  W: 10,   // szerokość (X)
  H: 3.2,  // wysokość (Y) — niski sufit jak w kotłowni
  D: 7,    // głębokość (Z)
};

/* =========================================================================
   KURZE CZĄSTECZKI — drobny pył techniczny
   ========================================================================= */
function DustParticles({ count = 120 }) {
  const pointsRef = useRef(null);
  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * ROOM.W * 0.85;
      const y = Math.random() * ROOM.H * 0.85 + 0.2;
      const z = (Math.random() - 0.5) * ROOM.D * 0.85;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
    }
    return { positions: pos, basePositions: base };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] = basePositions[i * 3] + Math.sin(t * 0.25 + i) * 0.12;
      arr[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(t * 0.18 + i * 0.6) * 0.3;
      arr[i * 3 + 2] = basePositions[i * 3 + 2] + Math.cos(t * 0.22 + i * 0.5) * 0.12;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#fff5d8"
        transparent
        opacity={0.32}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* =========================================================================
   OKNO z widokiem na dach z PV — lewa ściana, wysoko
   ========================================================================= */
function WindowToRoof() {
  const winW = 2.2;
  const winH = 1.4;
  const winY = ROOM.H - 0.9; // wysoko, jak w kotłowni
  const z = -ROOM.D / 2 + 0.05;

  return (
    <group>
      {/* "niebo + dach" za oknem — duży plane */}
      <mesh position={[-2.5, winY, z - 0.3]}>
        <planeGeometry args={[winW + 0.4, winH + 0.4]} />
        <meshBasicMaterial color={C.skyWarm} />
      </mesh>
      {/* sylwetka panelu PV na dachu (uproszczona, ciemna na tle nieba) */}
      <mesh position={[-2.5, winY - 0.3, z - 0.2]} rotation={[0, 0, -0.25]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshBasicMaterial color="#1a2840" />
      </mesh>
      {/* rama okna */}
      <group position={[-2.5, winY, z + 0.01]}>
        {/* rama pozioma */}
        <mesh>
          <boxGeometry args={[winW, 0.08, 0.06]} />
          <meshStandardMaterial color="#3a3530" />
        </mesh>
        {/* rama pionowa */}
        <mesh>
          <boxGeometry args={[0.08, winH, 0.06]} />
          <meshStandardMaterial color="#3a3530" />
        </mesh>
      </group>
      {/* parapet */}
      <mesh position={[-2.5, winY - winH / 2 - 0.1, z + 0.12]}>
        <boxGeometry args={[winW + 0.4, 0.06, 0.25]} />
        <meshStandardMaterial color={C.wallPlasterDark} roughness={0.85} />
      </mesh>
      {/* światło wpadające z okna */}
      <pointLight position={[-2.5, winY, z + 1.5]} intensity={1.6} distance={9} color="#fff0d0" />
    </group>
  );
}

/* =========================================================================
   ŚCIANY POMIESZCZENIA — tył z oknem, lewa, prawa, podłoga, sufit
   ========================================================================= */
function RoomShell() {
  return (
    <group>
      {/* podłoga */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.W, ROOM.D]} />
        <meshStandardMaterial color={C.floor} roughness={1} />
      </mesh>
      {/* spoiny podłogi */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`fj-${i}`}
          position={[0, 0.003, -ROOM.D / 2 + 0.5 + i * 1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[ROOM.W, 0.015]} />
          <meshBasicMaterial color={C.floorJoint} />
        </mesh>
      ))}

      {/* sufit z belkami */}
      <mesh position={[0, ROOM.H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.W, ROOM.D]} />
        <meshStandardMaterial color={C.ceiling} roughness={0.95} />
      </mesh>
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={`b-${i}`} position={[x, ROOM.H - 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.2, ROOM.D]} />
          <meshStandardMaterial color={C.beam} roughness={0.85} />
        </mesh>
      ))}

      {/* tylna ściana (z oknem osobno) */}
      <mesh position={[0, ROOM.H / 2, -ROOM.D / 2]} receiveShadow>
        <boxGeometry args={[ROOM.W, ROOM.H, 0.15]} />
        <meshStandardMaterial color={C.wallPlaster} roughness={0.95} />
      </mesh>

      {/* lewa ściana */}
      <mesh position={[-ROOM.W / 2, ROOM.H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, ROOM.H, ROOM.D]} />
        <meshStandardMaterial color={C.wallPlaster} roughness={0.95} />
      </mesh>

      {/* prawa ściana */}
      <mesh position={[ROOM.W / 2, ROOM.H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, ROOM.H, ROOM.D]} />
        <meshStandardMaterial color={C.wallPlaster} roughness={0.95} />
      </mesh>

      {/* odsłonięta cegła — fragment na tylnej ścianie (efekt nieotynkowanej części) */}
      <mesh position={[2.8, 0.9, -ROOM.D / 2 + 0.08]}>
        <boxGeometry args={[2.2, 1.4, 0.03]} />
        <meshStandardMaterial color={C.wallBrickRed} roughness={1} />
      </mesh>
      {/* spoiny cegieł na fragmencie */}
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 9 }).map((_, col) => {
          const offset = row % 2 === 0 ? 0 : 0.12;
          const x = 2.8 - 1.05 + col * 0.24 + offset;
          const y = 0.9 - 0.65 + row * 0.18;
          if (x < 1.75 || x > 3.85) return null;
          return (
            <mesh key={`bk-${row}-${col}`} position={[x, y, -ROOM.D / 2 + 0.095]}>
              <planeGeometry args={[0.22, 0.014]} />
              <meshBasicMaterial color="#5a3028" />
            </mesh>
          );
        })
      )}

      {/* cokoł — na wszystkich ścianach */}
      <mesh position={[0, 0.06, -ROOM.D / 2 + 0.08]}>
        <boxGeometry args={[ROOM.W, 0.12, 0.04]} />
        <meshStandardMaterial color={C.baseboard} roughness={0.7} />
      </mesh>
      <mesh position={[-ROOM.W / 2 + 0.08, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, ROOM.D]} />
        <meshStandardMaterial color={C.baseboard} roughness={0.7} />
      </mesh>
      <mesh position={[ROOM.W / 2 - 0.08, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, ROOM.D]} />
        <meshStandardMaterial color={C.baseboard} roughness={0.7} />
      </mesh>

      {/* okno na tylnej ścianie */}
      <WindowToRoof />
    </group>
  );
}

/* =========================================================================
   FALOWNIK HUAWEI SUN2000-STYLE — na tylnej ścianie, na środku
   ========================================================================= */
function Inverter({ state, lcdScreen, onLcdClick }) {
  // Wymiary: ~330mm szer × 520mm wys × 156mm głęb (real Huawei SUN2000-5KTL-M1)
  const W = 0.65;
  const H = 1.05;
  const D = 0.18;
  const x = 0;
  const y = 1.55; // wieszany na środku ściany
  const z = -ROOM.D / 2 + 0.18; // przy ścianie

  // LED state
  const ledStates = useMemo(() => {
    const base = { power: false, grid: false, comm: false, fault: false };
    if (state === "running") return { power: true, grid: true, comm: true, fault: false };
    if (state === "lcd_open") return { power: true, grid: true, comm: true, fault: false };
    if (state === "shutdown_pending") return { power: true, grid: true, comm: false, fault: false };
    if (state === "shutdown_done") return { power: false, grid: true, comm: false, fault: false };
    if (state === "dc_off") return { power: false, grid: true, comm: false, fault: false };
    if (state === "ac_off") return { power: false, grid: false, comm: false, fault: false };
    if (state === "burnt") return { power: false, grid: false, comm: false, fault: true };
    return base;
  }, [state]);

  // pulsowanie LCD gdy aktywny
  const lcdRef = useRef(null);
  useFrame(({ clock }) => {
    if (!lcdRef.current) return;
    const t = clock.getElapsedTime();
    if (state === "running" || state === "lcd_open" || state === "shutdown_pending") {
      lcdRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.08;
    } else {
      lcdRef.current.material.emissiveIntensity = 0.1;
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* === GŁÓWNA OBUDOWA === */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial
          color={C.inverterCase}
          roughness={0.55}
          metalness={0.45}
        />
      </mesh>

      {/* radiator po bokach — pionowe żebra chłodzące */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`fin-l-${i}`} position={[-W / 2 - 0.005, 0, -D / 2 + 0.025 + i * (D / 9)]} castShadow>
          <boxGeometry args={[0.015, H * 0.85, 0.012]} />
          <meshStandardMaterial color={C.inverterFins} roughness={0.7} metalness={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`fin-r-${i}`} position={[W / 2 + 0.005, 0, -D / 2 + 0.025 + i * (D / 9)]} castShadow>
          <boxGeometry args={[0.015, H * 0.85, 0.012]} />
          <meshStandardMaterial color={C.inverterFins} roughness={0.7} metalness={0.6} />
        </mesh>
      ))}

      {/* górny panel z logo i wentylacją */}
      <mesh position={[0, H / 2 - 0.08, D / 2 + 0.002]}>
        <boxGeometry args={[W - 0.05, 0.13, 0.005]} />
        <meshStandardMaterial color={C.inverterCaseLight} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Logo HUAWEI SUN2000 — jako tekst HTML zakotwiczony */}
      <Html
        position={[0, H / 2 - 0.08, D / 2 + 0.008]}
        center
        distanceFactor={3}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#d8d8d8",
            textShadow: "0 1px 2px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          HUAWEI SUN2000-5KTL
        </div>
      </Html>

      {/* === EKRAN LCD === */}
      <mesh
        ref={lcdRef}
        position={[0, H / 2 - 0.3, D / 2 + 0.002]}
        onClick={(e) => {
          e.stopPropagation();
          if (state === "running" || state === "lcd_open" || state === "shutdown_pending") {
            onLcdClick && onLcdClick();
          }
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <boxGeometry args={[W - 0.12, 0.22, 0.006]} />
        <meshStandardMaterial
          color={C.lcdGlass}
          emissive={C.lcdGlow}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Treść na LCD jako HTML */}
      <Html
        position={[0, H / 2 - 0.3, D / 2 + 0.009]}
        center
        distanceFactor={2.2}
        zIndexRange={[20, 0]}
      >
        <LcdContent state={state} lcdScreen={lcdScreen} />
      </Html>

      {/* === LEDy POD LCD === */}
      <group position={[0, H / 2 - 0.5, D / 2 + 0.003]}>
        {[
          { id: "power", label: "POWER", x: -0.18, on: ledStates.power, color: C.ledOn },
          { id: "grid", label: "GRID", x: -0.06, on: ledStates.grid, color: "#60a5fa" },
          { id: "comm", label: "COMM", x: 0.06, on: ledStates.comm, color: C.ledWarn },
          { id: "fault", label: "FAULT", x: 0.18, on: ledStates.fault, color: C.ledFault },
        ].map((led) => (
          <group key={led.id} position={[led.x, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 0.005, 12]} />
              <meshStandardMaterial
                color={led.on ? led.color : C.ledOff}
                emissive={led.on ? led.color : "#000"}
                emissiveIntensity={led.on ? 1.5 : 0}
              />
            </mesh>
            {led.on && (
              <pointLight
                position={[0, 0, 0.05]}
                intensity={0.15}
                distance={0.4}
                color={led.color}
              />
            )}
          </group>
        ))}
      </group>

      {/* === ETYKIETY LEDów (HTML) === */}
      <Html
        position={[0, H / 2 - 0.56, D / 2 + 0.005]}
        center
        distanceFactor={2.5}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            fontFamily: "monospace",
            fontSize: 5.5,
            fontWeight: 700,
            color: "#9a9a9a",
            letterSpacing: "0.1em",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <span>POWER</span>
          <span>GRID</span>
          <span>COMM</span>
          <span>FAULT</span>
        </div>
      </Html>

      {/* === TABLICZKA OSTRZEGAWCZA === */}
      <mesh position={[W / 2 - 0.12, -H / 2 + 0.16, D / 2 + 0.003]}>
        <boxGeometry args={[0.18, 0.12, 0.003]} />
        <meshStandardMaterial color="#f5a623" roughness={0.6} />
      </mesh>
      <Html
        position={[W / 2 - 0.12, -H / 2 + 0.16, D / 2 + 0.007]}
        center
        distanceFactor={2.2}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "monospace",
            color: "#1a1208",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800 }}>⚠</div>
          <div style={{ fontSize: 5.5, fontWeight: 800, letterSpacing: "0.08em" }}>DANGER</div>
          <div style={{ fontSize: 5, fontWeight: 700 }}>600V DC</div>
        </div>
      </Html>

      {/* === WLOTY KABLI DC NA GÓRZE === */}
      {[-0.12, 0.12].map((dx, i) => (
        <mesh key={`gland-top-${i}`} position={[dx, H / 2 + 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.05, 12]} />
          <meshStandardMaterial color="#1a1d22" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* === WYLOT KABLA AC NA DOLE === */}
      <mesh position={[0, -H / 2 - 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.05, 12]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}

/* =========================================================================
   ZAWARTOŚĆ EKRANU LCD — różna w zależności od stanu
   ========================================================================= */
function LcdContent({ state, lcdScreen }) {
  const baseStyle = {
    width: 168,
    fontFamily: "'Courier New', monospace",
    color: "#4ade80",
    textShadow: "0 0 4px rgba(74,222,128,0.6)",
    fontSize: 9,
    lineHeight: 1.4,
    padding: "6px 10px",
    pointerEvents: "none",
    userSelect: "none",
  };

  if (state === "burnt") {
    return (
      <div style={{ ...baseStyle, color: "#ef4444", textShadow: "0 0 4px rgba(239,68,68,0.6)" }}>
        <div style={{ fontWeight: 800, fontSize: 11 }}>⚠ FAULT</div>
        <div>E-503 OVERTEMP</div>
        <div>String 2: SHORT</div>
      </div>
    );
  }

  if (state === "ac_off") {
    return (
      <div style={{ ...baseStyle, color: "#666", textShadow: "none" }}>
        <div style={{ fontSize: 11 }}>OFFLINE</div>
        <div>—</div>
      </div>
    );
  }

  if (state === "shutdown_done" || state === "dc_off") {
    return (
      <div style={{ ...baseStyle, color: "#f5a623", textShadow: "0 0 4px rgba(245,166,35,0.6)" }}>
        <div style={{ fontSize: 10, fontWeight: 700 }}>SHUTDOWN OK</div>
        <div>U_DC: 12.4V</div>
        <div>I_DC: 0.0A</div>
        <div style={{ fontSize: 8 }}>safe to switch</div>
      </div>
    );
  }

  if (state === "shutdown_pending") {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: 10, fontWeight: 700 }}>DISCHARGING...</div>
        <div>U_DC: 198V ↓</div>
        <div>{"████░░░░░░ 40%"}</div>
        <div style={{ fontSize: 8 }}>wait ~2:30</div>
      </div>
    );
  }

  if (state === "lcd_open") {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>SERVICE MENU</div>
        <div>{">"} Safe Shutdown</div>
        <div style={{ color: "#666" }}>{"  "}Reset Fault</div>
        <div style={{ color: "#666" }}>{"  "}Logs</div>
      </div>
    );
  }

  // running
  return (
    <div style={baseStyle}>
      <div style={{ fontSize: 10, fontWeight: 700 }}>RUNNING</div>
      <div>P_AC: 4.83 kW</div>
      <div>U_DC: 384V</div>
      <div>I_DC: 12.6A</div>
    </div>
  );
}

/* =========================================================================
   KABLE — DC od góry falownika do sufitu/okna, AC od dołu do rozdzielnicy
   ========================================================================= */
function Cables({ state }) {
  // Kable DC: z falownika (góra, środek tylnej ściany) idą w górę i w lewo do okna
  // Kable AC: z falownika (dół) idą w prawo do rozdzielnicy AC
  const dcPlus = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector3(-0.12, 2.62, -ROOM.D / 2 + 0.18));
    points.push(new THREE.Vector3(-0.12, 2.95, -ROOM.D / 2 + 0.12));
    points.push(new THREE.Vector3(-1.2, 3.05, -ROOM.D / 2 + 0.12));
    points.push(new THREE.Vector3(-2.4, 2.85, -ROOM.D / 2 + 0.12));
    return new THREE.CatmullRomCurve3(points);
  }, []);
  const dcMinus = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector3(0.12, 2.62, -ROOM.D / 2 + 0.18));
    points.push(new THREE.Vector3(0.12, 2.98, -ROOM.D / 2 + 0.12));
    points.push(new THREE.Vector3(-1.1, 3.08, -ROOM.D / 2 + 0.12));
    points.push(new THREE.Vector3(-2.38, 2.88, -ROOM.D / 2 + 0.12));
    return new THREE.CatmullRomCurve3(points);
  }, []);
  const acCurve = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector3(0, 1.0, -ROOM.D / 2 + 0.18));
    points.push(new THREE.Vector3(0, 0.6, -ROOM.D / 2 + 0.18));
    points.push(new THREE.Vector3(1.0, 0.45, -ROOM.D / 2 + 0.18));
    points.push(new THREE.Vector3(2.4, 0.45, -ROOM.D / 2 + 0.18));
    points.push(new THREE.Vector3(2.6, 0.9, -ROOM.D / 2 + 0.18));
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // intensywność DC zależna od stanu
  const dcAlive = state === "running" || state === "lcd_open" || state === "shutdown_pending";
  const acAlive = state !== "ac_off";

  return (
    <group>
      {/* DC+ czerwony */}
      <mesh>
        <tubeGeometry args={[dcPlus, 24, 0.018, 8, false]} />
        <meshStandardMaterial
          color={C.cableDC_plus}
          roughness={0.55}
          emissive={dcAlive ? "#220606" : "#000"}
          emissiveIntensity={dcAlive ? 0.3 : 0}
        />
      </mesh>
      {/* DC- czarny */}
      <mesh>
        <tubeGeometry args={[dcMinus, 24, 0.018, 8, false]} />
        <meshStandardMaterial color={C.cableDC_minus} roughness={0.55} />
      </mesh>
      {/* AC szary */}
      <mesh>
        <tubeGeometry args={[acCurve, 32, 0.028, 8, false]} />
        <meshStandardMaterial
          color={C.cableAC}
          roughness={0.6}
          emissive={acAlive ? "#1a1a0a" : "#000"}
          emissiveIntensity={acAlive ? 0.2 : 0}
        />
      </mesh>
    </group>
  );
}

/* =========================================================================
   HEBEL DC — separator po lewej stronie falownika
   ========================================================================= */
function SwitchDC({ state, onToggle, canOperate, hoverHint, setHoverHint }) {
  // pozycje: po lewej od falownika
  const x = -0.9;
  const y = 1.55;
  const z = -ROOM.D / 2 + 0.16;

  // dźwignia: kąt obrotu zależny od stanu
  // ON (running): dźwignia pionowo (kąt = 0)
  // OFF (dc_off / ac_off): dźwignia pozioma (kąt = -PI/2)
  const isOff = state === "dc_off" || state === "ac_off";
  const targetAngle = isOff ? -Math.PI / 2 : 0;

  const handleRef = useRef(null);
  useFrame(() => {
    if (!handleRef.current) return;
    handleRef.current.rotation.z = THREE.MathUtils.lerp(
      handleRef.current.rotation.z,
      targetAngle,
      0.15
    );
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!canOperate) return;
    onToggle && onToggle("dc");
  };

  return (
    <group position={[x, y, z]}>
      {/* === OBUDOWA === */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.34, 0.12]} />
        <meshStandardMaterial color={C.switchBodyDC} roughness={0.7} metalness={0.3} />
      </mesh>

      {/* górna tabliczka */}
      <mesh position={[0, 0.12, 0.061]}>
        <boxGeometry args={[0.18, 0.06, 0.003]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.8} />
      </mesh>
      <Html
        position={[0, 0.12, 0.066]}
        center
        distanceFactor={2}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "monospace",
            color: "#e8e8e8",
            fontSize: 5,
            fontWeight: 800,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div>SEPARATOR DC</div>
          <div style={{ color: "#f5a623", marginTop: 1 }}>600V · 32A</div>
        </div>
      </Html>

      {/* symbol błyskawicy */}
      <Html
        position={[-0.07, 0.05, 0.062]}
        center
        distanceFactor={2.5}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            fontSize: 14,
            color: "#f5a623",
            textShadow: "0 0 4px rgba(245,166,35,0.5)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ⚡
        </div>
      </Html>

      {/* === DŹWIGNIA — obracana === */}
      <group position={[0, -0.02, 0.062]}>
        <group ref={handleRef}>
          {/* podstawa dźwigni */}
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
            <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* trzon dźwigni */}
          <mesh
            position={[0, 0.06, 0.015]}
            castShadow
            onClick={handleClick}
            onPointerOver={() => {
              setHoverHint && setHoverHint("dc");
              document.body.style.cursor = canOperate ? "grab" : "not-allowed";
            }}
            onPointerOut={() => {
              setHoverHint && setHoverHint(null);
              document.body.style.cursor = "default";
            }}
          >
            <boxGeometry args={[0.03, 0.12, 0.03]} />
            <meshStandardMaterial
              color={C.switchHandleDC}
              roughness={0.4}
              metalness={0.2}
              emissive={canOperate ? "#220606" : "#000"}
              emissiveIntensity={canOperate ? 0.3 : 0}
            />
          </mesh>
          {/* gałka na końcu dźwigni */}
          <mesh position={[0, 0.12, 0.015]} castShadow>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshStandardMaterial color={C.switchHandleDCDark} roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      </group>

      {/* === DIODA STANU === */}
      <mesh position={[0.07, -0.13, 0.062]}>
        <cylinderGeometry args={[0.012, 0.012, 0.005, 12]} />
        <meshStandardMaterial
          color={isOff ? C.ledOff : C.ledOn}
          emissive={isOff ? "#000" : C.ledOn}
          emissiveIntensity={isOff ? 0 : 1.4}
        />
      </mesh>

      {/* napisy I/O po bokach dźwigni */}
      <Html
        position={[-0.05, 0.05, 0.062]}
        center
        distanceFactor={2.2}
        zIndexRange={[10, 0]}
      >
        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 800, color: "#888", pointerEvents: "none", userSelect: "none" }}>
          I
        </div>
      </Html>
      <Html
        position={[0.05, -0.08, 0.062]}
        center
        distanceFactor={2.2}
        zIndexRange={[10, 0]}
      >
        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 800, color: "#888", pointerEvents: "none", userSelect: "none" }}>
          O
        </div>
      </Html>

      {/* tooltip blokady */}
      {hoverHint === "dc" && !canOperate && (
        <Html
          position={[0, 0.25, 0.1]}
          center
          distanceFactor={3}
          zIndexRange={[50, 0]}
        >
          <div
            style={{
              background: "rgba(20,15,10,0.92)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#fca5a5",
              padding: "4px 10px",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 9,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            ⚠ Najpierw Safe Shutdown przez LCD
          </div>
        </Html>
      )}
    </group>
  );
}

/* =========================================================================
   ROZDZIELNICA AC — po prawej stronie, mała szafka z wyłącznikiem
   ========================================================================= */
function ACDistributionBox({ state, onToggle, canOperate, hoverHint, setHoverHint }) {
  const x = 2.6;
  const y = 1.15;
  const z = -ROOM.D / 2 + 0.16;

  const isOff = state === "ac_off";
  const targetAngle = isOff ? -Math.PI / 2 : 0;

  const handleRef = useRef(null);
  useFrame(() => {
    if (!handleRef.current) return;
    handleRef.current.rotation.z = THREE.MathUtils.lerp(
      handleRef.current.rotation.z,
      targetAngle,
      0.15
    );
  });

  return (
    <group position={[x, y, z]}>
      {/* obudowa rozdzielnicy */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.55, 0.16]} />
        <meshStandardMaterial color="#e8e6df" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* pokrywa szklana */}
      <mesh position={[0, 0, 0.081]}>
        <boxGeometry args={[0.4, 0.5, 0.003]} />
        <meshStandardMaterial
          color="#1a1d22"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* nagłówek rozdzielnicy */}
      <Html
        position={[0, 0.32, 0.085]}
        center
        distanceFactor={2.2}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 6,
            fontWeight: 800,
            color: "#3a3530",
            letterSpacing: "0.1em",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ROZDZIELNICA AC
        </div>
      </Html>

      {/* === WYŁĄCZNIK AC w środku === */}
      <group position={[0, 0.05, 0.085]}>
        {/* czarne tło wyłącznika */}
        <mesh>
          <boxGeometry args={[0.16, 0.22, 0.02]} />
          <meshStandardMaterial color="#0a0c10" roughness={0.7} />
        </mesh>

        {/* dźwignia AC */}
        <group ref={handleRef} position={[0, -0.02, 0.012]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
            <meshStandardMaterial color="#1a1d22" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh
            position={[0, 0.05, 0.01]}
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              if (canOperate) onToggle && onToggle("ac");
            }}
            onPointerOver={() => {
              setHoverHint && setHoverHint("ac");
              document.body.style.cursor = canOperate ? "grab" : "not-allowed";
            }}
            onPointerOut={() => {
              setHoverHint && setHoverHint(null);
              document.body.style.cursor = "default";
            }}
          >
            <boxGeometry args={[0.022, 0.1, 0.024]} />
            <meshStandardMaterial
              color={C.switchHandleAC}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.1, 0.01]} castShadow>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshStandardMaterial color="#000" roughness={0.6} />
          </mesh>
        </group>

        {/* dioda AC */}
        <mesh position={[0.06, -0.08, 0.012]}>
          <cylinderGeometry args={[0.01, 0.01, 0.004, 12]} />
          <meshStandardMaterial
            color={isOff ? C.ledOff : "#60a5fa"}
            emissive={isOff ? "#000" : "#60a5fa"}
            emissiveIntensity={isOff ? 0 : 1.4}
          />
        </mesh>
      </group>

      {/* tabliczka 230V */}
      <Html
        position={[0, -0.18, 0.085]}
        center
        distanceFactor={2.2}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 5.5,
            fontWeight: 700,
            color: "#3a3530",
            letterSpacing: "0.08em",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          WYŁĄCZNIK · 230V · 25A
        </div>
      </Html>

      {/* tooltip blokady */}
      {hoverHint === "ac" && !canOperate && (
        <Html
          position={[0, 0.4, 0.1]}
          center
          distanceFactor={3}
          zIndexRange={[50, 0]}
        >
          <div
            style={{
              background: "rgba(20,15,10,0.92)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#fca5a5",
              padding: "4px 10px",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 9,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            ⚠ Najpierw wyłącz DC
          </div>
        </Html>
      )}
    </group>
  );
}

/* =========================================================================
   STÓŁ ROBOCZY + WYPOSAŻENIE — dekoracje pomieszczenia
   ========================================================================= */
function WorkbenchAndProps() {
  return (
    <group>
      {/* stół warsztatowy po prawej */}
      <group position={[3.6, 0, 1.5]}>
        {/* blat */}
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.06, 0.7]} />
          <meshStandardMaterial color="#5a4a35" roughness={0.85} />
        </mesh>
        {/* nogi */}
        {[[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].map(([dx, dz], i) => (
          <mesh key={`leg-${i}`} position={[dx, 0.42, dz]} castShadow>
            <boxGeometry args={[0.06, 0.85, 0.06]} />
            <meshStandardMaterial color="#3a3530" roughness={0.7} metalness={0.3} />
          </mesh>
        ))}
        {/* skrzynka narzędzi */}
        <mesh position={[-0.35, 1.0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.22, 0.25]} />
          <meshStandardMaterial color="#cc2820" roughness={0.6} />
        </mesh>
        {/* multimetr na stole */}
        <mesh position={[0.3, 0.92, 0]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.15]} />
          <meshStandardMaterial color="#f5a623" roughness={0.5} />
        </mesh>
        {/* ekran multimetru */}
        <mesh position={[0.3, 0.99, 0.076]}>
          <boxGeometry args={[0.14, 0.05, 0.003]} />
          <meshStandardMaterial color="#0a1a0a" emissive="#4ade80" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* kask na stole */}
      <mesh position={[3.85, 1.02, 1.8]} castShadow>
        <sphereGeometry args={[0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.hi} roughness={0.5} />
      </mesh>

      {/* kabel na podłodze (zwijka) */}
      <mesh position={[-3, 0.06, 2.5]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.25, 0.04, 8, 24]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.7} />
      </mesh>

      {/* puszka rozdzielcza na ścianie po prawej */}
      <mesh position={[ROOM.W / 2 - 0.12, 1.8, 1.5]} castShadow>
        <boxGeometry args={[0.08, 0.25, 0.25]} />
        <meshStandardMaterial color="#e8e6df" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* =========================================================================
   ŚWIAT POMIESZCZENIA TECHNICZNEGO
   ========================================================================= */
function InverterWorld({ state, lcdScreen, onLcdClick, onToggleSwitch, canOperateDC, canOperateAC }) {
  const [hoverHint, setHoverHint] = useState(null);

  return (
    <>
      {/* === oświetlenie ogólne === */}
      <ambientLight intensity={0.5} color="#fff0d8" />
      <directionalLight
        position={[2, 5, 4]}
        intensity={1.1}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* lampa sufitowa */}
      <pointLight position={[0, ROOM.H - 0.2, 0]} intensity={1.0} distance={8} color="#ffe8c0" />
      <pointLight position={[2.5, ROOM.H - 0.2, 1]} intensity={0.7} distance={6} color="#ffe8c0" />

      {/* atmosferyczna mgła */}
      <fog attach="fog" args={["#a89880", 8, 22]} />

      {/* pomieszczenie */}
      <RoomShell />

      {/* falownik */}
      <Inverter state={state} lcdScreen={lcdScreen} onLcdClick={onLcdClick} />

      {/* kable */}
      <Cables state={state} />

      {/* hebel DC */}
      <SwitchDC
        state={state}
        onToggle={onToggleSwitch}
        canOperate={canOperateDC}
        hoverHint={hoverHint}
        setHoverHint={setHoverHint}
      />

      {/* rozdzielnica AC */}
      <ACDistributionBox
        state={state}
        onToggle={onToggleSwitch}
        canOperate={canOperateAC}
        hoverHint={hoverHint}
        setHoverHint={setHoverHint}
      />

      {/* stół + props */}
      <WorkbenchAndProps />

      {/* kurz */}
      <DustParticles count={120} />

      <OrbitControls
        target={[0, 1.5, 0]}
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        minPolarAngle={0.4}
        maxPolarAngle={1.45}
      />
    </>
  );
}

/* =========================================================================
   GŁÓWNY EKSPORT KOMPONENTU SCENY
   ========================================================================= */
export default function InverterRoomScene({
  state = "running",
  lcdScreen = "main",
  onLcdClick,
  onToggleSwitch,
  onExit,
}) {
  // logika: hebel DC działa tylko po shutdown_done; AC tylko po dc_off
  const canOperateDC = state === "shutdown_done" || state === "dc_off";
  const canOperateAC = state === "dc_off" || state === "ac_off";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#1a1d22" }}>
      <Canvas
        shadows
        camera={{ position: [3.5, 2.5, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#2a2520"]} />
        <Suspense fallback={null}>
          <InverterWorld
            state={state}
            lcdScreen={lcdScreen}
            onLcdClick={onLcdClick}
            onToggleSwitch={onToggleSwitch}
            canOperateDC={canOperateDC}
            canOperateAC={canOperateAC}
          />
          <EffectComposer>
            <Bloom intensity={0.45} luminanceThreshold={0.75} luminanceSmoothing={0.2} mipmapBlur />
            <Vignette offset={0.32} darkness={0.55} />
            <ChromaticAberration offset={[0.0004, 0.0004]} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* === minimalny HUD na ten krok (pełen HUD w kolejnej turze) === */}
      <div
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5"
        style={{
          height: 60,
          background: "linear-gradient(180deg, rgba(15,18,24,0.92), rgba(15,18,24,0))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-[#f5a623]/30 bg-[#f5a623]/15">
            <Zap className="h-5 w-5 text-[#f5a623]" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white">
              Pomieszczenie techniczne · Falownik SUN2000
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
              Stan: {state}
            </div>
          </div>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-display text-xs font-semibold text-white backdrop-blur-md hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" /> Wyjdź
          </button>
        )}
      </div>
    </div>
  );
}
