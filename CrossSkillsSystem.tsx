'use client';
import React, { useState, useCallback, useEffect, useMemo, type FC, type ReactNode } from 'react';
import { Zap, Shuffle, Target, TrendingUp, Lightbulb, X } from 'lucide-react';

// ============================================================
// TYPY
// ============================================================

interface Skill {
  name: string;
  icon: string;
  color: string;
  description: string;
  usedIn: string[];
}

interface Scenario {
  domain: string;
  task: string;
  icon: string;
}

interface CrossDomainExample {
  skill: string;
  scenarios: Scenario[];
}

interface LevelInfo {
  label: string;
  color: string;
}

interface UserSkills {
  [skillId: string]: number;
}

interface CrossSkillsSystemProps {
  userSkills?: UserSkills;
  onExploreSkill?: (skillId: string) => void;
  onTryDifferentDomain?: (skillId: string) => void;
}

interface SkillCardProps {
  skillId: string;
  skill: Skill;
  level: number;
  isActive: boolean;
  onToggle: () => void;
  onExplore?: (skillId: string) => void;
  onTryDifferent?: (skillId: string) => void;
}

interface TransferDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExample: number;
  onChangeExample: (index: number) => void;
}

// ============================================================
// STAŁE
// ============================================================

const COLORS = {
  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
  gray: '#6b7280',
  background: {
    dark: '#0c0a1d',
    medium: '#1a1833',
    modal: '#1e1b4b',
    modalSecondary: '#312e81'
  }
} as const;

const UNIVERSAL_SKILLS: Record<string, Skill> = {
  'problem-solving': {
    name: 'Rozwiązywanie problemów',
    icon: '🧩',
    color: '#8b5cf6',
    description: 'Analiza sytuacji, identyfikacja przyczyn, znajdowanie rozwiązań',
    usedIn: ['IT', 'Automatyka', 'Logistyka', 'Medycyna', 'Inżynieria']
  },
  'analysis': {
    name: 'Analiza i diagnostyka',
    icon: '🔍',
    color: '#3b82f6',
    description: 'Zbieranie danych, interpretacja wyników, wyciąganie wniosków',
    usedIn: ['Data Science', 'QA', 'Medycyna', 'Finanse', 'Badania']
  },
  'safety': {
    name: 'Bezpieczeństwo',
    icon: '🛡️',
    color: '#10b981',
    description: 'Ocena ryzyka, procedury bezpieczeństwa, zapobieganie wypadkom',
    usedIn: ['IT Security', 'BHP', 'Medycyna', 'Produkcja', 'Lotnictwo']
  },
  'precision': {
    name: 'Precyzja i dokładność',
    icon: '🎯',
    color: '#f59e0b',
    description: 'Dbałość o detale, standardy jakości, minimalizacja błędów',
    usedIn: ['Chirurgia', 'Programowanie', 'Mechanika', 'Jubilerstwo', 'Architektura']
  },
  'systems-thinking': {
    name: 'Myślenie systemowe',
    icon: '🔄',
    color: '#ec4899',
    description: 'Rozumienie połączeń między elementami, widzenie całego obrazu',
    usedIn: ['Architektura IT', 'Zarządzanie', 'Ekologia', 'Urbanistyka', 'Biologia']
  },
  'calculation': {
    name: 'Obliczenia praktyczne',
    icon: '🧮',
    color: '#6366f1',
    description: 'Stosowanie wzorów, szacowanie, przeliczanie jednostek',
    usedIn: ['Finanse', 'Inżynieria', 'Farmacja', 'Budownictwo', 'Fizyka']
  },
  'tools': {
    name: 'Praca z narzędziami',
    icon: '🔧',
    color: '#14b8a6',
    description: 'Dobór narzędzi, ergonomia, konserwacja sprzętu',
    usedIn: ['Chirurgia', 'Rzemiosło', 'Sztuka', 'Laboratoria', 'Sport']
  },
  'communication': {
    name: 'Komunikacja techniczna',
    icon: '💬',
    color: '#f97316',
    description: 'Dokumentacja, tłumaczenie złożoności, współpraca',
    usedIn: ['Tech Writing', 'Konsulting', 'Edukacja', 'Sprzedaż', 'Management']
  }
};

