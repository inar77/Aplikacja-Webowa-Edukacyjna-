import React, { useState } from 'react';
import { ChevronRight, Star, Lock, Unlock, Zap, Code, Heart, Scale, Users, Brain } from 'lucide-react';

const CareerPathPlanner = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [testAnswers, setTestAnswers] = useState({});
  const [suggestedPath, setSuggestedPath] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  const paths = {
    elektryk: {
      name: 'Elektryk',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-500',
      description: 'Mistrzowie energii i systemów elektrycznych',
      requirements: ['Rozwiąż 2 zadania z podstaw fizyki', 'Przejdź test bezpieczeństwa pracy'],
      traits: ['praktyczny', 'precyzyjny', 'techniczny'],
      unlocked: false
    },
    programista: {
      name: 'Programista',
      icon: <Code className="w-6 h-6" />,
      color: 'from-blue-400 to-purple-500',
      description: 'Czarodzieje kodu i cyfrowych rozwiązań',
      requirements: ['Ukończ mini-kurs logiki algorytmicznej', 'Napisz pierwszy program "Hello World"'],
      traits: ['logiczny', 'kreatywny', 'cierpliwy'],
      unlocked: false
    },
    lekarz: {
      name: 'Lekarz',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-400 to-pink-500',
      description: 'Uzdrowiciele i strażnicy zdrowia',
      requirements: ['Zaliczyć test z biologii podstawowej', 'Przeczytaj case study pacjenta'],
      traits: ['empatyczny', 'dokładny', 'odpowiedzialny'],
      unlocked: false
    },
    sedzia: {
      name: 'Sędzia',
      icon: <Scale className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800',
      description: 'Strażnicy sprawiedliwości i prawa',
      requirements: ['Rozwiąż 3 zadania z logiki prawniczej', 'Przeanalizuj prosty przypadek prawny'],
      traits: ['analityczny', 'bezstronny', 'zasadniczy'],
      unlocked: false
    },
    polityk: {
      name: 'Polityk',
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-400 to-blue-500',
      description: 'Liderzy zmiany społecznej',
      requirements: ['Przeczytaj artykuł o retoryce i komunikacji', 'Napisz krótką propozycję rozwiązania problemu lokalnego'],
      traits: ['charyzmatyczny', 'komunikatywny', 'wizjonerski'],
      unlocked: false
    }
  };

  const testQuestions = [
    {
      id: 1,
      question: "Co sprawia Ci największą satysfakcję?",
      options: [
        { answer: "Rozwiązywanie praktycznych problemów własnymi rękami", points: { elektryk: 3, programista: 1 }},
        { answer: "Tworzenie czegoś nowego z niczego", points: { programista: 3, polityk: 1 }},
        { answer: "Pomaganie ludziom w trudnych chwilach", points: { lekarz: 3, sedzia: 1 }},
        { answer: "Dbanie o sprawiedliwość i porządek", points: { sedzia: 3, polityk: 2 }},
        { answer: "Prowadzenie ludzi ku lepszej przyszłości", points: { polityk: 3, lekarz: 1 }}
      ]
    },
    {
      id: 2,
      question: "Jak najlepiej się uczysz?",
      options: [
        { answer: "Poprzez praktyczne ćwiczenia i eksperymenty", points: { elektryk: 3, lekarz: 2 }},
        { answer: "Analizując wzorce i rozwiązując logiczne zagadki", points: { programista: 3, sedzia: 2 }},
        { answer: "Studiując przypadki i czytając dużo", points: { lekarz: 3, sedzia: 2 }},
        { answer: "Dyskutując i wymieniając się pomysłami", points: { polityk: 3, sedzia: 1 }},
        { answer: "Obserwując ekspertów i naśladując ich techniki", points: { elektryk: 2, programista: 2 }}
      ]
    },
    {
      id: 3,
      question: "Co Cię najbardziej motywuje?",
      options: [
        { answer: "Widzenie konkretnych rezultatów swojej pracy", points: { elektryk: 3, programista: 2 }},
        { answer: "Eleganckie rozwiązania skomplikowanych problemów", points: { programista: 3, sedzia: 2 }},
        { answer: "Pozytywny wpływ na życie innych ludzi", points: { lekarz: 3, polityk: 2 }},
        { answer: "Utrzymywanie porządku i sprawiedliwości", points: { sedzia: 3, polityk: 1 }},
        { answer: "Możliwość zmieniania świata na lepsze", points: { polityk: 3, lekarz: 2 }}
      ]
    },
    {
      id: 4,
      question: "Jakie środowisko pracy Ci odpowiada?",
      options: [
        { answer: "Warsztat, laboratorium - miejsce gdzie mogę tworzyć", points: { elektryk: 3, programista: 1 }},
        { answer: "Spokojne miejsce gdzie mogę się skupić i myśleć", points: { programista: 3, sedzia: 2 }},
        { answer: "Miejsce gdzie spotykam różnych ludzi codziennie", points: { lekarz: 3, polityk: 3 }},
        { answer: "Formalne środowisko wymagające profesjonalizmu", points: { sedzia: 3, lekarz: 1 }},
        { answer: "Dynamiczne miejsce pełne rozmów i spotkań", points: { polityk: 3, elektryk: 1 }}
      ]
    }
  ];

  const calculateSuggestion = () => {
    const scores = { elektryk: 0, programista: 0, lekarz: 0, sedzia: 0, polityk: 0 };
    
    Object.values(testAnswers).forEach(answer => {
      Object.entries(answer.points).forEach(([path, points]) => {
        scores[path] += points;
      });
    });

    const suggested = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    setSuggestedPath(suggested[0]);
    setCurrentStep('suggestion');
  };

  const completeTask = (pathName, taskIndex) => {
    const key = `${pathName}_${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: true }));
    
    // Check if all tasks are completed for this path
    const pathTasks = paths[pathName].requirements.length;
    const completedForPath = Object.keys({...completedTasks, [key]: true}).filter(k => k.startsWith(pathName)).length;
    
    if (completedForPath === pathTasks) {
      // Unlock the path
      paths[pathName].unlocked = true;
    }
  };

  const isTaskCompleted = (pathName, taskIndex) => {
    return completedTasks[`${pathName}_${taskIndex}`];
  };

  const isPathUnlocked = (pathName) => {
    const pathTasks = paths[pathName].requirements.length;
    const completedForPath = Object.keys(completedTasks).filter(k => k.startsWith(pathName)).length;
    return completedForPath === pathTasks;
  };

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Brain className="w-24 h-24 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Czapka Przydziału Kariery
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Podobnie jak w Hogwarcie, pomożemy Ci odkryć idealną ścieżkę rozwoju. 
              AI przeanalizuje Twoje predyspozycje, ale wybór zawsze należy do Ciebie!
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">🎭 Jak to działa?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-500 rounded-full p-2 flex-shrink-0">
                  <span className="text-black font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Test Osobowości</h3>
                  <p className="text-sm text-purple-200">Krótki quiz odkryje Twoje mocne strony</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">AI Sugestia</h3>
                  <p className="text-sm text-purple-200">Otrzymasz rekomendację idealnej ścieżki</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                  <span className="text-black font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Twój Wybór</h3>
                  <p className="text-sm text-purple-200">Zaakceptuj lub wybierz własną ścieżkę</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setCurrentStep('test')}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-4 rounded-full text-xl font-semibold hover:from-yellow-500 hover:to-amber-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Rozpocznij Test Przydziału ✨
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'test') {
    const currentQuestion = testQuestions.find(q => !testAnswers[q.id]);
    
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xl">Czapka analizuje Twoje odpowiedzi...</p>
            <button 
              onClick={calculateSuggestion}
              className="mt-6 bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Zobacz Wynik
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Test Przydziału</h1>
            <div className="bg-white/20 rounded-full h-3 max-w-md mx-auto">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all"
                style={{ width: `${(Object.keys(testAnswers).length / testQuestions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2">Pytanie {Object.keys(testAnswers).length + 1} z {testQuestions.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setTestAnswers(prev => ({
                      ...prev,
                      [currentQuestion.id]: option
                    }));
                  }}
                  className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/20 hover:border-yellow-400"
                >
                  {option.answer}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'suggestion') {
    const suggestedPathData = paths[suggestedPath];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🎩 Czapka Przemówiła!</h1>
            <p className="text-xl text-purple-200">Na podstawie Twoich odpowiedzi, oto nasza rekomendacja:</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Suggestion */}
            <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">AI Rekomenduje</h2>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              
              <div className={`bg-gradient-to-r ${suggestedPathData.color} p-6 rounded-xl text-white mb-4`}>
                <div className="flex items-center space-x-3 mb-3">
                  {suggestedPathData.icon}
                  <h3 className="text-2xl font-bold">{suggestedPathData.name}</h3>
                </div>
                <p className="text-white/90">{suggestedPathData.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-400">Dlaczego to pasuje do Ciebie:</h4>
                <ul className="space-y-2">
                  {suggestedPathData.traits.map((trait, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-yellow-400" />
                      <span>Jesteś {trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPath(suggestedPath);
                  setCurrentStep('pathways');
                }}
                className="w-full mt-6 bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Akceptuję Wybór AI ✨
              </button>
            </div>

            {/* Alternative Choice */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Lub Wybierz Sam</h2>
              <p className="text-purple-200 mb-6">
                Nie musisz się zgadzać z AI! Możesz wybrać dowolną ścieżkę, 
                ale pamiętaj - będziesz musiał spełnić jej wymagania.
              </p>

              <div className="space-y-3">
                {Object.entries(paths).filter(([key]) => key !== suggestedPath).map(([key, path]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedPath(key);
                      setCurrentStep('pathways');
                    }}
                    className={`w-full p-4 bg-gradient-to-r ${path.color} rounded-lg text-white hover:scale-105 transition-transform`}
                  >
                    <div className="flex items-center space-x-3">
                      {path.icon}
                      <span className="font-semibold">{path.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'pathways') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🎯 Twoje Ścieżki Kariery</h1>
            <p className="text-xl text-purple-200">
              Wybrana ścieżka: <span className="text-yellow-400 font-bold">{paths[selectedPath]?.name}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Selected Path - Highlighted */}
            <div className={`lg:col-span-2 bg-gradient-to-br ${paths[selectedPath]?.color}/20 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/50`}>
              <div className="flex items-center space-x-3 mb-4">
                {paths[selectedPath]?.icon}
                <h2 className="text-3xl font-bold">{paths[selectedPath]?.name}</h2>
                <div className="flex-1"></div>
                {isPathUnlocked(selectedPath) ? (
                  <Unlock className="w-8 h-8 text-green-400" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <p className="text-lg mb-6 text-purple-100">{paths[selectedPath]?.description}</p>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-400">Wymagania wstępne:</h3>
                {paths[selectedPath]?.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                    <button
                      onClick={() => completeTask(selectedPath, index)}
                      disabled={isTaskCompleted(selectedPath, index)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isTaskCompleted(selectedPath, index)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-white/50 hover:border-yellow-400'
                      }`}
                    >
                      {isTaskCompleted(selectedPath, index) && '✓'}
                    </button>
                    <span className={isTaskCompleted(selectedPath, index) ? 'line-through text-green-400' : ''}>{req}</span>
                  </div>
                ))}
              </div>

              {isPathUnlocked(selectedPath) && (
                <div className="mt-8 p-6 bg-green-500/20 border-2 border-green-400/50 rounded-xl">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 Gratulacje!</h3>
                  <p className="text-green-200 mb-4">Odblokowałeś ścieżkę {paths[selectedPath]?.name}! 
                  Teraz możesz wejść do prawdziwego programu rozwoju.</p>
                  <button className="bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors">
                    Rozpocznij Ścieżkę Rozwoju →
                  </button>
                </div>
              )}
            </div>

            {/* Other Paths */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Inne Ścieżki</h3>
              {Object.entries(paths).filter(([key]) => key !== selectedPath).map(([key, path]) => (
                <div key={key} 
                     className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/10 transition-colors cursor-pointer group"
                     onClick={() => setSelectedPath(key)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {path.icon}
                    <h4 className="font-semibold group-hover:text-yellow-400 transition-colors">{path.name}</h4>
                    <div className="flex-1"></div>
                    {isPathUnlocked(key) ? (
                      <Unlock className="w-5 h-5 text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-purple-200">{path.description}</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">
                      {Object.keys(completedTasks).filter(k => k.startsWith(key)).length}/{path.requirements.length} zadań
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CareerPathPlanner;


import React,  {useState} from 'react';
import MainNav from "./components/MainNav";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import TasksScreen from "./screens/TasksScreen";
import ShopScreen from "./screens/ShopScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ForumScreen from "./screens/ForumScreen";
import "./App.css";



type Screen = "home" | "map" | "tasks" | "shop" | "profile" | "forum";

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("home");
   // Demo user state
  const [user, setUser] = useState({
    name: "Ala",
    level: 2,
    xp: 120,
    faction: "Programista",
    gold: 150,
    items: ["Młotek Dyscypliny"],
    arena: 1,
    arenas: [
      { name: "Warsztat Początkującego", minLevel: 1 },
      { name: "Warsztat Adepta", minLevel: 5 },
      { name: "Warsztat Profesjonalisty", minLevel: 10 },
    ],
  });

  return (
    <div className="app-root">
      <MainNav current={screen} onChange={setScreen} user={user} />
      <main className="main-container">
        {screen === "home" && <HomeScreen user={user} />}
        {screen === "map" && <MapScreen user={user} />}
        {screen === "tasks" && <TasksScreen user={user} />}
        {screen === "shop" && <ShopScreen user={user} setUser={setUser} />}
        {screen === "profile" && <ProfileScreen user={user} />}
        {screen === "forum" && <ForumScreen />}
      </main>
    </div>
  );
};

export default App;


import React from "react";

type View = "map" | "profile" | "tasks" | "shop" | "forum";

const NavBar: React.FC<{ current: View; onChange: (v: View) => void }> = ({ current, onChange }) => {
  return (
    <nav className="bottom-nav">
      <button className={current === "profile" ? "active" : ""} onClick={() => onChange("profile")}>Profil</button>
      <button className={current === "tasks" ? "active" : ""} onClick={() => onChange("tasks")}>Zadania</button>
      <button className={current === "map" ? "active" : ""} onClick={() => onChange("map")}>Mapa</button>
      <button className={current === "shop" ? "active" : ""} onClick={() => onChange("shop")}>Sklep</button>
      <button className={current === "forum" ? "active" : ""} onClick={() => onChange("forum")}>Forum</button>
    </nav>
  );
};


export default NavBar;



import React from "react";

interface Props {
  title?: string;
  missionTitle: string;
  current: number;
  target: number;
  onIncrement?: () => void;
  onViewAll?: () => void;
}

const DailyMissionWidget: React.FC<Props> = ({ title = "Dzienne Misje", missionTitle, current, target, onIncrement, onViewAll }) => {
  const progress = Math.min(1, current / target);
  return (
    <div className="daily-card">
      <div className="daily-header">
        <div className="daily-title">{title}</div>
        <button className="link-btn" onClick={onViewAll}>ZOBACZ WSZYSTKIE</button>
      </div>

      <div className="mission-row">
        <div className="left-icon">⚡</div>
        <div className="mission-center">
          <div className="mission-title">{missionTitle}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
            <div className="



import React from "react";
import "./MainNav.css";

type Props = {
  current: string;
  onChange: (scr: string) => void;
  user: any;
};

const MainNav: React.FC<Props> = ({ current, onChange, user }) => (
  <nav className="main-nav">
    <div className="nav-logo">🧭 PathFinder</div>
    <div className="nav-user">
      {user.name} | Lv {user.level} | XP {user.xp} | {user.faction}
    </div>
    <div className="nav-btns">
      <button className={current === "home" ? "active" : ""} onClick={() => onChange("home")}>🏠</button>
      <button className={current === "map" ? "active" : ""} onClick={() => onChange("map")}>Mapa</button>
      <button className={current === "tasks" ? "active" : ""} onClick={() => onChange("tasks")}>Zadania</button>
      <button className={current === "shop" ? "active" : ""} onClick={() => onChange("shop")}>Sklep</button>
      <button className={current === "profile" ? "active" : ""} onClick={() => onChange("profile")}>Profil</button>
      <button className={current === "forum" ? "active" : ""} onClick={() => onChange("forum")}>Forum</button>
    </div>
  </nav>
);

export default MainNav;



import React from "react";
import "./HomeScreen.css";

const HomeScreen: React.FC<{ user: any }> = ({ user }) => (
  <div className="home-main">
    <h1>Witaj, {user.name}!</h1>
    <div className="arena-section">
      <div className="arena-info">
        <h2>Arena: {user.arenas[user.arena - 1].name}</h2>
        <div className="arena-bar">
          <span>Poziom: {user.level}</span>
          <span>XP: {user.xp}</span>
        </div>
      </div>
      <div className="arena-bg lvl-{user.arena}"></div>
    </div>
    <div className="chests-section">
      <h3>Darmowe Skrzynie</h3>
      <div className="chests-row">
        <div className="chest locked">🔒</div>
        <div className="chest unlocking">⏳</div>
        <div className="chest ready">🎁</div>
      </div>
    </div>
    <div className="quick-menu">
      <button>Trening</button>
      <button>Twoja Frakcja</button>
      <button>Sklep</button>
    </div>
  </div>
);

export default HomeScreen;



import React from "react";
import "./MapScreen.css";

const MapScreen: React.FC<{ user: any }> = ({ user }) => (
  <div className="map-main">
    <h2>Mapa Twojej ścieżki</h2>
    <div className="arenas-list">
      {user.arenas.map((arena: any, idx: number) => (
        <div key={arena.name} className={"arena-card" + (user.level >= arena.minLevel ? " unlocked" : " locked")}>
          <div className="arena-label">{arena.name}</div>
          <div className="arena-lvl">Lv {arena.minLevel}</div>
          <div>{user.level >= arena.minLevel ? "🟢" : "🔒"}</div>
        </div>
      ))}
    </div>
    <div className="map-scene">
      <h3>Aktualna profesja: {user.faction}</h3>
      <div className="map-art lvl-{user.arena}">
        {/* Tu można dodać obrazek/stół/narzędzia zależnie od profesji i poziomu */}
        <div className="scene-demo">[Scena profesji / stół/narzędzia]</div>
      </div>
    </div>
  </div>
);



import React from "react";
import "./DailyMissionWidget.css";

interface Props {
  title?: string;
  missionTitle: string;
  current: number;
  target: number;
  onIncrement?: () => void;
  onViewAll?: () => void;
}

const DailyMissionWidget: React.FC<Props> = ({
  title = "Dzienne Misje",
  missionTitle,
  current,
  target,
  onIncrement,
  onViewAll
}) => {
  const progress = Math.min(1, current / target);

  return (
    <div className="daily-card">
      <div className="daily-header">
        <div className="daily-title">{title}</div>
        <button className="link-btn" onClick={onViewAll}>ZOBACZ WSZYSTKIE</button>
      </div>
      <div className="mission-row">
        <div className="left-icon" role="img" aria-label="energy">⚡</div>
        <div className="mission-center">
          <div className="mission-title">{missionTitle}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
            <div className="progress-label">
              {current} / {target}
            </div>
          </div>
        </div>
        <div className="right-icon" role="img" aria-label="chest">🧰</div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        {onIncrement && (
          <button className="daily-btn" onClick={onIncrement}>+1 pkt</button>
        )}
        <button className="daily-btn" onClick={onViewAll}>Zobacz wszystkie</button>
      </div>
    </div>
  );
};

export default DailyMissionWidget;




import React from "react";
import "./ForumScreen.css";

const ForumScreen: React.FC = () => (
  <div className="forum-main">
    <h2>Forum społeczności</h2>
    <div className="forum-posts">
      <p>💬 "Motywacja to 80% sukcesu!"</p>
      <p>💬 "Jak pokonać prokrastynację?"</p>
      <p>💬 "Kto chce dołączyć do wyzwania codziennego?"</p>
    </div>
    <textarea placeholder="Napisz swoją wiadomość..." rows={3}></textarea>
    <button>Wyślij</button>
  </div>
);

export default ForumScreen;

--------------------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, Lock, Unlock, Zap, Code, Heart, Scale, Users, Brain, Trophy, Target, Book, Award, Sparkles, TrendingUp, Shield, CheckCircle } from 'lucide-react';



const CareerPathPlanner = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [testAnswers, setTestAnswers] = useState({});
  const [suggestedPath, setSuggestedPath] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [userLevel, setUserLevel] = useState(1);
  const [skills, setSkills] = useState({
    matematyka: 1,
    logika: 1,
    komunikacja: 1,
    biologia: 1,
    fizyka: 1,
    prawo: 1
  });




  import React, { useState } from 'react';
import { ChevronRight, Star, Lock, Unlock, Zap, Code, Heart, Scale, Users, Brain, Trophy, Target, Book, Award, Sparkles, TrendingUp, Shield, CheckCircle } from 'lucide-react';

const CareerPathPlanner = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [testAnswers, setTestAnswers] = useState({});
  const [suggestedPath, setSuggestedPath] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [userLevel, setUserLevel] = useState(1);
  const [skills, setSkills] = useState({
    matematyka: 1,
    logika: 1,
    komunikacja: 1,
    biologia: 1,
    fizyka: 1,
    prawo: 1
  });
  const [animating, setAnimating] = useState(false);

  const paths = {
    elektryk: {
      namee: 'Dom Voltów',
      shortName: 'Elektryk',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-500',
      bgPattern: 'bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20',
      description: 'Mistrzowie energii i systemów elektrycznych',
      motto: '"Energia płynie przez nasze dłonie"',
      requirements: [
        { task: 'Podnieś poziom matematyki do 3', skill: 'matematyka', required: 3 },
        { task: 'Podnieś poziom fizyki do 2', skill: 'fizyka', required: 2 },
        { task: 'Zalicz test bezpieczeństwa pracy', type: 'test' }
      ],
      traits: ['praktyczny', 'precyzyjny', 'techniczny'],
      benefits: ['Wysokie zarobki już na starcie', 'Praca w terenie', 'Zawód przyszłości (OZE)'],
      matchScore: 0
    },
    programista: {
      name: 'Dom Algorytmów',
      shortName: 'Programista',
      icon: <Code className="w-6 h-6" />,
      color: 'from-blue-400 to-purple-500',
      bgPattern: 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20',
      description: 'Czarodzieje kodu i cyfrowych rozwiązań',
      motto: '"Kod jest naszą magią"',
      requirements: [
        { task: 'Podnieś poziom logiki do 4', skill: 'logika', required: 4 },
        { task: 'Podnieś poziom matematyki do 3', skill: 'matematyka', required: 3 },
        { task: 'Napisz pierwszy program "Hello World"', type: 'project' }
      ],
      traits: ['logiczny', 'kreatywny', 'cierpliwy'],
      benefits: ['Praca zdalna', 'Nieograniczone możliwości rozwoju', 'Wysokie zarobki'],
      matchScore: 0
    },
    lekarz: {
      name: 'Dom Asklepiosa',
      shortName: 'Lekarz',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-400 to-pink-500',
      bgPattern: 'bg-gradient-to-br from-red-900/20 via-pink-900/20 to-rose-900/20',
      description: 'Uzdrowiciele i strażnicy zdrowia',
      motto: '"Życie jest najwyższą wartością"',
      requirements: [
        { task: 'Podnieś poziom biologii do 4', skill: 'biologia', required: 4 },
        { task: 'Podnieś poziom komunikacji do 3', skill: 'komunikacja', required: 3 },
        { task: 'Przeczytaj case study pacjenta', type: 'study' }
      ],
      traits: ['empatyczny', 'dokładny', 'odpowiedzialny'],
      benefits: ['Prestiż społeczny', 'Ratowanie życia', 'Stabilność zawodowa'],
      matchScore: 0
    },
    sedzia: {
      name: 'Dom Temidy',
      shortName: 'Sędzia',
      icon: <Scale className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800',
      bgPattern: 'bg-gradient-to-br from-gray-900/20 via-slate-900/20 to-zinc-900/20',
      description: 'Strażnicy sprawiedliwości i prawa',
      motto: '"Sprawiedliwość ponad wszystko"',
      requirements: [
        { task: 'Podnieś poziom prawa do 4', skill: 'prawo', required: 4 },
        { task: 'Podnieś poziom logiki do 3', skill: 'logika', required: 3 },
        { task: 'Przeanalizuj prosty przypadek prawny', type: 'case' }
      ],
      traits: ['analityczny', 'bezstronny', 'zasadniczy'],
      benefits: ['Niezależność', 'Wysokie wynagrodzenie', 'Szacunek społeczny'],
      matchScore: 0
    },
    polityk: {
      name: 'Dom Oratorów',
      shortName: 'Polityk',
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-400 to-blue-500',
      bgPattern: 'bg-gradient-to-br from-green-900/20 via-teal-900/20 to-blue-900/20',
      description: 'Liderzy zmiany społecznej',
      motto: '"Głos ludu jest naszą siłą"',
      requirements: [
        { task: 'Podnieś poziom komunikacji do 4', skill: 'komunikacja', required: 4 },
        { task: 'Podnieś poziom prawa do 2', skill: 'prawo', required: 2 },
        { task: 'Napisz krótką propozycję rozwiązania problemu lokalnego', type: 'essay' }
      ],
      traits: ['charyzmatyczny', 'komunikatywny', 'wizjonerski'],
      benefits: ['Wpływ na społeczeństwo', 'Networking', 'Możliwość realnej zmiany'],
      matchScore: 0
    }
  };

  const testQuestions = [
    {
      id: 1,
      question: "Co sprawia Ci największą satysfakcję?",
      options: [
        { answer: "Rozwiązywanie praktycznych problemów własnymi rękami", points: { elektryk: 3, programista: 1 }},
        { answer: "Tworzenie czegoś nowego z niczego", points: { programista: 3, polityk: 1 }},
        { answer: "Pomaganie ludziom w trudnych chwilach", points: { lekarz: 3, sedzia: 1 }},
        { answer: "Dbanie o sprawiedliwość i porządek", points: { sedzia: 3, polityk: 2 }},
        { answer: "Prowadzenie ludzi ku lepszej przyszłości", points: { polityk: 3, lekarz: 1 }}
      ]
    },
    {
      id: 2,
      question: "Jak najlepiej się uczysz?",
      options: [
        { answer: "Poprzez praktyczne ćwiczenia i eksperymenty", points: { elektryk: 3, lekarz: 2 }},
        { answer: "Analizując wzorce i rozwiązując logiczne zagadki", points: { programista: 3, sedzia: 2 }},
        { answer: "Studiując przypadki i czytając dużo", points: { lekarz: 3, sedzia: 2 }},
        { answer: "Dyskutując i wymieniając się pomysłami", points: { polityk: 3, sedzia: 1 }},
        { answer: "Obserwując ekspertów i naśladując ich techniki", points: { elektryk: 2, programista: 2 }}
      ]
    },
    {
      id: 3,
      question: "Co Cię najbardziej motywuje?",
      options: [
        { answer: "Widzenie konkretnych rezultatów swojej pracy", points: { elektryk: 3, programista: 2 }},
        { answer: "Eleganckie rozwiązania skomplikowanych problemów", points: { programista: 3, sedzia: 2 }},
        { answer: "Pozytywny wpływ na życie innych ludzi", points: { lekarz: 3, polityk: 2 }},
        { answer: "Utrzymywanie porządku i sprawiedliwości", points: { sedzia: 3, polityk: 1 }},
        { answer: "Możliwość zmieniania świata na lepsze", points: { polityk: 3, lekarz: 2 }}
      ]
    },
    {
      id: 4,
      question: "Jakie środowisko pracy Ci odpowiada?",
      options: [
        { answer: "Warsztat, laboratorium - miejsce gdzie mogę tworzyć", points: { elektryk: 3, programista: 1 }},
        { answer: "Spokojne miejsce gdzie mogę się skupić i myśleć", points: { programista: 3, sedzia: 2 }},
        { answer: "Miejsce gdzie spotykam różnych ludzi codziennie", points: { lekarz: 3, polityk: 3 }},
        { answer: "Formalne środowisko wymagające profesjonalizmu", points: { sedzia: 3, lekarz: 1 }},
        { answer: "Dynamiczne miejsce pełne rozmów i spotkań", points: { polityk: 3, elektryk: 1 }}
      ]
    },
    {
      id: 5,
      question: "Jak reagujesz na stres?",
      options: [
        { answer: "Skupiam się na znalezieniu praktycznego rozwiązania", points: { elektryk: 3, programista: 2 }},
        { answer: "Analizuję sytuację krok po kroku", points: { programista: 3, sedzia: 3 }},
        { answer: "Szukam wsparcia u innych i działam zespołowo", points: { lekarz: 2, polityk: 3 }},
        { answer: "Zachowuję zimną krew i trzymam się procedur", points: { sedzia: 3, lekarz: 2 }},
        { answer: "Przekuwam stres w energię do działania", points: { polityk: 3, elektryk: 2 }}
      ]
    }
  ];

  const calculateSuggestion = () => {
    const scores = { elektryk: 0, programista: 0, lekarz: 0, sedzia: 0, polityk: 0 };
    
    Object.values(testAnswers).forEach(answer => {
      Object.entries(answer.points).forEach(([path, points]) => {
        scores[path] += points;
      });
    });

    Object.keys(scores).forEach(path => {
      const maxScore = testQuestions.length * 3;
      paths[path].matchScore = Math.round((scores[path] / maxScore) * 100);
    });

    const suggested = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    setSuggestedPath(suggested[0]);
    setAnimating(true);
    setCurrentStep('suggestion');
  };

  const upgradeSkill = (skill) => {
    if (userLevel >= skills[skill] * 2) {
      setSkills(prev => ({
        ...prev,
        [skill]: prev[skill] + 1
      }));
    }
  };

  const checkPathRequirements = (pathName) => {
    const path = paths[pathName];
    return path.requirements.every(req => {
      if (req.skill) {
        return skills[req.skill] >= req.required;
      }
      return completedTasks[`${pathName}_${req.task}`];
    });
  };

  const getRequirementStatus = (pathName, req) => {
    if (req.skill) {
      return skills[req.skill] >= req.required;
    }
    return completedTasks[`${pathName}_${req.task}`];
  };

  const completeTask = (pathName, task) => {
    const key = `${pathName}_${task}`;
    setCompletedTasks(prev => ({ ...prev, [key]: true }));
    setUserLevel(prev => prev + 1);
  };

  // Welcome Screen
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <Sparkles className="w-2 h-2 text-white/20" />
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="relative inline-block">
              <Brain className="w-24 h-24 mx-auto mb-6 text-yellow-400 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Czapka Przydziału Kariery
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
              "Ach, kolejny śmiałek! Pozwól, że zajrzę w głąb Twojego umysłu i odkryję, 
              który fach będzie Twoim przeznaczeniem. Każdy ma swoją ścieżkę, ale tylko jeden Dom 
              pozwoli Ci rozkwitnąć w pełni..."
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-yellow-400" />
              Jak działa przydzielenie?
              <Shield className="w-6 h-6 text-yellow-400" />
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="group hover:scale-105 transition-transform">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-3 flex-shrink-0 shadow-lg">
                    <Brain className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Test Czapki</h3>
                    <p className="text-sm text-purple-200">Czapka przebada Twoje predyspozycje i talenty</p>
                  </div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full p-3 flex-shrink-0 shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Werdykt Magiczny</h3>
                    <p className="text-sm text-purple-200">AI-Czapka ogłosi najlepszy Dom dla Ciebie</p>
                  </div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-3 flex-shrink-0 shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Twój Wybór</h3>
                    <p className="text-sm text-purple-200">Możesz przyjąć lub wybrać własny Dom</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-5 gap-4">
              {Object.values(paths).map((path, i) => (
                <div key={i} className="text-center group">
                  <div className={`bg-gradient-to-br ${path.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {path.icon}
                  </div>
                  <p className="text-xs mt-2 text-purple-200">{path.shortName}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setCurrentStep('test')}
            className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black px-10 py-5 rounded-full text-xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all shadow-2xl animate-bounce"
          >
            <span className="flex items-center gap-2">
              Włóż Czapkę Przydziału
              <Sparkles className="w-6 h-6" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Test Screen
  if (currentStep === 'test') {
    const currentQuestion = testQuestions.find(q => !testAnswers[q.id]);
    
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-20 h-20 mx-auto mb-6 text-yellow-400 animate-pulse" />
            <div className="text-3xl font-bold mb-4 italic">"Hmm... Ciekawe, bardzo ciekawe..."</div>
            <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xl text-purple-200 mb-2">"Widzę w Tobie wielki potencjał..."</p>
            <p className="text-lg text-purple-300 italic">"Ale gdzie Cię umieścić?"</p>
            <button 
              onClick={calculateSuggestion}
              className="mt-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-4 rounded-full font-bold hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-105 shadow-2xl"
            >
              Poznaj decyzję 
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Czapka Bada Twój Umysł...</h1>
            <div className="bg-white/20 rounded-full h-3 max-w-md mx-auto overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(Object.keys(testAnswers).length / testQuestions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2 text-purple-200">
              Pytanie {Object.keys(testAnswers).length + 1} z {testQuestions.length}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-center italic">
              "{currentQuestion.question}"
            </h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setTestAnswers(prev => ({
                      ...prev,
                      [currentQuestion.id]: option
                    }));
                  }}
                  className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all border border-white/20 hover:border-yellow-400 transform hover:scale-[1.02]"
                >
                  {option.answer}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Suggestion Screen
  if (currentStep === 'suggestion') {
    const suggestedPathData = paths[suggestedPath];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-5xl mx-auto">
          {animating && (
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-4 text-yellow-400">
                "AH! WIEM JUŻ!"
              </h1>
              <p className="text-2xl text-purple-200 italic">Czapka ogłasza swój werdykt...</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className={`${suggestedPathData.bgPattern} backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/50 shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {suggestedPathData.matchScore}% dopasowania
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-yellow-400">Czapka przydziela Cię do:</h2>
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                </div>
                
                <div className={`bg-gradient-to-r ${suggestedPathData.color} p-8 rounded-xl text-white mb-6 shadow-xl`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      {React.cloneElement(suggestedPathData.icon, { className: "w-10 h-10" })}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold">{suggestedPathData.name}</h3>
                      <p className="text-lg italic opacity-90">{suggestedPathData.motto}</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-lg">{suggestedPathData.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Twoje cechy pasują do :
                    </h4>
                    <ul className="space-y-2">
                      {suggestedPathData.traits.map((trait, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>Jesteś {trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Korzyści z tej ścieżki:
                    </h4>
                    <ul className="space-y-2">
                      {suggestedPathData.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center space-x-2"></li>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>Jesteś {trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Korzyści z tej ścieżki:
                    </h4>
                    <ul className="space-y-2">
                      {suggestedPathData.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPath(suggestedPath);
                    setCurrentStep('pathways');
                  }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-4 px-6 rounded-xl font-bold hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-105 shadow-xl text-lg"
                >
                  Przyjmuję przydział do {suggestedPathData.name} ⚡
                </button>
              </div>
            </div>

            <div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold mb-2 text-center">"Nie zgadzasz się?"</h2>
                <p className="text-sm text-purple-200 mb-4 text-center italic">
                  "Możesz wybrać inny Dom, ale musisz spełnić jego wymagania..."
                </p>

                <div className="space-y-3">
                  {Object.entries(paths).filter(([key]) => key !== suggestedPath).map(([key, path]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedPath(key);
                        setCurrentStep('pathways');
                      }}
                      className="w-full group relative overflow-hidden"
                    >
                      <div className={`p-4 bg-gradient-to-r ${path.color} rounded-lg text-white hover:scale-105 transition-transform shadow-lg`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {path.icon}
                            <div className="text-left">
                              <p className="font-semibold">{path.name}</p>
                              <p className="text-xs opacity-80">{path.matchScore}% dopasowania</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pathways Screen
  if (currentStep === 'pathways') {
    const currentPath = paths[selectedPath];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Ścieżka Rozwoju</h1>
            <div className="flex items-center justify-center gap-4">
              <div className={`bg-gradient-to-r ${currentPath.