'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Target, Clock, Award, ChevronRight, Flame, 
  Calendar, BookOpen, Star, Shield, X, Sparkles, Trophy, TrendingUp
} from 'lucide-react';

// ============================================================
// DAILY DASHBOARD - Hero z metrykami, streak i dziennym celem
// ============================================================

// Utility: Format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

// Utility: Calculate level from XP
const calculateLevel = (xp) => {
  const baseXP = 100;
  const multiplier = 1.5;
  let level = 1;
  let xpForNextLevel = baseXP;
  let totalXPNeeded = 0;
  
  while (xp >= totalXPNeeded + xpForNextLevel) {
    totalXPNeeded += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }
  
  return {
    level,
    currentLevelXP: xp - totalXPNeeded,
    xpForNextLevel,
    progress: ((xp - totalXPNeeded) / xpForNextLevel) * 100
  };
};

// Get today's index (Monday = 0, Sunday = 6)
const getTodayIndex = () => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  iconColor, 
  bgColor, 
  borderColor, 
  label, 
  value, 
  subLabel, 
  onClick,
  isInteractive = false,
  pulse = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      style={{
        padding: '20px',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '16px',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: isHovered && isInteractive ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {pulse && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: borderColor.replace('0.3', '0.1'),
          animation: 'pulse 2s ease-in-out infinite'
        }} />
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        position: 'relative'
      }}>
        <Icon size={20} color={iconColor} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          {label}
        </span>
        {isInteractive && (
          <ChevronRight 
            size={14} 
            color="rgba(255,255,255,0.4)" 
            style={{
              marginLeft: 'auto',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.2s ease'
            }}
          />
        )}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: 900,
        color: iconColor,
        lineHeight: 1,
        position: 'relative'
      }}>
        {value}
      </div>
      <div style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        marginTop: '4px'
      }}>
        {subLabel}
      </div>
    </div>
  );
};

// Weekly Day Component
const WeeklyDay = ({ day, activity, isToday, maxActivity }) => {
  const [isHovered, setIsHovered] = useState(false);
  const normalizedHeight = maxActivity > 0 ? (activity / maxActivity) * 100 : 0;
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: 1,
        textAlign: 'center',
        position: 'relative'
      }}
    >
      {isHovered && activity > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '6px 10px',
          background: 'rgba(0,0,0,0.9)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          {activity} XP
        </div>
      )}
      
      <div style={{
        height: '48px',
        background: activity > 0 
          ? `rgba(124, 58, 237, ${0.2 + (normalizedHeight / 100) * 0.6})`
          : 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        border: isToday 
          ? '2px solid #a78bfa' 
          : '1px solid rgba(255,255,255,0.1)',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '4px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
      }}>
        {activity > 0 && (
          <div style={{
            width: '100%',
            height: `${Math.max(20, normalizedHeight)}%`,
            background: 'linear-gradient(0deg, #7c3aed 0%, #a78bfa 100%)',
            borderRadius: '6px',
            transition: 'height 0.5s ease'
          }} />
        )}
      </div>
      <span style={{
        color: isToday ? '#a78bfa' : 'rgba(255,255,255,0.4)',
        fontSize: '11px',
        fontWeight: isToday ? 700 : 400
      }}>
        {day}
      </span>
    </div>
  );
};