const CROSS_DOMAIN_EXAMPLES: CrossDomainExample[] = [
  {
    skill: 'problem-solving',
    scenarios: [
      { domain: 'Elektryk', task: 'Diagnoza zwarcia w instalacji', icon: '⚡' },
      { domain: 'IT', task: 'Debugowanie kodu aplikacji', icon: '💻' },
      { domain: 'Mechanik', task: 'Znalezienie przyczyny awarii silnika', icon: '🔩' },
      { domain: 'Lekarz', task: 'Diagnostyka objawów pacjenta', icon: '🩺' }
    ]
  },
  {
    skill: 'calculation',
    scenarios: [
      { domain: 'Elektryk', task: 'Obliczenie przekroju przewodu', icon: '⚡' },
      { domain: 'Farmaceuta', task: 'Dawkowanie leku na masę ciała', icon: '💊' },
      { domain: 'Budownictwo', task: 'Obliczenie nośności belki', icon: '🏗️' },
      { domain: 'Finanse', task: 'Kalkulacja zwrotu z inwestycji', icon: '📊' }
    ]
  },
  {
    skill: 'safety',
    scenarios: [
      { domain: 'Elektryk', task: 'Procedury pracy pod napięciem', icon: '⚡' },
      { domain: 'IT', task: 'Zabezpieczenie przed cyberatakiem', icon: '🔐' },
      { domain: 'Chemik', task: 'Obsługa substancji niebezpiecznych', icon: '🧪' },
      { domain: 'Pilot', task: 'Procedury awaryjne w locie', icon: '✈️' }
    ]
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getSkillLevel = (level: number): LevelInfo => {
  if (level >= 80) return { label: 'Ekspert', color: '#8b5cf6' };
  if (level >= 60) return { label: 'Zaawansowany', color: '#3b82f6' };
  if (level >= 40) return { label: 'Średni', color: '#10b981' };
  if (level >= 20) return { label: 'Podstawowy', color: '#f59e0b' };
  return { label: 'Nowy', color: '#6b7280' };
};

// ============================================================
// STYLE HELPERS
// ============================================================

const styles = {
  container: {
    background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.medium} 100%)`,
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '24px',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 900,
    color: 'white'
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    maxWidth: '500px'
  },
  primaryButton: {
    padding: '12px 20px',
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  modal: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
    animation: 'fadeIn 0.2s ease'
  },
  modalContent: {
    background: `linear-gradient(135deg, ${COLORS.background.modal} 0%, ${COLORS.background.modalSecondary} 100%)`,
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '600px',
    width: '100%',
    border: `2px solid rgba(124, 58, 237, 0.3)`,
    animation: 'slideUp 0.3s ease',
    position: 'relative' as const
  }
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

const SkillCard: FC<SkillCardProps> = React.memo(({ 
  skillId, 
  skill, 
  level, 
  isActive, 
  onToggle, 
  onExplore, 
  onTryDifferent 
}) => {
  const levelInfo = useMemo(() => getSkillLevel(level), [level]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }, [onToggle]);

  const handleExplore = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onExplore?.(skillId);
  }, [onExplore, skillId]);

  const handleTryDifferent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onTryDifferent?.(skillId);
  }, [onTryDifferent, skillId]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      aria-label={`${skill.name} - poziom ${levelInfo.label}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      style={{
        padding: '20px',
        background: isActive 
          ? `linear-gradient(135deg, ${skill.color}20 0%, ${skill.color}10 100%)`
          : 'rgba(255,255,255,0.03)',
        border: `2px solid ${isActive ? skill.color : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        outline: 'none'
      }}
    >
      {/* Nagłówek karty */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: `${skill.color}20`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }} aria-hidden="true">
          {skill.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: 0,
            color: 'white',
            fontSize: '15px',
            fontWeight: 700
          }}>
            {skill.name}
          </h4>
          <span style={{
            fontSize: '12px',
            color: levelInfo.color,
            fontWeight: 600
          }}>
            {levelInfo.label}
          </span>
        </div>
      </div>

      {/* Pasek postępu */}
      <div 
        role="progressbar"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Poziom umiejętności: ${level}%`}
        style={{
          height: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}
      >
        <div style={{
          height: '100%',
          width: `${level}%`,
          background: `linear-gradient(90deg, ${skill.color} 0%, ${skill.color}aa 100%)`,
          borderRadius: '3px',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Opis */}
      <p style={{
        margin: '0 0 12px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
        lineHeight: 1.5
      }}>
        {skill.description}
      </p>

      {/* Tagi domen */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skill.usedIn.slice(0, 3).map((domain) => (
          <span
            key={domain}
            style={{
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '999px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.6)'
            }}
          >
            {domain}
          </span>
        ))}
        {skill.usedIn.length > 3 && (
          <span style={{
            padding: '4px 10px',
            fontSize: '11px',
            color: skill.color
          }}>
            +{skill.usedIn.length - 3}
          </span>
        )}
      </div>

      {/* Rozwinięta zawartość */}
      {isActive && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={handleExplore}
              style={{
                flex: 1,
                padding: '10px',
                background: skill.color,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              aria-label={`Rozwijaj kompetencję: ${skill.name}`}
            >
              Rozwijaj tę kompetencję
            </button>
            <button
              onClick={handleTryDifferent}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              aria-label={`Wypróbuj ${skill.name} w innym kontekście`}
              title="Wypróbuj w innym kontekście"
            >
              <Shuffle size={16} aria-hidden="true" />
            </button>
          </div>
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            💡 Spróbuj tej umiejętności w innym kontekście zawodowym
          </p>
        </div>
      )}
    </div>
  );
});

SkillCard.displayName = 'SkillCard';

// Sekcja z insightami
const TransferInsight: FC = React.memo(() => (
  <div style={{
    padding: '24px',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    }}>
      <Lightbulb size={24} color="#fbbf24" aria-hidden="true" />
      <h3 style={{
        margin: 0,
        color: 'white',
        fontSize: '18px',
        fontWeight: 700
      }}>
        Dlaczego to ważne?
      </h3>
    </div>
    <p style={{
      margin: '0 0 16px',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '15px',
      lineHeight: 1.7
    }}>
      W przyszłości ludzie będą zmieniać zawód średnio{' '}
      <strong style={{ color: '#fbbf24' }}>5-7 razy</strong> w ciągu życia. 
      Kluczem do sukcesu nie jest nauka jednego zawodu, ale budowanie{' '}
      <strong style={{ color: '#a78bfa' }}>uniwersalnej bazy umiejętności</strong>, 
      które można szybko adaptować do nowych domen.
    </p>
    <div style={{
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {[
        { icon: TrendingUp, color: '#10b981', text: 'Uczysz się szybciej w nowych dziedzinach' },
        { icon: Target, color: '#3b82f6', text: 'Widzisz połączenia między branżami' },
        { icon: Zap, color: '#f59e0b', text: 'Stajesz się bardziej konkurencyjny' }
      ].map(({ icon: Icon, color, text }) => (
        <div
          key={text}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '13px'
          }}
        >
          <Icon size={16} color={color} aria-hidden="true" />
          {text}
        </div>
      ))}
    </div>
  </div>
));

TransferInsight.displayName = 'TransferInsight';

// Modal demonstracji transferu
const TransferDemoModal: FC<TransferDemoModalProps> = React.memo(({ 
  isOpen, 
  onClose, 
  currentExample, 
  onChangeExample 
}) => {
  // Obsługa klawisza Escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const example = CROSS_DOMAIN_EXAMPLES[currentExample];
  const skill = UNIVERSAL_SKILLS[example.skill];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
      onClick={onClose}
      style={styles.modal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={styles.modalContent}
      >
        {/* Przycisk zamknięcia */}
        <button
          onClick={onClose}
          aria-label="Zamknij modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Shuffle size={28} color="#a78bfa" aria-hidden="true" />
          <h2 
            id="transfer-modal-title"
            style={{
              margin: 0,
              color: 'white',
              fontSize: '24px',
              fontWeight: 800
            }}
          >
            Transfer Umiejętności
          </h2>
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '15px',
          marginBottom: '24px',
          lineHeight: 1.6
        }}>
          Ta sama kompetencja - różne zawody. Zobacz jak umiejętność
          <strong style={{ color: '#fbbf24' }}> "{skill?.name}"</strong> 
          {' '}jest wykorzystywana w różnych dziedzinach:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {example.scenarios.map((scenario, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '24px' }} aria-hidden="true">{scenario.icon}</span>
                <span style={{
                  color: '#a78bfa',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  {scenario.domain}
                </span>
              </div>
              <p style={{
                margin: 0,
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px'
              }}>
                {scenario.task}
              </p>
            </div>
          ))}
        </div>

        {/* Paginacja */}
        <div 
          role="tablist"
          aria-label="Przykłady transferu umiejętności"
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            justifyContent: 'center'
          }}
        >
          {CROSS_DOMAIN_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={currentExample === idx}
              aria-label={`Przykład ${idx + 1}: ${UNIVERSAL_SKILLS[ex.skill]?.name}`}
              onClick={() => onChangeExample(idx)}
              style={{
                width: '40px',
                height: '6px',
                background: currentExample === idx ? '#a78bfa' : 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onChangeExample((currentExample + 1) % CROSS_DOMAIN_EXAMPLES.length)}
            style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease'
            }}
          >
            <Shuffle size={18} aria-hidden="true" />
            Następna kompetencja
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
});

