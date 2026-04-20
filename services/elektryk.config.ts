// careers/electrician/config.ts

import type { CareerDefinition } from '../../core/types/career';

export const electricianCareer: CareerDefinition = {
  id: 'electrician',
  name: 'Elektryk',
  icon: '⚡',
  description: 'Instalacje elektryczne, pomiary, diagnostyka usterek',

  theme: {
    environment: {
      bgPrimary: '#0a0e1a',
      bgSecondary: '#111827',
      bgGradient: 'radial-gradient(ellipse at 30% 20%, #0f172a 0%, #020617 50%, #000000 100%)',
      surfaceColor: '#1e293b',
      surfaceTexture: 'metal',
    },
    system: {
      accent: '#06b6d4',           // Cyan — system, mierniki, informacja
      accentGlow: '#22d3ee',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    },
    semantic: {
      live: '#ef4444',             // Faza — czerwień = niebezpieczeństwo
      neutral: '#3b82f6',          // Neutral — niebieski
      earth: '#22c55e',            // Uziemienie — zielony
      liveBrown: '#92400e',        // Brązowy przewód L
      neutralBlue: '#1e40af',      // Niebieski przewód N
      earthGreenYellow: '#15803d', // Żółto-zielony PE
      copper: '#d97706',           // Miedź (przekrój)
      insulation: '#475569',       // Izolacja
      busbar: '#94a3b8',           // Szyna zbiorcza
      panelFrame: '#334155',       // Ramka rozdzielnicy
    },
    ambience: {
      mood: 'industrial',
      lightDirection: 'top-left',
      lightIntensity: 0.6,
      shadowDepth: 0.7,
      noiseOpacity: 0.04,
    },
    audio: {
      ambientLoop: '/audio/industrial-hum.mp3',
      interactionSounds: {
        wireConnect: '/audio/click-snap.mp3',
        breakerToggle: '/audio/breaker-click.mp3',
        toolSelect: '/audio/tool-pickup.mp3',
        multimeterBeep: '/audio/beep-short.mp3',
      },
      feedbackSounds: {
        success: '/audio/success-chime.mp3',
        error: '/audio/error-buzz.mp3',
        warning: '/audio/warning-tone.mp3',
        complete: '/audio/mission-complete.mp3',
      },
    },
  },

  toolSet: [
    {
      id: 'multimeter',
      name: 'Multimetr',
      icon: '📊',
      description: 'Pomiar napięcia, prądu i rezystancji',
      category: 'measurement',
      interaction: {
        type: 'point-and-click',
        cursor: 'crosshair',
        useEffect: 'measurement-display',
        useSound: '/audio/multimeter-beep.mp3',
      },
      hotkey: 'M',
    },
    {
      id: 'voltage-tester',
      name: 'Próbnik napięcia',
      icon: '🔍',
      description: 'Szybki test obecności napięcia',
      category: 'diagnostic',
      interaction: {
        type: 'point-and-click',
        cursor: 'crosshair',
        useEffect: 'glow',
        useSound: '/audio/tester-beep.mp3',
      },
      hotkey: 'V',
    },
    {
      id: 'screwdriver-flat',
      name: 'Wkrętak płaski',
      icon: '🪛',
      description: 'Do dokręcania zacisków',
      category: 'connection',
      interaction: {
        type: 'point-and-click',
        useEffect: 'none',
        useSound: '/audio/screw-turn.mp3',
      },
      hotkey: 'S',
    },
    {
      id: 'wire-stripper',
      name: 'Ściągacz izolacji',
      icon: '✂️',
      description: 'Zdejmowanie izolacji z przewodów',
      category: 'cutting',
      interaction: {
        type: 'point-and-click',
        useEffect: 'cut-animation',
        useSound: '/audio/strip-click.mp3',
      },
      hotkey: 'W',
    },
    {
      id: 'safety-gloves',
      name: 'Rękawice izolacyjne',
      icon: '🧤',
      description: 'Ochrona przed porażeniem',
      category: 'safety',
      interaction: {
        type: 'toggle',
        useEffect: 'none',
      },
      hotkey: 'G',
    },
  ],

  scenes: [
    // --- MIESZKANIE ---
    {
      id: 'apartment-panel',
      name: 'Mieszkanie — Rozdzielnia',
      description: 'Standardowa rozdzielnia w mieszkaniu na osiedlu',
      difficulty: 'beginner',
      environment: {
        layers: [
          {
            id: 'wall-bg',
            type: 'background',
            zIndex: 0,
            render: 'css',
            css: {
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            },
          },
          {
            id: 'wall-texture',
            type: 'background',
            zIndex: 1,
            render: 'css',
            css: {
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 200px,
                  rgba(255,255,255,0.01) 200px,
                  rgba(255,255,255,0.01) 201px
                )
              `,
              opacity: 0.5,
            },
            parallaxFactor: 0.02,
          },
          {
            id: 'concrete-noise',
            type: 'overlay',
            zIndex: 2,
            render: 'css',
            css: {
              backgroundImage: 'url(/textures/concrete-noise.png)',
              backgroundSize: '200px 200px',
              opacity: 0.04,
              mixBlendMode: 'overlay',
            },
          },
          {
            id: 'light-cone',
            type: 'overlay',
            zIndex: 3,
            render: 'css',
            css: {
              background: 'radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            },
          },
        ],
        lighting: {
          ambient: 'rgba(15, 23, 42, 0.95)',
          spotlights: [
            { x: 50, y: 5, radius: 60, color: '#ffffff', intensity: 0.12, animated: false },
            { x: 50, y: 40, radius: 30, color: '#06b6d4', intensity: 0.05, animated: true },
          ],
        },
        perspective: {
          type: 'frontal',
          depth: 1200,
          vanishingPointX: 50,
          vanishingPointY: 40,
        },
      },
      centralObject: {
        id: 'main-panel',
        name: 'Rozdzielnia mieszkaniowa',
        component: 'DistributionPanel',
        position: { x: 20, y: 10, width: 60, height: 75 },
        parts: [
          { id: 'main-breaker', label: 'Wyłącznik główny', relativePosition: { x: 10, y: 5, width: 15, height: 12 }, interactable: true, state: 'normal' },
          { id: 'rcd-1', label: 'RCD 30mA', relativePosition: { x: 30, y: 5, width: 12, height: 12 }, interactable: true, state: 'normal' },
          { id: 'mcb-kitchen', label: 'B16 Kuchnia', relativePosition: { x: 10, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-bathroom', label: 'B10 Łazienka', relativePosition: { x: 22, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-living', label: 'B16 Salon', relativePosition: { x: 34, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-bedroom', label: 'B10 Sypialnia', relativePosition: { x: 46, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-lighting', label: 'B10 Oświetlenie', relativePosition: { x: 58, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'busbar-N', label: 'Szyna N', relativePosition: { x: 5, y: 50, width: 90, height: 4 }, interactable: true, state: 'normal' },
          { id: 'busbar-PE', label: 'Szyna PE', relativePosition: { x: 5, y: 58, width: 90, height: 4 }, interactable: true, state: 'normal' },
          { id: 'terminal-block', label: 'Listwa zaciskowa', relativePosition: { x: 5, y: 68, width: 90, height: 8 }, interactable: true, state: 'normal' },
        ],
      },
      interactionPoints: [
        {
          id: 'ip-main-breaker',
          x: 25, y: 18, width: 12, height: 10,
          type: 'click',
          label: 'Wyłącznik główny',
          states: {
            idle: { borderColor: 'transparent', opacity: 0, labelVisible: false, pulseAnimation: false },
            hover: { borderColor: '#06b6d4', glowColor: '#06b6d4', glowIntensity: 0.2, opacity: 1, labelVisible: true, pulseAnimation: false },
            active: { borderColor: '#f59e0b', glowColor: '#f59e0b', glowIntensity: 0.4, opacity: 1, labelVisible: true, pulseAnimation: true },
            completed: { borderColor: '#10b981', glowColor: '#10b981', glowIntensity: 0.15, opacity: 0.8, labelVisible: false, pulseAnimation: false },
            error: { borderColor: '#ef4444', glowColor: '#ef4444', glowIntensity: 0.5, opacity: 1, labelVisible: true, pulseAnimation: true },
          },
          taskBinding: 'wire-identification',
        },
      ],
      decorations: [
        { id: 'wall-outlet-left', type: 'outlet', position: { x: 5, y: 70 }, size: { width: 8, height: 6 }, opacity: 0.3, zIndex: 1 },
        { id: 'label-sticker', type: 'sticker', position: { x: 22, y: 88 }, size: { width: 56, height: 5 }, opacity: 0.5, zIndex: 1 },
      ],
    },
  ],

  taskCatalog: [
    // Zadanie 1: Rozpoznaj przewody
    {
      id: 'wire-identification',
      title: 'Rozpoznawanie przewodów',
      briefing: 'Nowy pracownik na budowie musi umieć rozpoznać przewody po kolorach i oznaczeniach. Przed Tobą otwarta rozdzielnia z podłączonymi przewodami.',
      objective: 'Wskaż i prawidłowo zidentyfikuj każdy typ przewodu w rozdzielnicy.',
      difficulty: 'beginner',
      estimatedMinutes: 3,
      maxXP: 150,
      scenario: {
        location: 'Mieszkanie na 3. piętrze, blok z lat 90.',
        situation: 'Szef ekipy poprosił Cię o sprawdzenie rozdzielnicy przed rozpoczęciem prac remontowych.',
        clientNote: 'Proszę nie wyłączać prądu — lodówka musi działać.',
      },
      sceneId: 'apartment-panel',
      requiredTools: ['voltage-tester'],
      safetyRequirements: [
        {
          id: 'safety-gloves',
          label: 'Rękawice izolacyjne',
          description: 'Załóż rękawice przed pracą z rozdzielnią pod napięciem',
          icon: '🧤',
          preWork: true,
          check: 'manual-confirm',
          penalty: 'point-deduction',
          penaltyAmount: 30,
        },
        {
          id: 'voltage-check',
          label: 'Sprawdź napięcie',
          description: 'Przed dotknięciem przewodów, użyj próbnika napięcia',
          icon: '⚡',
          preWork: true,
          check: 'tool-verify',
          penalty: 'task-fail',
        },
      ],
      steps: [
        {
          id: 'step-identify-L',
          order: 1,
          type: 'identify',
          instruction: 'Wskaż przewód fazowy (L). Jaki ma kolor?',
          hint: 'Przewód fazowy ma kolor brązowy wg normy PN-EN 60446.',
          action: {
            type: 'click',
            targetIds: ['wire-L-brown'],
          },
          validation: {
            type: 'exact',
            correctAnswer: 'wire-L-brown',
          },
          successFeedback: 'Dokładnie! Przewód brązowy to faza (L). Pod napięciem 230V — zawsze zachowaj ostrożność.',
          errorFeedbacks: {
            'wire-N-blue': 'To jest przewód neutralny (N), nie fazowy. Przewód fazowy jest brązowy.',
            'wire-PE-green': 'To jest uziemienie (PE). Przewód fazowy jest brązowy, nie żółto-zielony.',
            default: 'To nie jest przewód fazowy. Szukaj przewodu w kolorze brązowym.',
          },
          points: 20,
        },
        {
          id: 'step-identify-N',
          order: 2,
          type: 'identify',
          instruction: 'Teraz wskaż przewód neutralny (N).',
          hint: 'Przewód neutralny ma kolor niebieski.',
          action: {
            type: 'click',
            targetIds: ['wire-N-blue'],
          },
          validation: {
            type: 'exact',
            correctAnswer: 'wire-N-blue',
          },
          successFeedback: 'Tak! Niebieski to neutral (N). W normalnych warunkach nie ma na nim napięcia, ale ZAWSZE traktuj go jak pod napięciem.',
          errorFeedbacks: {
            'wire-L-brown': 'To jest faza (L), nie neutral. Neutral jest niebieski.',
            default: 'To nie jest neutral. Szukaj niebieskiego przewodu.',
          },
          points: 20,
        },
        {
          id: 'step-identify-PE',
          order: 3,
          type: 'identify',
          instruction: 'Ostatni — wskaż przewód ochronny (PE, uziemienie).',
          hint: 'Przewód PE ma charakterystyczny kolor żółto-zielony.',
          action: {
            type: 'click',
            targetIds: ['wire-PE-green'],
          },
          validation: {
            type: 'exact',
            correctAnswer: 'wire-PE-green',
          },
          successFeedback: 'Perfekcyjnie! Żółto-zielony to PE — uziemienie ochronne. Chroni przed porażeniem w razie uszkodzenia izolacji.',
          errorFeedbacks: {
            default: 'To nie jest PE. Szukaj przewodu żółto-zielonego (z paskami).',
          },
          points: 20,
        },
        {
          id: 'step-measure-voltage',
          order: 4,
          type: 'measure',
          instruction: 'Użyj multimetru, aby zmierzyć napięcie między fazą (L) a neutralem (N).',
          hint: 'Wybierz multimetr z paska narzędzi (klawisz M), a potem dotknij kolejno fazy i neutralu.',
          action: {
            type: 'tool-use',
            toolId: 'multimeter',
            toolTarget: 'wire-L-brown',
            expectedValue: { min: 220, max: 240, unit: 'V' },
          },
          validation: {
            type: 'range',
            correctAnswer: { min: 220, max: 240 },
            tolerance: 5,
          },
          successFeedback: 'Pomiar prawidłowy! ~230V AC między fazą a neutralem to standardowe napięcie w instalacji jednofazowej.',
          errorFeedbacks: {
            default: 'Nieprawidłowy pomiar. Upewnij się, że próbniki dotykają L i N.',
          },
          points: 30,
        },
      ],
      possibleErrors: [
        {
          id: 'err-touch-live',
          description: 'Dotknięcie przewodu pod napięciem bez rękawic',
          severity: 'dangerous',
          visualEffect: 'flash',
          explanation: 'W rzeczywistości dotknięcie fazy (230V) bez izolacji może być śmiertelne! Prąd 30mA przez ciało jest już niebezpieczny.',
          realWorldConsequence: 'Porażenie prądem, możliwe zatrzymanie akcji serca.',
          pointPenalty: 50,
        },
        {
          id: 'err-wrong-wire',
          description: 'Pomylenie fazy z neutralem',
          severity: 'major',
          visualEffect: 'red-glow',
          explanation: 'Pomylenie L z N w instalacji może prowadzić do niebezpiecznej sytuacji — urządzenia mogą być pod napięciem nawet po wyłączeniu.',
          realWorldConsequence: 'Zagrożenie porażeniem przy serwisowaniu urządzeń.',
          pointPenalty: 20,
        },
      ],
      grading: {
        thresholds: { perfect: 95, excellent: 85, good: 70, passing: 50 },
        speedBonus: { underSeconds: 120, bonusXP: 30 },
        noErrorBonus: 40,
        safetyPerfectBonus: 25,
      },
    },
  ],

  progression: {
    levels: [
      { level: 1, title: 'Praktykant', minXP: 0, icon: '🔰' },
      { level: 2, title: 'Pomocnik', minXP: 500, icon: '🔧' },
      { level: 3, title: 'Czeladnik', minXP: 1500, icon: '⚡' },
      { level: 4, title: 'Elektryk', minXP: 4000, icon: '🏅' },
      { level: 5, title: 'Starszy Elektryk', minXP: 8000, icon: '🏆' },
      { level: 6, title: 'Mistrz Instalacji', minXP: 15000, icon: '👑' },
    ],
    milestones: [
      { id: 'first-task', name: 'Pierwszy dzień', description: 'Ukończ pierwsze zadanie', icon: '📋', xpReward: 50 },
      { id: 'safety-perfect', name: 'Bezpieczny praktyk', description: '5 zadań bez naruszenia BHP', icon: '🛡️', xpReward: 100 },
      { id: 'speed-demon', name: 'Sprawny jak prąd', description: 'Ukończ zadanie w połowie czasu', icon: '⚡', xpReward: 75 },
    ],
  },

  learningMetaphor: {
    progressLabel: 'Stopień kwalifikacji',
    experienceLabel: 'Godziny praktyki',
    completionVerb: 'Wykonał',
    workplaceNoun: 'Stanowisko',
    taskNoun: 'Zlecenie',
    mentorTitle: 'Mistrz',
  },
};// careers/electrician/config.ts

import type { CareerDefinition } from '../../core/types/career';

export const electricianCareer: CareerDefinition = {
  id: 'electrician',
  name: 'Elektryk',
  icon: '⚡',
  description: 'Instalacje elektryczne, pomiary, diagnostyka usterek',

  theme: {
    environment: {
      bgPrimary: '#0a0e1a',
      bgSecondary: '#111827',
      bgGradient: 'radial-gradient(ellipse at 30% 20%, #0f172a 0%, #020617 50%, #000000 100%)',
      surfaceColor: '#1e293b',
      surfaceTexture: 'metal',
    },
    system: {
      accent: '#06b6d4',           // Cyan — system, mierniki, informacja
      accentGlow: '#22d3ee',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    },
    semantic: {
      live: '#ef4444',             // Faza — czerwień = niebezpieczeństwo
      neutral: '#3b82f6',          // Neutral — niebieski
      earth: '#22c55e',            // Uziemienie — zielony
      liveBrown: '#92400e',        // Brązowy przewód L
      neutralBlue: '#1e40af',      // Niebieski przewód N
      earthGreenYellow: '#15803d', // Żółto-zielony PE
      copper: '#d97706',           // Miedź (przekrój)
      insulation: '#475569',       // Izolacja
      busbar: '#94a3b8',           // Szyna zbiorcza
      panelFrame: '#334155',       // Ramka rozdzielnicy
    },
    ambience: {
      mood: 'industrial',
      lightDirection: 'top-left',
      lightIntensity: 0.6,
      shadowDepth: 0.7,
      noiseOpacity: 0.04,
    },
    audio: {
      ambientLoop: '/audio/industrial-hum.mp3',
      interactionSounds: {
        wireConnect: '/audio/click-snap.mp3',
        breakerToggle: '/audio/breaker-click.mp3',
        toolSelect: '/audio/tool-pickup.mp3',
        multimeterBeep: '/audio/beep-short.mp3',
      },
      feedbackSounds: {
        success: '/audio/success-chime.mp3',
        error: '/audio/error-buzz.mp3',
        warning: '/audio/warning-tone.mp3',
        complete: '/audio/mission-complete.mp3',
      },
    },
  },

  toolSet: [
    {
      id: 'multimeter',
      name: 'Multimetr',
      icon: '📊',
      description: 'Pomiar napięcia, prądu i rezystancji',
      category: 'measurement',
      interaction: {
        type: 'point-and-click',
        cursor: 'crosshair',
        useEffect: 'measurement-display',
        useSound: '/audio/multimeter-beep.mp3',
      },
      hotkey: 'M',
    },
    {
      id: 'voltage-tester',
      name: 'Próbnik napięcia',
      icon: '🔍',
      description: 'Szybki test obecności napięcia',
      category: 'diagnostic',
      interaction: {
        type: 'point-and-click',
        cursor: 'crosshair',
        useEffect: 'glow',
        useSound: '/audio/tester-beep.mp3',
      },
      hotkey: 'V',
    },
    {
      id: 'screwdriver-flat',
      name: 'Wkrętak płaski',
      icon: '🪛',
      description: 'Do dokręcania zacisków',
      category: 'connection',
      interaction: {
        type: 'point-and-click',
        useEffect: 'none',
        useSound: '/audio/screw-turn.mp3',
      },
      hotkey: 'S',
    },
    {
      id: 'wire-stripper',
      name: 'Ściągacz izolacji',
      icon: '✂️',
      description: 'Zdejmowanie izolacji z przewodów',
      category: 'cutting',
      interaction: {
        type: 'point-and-click',
        useEffect: 'cut-animation',
        useSound: '/audio/strip-click.mp3',
      },
      hotkey: 'W',
    },
    {
      id: 'safety-gloves',
      name: 'Rękawice izolacyjne',
      icon: '🧤',
      description: 'Ochrona przed porażeniem',
      category: 'safety',
      interaction: {
        type: 'toggle',
        useEffect: 'none',
      },
      hotkey: 'G',
    },
  ],

  scenes: [
    // --- MIESZKANIE ---
    {
      id: 'apartment-panel',
      name: 'Mieszkanie — Rozdzielnia',
      description: 'Standardowa rozdzielnia w mieszkaniu na osiedlu',
      difficulty: 'beginner',
      environment: {
        layers: [
          {
            id: 'wall-bg',
            type: 'background',
            zIndex: 0,
            render: 'css',
            css: {
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            },
          },
          {
            id: 'wall-texture',
            type: 'background',
            zIndex: 1,
            render: 'css',
            css: {
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 200px,
                  rgba(255,255,255,0.01) 200px,
                  rgba(255,255,255,0.01) 201px
                )
              `,
              opacity: 0.5,
            },
            parallaxFactor: 0.02,
          },
          {
            id: 'concrete-noise',
            type: 'overlay',
            zIndex: 2,
            render: 'css',
            css: {
              backgroundImage: 'url(/textures/concrete-noise.png)',
              backgroundSize: '200px 200px',
              opacity: 0.04,
              mixBlendMode: 'overlay',
            },
          },
          {
            id: 'light-cone',
            type: 'overlay',
            zIndex: 3,
            render: 'css',
            css: {
              background: 'radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            },
          },
        ],
        lighting: {
          ambient: 'rgba(15, 23, 42, 0.95)',
          spotlights: [
            { x: 50, y: 5, radius: 60, color: '#ffffff', intensity: 0.12, animated: false },
            { x: 50, y: 40, radius: 30, color: '#06b6d4', intensity: 0.05, animated: true },
          ],
        },
        perspective: {
          type: 'frontal',
          depth: 1200,
          vanishingPointX: 50,
          vanishingPointY: 40,
        },
      },
      centralObject: {
        id: 'main-panel',
        name: 'Rozdzielnia mieszkaniowa',
        component: 'DistributionPanel',
        position: { x: 20, y: 10, width: 60, height: 75 },
        parts: [
          { id: 'main-breaker', label: 'Wyłącznik główny', relativePosition: { x: 10, y: 5, width: 15, height: 12 }, interactable: true, state: 'normal' },
          { id: 'rcd-1', label: 'RCD 30mA', relativePosition: { x: 30, y: 5, width: 12, height: 12 }, interactable: true, state: 'normal' },
          { id: 'mcb-kitchen', label: 'B16 Kuchnia', relativePosition: { x: 10, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-bathroom', label: 'B10 Łazienka', relativePosition: { x: 22, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-living', label: 'B16 Salon', relativePosition: { x: 34, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-bedroom', label: 'B10 Sypialnia', relativePosition: { x: 46, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'mcb-lighting', label: 'B10 Oświetlenie', relativePosition: { x: 58, y: 22, width: 8, height: 18 }, interactable: true, state: 'normal' },
          { id: 'busbar-N', label: 'Szyna N', relativePosition: { x: 5, y: 50, width: 90, height: 4 }, interactable: true, state: 'normal' },
          { id: 'busbar-PE', label: 'Szyna PE', relativePosition: { x: 5, y: 58, width: 90, height: 4 }, interactable: true, state: 'normal' },
          { id: 'terminal-block', label: 'Listwa zaciskowa', relativePosition: { x: 5, y: 68, width: 90, height: 8 }, interactable: true, state: 'normal' },
        ],
      },
      interactionPoints: [
        {
          id: 'ip-main-breaker',
          x: 25, y: 18, width: 12, height: 10,
          type: 'click',
          label: 'Wyłącznik główny',
          states: {
            idle: { borderColor: 'transparent', opacity: 0, labelVisible: false, pulseAnimation: false },
            hover: { borderColor: '#06b6d4', glowColor: '#06b6d4', glowIntensity: 0.2, opacity: 1, labelVisible: true, pulseAnimation: false },
            active: { borderColor: '#f59e0b', glowColor: '#f59e0b', glowIntensity: 0.4, opacity: 1, labelVisible: true, pulseAnimation: true },
            completed: { borderColor: '#10b981', glowColor: '#10b981', glowIntensity: 0.15, opacity: 0.8, labelVisible: false, pulseAnimation: false },
            error: { borderColor: '#ef4444', glowColor: '#ef4444', glowIntensity: 0.5, opacity: 1, labelVisible: true, pulseAnimation: true },
          },
          taskBinding: 'wire-identification',
        },
      ],
      decorations: [
        { id: 'wall-outlet-left', type: 'outlet', position: { x: 5, y: 70 }, size: { width: 8, height: 6 }, opacity: 0.3, zIndex: 1 },
        { id: 'label-sticker', type: 'sticker', position: { x: 22, y: 88 }, size: { width: 56, height: 5 }, opacity: 0.5, zIndex: 1 },
      ],
    },
  ],

  taskCatalog: [
    // Zadanie 1: Rozpoznaj przewody
    {
      id: 'wire-identification',
      title: 'Rozpoznawanie przewodów',
      briefing: 'Nowy pracownik na budowie musi umieć rozpoznać przewody po kolorach i oznaczeniach. Przed Tobą otwarta rozdzielnia z podłączonymi przewodami.',
      objective: 'Wskaż i prawidłowo zidentyfikuj każdy typ przewodu w rozdzielnicy.',
      difficulty: 'beginner',
      estimatedMinutes: 3,
      maxXP: 150,
      scenario: {
        location: 'Mieszkanie na 3. piętrze, blok z lat 90.',
        situation: 'Szef ekipy poprosił Cię o sprawdzenie rozdzielnicy przed rozpoczęciem prac remontowych.',
        clientNote: 'Proszę nie wyłączać prądu — lodówka musi działać.',
      },
      sceneId: 'apartment-panel',
      requiredTools: ['voltage-tester'],
      safetyRequirements: [
        {
          id: 'safety-gloves',
          label: 'Rękawice izolacyjne',
          description: 'Załóż rękawice przed pracą z rozdzielnią pod napięciem',
          icon: '🧤',
          preWork: true,
          check: 'manual-confirm',
          penalty: 'point-deduction',
          penaltyAmount: 30,
        },
        {
          id: 'voltage-check',
          label: 'Sprawdź napięcie',
          description: 'Przed dotknięciem przewodów, użyj próbnika napięcia',
          icon: '⚡',
          preWork: true,
          check: 'tool-verify',
          penalty: 'task-fail',
        },
      ],
      steps: [
        {
          id: 'step-identify-L',
          order: 1,
          type: 'identify',
          instruction: 'Wskaż przewód fazowy (L). Jaki ma kolor?',
          hint: 'Przewód fazowy ma kolor brązowy wg normy PN-EN 60446.',
          action: {
            type: 'click',
            targetIds: ['wire-L-brown'],
          },
          validation: {
            type: 'exact',
            correctAnswer: 'wire-L-brown',
          },
          successFeedback: 'Dokładnie! Przewód brązowy to faza (L). Pod napięciem 230V — zawsze zachowaj ostrożność.',
          errorFeedbacks: {
            'wire-N-blue': 'To jest przewód neutralny (N), nie fazowy. Przewód fazowy jest brązowy.',
            'wire-PE-green': 'To jest uziemienie (PE). Przewód fazowy jest brązowy, nie żółto-zielony.',
            default: 'To nie jest przewód fazowy. Szukaj przewodu w kolorze brązowym.',
          },
          points: 20,
        },
        {
          id: 'step-identify-N',
          order: 2,
          type: 'identify',
          instruction: 'Teraz wskaż przewód neutralny (N).',
          hint: 'Przewód neutralny ma kolor niebieski.',
          action: {
            type: 'click',
            targetIds: ['wire-N-blue'],
          },
          validation: {
            type: 'exact',
            correctAnswer: 'wire-N-blue',
          },
          successFeedback: 'Tak! Niebieski to neutral (N). W normalnych warunkach nie ma na nim napięcia, ale ZAWSZE traktuj go jak pod napięciem.',
          errorFeedbacks: {
            'wire-L-brown': 'To jest faza (L), nie neutral. Neutral jest niebieski.',
            default: 'To nie jest neutral. Szukaj niebieskiego przewodu.',
          },
          points: 20,
        },
        {
          id: 'step-identify-PE',
          order: 3,
          type: 'identify',
          instruction: 'Ostatni — wskaż przewód ochronny (PE, uziemienie).',
          hint: 'Przewód PE ma charakterystyczny kolor żółto-zielony.',
          action: {
            type: 'click',
            targetIds: ['wire-PE-green'],
          },
          validation: {
            type: 'exact',
            correctAnswer: 'wire-PE-green',
          },
          successFeedback: 'Perfekcyjnie! Żółto-zielony to PE — uziemienie ochronne. Chroni przed porażeniem w razie uszkodzenia izolacji.',
          errorFeedbacks: {
            default: 'To nie jest PE. Szukaj przewodu żółto-zielonego (z paskami).',
          },
          points: 20,
        },
        {
          id: 'step-measure-voltage',
          order: 4,
          type: 'measure',
          instruction: 'Użyj multimetru, aby zmierzyć napięcie między fazą (L) a neutralem (N).',
          hint: 'Wybierz multimetr z paska narzędzi (klawisz M), a potem dotknij kolejno fazy i neutralu.',
          action: {
            type: 'tool-use',
            toolId: 'multimeter',
            toolTarget: 'wire-L-brown',
            expectedValue: { min: 220, max: 240, unit: 'V' },
          },
          validation: {
            type: 'range',
            correctAnswer: { min: 220, max: 240 },
            tolerance: 5,
          },
          successFeedback: 'Pomiar prawidłowy! ~230V AC między fazą a neutralem to standardowe napięcie w instalacji jednofazowej.',
          errorFeedbacks: {
            default: 'Nieprawidłowy pomiar. Upewnij się, że próbniki dotykają L i N.',
          },
          points: 30,
        },
      ],
      possibleErrors: [
        {
          id: 'err-touch-live',
          description: 'Dotknięcie przewodu pod napięciem bez rękawic',
          severity: 'dangerous',
          visualEffect: 'flash',
          explanation: 'W rzeczywistości dotknięcie fazy (230V) bez izolacji może być śmiertelne! Prąd 30mA przez ciało jest już niebezpieczny.',
          realWorldConsequence: 'Porażenie prądem, możliwe zatrzymanie akcji serca.',
          pointPenalty: 50,
        },
        {
          id: 'err-wrong-wire',
          description: 'Pomylenie fazy z neutralem',
          severity: 'major',
          visualEffect: 'red-glow',
          explanation: 'Pomylenie L z N w instalacji może prowadzić do niebezpiecznej sytuacji — urządzenia mogą być pod napięciem nawet po wyłączeniu.',
          realWorldConsequence: 'Zagrożenie porażeniem przy serwisowaniu urządzeń.',
          pointPenalty: 20,
        },
      ],
      grading: {
        thresholds: { perfect: 95, excellent: 85, good: 70, passing: 50 },
        speedBonus: { underSeconds: 120, bonusXP: 30 },
        noErrorBonus: 40,
        safetyPerfectBonus: 25,
      },
    },
  ],

  progression: {
    levels: [
      { level: 1, title: 'Praktykant', minXP: 0, icon: '🔰' },
      { level: 2, title: 'Pomocnik', minXP: 500, icon: '🔧' },
      { level: 3, title: 'Czeladnik', minXP: 1500, icon: '⚡' },
      { level: 4, title: 'Elektryk', minXP: 4000, icon: '🏅' },
      { level: 5, title: 'Starszy Elektryk', minXP: 8000, icon: '🏆' },
      { level: 6, title: 'Mistrz Instalacji', minXP: 15000, icon: '👑' },
    ],
    milestones: [
      { id: 'first-task', name: 'Pierwszy dzień', description: 'Ukończ pierwsze zadanie', icon: '📋', xpReward: 50 },
      { id: 'safety-perfect', name: 'Bezpieczny praktyk', description: '5 zadań bez naruszenia BHP', icon: '🛡️', xpReward: 100 },
      { id: 'speed-demon', name: 'Sprawny jak prąd', description: 'Ukończ zadanie w połowie czasu', icon: '⚡', xpReward: 75 },
    ],
  },

  learningMetaphor: {
    progressLabel: 'Stopień kwalifikacji',
    experienceLabel: 'Godziny praktyki',
    completionVerb: 'Wykonał',
    workplaceNoun: 'Stanowisko',
    taskNoun: 'Zlecenie',
    mentorTitle: 'Mistrz',
  },
};