export default function DailyDashboard({
  streak = { days: 0, lastDate: null, record: 0, freezesAvailable: 0 },
  totalXP = 0,
  todayXP = 0,
  dailyGoal = 100,
  completedToday = 0,
  nextTask = null,
  weeklyProgress = [],
  onContinue,
  onViewAll,
  userName = null
}) {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const modalRef = useRef(null);

  // Animate XP counter
  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    let animationFrame;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedXP(Math.floor(todayXP * easeOut));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [todayXP]);

  // Set time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showStreakDetails) {
        setShowStreakDetails(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showStreakDetails]);

  // Focus modal
  useEffect(() => {
    if (showStreakDetails && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showStreakDetails]);

  const getGreeting = () => {
    const name = userName ? `, ${userName}` : '';
    switch (timeOfDay) {
      case 'morning': return { text: `Dzień dobry${name}`, emoji: '☀️' };
      case 'afternoon': return { text: `Witaj ponownie${name}`, emoji: '🌤️' };
      case 'evening': return { text: `Dobry wieczór${name}`, emoji: '🌅' };
      case 'night': return { text: `Nocna sesja${name}?`, emoji: '🌙' };
      default: return { text: `Witaj${name}`, emoji: '👋' };
    }
  };

  const dailyProgress = Math.min(100, Math.round((todayXP / dailyGoal) * 100));
  const greeting = getGreeting();
  const levelInfo = calculateLevel(totalXP);
  const maxWeeklyActivity = Math.max(...weeklyProgress, 1);
  const todayIndex = getTodayIndex();

  const getMotivationalMessage = () => {
    if (dailyProgress >= 100) return 'Cel osiągnięty! 🎯';
    if (streak.days >= 30) return 'Legendarny miesiąc! 🏆';
    if (streak.days >= 7) return 'Niesamowita passa! 🔥';
    if (streak.days >= 3) return 'Świetnie Ci idzie!';
    if (completedToday >= 3) return 'Produktywny dzień!';
    if (dailyProgress >= 50) return 'Połowa drogi za Tobą!';
    return 'Każdy krok się liczy ✨';
  };

  const getStreakIcon = () => {
    if (streak.days >= 30) return Trophy;
    if (streak.days >= 14) return Star;
    if (streak.days >= 7) return Flame;
    if (streak.days >= 3) return TrendingUp;
    return Flame;
  };

  const getStreakColor = () => {
    if (streak.days >= 30) return '#fbbf24';
    if (streak.days >= 14) return '#f97316';
    if (streak.days >= 7) return '#ef4444';
    if (streak.days >= 3) return '#22c55e';
    return '#fbbf24';
  };

  const StreakIcon = getStreakIcon();
  const streakColor = getStreakColor();

  const styles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style>{styles}</style>
      
      {/* Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 90% 10%, rgba(245, 158, 11, 0.15) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)',
        pointerEvents: 'none'
      }} />

      {/* Floating Particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            background: `rgba(255,255,255,${0.2 + (i % 3) * 0.1})`,
            borderRadius: '50%',
            left: `${15 + i * 15}%`,
            top: `${25 + (i % 3) * 20}%`,
            animation: `float ${3 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            pointerEvents: 'none'
          }}
        />
      ))}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(300px, 380px)',
        gap: '32px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* LEFT SECTION */}
        <div>
          {/* Greeting */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '32px' }}>{greeting.emoji}</span>
              <h1 style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 900,
                color: 'white'
              }}>
                {greeting.text}!
              </h1>
              
              {/* Level Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(124, 58, 237, 0.3)',
                borderRadius: '20px',
                border: '1px solid rgba(124, 58, 237, 0.5)'
              }}>
                <Star size={14} color="#a78bfa" fill="#a78bfa" />
                <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 700 }}>
                  Poziom {levelInfo.level}
                </span>
              </div>
            </div>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getMotivationalMessage()}
              {streak.freezesAvailable > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  background: 'rgba(96, 165, 250, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#60a5fa'
                }}>
                  <Shield size={12} />
                  {streak.freezesAvailable}
                </span>
              )}
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <StatCard
              icon={StreakIcon}
              iconColor={streakColor}
              bgColor="rgba(245, 158, 11, 0.15)"
              borderColor="rgba(245, 158, 11, 0.3)"
              label="Streak"
              value={streak.days}
              subLabel="dni z rzędu"
              onClick={() => setShowStreakDetails(true)}
              isInteractive={true}
              pulse={streak.days >= 7}
            />

            <StatCard
              icon={Zap}
              iconColor="#a78bfa"
              bgColor="rgba(124, 58, 237, 0.15)"
              borderColor="rgba(124, 58, 237, 0.3)"
              label="Dzisiaj"
              value={formatNumber(animatedXP)}
              subLabel="XP zdobyte"
            />

            <StatCard
              icon={Award}
              iconColor="#34d399"
              bgColor="rgba(16, 185, 129, 0.15)"
              borderColor="rgba(16, 185, 129, 0.3)"
              label="Łącznie"
              value={formatNumber(totalXP)}
              subLabel="całkowite XP"
            />
          </div>

          {/* Daily Goal Progress */}
          <div style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: dailyProgress >= 100 
              ? '2px solid rgba(16, 185, 129, 0.5)'
              : '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'white',
                fontWeight: 600
              }}>
                <Target size={18} />
                Cel dzienny
                {dailyProgress >= 100 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#10b981',
                    fontWeight: 700
                  }}>
                    <Sparkles size={12} />
                    OSIĄGNIĘTY
                  </span>
                )}
              </div>
              <span style={{
                color: dailyProgress >= 100 ? '#10b981' : '#a78bfa',
                fontWeight: 700
              }}>
                {todayXP}/{dailyGoal} XP
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              height: '14px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '7px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {[25, 50, 75].map(milestone => (
                <div
                  key={milestone}
                  style={{
                    position: 'absolute',
                    left: `${milestone}%`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'rgba(255,255,255,0.2)',
                    zIndex: 1
                  }}
                />
              ))}
              
              <div style={{
                height: '100%',
                width: `${dailyProgress}%`,
                background: dailyProgress >= 100 
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
                borderRadius: '7px',
                transition: 'width 0.5s ease',
                boxShadow: dailyProgress >= 100 
                  ? '0 0 20px rgba(16, 185, 129, 0.5)'
                  : '0 0 20px rgba(124, 58, 237, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: 'shimmer 2s ease-in-out infinite'
                }} />
              </div>
            </div>
            
            {dailyProgress >= 100 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                color: '#10b981',
                fontSize: '14px',
                fontWeight: 600
              }}>
                <span style={{ fontSize: '20px' }}>🎉</span>
                Świetna robota! Cel osiągnięty!
              </div>
            ) : (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                Jeszcze {dailyGoal - todayXP} XP do celu
              </div>
            )}
          </div>

          {/* Weekly Activity */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ 
                color: 'rgba(255,255,255,0.6)', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Calendar size={14} />
                Aktywność w tym tygodniu
              </span>
              <span style={{
                color: '#a78bfa',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {weeklyProgress.reduce((a, b) => a + b, 0)} XP
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, idx) => (
                <WeeklyDay
                  key={day}
                  day={day}
                  activity={weeklyProgress[idx] || 0}
                  isToday={idx === todayIndex}
                  maxActivity={maxWeeklyActivity}
                />
              ))}
            </div>
          </div>

          {/* Level Progress */}
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                Postęp do poziomu {levelInfo.level + 1}
              </span>
              <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 600 }}>
                {levelInfo.currentLevelXP}/{levelInfo.xpForNextLevel} XP
              </span>
            </div>
            <div style={{
              height: '6px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${levelInfo.progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                borderRadius: '3px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Continue Learning */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '400px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <BookOpen size={20} color="#fbbf24" />
            <span style={{
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Kontynuuj naukę
            </span>
          </div>

          {nextTask ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {nextTask.type === 'calc' ? '🧮' : 
                 nextTask.type === 'practical' ? '🔧' :
                 nextTask.type === 'safety' ? '⚠️' :
                 nextTask.type === 'theory' ? '📚' :
                 nextTask.type === 'quiz' ? '❓' :
                 nextTask.type === 'video' ? '🎬' : '📝'}
              </div>

              <h3 style={{
                margin: '0 0 12px',
                color: 'white',
                fontSize: '22px',
                fontWeight: 800,
                lineHeight: 1.3
              }}>
                {nextTask.title}
              </h3>

              <p style={{
                margin: '0 0 20px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                lineHeight: 1.6,
                flex: 1
              }}>
                {nextTask.description?.length > 120 
                  ? `${nextTask.description.slice(0, 120)}...`
                  : nextTask.description || 'Kliknij aby rozpocząć tę lekcję.'}
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                {nextTask.estimatedTime && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '13px'
                  }}>
                    <Clock size={14} />
                    {nextTask.estimatedTime}
                  </span>
                )}
                {nextTask.xpReward && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    color: '#fbbf24',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    <Zap size={14} />
                    +{nextTask.xpReward} XP
                  </span>
                )}
              </div>

              <button
                onClick={() => onContinue?.(nextTask)}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)'
                }}
              >
                Rozpocznij teraz
                <ChevronRight size={20} />
              </button>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{
                margin: '0 0 8px',
                color: 'white',
                fontSize: '20px',
                fontWeight: 700
              }}>
                Wszystko ukończone!
              </h3>
              <p style={{
                margin: 0,
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px'
              }}>
                Świetna robota! Wracaj jutro po nowe wyzwania.
              </p>
            </div>
          )}

          <button
            onClick={onViewAll}
            style={{
              marginTop: '12px',
              padding: '12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Zobacz wszystkie lekcje
          </button>
        </div>
      </div>

      {/* Streak Modal */}
      {showStreakDetails && (
        <div
          onClick={() => setShowStreakDetails(false)}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              animation: 'scaleIn 0.3s ease',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowStreakDetails(false)}
              aria-label="Zamknij"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)'
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '56px' }}>🔥</div>
              <div>
                <div style={{
                  fontSize: '40px',
                  fontWeight: 900,
                  color: '#fbbf24',
                  lineHeight: 1
                }}>
                  {streak.days} dni
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '14px',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <StreakIcon size={14} color={streakColor} />
                  {streak.days >= 30 ? 'Legenda' : 
                   streak.days >= 14 ? 'Mistrz' : 
                   streak.days >= 7 ? 'W ogniu' : 
                   streak.days >= 3 ? 'Rośnie' : 'Buduj'}
                </div>
              </div>
            </div>
            
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '15px',
              lineHeight: 1.7,
              marginBottom: '24px'
            }}>
              {streak.days >= 30 
                ? '🏆 Niesamowite! Miesiąc codziennej nauki! Jesteś prawdziwą legendą!'
                : streak.days >= 7 
                  ? '⭐ Tydzień codziennej nauki. To buduje prawdziwe nawyki!'
                  : streak.days >= 3
                    ? '💪 Świetnie! Utrzymujesz regularność!'
                    : '🌱 Każdy dzień się liczy. Ucz się codziennie!'}
            </p>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  marginBottom: '4px'
                }}>
                  Rekord
                </div>
                <div style={{ 
                  color: '#fbbf24', 
                  fontWeight: 700,
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Trophy size={16} />
                  {Math.max(streak.days, streak.record || 0)} dni
                </div>
              </div>
              
              <div style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  marginBottom: '4px'
                }}>
                  Zamrożenia
                </div>
                <div style={{ 
                  color: '#60a5fa', 
                  fontWeight: 700,
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Shield size={16} />
                  {streak.freezesAvailable || 0}
                </div>
              </div>
            </div>

            {/* Next milestone */}
            {streak.days < 30 && (
              <div style={{
                padding: '16px',
                background: 'rgba(124, 58, 237, 0.1)',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid rgba(124, 58, 237, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    Następny cel
                  </span>
                  <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '14px' }}>
                    {streak.days < 7 ? '7 dni' : streak.days < 14 ? '14 dni' : '30 dni'}
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(streak.days / (streak.days < 7 ? 7 : streak.days < 14 ? 14 : 30)) * 100}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            )}

            <button
              onClick={() => setShowStreakDetails(false)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}
            >
              Kontynuuj naukę 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