TransferDemoModal.displayName = 'TransferDemoModal';

// ============================================================
// GŁÓWNY KOMPONENT
// ============================================================

const CrossSkillsSystem: FC<CrossSkillsSystemProps> = ({
  userSkills = {},
  onExploreSkill,
  onTryDifferentDomain
}) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showTransferDemo, setShowTransferDemo] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);

  // Memoizowane handlery
  const handleOpenDemo = useCallback(() => setShowTransferDemo(true), []);
  const handleCloseDemo = useCallback(() => setShowTransferDemo(false), []);
  const handleChangeExample = useCallback((idx: number) => setCurrentExample(idx), []);

  // Memoizowana lista umiejętności
  const skillEntries = useMemo(() => Object.entries(UNIVERSAL_SKILLS), []);

  return (
    <div style={styles.container}>
      {/* Globalne style CSS dla animacji */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '28px' }} aria-hidden="true">🎯</span>
            <h2 style={styles.title}>
              Kompetencje Uniwersalne
            </h2>
          </div>
          <p style={styles.subtitle}>
            Te umiejętności przenoszą się między zawodami. Ucz się raz - stosuj wszędzie.
          </p>
        </div>

        <button
          onClick={handleOpenDemo}
          style={styles.primaryButton}
          aria-label="Zobacz demonstrację transferu umiejętności"
        >
          <Shuffle size={18} aria-hidden="true" />
          Zobacz transfer umiejętności
        </button>
      </header>

      {/* SKILLS GRID */}
      <div style={styles.grid} role="list" aria-label="Lista kompetencji uniwersalnych">
        {skillEntries.map(([skillId, skill]) => {
          const level = userSkills[skillId] || 0;
          const isActive = activeSkill === skillId;

          return (
            <SkillCard
              key={skillId}
              skillId={skillId}
              skill={skill}
              level={level}
              isActive={isActive}
              onToggle={() => setActiveSkill(isActive ? null : skillId)}
              onExplore={onExploreSkill}
              onTryDifferent={onTryDifferentDomain}
            />
          );
        })}
      </div>

      {/* TRANSFER INSIGHT */}
      <TransferInsight />

      {/* TRANSFER DEMO MODAL */}
      <TransferDemoModal
        isOpen={showTransferDemo}
        onClose={handleCloseDemo}
        currentExample={currentExample}
        onChangeExample={handleChangeExample}
      />
    </div>
  );
};

export default CrossSkillsSystem;
