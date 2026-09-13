import React, { useState } from 'react';
import { TaskKPI, RewardTargetType } from '../types';
import { X, Gift, Sparkles, Target, Flame, Layers } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskKPI[];
  onSaveReward: (rewardData: {
    title: string;
    description?: string;
    targetType: RewardTargetType;
    linkedTaskId?: string;
    requiredCount?: number;
  }) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSaveReward,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<RewardTargetType>('tasks_count');
  const [linkedTaskId, setLinkedTaskId] = useState(tasks[0]?.id || '');
  const [requiredCount, setRequiredCount] = useState<number>(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveReward({
      title: title.trim(),
      description: description.trim() || undefined,
      targetType,
      linkedTaskId: targetType === 'single_task' ? linkedTaskId : undefined,
      requiredCount: targetType !== 'single_task' ? Number(requiredCount) || 1 : undefined,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="reward-form-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-4.5 sm:p-6 shadow-2xl border border-stone-100 my-auto max-h-[92dvh] flex flex-col relative"
      >
        <button
          id="close-reward-modal-btn"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#ffe4e8] flex items-center justify-center text-[#be185d]">
            <Gift className="w-5 h-5 text-[#fb7185]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Новый личный приз / поощрение
            </h2>
            <p className="text-xs text-stone-500">
              Награждайте себя за реальные результаты и закрытые дела
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3 overflow-y-auto pr-1 flex-1">
          {/* Название приза */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Что за приз вы хотите себе подарить? <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-reward-title"
              type="text"
              required
              placeholder="Например: Поход в любимый ресторан, покупка наушников, вечер видеоигр..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Условие получения */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Условие получения приза
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('tasks_count')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'tasks_count'
                    ? 'border-[#61c0bf] bg-[#61c0bf]/15 ring-2 ring-[#61c0bf]/30 font-semibold text-stone-900'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#2b7a78]" />
                  Выполнить N любых дел
                </div>
                <div className="text-[10px] text-stone-500">
                  Завершить определённое количество задач
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('joy_count')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'joy_count'
                    ? 'border-[#ffd4dc] bg-[#fff0f3] ring-2 ring-[#ffd4dc] font-semibold text-[#881337]'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#fb7185]" />
                  Дела с планкой радости
                </div>
                <div className="text-[10px] text-stone-500">
                  Выполнить N дел на уровне радости или выше
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('single_task')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'single_task'
                    ? 'border-[#bbded6] bg-[#bbded6]/40 ring-2 ring-[#bbded6]/50 font-semibold text-stone-900'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                  <Target className="w-3.5 h-3.5 text-[#246158]" />
                  За конкретное дело
                </div>
                <div className="text-[10px] text-stone-500">
                  Награда за один важный экзамен или проект
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('streak')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'streak'
                    ? 'border-[#fecdd3] bg-[#ffe4e8]/60 ring-2 ring-[#fecdd3] font-semibold text-[#881337]'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                  <Flame className="w-3.5 h-3.5 text-[#fb7185]" />
                  Серия продуктивных дней
                </div>
                <div className="text-[10px] text-stone-500">
                  Закрывать задачи N дней подряд
                </div>
              </button>
            </div>
          </div>

          {/* Condition-specific inputs */}
          {targetType === 'single_task' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Выберите дело из списка:
              </label>
              {tasks.length > 0 ? (
                <select
                  value={linkedTaskId}
                  onChange={(e) => setLinkedTaskId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#61c0bf] bg-white text-stone-900"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.status === 'completed' ? '(Уже выполнено)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  Пока нет созданных дел. Создайте дело сначала или выберите условие по количеству.
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {targetType === 'streak' ? 'Сколько дней подряд необходимо?' : 'Сколько дел необходимо выполнить?'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={requiredCount}
                  onChange={(e) => setRequiredCount(Math.max(1, Number(e.target.value)))}
                  className="w-28 px-3.5 py-2 rounded-xl border border-stone-300 text-base sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#61c0bf]"
                />
                <span className="text-xs text-stone-500">
                  {targetType === 'streak' ? 'дней без перерыва' : 'задач с достигнутым результатом'}
                </span>
              </div>
            </div>
          )}

          {/* Описание / Зачем мне это */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Мотивация / Заметка к призу (необязательно)
            </label>
            <textarea
              rows={2}
              placeholder="Почему этот приз ценен для меня? Как я отпраздную?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400 resize-none"
            />
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-stone-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0] transition-colors shadow-xs cursor-pointer"
            >
              Сохранить приз
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
