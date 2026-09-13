import React, { useState, useEffect } from 'react';
import { TaskKPI } from '../types';
import { formatISODate } from '../services/kpiCalculator';
import { X, CalendarDays, TrendingUp } from 'lucide-react';

interface DailyProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskKPI | null;
  onSaveDailyLog: (taskId: string, date: string, progressPercent: number, note?: string) => void;
}

export const DailyProgressModal: React.FC<DailyProgressModalProps> = ({
  isOpen,
  onClose,
  task,
  onSaveDailyLog,
}) => {
  const [date, setDate] = useState(formatISODate(new Date()));
  const [progressPercent, setProgressPercent] = useState(50);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      const today = formatISODate(new Date());
      setDate(today);
      const existing = task.dailyLogs.find(l => l.date === today);
      if (existing) {
        setProgressPercent(existing.progressPercent);
        setNote(existing.note || '');
      } else {
        const lastLog = task.dailyLogs[task.dailyLogs.length - 1];
        setProgressPercent(lastLog ? lastLog.progressPercent : 50);
        setNote('');
      }
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDailyLog(task.id, date, Number(progressPercent), note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="daily-progress-modal"
        className="bg-white rounded-3xl max-w-md w-full p-4.5 sm:p-6 shadow-2xl border border-stone-100 my-auto max-h-[92dvh] flex flex-col relative"
      >
        <button
          id="close-daily-modal-btn"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#ffe4e8] flex items-center justify-center text-[#be185d]">
            <CalendarDays className="w-4 h-4 text-[#fb7185]" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900">
            Дневной прогресс
          </h2>
        </div>
        <p className="text-xs text-stone-500 mb-2 line-clamp-1 shrink-0">
          {task.title}
        </p>

        {/* Task Joy Reference */}
        <div className="bg-[#fff0f3] border border-[#ffd4dc] rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-[#9f1239] shrink-0">
          <span className="flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-[#fb7185]" />
            План: <strong className="text-stone-800">{task.plannedTarget}</strong>
          </span>
          <span className="font-semibold text-[#881337]">
            Радость: {task.joyThreshold}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1">
              Дата отметки
            </label>
            <input
              id="input-daily-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#61c0bf]" />
                Уровень готовности
              </span>
              <span className="text-sm font-extrabold text-[#2b7a78]">{progressPercent}%</span>
            </div>
            <input
              id="input-daily-progress-slider"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              className="w-full accent-[#61c0bf] cursor-pointer"
            />
            {/* Quick buttons */}
            <div className="flex gap-1.5 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setProgressPercent(pct)}
                  className={`flex-1 min-h-[36px] py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    progressPercent === pct
                      ? 'bg-[#61c0bf] text-white border-[#61c0bf]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Что сделано сегодня? (заметка)
            </label>
            <textarea
              id="input-daily-note"
              rows={2}
              placeholder="Например: Повторил 3 билета, разобрал примеры..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* History of recent daily logs */}
          {task.dailyLogs && task.dailyLogs.length > 0 && (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 max-h-32 overflow-y-auto space-y-1.5">
              <div className="text-[11px] font-bold text-stone-500 uppercase">История отметок:</div>
              {task.dailyLogs.slice(-4).reverse().map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-stone-600">
                  <span className="font-medium text-stone-700">{log.date}:</span>
                  <span className="font-semibold text-[#2b7a78]">{log.progressPercent}%</span>
                  {log.note && <span className="text-stone-500 truncate max-w-[150px] italic">{log.note}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-stone-100 shrink-0">
            <button
              id="cancel-daily-btn"
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              id="save-daily-btn"
              type="submit"
              className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0] transition-colors shadow-xs cursor-pointer"
            >
              Сохранить отметку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
