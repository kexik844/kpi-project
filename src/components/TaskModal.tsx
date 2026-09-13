import React, { useState, useEffect } from 'react';
import { TaskKPI } from '../types';
import { DEFAULT_CATEGORIES } from '../services/storageService';
import { formatISODate } from '../services/kpiCalculator';
import { X, Target, Smile, Calendar, Sparkles, Gift, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskKPI>) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: TaskKPI | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(formatISODate(new Date()));
  const [plannedTarget, setPlannedTarget] = useState('');
  const [joyThreshold, setJoyThreshold] = useState('');
  const [rewardTitle, setRewardTitle] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      if (DEFAULT_CATEGORIES.includes(taskToEdit.category)) {
        setCategory(taskToEdit.category);
        setIsCustomCategory(false);
      } else {
        setIsCustomCategory(true);
        setCustomCategory(taskToEdit.category);
      }
      setScheduledDate(taskToEdit.scheduledDate);
      setPlannedTarget(taskToEdit.plannedTarget);
      setJoyThreshold(taskToEdit.joyThreshold);
      setRewardTitle(taskToEdit.rewardTitle || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory(DEFAULT_CATEGORIES[0]);
      setIsCustomCategory(false);
      setCustomCategory('');
      setScheduledDate(formatISODate(new Date()));
      setPlannedTarget('');
      setJoyThreshold('');
      setRewardTitle('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !plannedTarget.trim() || !joyThreshold.trim()) {
      return;
    }

    const finalCategory = isCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      scheduledDate,
      plannedTarget: plannedTarget.trim(),
      joyThreshold: joyThreshold.trim(),
      rewardTitle: rewardTitle.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="task-form-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-4.5 sm:p-6 shadow-2xl border border-stone-100 my-auto max-h-[92dvh] flex flex-col relative"
      >
        <button
          id="close-task-modal-btn"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#ffe4e8] flex items-center justify-center text-[#be185d]">
            <Sparkles className="w-4 h-4 text-[#fb7185]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {taskToEdit ? 'Редактировать дело' : 'Новое дело с личностным KPI'}
          </h2>
        </div>
        <p className="text-xs text-stone-500 mb-4 shrink-0">
          Задайте дело, плановый ориентир и личную планку радости для честного трекинга.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Дело (Название) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Дело / Задача <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-task-title"
              type="text"
              required
              placeholder="Например: Экзамен по математике или Забег на 10 км"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400 font-medium"
            />
          </div>

          {/* KPI Section */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center justify-between">
              <span>Шкала Личностного KPI</span>
              <span className="text-[11px] text-stone-400 font-normal lowercase">план ➔ радость</span>
            </div>

            {/* 1. Planned Target */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#2b7a78]" />
                Планируемый результат <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-planned-target"
                type="text"
                required
                placeholder="Например: Сдать на 4"
                value={plannedTarget}
                onChange={(e) => setPlannedTarget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                То, что вы объективно наметили выполнить
              </span>
            </div>

            {/* 2. Joy Threshold (Soft Pink accent) */}
            <div className="bg-[#fff0f3] p-3 rounded-xl border border-[#ffd4dc]">
              <label className="block text-xs font-bold text-[#9f1239] mb-1 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#fb7185]" />
                Результат, достигнув который я буду рад <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-joy-threshold"
                type="text"
                required
                placeholder="Например: Сдать на 3"
                value={joyThreshold}
                onChange={(e) => setJoyThreshold(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#ffd4dc] focus:outline-none focus:ring-2 focus:ring-[#fb7185] text-base sm:text-sm text-stone-900 placeholder:text-stone-400"
              />
              <span className="text-[11px] text-[#9f1239]/80 mt-0.5 block">
                Планка искреннего удовлетворения и внутреннего спокойствия
              </span>
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Дата дедлайна
              </label>
              <input
                id="input-scheduled-date"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Сфера / Категория
              </label>
              {!isCustomCategory ? (
                <div className="flex gap-1.5">
                  <select
                    id="select-category"
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 bg-white"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Другая сфера...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Своя категория"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#61c0bf]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Personal Reward for this task */}
          <div className="bg-[#fff0f3]/70 rounded-2xl p-3.5 border border-[#ffd4dc] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9f1239] flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#fb7185]" />
              Личный приз / поощрение за это дело (необязательно)
            </label>
            <input
              id="input-task-reward"
              type="text"
              placeholder="Например: Купить наушники, вечер кино, поход в спа..."
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#ffd4dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#fb7185] text-base sm:text-sm text-stone-900 placeholder:text-stone-400"
            />
            <p className="text-[11px] text-[#9f1239]/80">
              Если указать награду, она автоматически появится в витрине призов и разблокируется при завершении дела.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Детали и контекст (необязательно)
            </label>
            <textarea
              id="input-task-description"
              rows={2}
              placeholder="Дополнительные критерии, ссылки или заметки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-base sm:text-sm text-stone-900 placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-stone-100 shrink-0">
            {taskToEdit && onDelete ? (
              <button
                id="delete-task-modal-btn"
                type="button"
                onClick={() => {
                  const idToDelete = taskToEdit.id;
                  onClose();
                  onDelete(idToDelete);
                }}
                className="flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить дело</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                id="cancel-task-modal-btn"
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                id="save-task-modal-btn"
                type="submit"
                className="flex-1 sm:flex-initial min-h-[42px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0] transition-colors shadow-xs cursor-pointer"
              >
                {taskToEdit ? 'Сохранить изменения' : 'Создать дело'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
