import React, { useState } from 'react';
import { TaskKPI } from '../types';
import { formatISODate } from '../services/kpiCalculator';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Plus, 
  Target, 
  Smile,
  Award
} from 'lucide-react';

interface DailyTrackerViewProps {
  tasks: TaskKPI[];
  onOpenTaskModal: () => void;
  onRecordOutcome: (task: TaskKPI) => void;
  onAddDailyProgress: (task: TaskKPI) => void;
}

export const DailyTrackerView: React.FC<DailyTrackerViewProps> = ({
  tasks,
  onOpenTaskModal,
  onRecordOutcome,
  onAddDailyProgress,
}) => {
  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));

  // Generate 7-day strip centered around selectedDate or current week
  const getDayStrip = () => {
    const dates = [];
    const base = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dayStrip = getDayStrip();

  // Tasks scheduled for this date OR tasks with dailyLog on this date OR active in-progress tasks
  const tasksForSelectedDay = tasks.filter(t => {
    const isScheduled = t.scheduledDate === selectedDate;
    const isCompletedOnDay = t.completedAt === selectedDate;
    const hasLogOnDay = (t.dailyLogs || []).some(l => l.date === selectedDate);
    const isInProgress = t.status === 'in_progress';
    return isScheduled || isCompletedOnDay || hasLogOnDay || isInProgress;
  });

  const isToday = selectedDate === formatISODate(new Date());

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatISODate(date));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatISODate(date));
  };

  const todayStr = formatISODate(new Date());

  return (
    <div className="space-y-5">
      {/* Day Strip Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#61c0bf]" />
            <h2 className="text-base font-bold text-stone-900">
              Календарь дневного прогресса
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                id="back-to-today-btn"
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#ffe4e8] text-[#9f1239] border border-[#ffd4dc] font-semibold hover:bg-[#ffd4dc] transition-colors cursor-pointer"
              >
                Сегодня
              </button>
            )}
            <div className="flex items-center gap-1">
              <button
                id="prev-day-btn"
                onClick={handlePrevDay}
                aria-label="Предыдущий день"
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-stone-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="next-day-btn"
                onClick={handleNextDay}
                aria-label="Следующий день"
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-stone-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7-day strip buttons */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {dayStrip.map((d) => {
            const dateStr = formatISODate(d);
            const isSelected = dateStr === selectedDate;
            const isCurrentToday = dateStr === todayStr;
            const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
            const dayNum = d.getDate();

            // Count tasks active or logged on this date
            const count = tasks.filter(t => 
              t.scheduledDate === dateStr || 
              t.completedAt === dateStr || 
              (t.dailyLogs || []).some(l => l.date === dateStr)
            ).length;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:p-2 rounded-xl transition-all cursor-pointer min-h-[52px] ${
                  isSelected
                    ? 'bg-[#61c0bf] text-white shadow-sm ring-2 ring-[#61c0bf]/30'
                    : isCurrentToday
                    ? 'bg-[#fff0f3] text-[#9f1239] border border-[#ffd4dc]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-tight ${isSelected ? 'text-white/90' : 'text-stone-500'}`}>
                  {weekday}
                </span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 leading-none">
                  {dayNum}
                </span>
                {count > 0 ? (
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-white' : 'bg-[#61c0bf]'}`} />
                ) : (
                  <span className="mt-1 w-1.5 h-1.5 opacity-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Header & Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-800">
            Дела на {selectedDate} {isToday ? '(Сегодня)' : ''}
          </h3>
          <p className="text-xs text-stone-500">
            Отмечайте прогресс в % и добавляйте шаги для сохранения динамики
          </p>
        </div>

        <button
          id="add-task-daily-btn"
          onClick={onOpenTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#61c0bf] hover:bg-[#4db2b1] transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новое дело</span>
        </button>
      </div>

      {/* List of Tasks for this day */}
      {tasksForSelectedDay.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center">
          <CalendarDays className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">
            Нет активных задач на этот день
          </p>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Добавьте новую цель с личным KPI или переключитесь на активные дела.
          </p>
          <button
            onClick={onOpenTaskModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#61c0bf] hover:bg-[#4db2b1] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Добавить дело
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasksForSelectedDay.map((task) => {
            const isCompleted = task.status === 'completed';
            const logForSelectedDay = (task.dailyLogs || []).find(l => l.date === selectedDate);
            const latestLog = task.dailyLogs && task.dailyLogs.length > 0 
              ? task.dailyLogs[task.dailyLogs.length - 1] 
              : null;
            const progress = isCompleted ? 100 : (logForSelectedDay?.progressPercent ?? latestLog?.progressPercent ?? 0);

            return (
              <div 
                key={task.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ffe4e8] text-[#9f1239] border border-[#ffd4dc]">
                      {task.category}
                    </span>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#bbded6]/40 text-[#246158] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Завершено ({task.actualResult || 'Факт есть'})
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        В процессе
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 leading-snug truncate">
                    {task.title}
                  </h4>

                  {/* KPI summary */}
                  <div className="flex items-center gap-2 text-xs text-stone-600 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-700">
                      <Target className="w-3 h-3 text-[#61c0bf]" />
                      План: <strong className="text-stone-900">{task.plannedTarget}</strong>
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fff0f3] border border-[#ffd4dc] text-[#9f1239]">
                      <Smile className="w-3 h-3 text-[#fb7185]" />
                      Рад: <strong className="text-[#881337]">{task.joyThreshold}</strong>
                    </span>
                  </div>

                  {logForSelectedDay?.note && (
                    <div className="text-[11px] text-stone-500 mt-1.5 italic bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                      Отметка дня: «{logForSelectedDay.note}»
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-2.5 max-w-md">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-stone-500">Прогресс:</span>
                      <span className="font-bold text-[#2b7a78]">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progress}%`, 
                          backgroundColor: isCompleted ? '#61c0bf' : '#bbded6' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                  <button
                    onClick={() => onAddDailyProgress(task)}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
                    <span>Отметить прогресс</span>
                  </button>

                  <button
                    onClick={() => onRecordOutcome(task)}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Изменить факт' : 'Зафиксировать факт'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
