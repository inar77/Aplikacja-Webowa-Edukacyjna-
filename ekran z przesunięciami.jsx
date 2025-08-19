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
  Circle
} from 'lucide-react';

const SwipeableApp = () => {
  const [currentScreen, setCurrentScreen] = useState(2); // Start at Home (center)
  const [user, setUser] = useState({
    name: 'Jan',
    level: 3,
    xp: 240,
    xpToNext: 500,
    coins: 150,
    streak: 7
  });
  
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Podstawy JavaScript',
      xp: 50,
      time: '15 min',
      completed: false,
      difficulty: 1
    },
    {
      id: 2,
      title: 'Komunikacja w zespole',
      xp: 30,
      time: '10 min',
      completed: false,
      difficulty: 1
    },
    {
      id: 3,
      title: 'Projekt: Todo App',
      xp: 100,
      time: '45 min',
      completed: false,
      difficulty: 2
    }
  ]);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

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

    if (isLeftSwipe && currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
    if (isRightSwipe && currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const completeTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    
    setUser({
      ...user,
      xp: Math.min(user.xp + tasks.find(t => t.id === taskId).xp, user.xpToNext),
      coins: user.coins + 10
    });
  };

  // Screen Components
  const ProfileScreen = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-500 to-purple-600 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">Profil</h2>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h3 className="text-xl font-bold">{user.name}</h3>
        <p className="text-purple-200">Poziom {user.level}</p>
      </div>

      <div className="space-y-4 flex-1">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-purple-200">XP</span>
            <span>{user.xp}/{user.xpToNext}</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
            />
          </div>
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
      </div>
    </div>
  );

  const DailyScreen = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-500 to-red-500 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">Dzienny Cel</h2>
      
      <div className="bg-white/10 rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="text-6xl">🔥</div>
        </div>
        <h3 className="text-center text-3xl font-bold mb-2">{user.streak}</h3>
        <p className="text-center text-white/80">dni z rzędu</p>
      </div>

      <div className="space-y-4 flex-1">
        <h4 className="font-semibold">Dzisiejsze wyzwania:</h4>
        {tasks.slice(0, 3).map((task, idx) => (
          <div key={task.id} className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                task.completed ? 'bg-green-400' : 'bg-white/20'
              }`}>
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-sm">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={task.completed ? 'line-through opacity-60' : ''}>
                  {task.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Postęp</span>
          <span>{tasks.filter(t => t.completed).length}/3</span>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${(tasks.filter(t => t.completed).length / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-500 to-blue-600 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cześć {user.name}!</h1>
          <p className="text-blue-200">Gotowy na nowe wyzwania?</p>
        </div>
        <div className="text-4xl">👋</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6" />
            <span className="text-2xl font-bold">3</span>
          </div>
          <p className="text-sm text-blue-200">Zadania dziś</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-6 h-6" />
            <span className="text-2xl font-bold">180</span>
          </div>
          <p className="text-sm text-blue-200">XP dziś</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <button className="bg-white text-blue-600 rounded-full py-6 px-8 font-bold text-xl shadow-lg hover:scale-105 transition-transform">
          Rozpocznij naukę
        </button>
      </div>

      <div className="bg-white/10 rounded-2xl p-4">
        <p className="text-center text-sm text-blue-200">
          "Wszystkie ścieżki tutaj się schodzą"
        </p>
      </div>
    </div>
  );

  const TasksScreen = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-green-500 to-teal-500 text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Zadania</h2>
      
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`bg-white/10 rounded-2xl p-4 ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold flex-1">{task.title}</h3>
              {task.completed && (
                <CheckCircle className="w-5 h-5 text-green-300" />
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-green-200 mb-3">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>{task.xp} XP</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{task.time}</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <Circle 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < task.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {!task.completed && (
              <button 
                onClick={() => completeTask(task.id)}
                className="w-full bg-white/20 hover:bg-white/30 rounded-xl py-2 font-medium transition-colors"
              >
                Wykonaj
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ShopScreen = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-yellow-500 to-amber-500 text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Sklep</h2>
      
      <div className="bg-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span>Twoje monety</span>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-300 rounded-full"></div>
            <span className="text-2xl font-bold">{user.coins}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Blokada rozpraszaczy</h3>
              <p className="text-sm text-yellow-200">Zablokuj TikTok na 2h</p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
          <button className="w-full bg-white/20 rounded-xl py-2 mt-3 font-medium">
            50 monet
          </button>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Dodatkowe życie</h3>
              <p className="text-sm text-yellow-200">Nie strać serii</p>
            </div>
            <div className="text-2xl">❤️</div>
          </div>
          <button className="w-full bg-white/20 rounded-xl py-2 mt-3 font-medium">
            100 monet
          </button>
        </div>
      </div>
    </div>
  );

  const screens = [
    { component: <ProfileScreen />, icon: '👤', label: 'Profil' },
    { component: <DailyScreen />, icon: '🔥', label: 'Dzienny' },
    { component: <HomeScreen />, icon: '🏠', label: 'Start' },
    { component: <TasksScreen />, icon: '📋', label: 'Zadania' },
    { component: <ShopScreen />, icon: '🛍️', label: 'Sklep' }
  ];

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div 
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={containerRef}
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
              <span className="text-2xl">{screen.icon}</span>
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

      {/* Desktop Navigation Hints */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none">
        {currentScreen > 0 && (
          <button 
            onClick={() => setCurrentScreen(currentScreen - 1)}
            className="pointer-events-auto bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div />
        {currentScreen < screens.length - 1 && (
          <button 
            onClick={() => setCurrentScreen(currentScreen + 1)}
            className="pointer-events-auto bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SwipeableApp;