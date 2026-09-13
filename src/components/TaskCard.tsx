import React from 'react';
import { TaskKPI, KPIAchievement } from '../types';
import { KPI_ACHIEVEMENT_CONFIG } from '../services/kpiCalculator';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  Target, 
  Smile, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  CalendarDays,
  Gift
} from 'lucide-react';

interface TaskCardProps {
  task: TaskKPI;
  onEdit: (task: TaskKPI) => void;
  onDelete: (taskId: string) => void;
  onRecordOutcome: (task: TaskKPI) => void;
  onAddDailyProgress: (task: TaskKPI) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onRecordOutcome,
  onAddDailyProgress,
}) => {
  const isCompleted = task.status === 'completed';
  const achievementConfig = task.achievement ? KPI_ACHIEVEMENT_CONFIG[task.achievement] : null;

  // Calculate current progress percent
  const latestLog = task.dailyLogs && task.dailyLogs.length > 0 
    ? task.dailyLogs[task.dailyLogs.length - 1] 
    : null;
  const currentProgress = isCompleted ? 100 : (latestLog ? latestLog.progressPercent : 0);

  return (
    <div 
      id={`task-card-${task.id}`}
      className="bg-white rounded-2xl border border-stone-200/80 hover:border-[#ffd4dc] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative"
    >
      <div>
        {/* Top bar: Category + Date + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffe4e8] text-[#9f1239] border border-[#ffd4dc]">
              {task.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <CalendarDays className="w-3.5 h-3.5 text-[#61c0bf]" />
              {task.scheduledDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#bbded6]/40 text-[#246158]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2b7a78]" />
                Завершено
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                В процессе
              </span>
            )}

            <div className="flex items-center gap-1 ml-1">
              <button
                id={`edit-task-btn-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                title="Редактировать дело"
                aria-label="Редактировать дело"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                id={`delete-task-btn-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                title="Удалить дело"
                aria-label="Удалить дело"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-stone-900 leading-snug">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Linked Reward Banner if set */}
        {task.rewardTitle && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#fff0f3] border border-[#ffd4dc] text-[11px] text-[#9f1239] font-medium mb-3">
            <Gift className="w-3.5 h-3.5 text-[#fb7185] shrink-0" />
            <span className="truncate">Приз: <strong>{task.rewardTitle}</strong></span>
            {isCompleted && task.achievement !== 'below' && (
              <span className="ml-auto text-[10px] font-bold text-[#246158] bg-[#bbded6]/80 px-1.5 py-0.5 rounded-full shrink-0">
                Заслужено!
              </span>
            )}
          </div>
        )}

        {/* KPI Chain: План -> Радость -> Факт */}
        <div className="rounded-xl bg-stone-50/70 border border-stone-200/80 p-3 mb-4 space-y-2.5">
          <div className="text-[11px] font-bold tracking-wide uppercase text-stone-600 flex items-center justify-between">
            <span>Личностный KPI</span>
            <span className="text-[10px] text-stone-400 font-normal lowercase">план ➔ радость ➔ факт</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* 1. Planned Target */}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600 mb-0.5">
                <Target className="w-3 h-3 text-[#61c0bf]" />
                <span>План:</span>
              </div>
              <div className="font-semibold text-stone-800 break-words leading-tight">
                {task.plannedTarget}
              </div>
            </div>

            {/* 2. Joy Threshold (Soft Pink Accent) */}
            <div className="p-2.5 rounded-xl bg-[#fff0f3] border border-[#ffd4dc] shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#9f1239] mb-0.5">
                <Smile className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>Буду рад:</span>
              </div>
              <div className="font-semibold text-[#881337] break-words leading-tight">
                {task.joyThreshold}
              </div>
            </div>

            {/* 3. Actual Result */}
            <div className={`p-2.5 rounded-xl border shadow-2xs ${
              isCompleted 
                ? 'bg-white border-[#bbded6]' 
                : 'bg-stone-100/60 border-dashed border-stone-300'
            }`}>
              <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600 mb-0.5">
                <TrendingUp className="w-3 h-3 text-[#2b7a78]" />
                <span>Факт:</span>
              </div>
              <div className={`font-semibold break-words leading-tight ${
                task.actualResult ? 'text-stone-900' : 'text-stone-400 italic'
              }`}>
                {task.actualResult || 'Не зафиксирован'}
              </div>
            </div>
          </div>

          {/* Achievement Verdict if completed */}
          {achievementConfig && (
            <div className={`flex items-center justify-between p-2 rounded-lg border ${achievementConfig.borderColor} ${achievementConfig.badgeBg} text-xs mt-2`}>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#2b7a78]" />
                <span className={`font-bold ${achievementConfig.badgeText}`}>
                  {achievementConfig.label}
                </span>
              </div>
              {task.completedAt && (
                <span className="text-[11px] text-stone-500">
                  {task.completedAt}
                </span>
              )}
            </div>
          )}

          {task.reflection && (
            <div className="text-[11px] text-stone-600 bg-white/80 p-2 rounded-lg italic border border-stone-100">
              «{task.reflection}»
            </div>
          )}
        </div>

        {/* Daily progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium">Прогресс выполнения:</span>
            <span className="font-bold text-stone-800">{currentProgress}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${currentProgress}%`,
                backgroundColor: isCompleted ? '#61c0bf' : '#bbded6'
              }}
            />
          </div>
          {latestLog && latestLog.note && !isCompleted && (
            <div className="text-[11px] text-stone-500 mt-1 truncate">
              {latestLog.date}: {latestLog.note}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-2">
        <button
          id={`daily-progress-btn-${task.id}`}
          onClick={() => onAddDailyProgress(task)}
          className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CalendarDays className="w-3.5 h-3.5 text-stone-600" />
          <span>Отметить день</span>
        </button>

        <button
          id={`record-outcome-btn-${task.id}`}
          onClick={() => onRecordOutcome(task)}
          className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 ${
            isCompleted
              ? 'bg-[#bbded6]/50 text-[#246158] hover:bg-[#bbded6]'
              : 'bg-[#61c0bf] text-white hover:bg-[#4db2b1] shadow-xs'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Изменить факт' : 'Внести факт'}</span>
        </button>
      </div>
    </div>
  );
};
