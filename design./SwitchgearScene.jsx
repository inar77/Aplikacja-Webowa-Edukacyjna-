Robię FPP-overlay z kredowymi affordances. Buduję realistyczną scenę rozdzielni 230V (SVG, żeby było spójne i lekkie), z system step-by-step podpowiedzi + parallax (lekkie kołysanie kamery dla wrażenia FPP). Dodam też routing: z briefingu → wejście do scenki.
Action: file_editor create /app/frontend/src/navig/SwitchgearScene.jsx --file-text "import React from \"react\";

/**
 * SwitchgearScene
 * ------------------------------------------------------------
 * Stylizowana, \"fotorealistyczna\" SVG-scenka rozdzielni 230V
 * widzianej w trybie FPP. Każdy interaktywny element ma id,
 * po którym overlay z HandDrawnArrow celuje (przekazujemy world-coords).
 *
 * Props:
 *   onHit(id) – wywołane przy kliknięciu w element
 *   completedSteps – Set<string>, co user już zaliczył
 *   activeId – id elementu który aktualnie jest \"live\" (mocniejszy glow)
 */
export default function SwitchgearScene({ onHit, completedSteps = new Set(), activeId }) {
  const interact = (id) => () => onHit?.(id);

  const isDone = (id) => completedSteps.has(id);
  const isActive = (id) => activeId === id;

  return (
    <svg
      data-testid=\"switchgear-scene\"
      viewBox=\"0 0 1000 620\"
      className=\"h-full w-full\"
      preserveAspectRatio=\"xMidYMid meet\"
    >
      <defs>
        {/* metal cabinet gradient */}
        <linearGradient id=\"cab\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
          <stop offset=\"0%\" stopColor=\"#3a3f4a\" />
          <stop offset=\"50%\" stopColor=\"#22262e\" />
          <stop offset=\"100%\" stopColor=\"#181b22\" />
        </linearGradient>
        <linearGradient id=\"cab-inner\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
          <stop offset=\"0%\" stopColor=\"#0f1218\" />
          <stop offset=\"100%\" stopColor=\"#1a1e26\" />
        </linearGradient>
        {/* breaker plastic */}
        <linearGradient id=\"breaker-body\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
          <stop offset=\"0%\" stopColor=\"#e8e2d2\" />
          <stop offset=\"100%\" stopColor=\"#b9b29f\" />
        </linearGradient>
        <linearGradient id=\"breaker-body-off\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
          <stop offset=\"0%\" stopColor=\"#7a6e57\" />
          <stop offset=\"100%\" stopColor=\"#5a4f3d\" />
        </linearGradient>
        {/* lever */}
        <linearGradient id=\"lever\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
          <stop offset=\"0%\" stopColor=\"#1f1f1f\" />
          <stop offset=\"100%\" stopColor=\"#0a0a0a\" />
        </linearGradient>
        {/* warm tungsten light from inside */}
        <radialGradient id=\"warm-light\" cx=\"50%\" cy=\"40%\" r=\"60%\">
          <stop offset=\"0%\" stopColor=\"rgba(255,180,90,0.18)\" />
          <stop offset=\"100%\" stopColor=\"rgba(255,180,90,0)\" />
        </radialGradient>
        {/* screw highlight */}
        <radialGradient id=\"screw-grad\" cx=\"35%\" cy=\"35%\" r=\"65%\">
          <stop offset=\"0%\" stopColor=\"#cfd6e0\" />
          <stop offset=\"60%\" stopColor=\"#5a6270\" />
          <stop offset=\"100%\" stopColor=\"#2b2f37\" />
        </radialGradient>
        <filter id=\"soft-shadow\">
          <feGaussianBlur stdDeviation=\"2\" />
        </filter>
        <filter id=\"grain-overlay\">
          <feTurbulence baseFrequency=\"1.4\" numOctaves=\"2\" seed=\"11\" />
          <feColorMatrix values=\"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0\" />
        </filter>
      </defs>

      {/* tło ściany (ceglasta piwnica) */}
      <rect x=\"0\" y=\"0\" width=\"1000\" height=\"620\" fill=\"#1a1410\" />
      <g opacity=\"0.45\">
        {Array.from({ length: 14 }).map((_, row) =>
          Array.from({ length: 22 }).map((__, col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 50 + (row % 2 === 0 ? 0 : 25)}
              y={row * 46}
              width=\"46\"
              height=\"40\"
              fill={`rgb(${50 + ((row + col) % 4) * 8}, ${30 + ((row + col) % 3) * 6}, ${22 + ((row * col) % 5) * 4})`}
              stroke=\"rgba(0,0,0,0.4)\"
              strokeWidth=\"1\"
            />
          ))
        )}
      </g>
      <rect x=\"0\" y=\"0\" width=\"1000\" height=\"620\" fill=\"url(#warm-light)\" />

      {/* podłoga */}
      <polygon points=\"0,520 1000,520 1000,620 0,620\" fill=\"#0e0c0a\" opacity=\"0.85\" />

      {/* CABINET zewnętrzny */}
      <rect x=\"170\" y=\"80\" width=\"660\" height=\"440\" rx=\"8\" fill=\"url(#cab)\" stroke=\"#0a0c10\" strokeWidth=\"2\" />
      {/* cienie wewnętrzne */}
      <rect x=\"186\" y=\"96\" width=\"628\" height=\"408\" rx=\"4\" fill=\"url(#cab-inner)\" />
      {/* śruby narożne (klikalne) */}
      {[
        { id: \"screw-tl\", x: 200, y: 110 },
        { id: \"screw-tr\", x: 800, y: 110 },
        { id: \"screw-bl\", x: 200, y: 490 },
        { id: \"screw-br\", x: 800, y: 490 },
      ].map((s) => (
        <g
          key={s.id}
          data-testid={`fpp-${s.id}`}
          style={{ cursor: \"pointer\" }}
          onClick={interact(s.id)}
        >
          <circle cx={s.x} cy={s.y} r=\"10\" fill=\"url(#screw-grad)\" stroke=\"#0a0c10\" strokeWidth=\"1\" />
          <line x1={s.x - 6} y1={s.y - 2} x2={s.x + 6} y2={s.y + 2} stroke=\"#1a1e26\" strokeWidth=\"1.6\" />
          {isActive(s.id) && (
            <circle cx={s.x} cy={s.y} r=\"14\" fill=\"none\" stroke=\"#f4a13d\" strokeWidth=\"1.4\" opacity=\"0.7\">
              <animate attributeName=\"r\" values=\"12;20;12\" dur=\"1.8s\" repeatCount=\"indefinite\" />
              <animate attributeName=\"opacity\" values=\"0.7;0;0.7\" dur=\"1.8s\" repeatCount=\"indefinite\" />
            </circle>
          )}
          {isDone(s.id) && (
            <circle cx={s.x} cy={s.y} r=\"14\" fill=\"none\" stroke=\"#58d896\" strokeWidth=\"1.4\" />
          )}
        </g>
      ))}

      {/* etykieta nad szyną */}
      <rect x=\"240\" y=\"135\" width=\"520\" height=\"22\" rx=\"3\" fill=\"#2b2f37\" stroke=\"#0a0c10\" strokeWidth=\"1\" />
      <text
        x=\"500\"
        y=\"151\"
        textAnchor=\"middle\"
        fill=\"#c8d2e6\"
        fontFamily=\"JetBrains Mono, monospace\"
        fontSize=\"11\"
        letterSpacing=\"2\"
      >
        ROZDZIELNIA · 230 V · OBWÓD 03
      </text>

      {/* SZYNA DIN */}
      <rect x=\"220\" y=\"200\" width=\"560\" height=\"22\" fill=\"#2a2e36\" stroke=\"#0a0c10\" strokeWidth=\"1\" />
      <rect x=\"220\" y=\"200\" width=\"560\" height=\"6\" fill=\"#3d424c\" />

      {/* MAIN SWITCH (główny wyłącznik) – po lewej */}
      <g
        data-testid=\"fpp-main-breaker\"
        style={{ cursor: \"pointer\" }}
        onClick={interact(\"main-breaker\")}
      >
        <rect x=\"232\" y=\"216\" width=\"56\" height=\"120\" rx=\"3\" fill=\"url(#breaker-body)\" stroke=\"#0a0c10\" strokeWidth=\"1.5\" />
        <rect x=\"244\" y=\"252\" width=\"32\" height=\"48\" rx=\"2\" fill=\"url(#lever)\" stroke=\"#0a0c10\" strokeWidth=\"1\" />
        <rect x=\"252\" y=\"262\" width=\"16\" height=\"6\" fill=\"#cf4040\" />
        <text x=\"260\" y=\"345\" textAnchor=\"middle\" fill=\"#3a3f4a\" fontFamily=\"JetBrains Mono, monospace\" fontSize=\"8\">MAIN</text>
        {isActive(\"main-breaker\") && (
          <rect x=\"228\" y=\"212\" width=\"64\" height=\"128\" rx=\"4\" fill=\"none\" stroke=\"#f4a13d\" strokeWidth=\"2\" opacity=\"0.7\">
            <animate attributeName=\"opacity\" values=\"0.7;0.15;0.7\" dur=\"1.4s\" repeatCount=\"indefinite\" />
          </rect>
        )}
        {isDone(\"main-breaker\") && (
          <>
            <rect x=\"244\" y=\"252\" width=\"32\" height=\"48\" rx=\"2\" fill=\"url(#lever)\" />
            <rect x=\"252\" y=\"282\" width=\"16\" height=\"6\" fill=\"#58d896\" />
            <text x=\"260\" y=\"306\" textAnchor=\"middle\" fill=\"#58d896\" fontFamily=\"JetBrains Mono, monospace\" fontSize=\"9\">OFF</text>
          </>
        )}
      </g>

      {/* BREAKERY (5 szt) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 330 + i * 70;
        const id = `breaker-${i + 1}`;
        const off = isDone(id);
        return (
          <g
            key={id}
            data-testid={`fpp-${id}`}
            style={{ cursor: \"pointer\" }}
            onClick={interact(id)}
          >
            <rect
              x={x}
              y=\"216\"
              width=\"50\"
              height=\"100\"
              rx=\"3\"
              fill={off ? \"url(#breaker-body-off)\" : \"url(#breaker-body)\"}
              stroke=\"#0a0c10\"
              strokeWidth=\"1.5\"
            />
            <rect x={x + 11} y={off ? 268 : 246} width=\"28\" height=\"40\" rx=\"2\" fill=\"url(#lever)\" stroke=\"#0a0c10\" strokeWidth=\"1\" />
            <rect x={x + 18} y={off ? 278 : 256} width=\"14\" height=\"4\" fill={off ? \"#58d896\" : \"#cf4040\"} />
            <text x={x + 25} y=\"325\" textAnchor=\"middle\" fill=\"#3a3f4a\" fontFamily=\"JetBrains Mono, monospace\" fontSize=\"8\">
              C{i + 1}
            </text>
            {/* zacisk od dołu (klikalny dla \"odkręć zacisk\") */}
            <rect x={x + 14} y=\"316\" width=\"22\" height=\"14\" fill=\"#cf9a3d\" stroke=\"#5a3f10\" strokeWidth=\"1\" />
            {/* śrubka na zacisku */}
            <circle cx={x + 25} cy=\"323\" r=\"3.5\" fill=\"url(#screw-grad)\" stroke=\"#0a0c10\" strokeWidth=\"0.5\" />
            <line x1={x + 22} y1=\"321\" x2={x + 28} y2=\"325\" stroke=\"#1a1e26\" strokeWidth=\"1\" />
            {isActive(id) && (
              <rect x={x - 4} y=\"212\" width=\"58\" height=\"124\" rx=\"4\" fill=\"none\" stroke=\"#f4a13d\" strokeWidth=\"2\">
                <animate attributeName=\"opacity\" values=\"0.9;0.2;0.9\" dur=\"1.4s\" repeatCount=\"indefinite\" />
              </rect>
            )}
          </g>
        );
      })}

      {/* TERMINAL (zacisk PE) – po prawej, kluczowy do \"odkręć zacisk\" */}
      <g
        data-testid=\"fpp-pe-terminal\"
        style={{ cursor: \"pointer\" }}
        onClick={interact(\"pe-terminal\")}
      >
        <rect x=\"690\" y=\"216\" width=\"80\" height=\"100\" rx=\"3\" fill=\"#3d3a2a\" stroke=\"#0a0c10\" strokeWidth=\"1.5\" />
        <text x=\"730\" y=\"232\" textAnchor=\"middle\" fill=\"#9a8c5a\" fontFamily=\"JetBrains Mono, monospace\" fontSize=\"9\" letterSpacing=\"2\">PE / N</text>
        {/* 4 śrubki w rzędzie */}
        {[0, 1, 2, 3].map((j) => (
          <g key={j}>
            <rect x={700 + j * 18} y=\"248\" width=\"14\" height=\"22\" fill=\"#1f1d18\" stroke=\"#0a0c10\" strokeWidth=\"0.6\" />
            <circle cx={707 + j * 18} cy=\"259\" r=\"4.5\" fill=\"url(#screw-grad)\" stroke=\"#0a0c10\" strokeWidth=\"0.5\" />
            <line x1={704 + j * 18} y1=\"257\" x2={710 + j * 18} y2=\"261\" stroke=\"#1a1e26\" strokeWidth=\"1.2\" />
          </g>
        ))}
        {/* przewody wychodzące */}
        <path d=\"M 707 270 Q 700 360, 660 420\" stroke=\"#f7d04a\" strokeWidth=\"3\" fill=\"none\" />
        <path d=\"M 725 270 Q 730 360, 760 420\" stroke=\"#3a8fe6\" strokeWidth=\"3\" fill=\"none\" />
        <path d=\"M 743 270 Q 760 360, 790 430\" stroke=\"#58d896\" strokeWidth=\"3\" fill=\"none\" />
        <path d=\"M 761 270 Q 790 360, 820 430\" stroke=\"#a0a0a0\" strokeWidth=\"3\" fill=\"none\" />

        {isActive(\"pe-terminal\") && (
          <rect x=\"686\" y=\"212\" width=\"88\" height=\"108\" rx=\"4\" fill=\"none\" stroke=\"#f4a13d\" strokeWidth=\"2\">
            <animate attributeName=\"opacity\" values=\"0.95;0.2;0.95\" dur=\"1.4s\" repeatCount=\"indefinite\" />
          </rect>
        )}
        {isDone(\"pe-terminal\") && (
          <rect x=\"686\" y=\"212\" width=\"88\" height=\"108\" rx=\"4\" fill=\"none\" stroke=\"#58d896\" strokeWidth=\"2\" opacity=\"0.85\" />
        )}
      </g>

      {/* PRZEWODY pod breakerami */}
      <g opacity=\"0.92\">
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 330 + i * 70 + 25;
          return (
            <path
              key={i}
              d={`M ${x} 330 C ${x} 380, ${280 + i * 40} 410, ${260 + i * 50} 470`}
              stroke={[\"#cf4040\", \"#3a8fe6\", \"#58d896\", \"#f7d04a\", \"#a0a0a0\"][i]}
              strokeWidth=\"3\"
              fill=\"none\"
            />
          );
        })}
      </g>

      {/* MULTIMETR – po lewej dole sceny, klikalne sondy */}
      <g
        data-testid=\"fpp-multimeter\"
        style={{ cursor: \"pointer\" }}
        onClick={interact(\"multimeter\")}
      >
        {/* korpus */}
        <rect x=\"40\" y=\"430\" width=\"120\" height=\"160\" rx=\"10\" fill=\"#d97a1f\" stroke=\"#7a3d05\" strokeWidth=\"2\" />
        <rect x=\"48\" y=\"440\" width=\"104\" height=\"46\" rx=\"3\" fill=\"#0f1218\" stroke=\"#0a0c10\" strokeWidth=\"1\" />
        <text
          x=\"100\"
          y=\"473\"
          textAnchor=\"middle\"
          fill=\"#58d896\"
          fontFamily=\"JetBrains Mono, monospace\"
          fontWeight=\"600\"
          fontSize=\"18\"
          letterSpacing=\"1\"
        >
          {isDone(\"multimeter\") ? \"0.00\" : \"230.4\"}
        </text>
        {/* pokrętło */}
        <circle cx=\"100\" cy=\"528\" r=\"26\" fill=\"#1f1f1f\" stroke=\"#0a0c10\" strokeWidth=\"1.5\" />
        <line x1=\"100\" y1=\"528\" x2=\"100\" y2=\"508\" stroke=\"#f4ecd8\" strokeWidth=\"2.5\" strokeLinecap=\"round\" />
        {/* sondy */}
        <path d=\"M 60 590 C 30 600, 10 540, 30 480\" stroke=\"#cf4040\" strokeWidth=\"3.5\" fill=\"none\" />
        <path d=\"M 140 590 C 180 600, 200 540, 180 480\" stroke=\"#1a1a1a\" strokeWidth=\"3.5\" fill=\"none\" />
        <text x=\"100\" y=\"615\" textAnchor=\"middle\" fill=\"#f4ecd8\" fontFamily=\"JetBrains Mono, monospace\" fontSize=\"9\" letterSpacing=\"2\" opacity=\"0.8\">FLUKE 117</text>
        {isActive(\"multimeter\") && (
          <rect x=\"34\" y=\"424\" width=\"132\" height=\"172\" rx=\"12\" fill=\"none\" stroke=\"#f4a13d\" strokeWidth=\"2\">
            <animate attributeName=\"opacity\" values=\"0.9;0.2;0.9\" dur=\"1.4s\" repeatCount=\"indefinite\" />
          </rect>
        )}
      </g>

      {/* lekki refleks na froncie szafy */}
      <rect x=\"170\" y=\"80\" width=\"660\" height=\"440\" rx=\"8\" fill=\"url(#warm-light)\" opacity=\"0.6\" />

      {/* vignette + grain */}
      <rect x=\"0\" y=\"0\" width=\"1000\" height=\"620\" filter=\"url(#grain-overlay)\" />
      <radialGradient id=\"vignette\" cx=\"50%\" cy=\"50%\" r=\"65%\">
        <stop offset=\"60%\" stopColor=\"rgba(0,0,0,0)\" />
        <stop offset=\"100%\" stopColor=\"rgba(0,0,0,0.85)\" />
      </radialGradient>
      <rect x=\"0\" y=\"0\" width=\"1000\" height=\"620\" fill=\"url(#vignette)\" />
    </svg>
  );
}
"
Observation: Create successful: /app/frontend/src/navig/SwitchgearScene.jsx
