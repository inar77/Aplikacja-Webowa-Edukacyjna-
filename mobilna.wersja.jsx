import React, { useState, useEffect, useRef } from 'react';
import { 
  Home,
  Target,
  Trophy,
  ShoppingBag,
  Users,
  Zap,
  Clock,
  CheckCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Circle,
  X,
  Book,
  Code,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Award,
  Sparkles,
  Bell,
  Settings,
  User,
  Heart,
  Shield,
  Coffee
} from 'lucide-react';

const CareerPathApp = () => {
  const [currentScreen, setCurrentScreen] = useState(2); // Start at Home
  const [user, setUser] = useState({
    name: 'Jan',
    level: 3,
    xp: 240,
    xpToNext: 500,
    totalXp: 1240,
    coins: 150,
    currentPath: 'Programista',
    streak: 7,
    dailyGoal: 3,
    dailyProgress: 1,
    inventory: []
  });

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [timeChallenge, setTimeChallenge] = useState(null);
  
  const taskCategories = {
    'Programowanie': {
      icon: <Code className="w-5 h-5" />,
      color: 'from-blue-500 to-purple-500',
      subcategories: {
        'Podstawy': [
          {
            id: 1,
            title: 'Zmienne i typy danych',
            description: 'Poznaj podstawowe typy danych w JavaScript',
            xpReward: 30,
            coinReward: 5,
            timeEstimate: '10 min',
            difficulty: 'łatwe',
            completed: false,
            hasChallenge: true
          },
          {
            id: 2,
            title: 'Funkcje i scope',
            description: 'Zrozum jak działają funkcje i zasięg zmiennych',
            xpReward: 40,
            coinReward: 8,
            timeEstimate: '15 min',
            difficulty: 'łatwe',
            completed: false
          },
          {
            id: 3,
            title: 'Pętle i iteracje',
            description: 'Opanuj for, while, forEach',
            xpReward: 45,
            coinReward: 10,
            timeEstimate: '20 min',
            difficulty: 'średnie',
            completed: false
          }
        ],
        'Algorytmy': [
          {
            id: 4,
            title: 'Sortowanie bąbelkowe',
            description: 'Zaimplementuj podstawowy algorytm sortowania',
            xpReward: 60,
            coinReward: 15,
            timeEstimate: '25 min',
            difficulty: 'średnie',
            completed: false,
            hasChallenge: true
          },
          {
            id: 5,
            title: 'Wyszukiwanie binarne',
            description: 'Naucz się efektywnego przeszukiwania',
            xpReward: 70,
            coinReward: 18,
            timeEstimate: '30 min',
            difficulty: 'średnie',
            completed: false
          },
          {
            id: 6,
            title: 'Rekurencja',
            description: 'Zrozum funkcje wywołujące same siebie',
            xpReward: 80,
            coinReward: 20,
            timeEstimate: '35 min',
            difficulty: 'trudne',
            completed: false,
            locked: true,
            requiredLevel: 4
          }
        ],
        'Python': [
          {
            id: 7,
            title: 'Składnia Python',
            description: 'Podstawy języka Python',
            xpReward: 35,
            coinReward: 7,
            timeEstimate: '15 min',
            difficulty: 'łatwe',
            completed: false
          },
          {
            id: 8,
            title: 'List comprehension',
            description: 'Eleganckie tworzenie list w Pythonie',
            xpReward: 50,
            coinReward: 12,
            timeEstimate: '20 min',
            difficulty: 'średnie',
            completed: false
          },
          {
            id: 9,
            title: 'Dekoratory',
            description: 'Zaawansowane koncepty Pythona',
            xpReward: 90,
            coinReward: 25,
            timeEstimate: '40 min',
            difficulty: 'trudne',
            completed: false,
            locked: true,
            requiredLevel: 5
          }
        ],
        'Frontend': [
          {
            id: 10,
            title: 'HTML Semantyczny',
            description: 'Poprawna struktura dokumentów HTML',
            xpReward: 25,
            coinReward: 5,
            timeEstimate: '10 min',
            difficulty: 'łatwe',
            completed: false
          },
          {
            id: 11,
            title: 'CSS Grid & Flexbox',
            description: 'Nowoczesne layouty CSS',
            xpReward: 55,
            coinReward: 12,
            timeEstimate: '25 min',
            difficulty: 'średnie',
            completed: false
          },
          {
            id: 12,
            title: 'React Podstawy',
            description: 'Komponenty, props i state',
            xpReward: 75,
            coinReward: 18,
            timeEstimate: '35 min',
            difficulty: 'średnie',
            completed: false
          }
        ]
      }
    },
    'Soft Skills': {
      icon: <Users className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500',
      subcategories: {
        'Komunikacja': [
          {
            id: 13,
            title: 'Aktywne słuchanie',
            description: 'Naucz się słuchać ze zrozumieniem',
            xpReward: 30,
            coinReward: 6,
            timeEstimate: '15 min',
            difficulty: 'łatwe',
            completed: false,
            hasChallenge: true
          },
          {
            id: 14,
            title: 'Empatia w praktyce',
            description: 'Zrozum perspektywę innych osób',
            xpReward: 35,
            coinReward: 8,
            timeEstimate: '20 min',
            difficulty: 'łatwe',
            completed: false
          },
          {
            id: 15,
            title: 'Asertywność',
            description: 'Wyrażaj swoje potrzeby z szacunkiem',
            xpReward: 40,
            coinReward: 10,
            timeEstimate: '25 min',
            difficulty: 'średnie',
            completed: false
          }
        ],
        'Praca pod presją': [
          {
            id: 16,
            title: 'Zarządzanie stresem',
            description: 'Techniki radzenia sobie ze stresem',
            xpReward: 45,
            coinReward: 10,
            timeEstimate: '20 min',
            difficulty: 'średnie',
            completed: false,
            hasChallenge: true,
            timeLimit: 60 // sekund na wykonanie
          },
          {
            id: 17,
            title: 'Priorytetyzacja zadań',
            description: 'Ustal co jest najważniejsze',
            xpReward: 50,
            coinReward: 12,
            timeEstimate: '15 min',
            difficulty: 'średnie',
            completed: false,
            hasChallenge: true,
            timeLimit: 45
          },
          {
            id: 18,
            title: 'Szybkie decyzje',
            description: 'Podejmuj decyzje pod presją czasu',
            xpReward: 60,
            coinReward: 15,
            timeEstimate: '10 min',
            difficulty: 'trudne',
            completed: false,
            hasChallenge: true,
            timeLimit: 30
          }
        ],
        'Praca zespołowa': [
          {
            id: 19,
            title: 'Rozwiązywanie konfliktów',
            description: 'Mediacja i negocjacje w zespole',
            xpReward: 55,
            coinReward: 13,
            timeEstimate: '30 min',
            difficulty: 'średnie',
            completed: false
          },
          {
            id: 20,
            title: 'Dawanie feedbacku',
            description: 'Konstruktywna krytyka',
            xpReward: 40,
            coinReward: 9,
            timeEstimate: '20 min',
            difficulty: 'łatwe',
            completed: false
          },
          {
            id: 21,
            title: 'Delegowanie zadań',
            description: 'Efektywne dzielenie się pracą',
            xpReward: 65,
            coinReward: 16,
            timeEstimate: '25 min',
            difficulty: 'trudne',
            completed: false,
            locked: true,
            requiredLevel: 4
          }
        ]
      }
    },
    'Projekty': {
      icon: <Briefcase className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      subcategories: {
        'Mini projekty': [
          {
            id: 22,
            title: 'Kalkulator',
            description: 'Prosty kalkulator w JavaScript',
            xpReward: 80,
            coinReward: 20,
            timeEstimate: '45 min',
            difficulty: 'średnie',
            completed: false
          },
          {
            id: 23,
            title: 'Todo Lista',
            description: 'Aplikacja do zarządzania zadaniami',
            xpReward: 100,
            coinReward: 25,
            timeEstimate: '60 min',
            difficulty: 'średnie',
            completed: false
          }
        ],
        'Duże projekty': [
          {
            id: 24,
            title: 'Blog osobisty',
            description: 'Pełna aplikacja blogowa',
            xpReward: 200,
            coinReward: 50,
            timeEstimate: '3h',
            difficulty: 'trudne',
            completed: false,
            locked: true,
            requiredLevel: 6
          },
          {
            id: 25,
            title: 'E-commerce',
            description: 'Sklep internetowy z koszykiem',
            xpReward: 300,
            coinReward: 75,
            timeEstimate: '5h',
            difficulty: 'trudne',
            completed: false,
            locked: true,
            requiredLevel: 8
          }
        ]
      }
    }
  };

  const [tasks, setTasks] = useState([]);

  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Shop items
  const shopItems = [
    {
      id: 1,
      name: 'Blokada rozpraszaczy',
      description: 'Zablokuj TikTok i YouTube na 2 godziny',
      price: 50,
      icon: '🛡️',
      effect: 'productivity'
    },
    {
      id: 2,
      name: 'Dodatkowe życie',
      description: 'Nie strać serii w razie niepowodzenia',
      price: 100,
      icon: '❤️',
      effect: 'streak_protection'
    },
    {
      id: 3,
      name: 'Podwójne XP',
      description: 'Następne zadanie da 2x więcej XP',
      price: 75,
      icon: '⚡',
      effect: 'xp_boost'
    },
    {
      id: 4,
      name: 'Mentor AI',
      description: 'Personalne wskazówki na 24h',
      price: 150,
      icon: '🤖',
      effect: 'ai_mentor'
    }
  ];

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentScreen < 4) {
      setCurrentScreen(currentScreen + 1);
    }
    if (isRightSwipe && currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'łatwe': return 'text-green-600 bg-green-50 border-green-200';
      case 'średnie': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'trudne': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task.completed || task.locked) return;

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, progress: 100 } : t
    ));

    const oldLevel = user.level;
    let newXp = user.xp + task.xpReward;
    let newLevel = user.level;
    let newXpToNext = user.xpToNext;
    
    if (newXp >= user.xpToNext) {
      newXp = newXp - user.xpToNext;
      newLevel = user.level + 1;
      newXpToNext = 500 + (newLevel * 100);
      setLevelUpAnimation(true);
      setTimeout(() => setLevelUpAnimation(false), 3000);
    }

    setUser({
      ...user,
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
      totalXp: user.totalXp + task.xpReward,
      coins: user.coins + task.coinReward,
      dailyProgress: Math.min(user.dailyProgress + 1, user.dailyGoal)
    });

    setLastReward({
      xp: task.xpReward,
      coins: task.coinReward,
      levelUp: newLevel > oldLevel
    });
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  };

  const buyItem = (item) => {
    if (user.coins >= item.price) {
      setUser({
        ...user,
        coins: user.coins - item.price,
        inventory: [...user.inventory, item]
      });
      // Show purchase confirmation
      setLastReward({ purchase: item.name });
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    }
  };

  const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  {task.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                  <p className="text-sm text-gray-500">{task.category}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">{task.description}</p>

            {task.subtasks && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Co będziesz robić:</h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">{idx + 1}</span>
                      </div>
                      <span className="text-sm text-gray-700">{subtask.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-4 border-t border-b mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{task.xpReward} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="font-semibold">{task.coinReward} monet</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{task.timeEstimate}</span>
              </div>
            </div>

            <button
              onClick={() => {
                completeTask(task.id);
                onClose();
              }}
              disabled={task.completed || task.locked}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                task.completed 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : task.locked
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]'
              }`}
            >
              {task.completed ? 'Ukończone' : task.locked ? `Wymagany poziom ${task.requiredLevel}` : 'Rozpocznij zadanie'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Screen Components
  const ProfileScreen = () => (
    <div className="h-full bg-gradient-to-b from-purple-500 to-purple-600 text-white overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Profil</h2>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold">{user.name}</h3>
          <p className="text-purple-200">{user.currentPath}</p>
          <p className="text-purple-300">Poziom {user.level}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-purple-200">Doświadczenie</span>
              <span>{user.xp}/{user.xpToNext} XP</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white to-purple-300 rounded-full transition-all duration-500"
                style={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
              />
            </div>
            <p className="text-xs text-purple-200 mt-1">Całkowite XP: {user.totalXp}</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span>Seria dni</span>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5" />
                <span className="text-xl font-bold">{user.streak}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span>Monety</span>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                <span className="text-xl font-bold">{user.coins}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <h4 className="font-semibold mb-3">Ostatnie osiągnięcia</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm">Pierwszy tydzień ukończony</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🐍</span>
                <span className="text-sm">Podstawy Pythona opanowane</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span className="text-sm">Ścieżka wybrana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DailyScreen = () => (
    <div className="h-full bg-gradient-to-b from-orange-500 to-red-500 text-white overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Dzienny Cel</h2>
        
        <div className="bg-white/10 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="text-7xl animate-pulse">🔥</div>
          </div>
          <h3 className="text-center text-4xl font-bold mb-2">{user.streak}</h3>
          <p className="text-center text-white/80">dni z rzędu</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">Cel na dziś</span>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {user.dailyProgress}/{user.dailyGoal} zadań
            </span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${(user.dailyProgress / user.dailyGoal) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Dzisiejsze wyzwania:</h4>
          {tasks.slice(0, 3).map((task, idx) => (
            <div key={task.id} className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  task.completed ? 'bg-green-400' : 'bg-white/20'
                }`}>
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="font-bold">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-orange-200">{task.xpReward} XP • {task.timeEstimate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white/10 rounded-2xl p-4">
          <p className="text-center text-sm">
            💡 Wskazówka: Ukończ zadania rano, aby mieć więcej energii!
          </p>
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="h-full bg-gradient-to-b from-blue-500 to-blue-600 text-white overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cześć {user.name}!</h1>
            <p className="text-blue-200">Gotowy na nowe wyzwania?</p>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-white/80" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>

        <div className="bg-white/10 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-blue-200">Twój poziom</p>
              <p className="text-3xl font-bold">{user.level}</p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(user.xp / user.xpToNext) * 226} 226`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{Math.round((user.xp / user.xpToNext) * 100)}%</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-200">Do następnego poziomu</p>
            <p className="font-semibold">{user.xpToNext - user.xp} XP</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6" />
              <span className="text-2xl font-bold">{user.dailyProgress}</span>
            </div>
            <p className="text-sm text-blue-200">Zadania dziś</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-6 h-6" />
              <span className="text-2xl font-bold">{user.streak}</span>
            </div>
            <p className="text-sm text-blue-200">Seria dni</p>
          </div>
        </div>

        <button 
          onClick={() => setCurrentScreen(3)}
          className="w-full bg-white text-blue-600 rounded-2xl py-5 font-bold text-lg shadow-lg hover:scale-105 transition-transform active:scale-95"
        >
          Rozpocznij naukę
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200 italic">
            "Wszystkie ścieżki tutaj się schodzą"
          </p>
        </div>
      </div>
    </div>
  );

  const TimeChallengeModal = ({ task, onClose, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(task.timeLimit || 60);
    const [answer, setAnswer] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
      if (isRunning && timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        onClose();
        alert('Czas minął! Spróbuj ponownie.');
      }
    }, [timeLeft, isRunning]);

    const handleStart = () => {
      setIsRunning(true);
    };

    const handleSubmit = () => {
      if (answer.trim()) {
        onComplete(task.id);
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Wyzwanie czasowe!</h2>
            <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
            >
              Rozpocznij wyzwanie
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Zadanie:</p>
                <p className="text-sm">Napisz 3 przykłady użycia tej umiejętności w praktyce</p>
              </div>
              
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Twoja odpowiedź..."
                className="w-full p-3 border rounded-lg resize-none h-32"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
                >
                  Wyślij odpowiedź
                </button>
                <button
                  onClick={onClose}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TasksScreen = () => (
    <div className="h-full bg-white overflow-y-auto">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 sticky top-0 z-10">
        <h2 className="text-2xl font-bold mb-4">Zadania</h2>
        <div className="flex space-x-2 overflow-x-auto">
          {Object.keys(taskCategories).map((category) => (
            <button
              key={category}
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                expandedCategory === category 
                  ? 'bg-white text-green-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {expandedCategory ? (
          <div>
            <button
              onClick={() => setExpandedCategory(null)}
              className="flex items-center space-x-2 text-gray-600 mb-4 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Powrót</span>
            </button>

            <div className="space-y-6">
              {Object.entries(taskCategories[expandedCategory].subcategories).map(([subcat, tasks]) => (
                <div key={subcat}>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{subcat}</h3>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white rounded-xl border-2 ${
                          task.completed ? 'border-green-300 bg-green-50/50' : 'border-gray-200'
                        } p-4 hover:shadow-lg transition-all ${
                          task.locked ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex items-center space-x-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">+{task.xpReward}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                              <span className="font-medium">+{task.coinReward}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{task.timeEstimate}</span>
                            </div>
                            {task.hasChallenge && (
                              <div className="flex items-center space-x-1 text-red-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs font-medium">Wyzwanie!</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (!task.completed && !task.locked) {
                                if (task.hasChallenge && task.timeLimit) {
                                  setTimeChallenge(task);
                                } else {
                                  setSelectedTask(task);
                                }
                              }
                            }}
                            disabled={task.completed || task.locked}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              task.completed 
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : task.locked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : task.hasChallenge
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-md active:scale-[0.98]'
                                : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-md active:scale-[0.98]'
                            }`}
                          >
                            {task.completed ? '✓' : task.locked ? '🔒' : task.hasChallenge ? '⚡ Wyzwanie' : 'Start'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {Object.entries(taskCategories).map(([category, data]) => {
              const totalTasks = Object.values(data.subcategories).flat().length;
              const completedTasks = Object.values(data.subcategories).flat().filter(t => t.completed).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setExpandedCategory(category)}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${data.color} flex items-center justify-center text-white`}>
                        {data.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{category}</h3>
                        <p className="text-sm text-gray-500">
                          {Object.keys(data.subcategories).length} podkategorie
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Postęp</span>
                      <span>{completedTasks}/{totalTasks} zadań</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${data.color} transition-all duration-500`}
                        style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time Challenge Modal */}
      {timeChallenge && (
        <TimeChallengeModal
          task={timeChallenge}
          onClose={() => setTimeChallenge(null)}
          onComplete={completeTask}
        />
      )}
    </div>
  );

  const ShopScreen = () => (
    <div className="h-full bg-gradient-to-b from-yellow-500 to-amber-500 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Sklep</h2>
        
        <div className="bg-white rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Twoje monety</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
              <span className="text-2xl font-bold text-gray-900">{user.coins}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shopItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <div className="text-3xl ml-4">{item.icon}</div>
              </div>
              
              <button 
                onClick={() => buyItem(item)}
                disabled={user.coins < item.price}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  user.coins >= item.price
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:shadow-lg active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                  <span>{item.price} monet</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const screens = [
    { component: <ProfileScreen />, icon: <User className="w-5 h-5" />, label: 'Profil', color: 'purple' },
    { component: <DailyScreen />, icon: <Flame className="w-5 h-5" />, label: 'Dzienny', color: 'orange' },
    { component: <HomeScreen />, icon: <Home className="w-5 h-5" />, label: 'Start', color: 'blue' },
    { component: <TasksScreen />, icon: <Target className="w-5 h-5" />, label: 'Zadania', color: 'green' },
    { component: <ShopScreen />, icon: <ShoppingBag className="w-5 h-5" />, label: 'Sklep', color: 'yellow' }
  ];

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div 
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentScreen * 100}%)` }}
        >
          {screens.map((screen, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              {screen.component}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-around py-3">
          {screens.map((screen, index) => (
            <button
              key={index}
              onClick={() => setCurrentScreen(index)}
              className={`flex flex-col items-center space-y-1 px-3 py-1 rounded-lg transition-all ${
                currentScreen === index 
                  ? 'bg-gray-800 scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div className={currentScreen === index ? 'text-white' : 'text-gray-400'}>
                {screen.icon}
              </div>
              <span className={`text-xs ${
                currentScreen === index ? 'text-white' : 'text-gray-400'
              }`}>
                {screen.label}
              </span>
            </button>
          ))}
        </div>

        {/* Page Indicator Dots */}
        <div className="flex justify-center space-x-2 pb-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                currentScreen === index 
                  ? 'w-6 bg-white' 
                  : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {/* Reward Popup */}
      {showReward && lastReward && (
        <div className="fixed bottom-20 right-4 bg-white rounded-xl shadow-2xl p-4 animate-slide-up z-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {lastReward.levelUp ? 'Nowy poziom!' : lastReward.purchase ? 'Zakupiono!' : 'Zadanie ukończone!'}
              </p>
              <div className="flex items-center space-x-2 text-sm">
                {lastReward.xp && <span className="text-yellow-600">+{lastReward.xp} XP</span>}
                {lastReward.coins && <span className="text-yellow-600">+{lastReward.coins} monet</span>}
                {lastReward.purchase && <span className="text-green-600">{lastReward.purchase}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Animation */}
      {levelUpAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-bounce-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Poziom {user.level}!</h2>
              <p className="text-gray-600">Świetna robota!</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default CareerPathApp;