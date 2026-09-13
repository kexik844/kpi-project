import React, { useState, useEffect } from 'react';
import { TaskKPI, KPIAchievement } from '../types';
import { KPI_ACHIEVEMENT_CONFIG, formatISODate } from '../services/kpiCalculator';
import { X, Award, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';

interface RecordOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskKPI | null;
  onSaveOutcome: (
    taskId: string,
    actualResult: string,
    achievement: KPIAchievement,
    reflection: string,
    completedAt: string
  ) => void;
}

export const RecordOutcomeModal: React.FC<RecordOutcomeModalProps> = ({
  isOpen,
  onClose,
  task,
  onSaveOutcome,
}) => {
  const [actualResult, setActualResult] = useState('');
  const [achievement, setAchievement] = useState<KPIAchievement>('planned');
  const [reflection, setReflection] = useState('');
  const [completedAt, setCompletedAt] = useState(formatISODate(new Date()));

  useEffect(() => {
    if (task) {
      setActualResult(task.actualResult || '');
      setAchievement(task.achievement || 'planned');
      setReflection(task.reflection || '');
      setCompletedAt(task.completedAt || formatISODate(new Date()));
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualResult.trim()) return;

    onSaveOutcome(
      task.id,
      actualResult.trim(),
      achievement,
      reflection.trim(),
      completedAt
    );
    onClose();
  };

  const achievementOptions: KPIAchievement[] = ['exceeded', 'planned', 'satisfied', 'below'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="record-outcome-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-4.5 sm:p-6 shadow-2xl border border-stone-100 my-auto max-h-[92dvh] flex flex-col relative"
      >
        <button
          id="close-outcome-modal-btn"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#61c0bf]/20 flex items-center justify-center text-[#2b7a78]">
            <Award className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            Фиксация факта и KPI
          </h2>
        </div>
        <p className="text-xs text-stone-500 mb-3 shrink-0">
          Сравните запланированное, планку радости и реальный полученный итог.
        </p>

        {/* Task Reference banner */}
        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 mb-3 space-y-2 shrink-0">
          <div className="text-xs font-semibold text-stone-900 line-clamp-1">
            {task.title}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-xl border border-stone-200">
              <span className="text-[11px] text-stone-500 block">План:</span>
              <span className="font-semibold text-stone-800 line-clamp-1">{task.plannedTarget}</span>
            </div>
            <div className="bg-[#fff0f3] p-2 rounded-xl border border-[#ffd4dc]">
              <span className="text-[11px] text-[#9f1239] block font-medium">Буду рад:</span>
              <span className="font-bold text-[#881337] line-clamp-1">{task.joyThreshold}</span>
            </div>
          </div>

          {task.rewardTitle && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#fff0f3] border border-[#ffd4dc] text-[11px] text-[#9f1239] font-medium">
              <span>🎁 Личный приз: <strong>{task.rewardTitle}</strong></span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Фактический результат */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Фактический результат <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-actual-result"
              type="text"
              required
              placeholder="Например: Получил 5 или Пробежал за 48 минут"
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400 font-medium"
            />
          </div>

          {/* KPI Assessment Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Итоговая оценка по шкале KPI
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {achievementOptions.map((opt) => {
                const config = KPI_ACHIEVEMENT_CONFIG[opt];
                const isSelected = achievement === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAchievement(opt)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `${config.borderColor} ${config.badgeBg} ring-2 ring-stone-900/10 shadow-xs`
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs font-bold ${isSelected ? config.badgeText : 'text-stone-800'}`}>
                        {config.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2b7a78]" />
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 leading-tight">
                      {config.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date of completion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Дата фиксации
              </label>
              <input
                id="input-completion-date"
                type="date"
                required
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900"
              />
            </div>
          </div>

          {/* Рефлексия / выводы */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              Личная рефлексия и выводы (необязательно)
            </label>
            <textarea
              id="input-reflection"
              rows={2}
              placeholder="Что сработало лучше всего? Что учесть при постановке следующих целей?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-stone-100 shrink-0">
            <button
              id="cancel-outcome-btn"
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              id="save-outcome-btn"
              type="submit"
              className="min-h-[42px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0] transition-colors shadow-xs cursor-pointer"
            >
              Зафиксировать результат
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
