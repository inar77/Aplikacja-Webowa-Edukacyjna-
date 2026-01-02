// components/WorkshopRunner.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { DailyJob, WorkshopTask } from '../types/workshop';
import { Zap, ArrowRight, ArrowLeft, CheckCircle2, Camera, Mic, PlayCircle } from 'lucide-react';
import { useApp } from 'app/contexts/AppContext'; // jak u Ciebie [file:44]

interface WorkshopRunnerProps {
  job: DailyJob;
  onFinish?: (result: { jobId: string; earnedXP: number }) => void;
  onExit?: () => void;
}

export const WorkshopRunner: React.FC<WorkshopRunnerProps> = ({
  job,
  onFinish,
  onExit,
}) => {
  const { addXP } = useApp() as any; // dostosuj do swojego kontekstu [file:54]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [earnedXP, setEarnedXP] = useState(0);

  const currentTask = useMemo(
    () => job.tasks[currentIndex],
    [job.tasks, currentIndex]
  );

  const isLast = currentIndex === job.tasks.length - 1;

  const handleCompleteTask = () => {
    if (!completedIds.includes(currentTask.id)) {
      setCompletedIds((prev) => [...prev, currentTask.id]);
      setEarnedXP((prev) => prev + currentTask.xpReward);
    }
    if (isLast) {
      addXP?.(earnedXP + currentTask.xpReward, `Zlecenie: ${job.title}`);
      onFinish?.({ jobId: job.id, earnedXP: earnedXP + currentTask.xpReward });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-50">
      {/* Pasek nagłówka */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            {job.title}
          </h1>
          <p className="text-xs text-slate-400">
            {job.tasks.length} zadania · ok. {job.estimatedMinutes} min · {earnedXP} XP zebrane
          </p>
        </div>
        <button
          onClick={onExit}
          className="text-xs text-slate-400 hover:text-slate-100"
        >
          Wyjdź
        </button>
      </header>

      {/* Główna część: narzędzia + zadanie */}
      <div className="flex-1 grid grid-rows-[auto_1fr_auto] lg:grid-cols-[260px_1fr] lg:grid-rows-1">
        {/* Lewy panel – lista zadań */}
        <aside className="border-b border-slate-800 lg:border-b-0 lg:border-r bg-slate-900/50 p-4 space-y-3">
          {job.tasks.map((task, idx) => {
            const isActive = idx === currentIndex;
            const isDone = completedIds.includes(task.id);
            return (
              <button
                key={task.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-full text-left rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2 border transition ${
                  isActive
                    ? 'border-violet-400 bg-violet-950/60'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TaskIcon kind={task.kind} />
                  <span className="font-semibold line-clamp-1">
                    {task.title}
                  </span>
                </div>
                {isDone && (
                  <CheckCircle2 className="text-emerald-400" size={16} />
                )}
              </button>
            );
          })}
        </aside>

        {/* Prawy panel – aktualne zadanie */}
        <main className="p-4 lg:p-8 flex flex-col gap-4">
          {/* Pasek górny zadania */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold mb-1">
                Zadanie {currentIndex + 1} z {job.tasks.length}
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TaskIcon kind={currentTask.kind} />
                {currentTask.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {currentTask.description}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>+{currentTask.xpReward} XP</div>
              <div>~ {currentTask.estimatedMinutes} min</div>
            </div>
          </div>

          {/* Obszar roboczy */}
          <div className="flex-1 mt-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:p-6 flex items-center justify-center">
            <TaskWorkspace task={currentTask} />
          </div>

          {/* Dolny pasek nawigacji */}
          <div className="flex items-center justify-between gap-4 mt-2">
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="flex items-center gap-2 text-xs text-slate-400 disabled:opacity-40"
            >
              <ArrowLeft size={16} />
              Wróć
            </button>

            <button
              onClick={handleCompleteTask}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
            >
              {isLast ? 'Zakończ zlecenie' : 'Zadanie wykonane'}
              <ArrowRight size={16} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

// Ikony w zależności od typu zadania
const TaskIcon: React.FC<{ kind: WorkshopTask['kind'] }> = ({ kind }) => {
  switch (kind) {
    case 'simulation':
      return <PlayCircle className="text-sky-400" size={16} />;
    case 'photo':
      return <Camera className="text-amber-400" size={16} />;
    case 'voice':
      return <Mic className="text-emerald-400" size={16} />;
    case 'story':
      return <Zap className="text-pink-400" size={16} />;
    default:
      return <Zap size={16} />;
  }
};

// „Makiety” workspace – tu później podłączysz prawdziwe symulacje / kamerę / audio
const TaskWorkspace: React.FC<{ task: WorkshopTask }> = ({ task }) => {
  if (task.kind === 'simulation') {
    return (
      <div className="text-center text-sm text-slate-300 space-y-4">
        <div className="text-4xl mb-2">🧪</div>
        <p>Tu załadujesz swoją symulację 3D / circuit-builder.</p>
        <p className="text-xs text-slate-500">
          Wersja MVP: możesz na razie wyświetlać sta
