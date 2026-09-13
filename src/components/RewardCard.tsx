import React from 'react';
import { RewardItem, TaskKPI } from '../types';
import { Gift, CheckCircle2, Lock, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface RewardCardProps {
  reward: RewardItem;
  tasks: TaskKPI[];
  onClaim: (rewardId: string) => void;
  onDelete: (rewardId: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  tasks,
  onClaim,
  onDelete,
}) => {
  const isUnlocked = reward.status === 'unlocked';
  const isClaimed = reward.status === 'claimed';
  const isLocked = reward.status === 'locked';

  // Find linked task if single_task
  const linkedTask = reward.linkedTaskId 
    ? tasks.find(t => t.id === reward.linkedTaskId) 
    : null;

  // Calculate progress for multi-task rewards
  let progressText = '';
  let progressPercent = 0;

  if (reward.targetType === 'single_task') {
    if (linkedTask) {
      progressText = `Дело: «${linkedTask.title}»`;
      progressPercent = linkedTask.status === 'completed' ? 100 : 30;
    } else {
      progressText = 'Привязано к конкретному делу';
      progressPercent = isUnlocked || isClaimed ? 100 : 0;
    }
  } else if (reward.targetType === 'tasks_count') {
    const required = reward.requiredCount || 1;
    const completed = tasks.filter(t => t.status === 'completed').length;
    progressText = `${Math.min(completed, required)} из ${required} завершённых дел`;
    progressPercent = Math.min(100, Math.round((completed / required) * 100));
  } else if (reward.targetType === 'joy_count') {
    const required = reward.requiredCount || 1;
    const joyCount = tasks.filter(t => t.status === 'completed' && t.achievement !== 'below').length;
    progressText = `${Math.min(joyCount, required)} из ${required} дел с радостью`;
    progressPercent = Math.min(100, Math.round((joyCount / required) * 100));
  } else if (reward.targetType === 'streak') {
    const required = reward.requiredCount || 1;
    progressText = `Серия из ${required} дней подряд`;
    progressPercent = isUnlocked || isClaimed ? 100 : 40;
  }

  return (
    <div 
      id={`reward-card-${reward.id}`}
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-xs relative overflow-hidden ${
        isUnlocked
          ? 'bg-gradient-to-br from-[#fff0f3] via-white to-[#bbded6]/25 border-[#ffd4dc] shadow-md ring-2 ring-[#ffd4dc]'
          : isClaimed
          ? 'bg-white/80 border-stone-200 opacity-90'
          : 'bg-white border-stone-200 hover:border-[#ffd4dc]'
      }`}
    >
      <div>
        {/* Top Status and Target Type */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isUnlocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white shadow-2xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Заслужено! Можно забрать
              </span>
            )}
            {isClaimed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#bbded6]/50 text-[#246158]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Приз получен
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                <Lock className="w-3 h-3 text-stone-400" />
                В процессе выполнения
              </span>
            )}
          </div>

          <button
            onClick={() => onDelete(reward.id)}
            title="Удалить приз"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-stone-300 hover:text-rose-500 active:text-rose-600 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Prize Title & Icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isUnlocked 
              ? 'bg-[#ffe4e8] text-[#be185d]' 
              : isClaimed 
              ? 'bg-[#bbded6]/40 text-[#246158]' 
              : 'bg-stone-100 text-stone-500'
          }`}>
            <Gift className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-base font-bold text-stone-900 leading-snug">
              {reward.title}
            </h4>
            {reward.description && (
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                {reward.description}
              </p>
            )}
          </div>
        </div>

        {/* Condition details & Progress bar */}
        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/60 mb-3 space-y-1.5">
          <div className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
            <span>Условие получения:</span>
            <span className="text-stone-800 font-bold">{progressPercent}%</span>
          </div>
          <div className="text-xs text-stone-700 font-medium truncate">
            {progressText}
          </div>

          {!isClaimed && (
            <div className="w-full h-1.5 bg-stone-200/70 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: isUnlocked ? '#fb7185' : '#61c0bf'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-stone-400">
          {isClaimed && reward.claimedAt 
            ? `Получен: ${reward.claimedAt}` 
            : `Создан: ${reward.createdAt}`}
        </span>

        {isUnlocked && (
          <button
            onClick={() => onClaim(reward.id)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#61c0bf] hover:opacity-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Забрать приз
          </button>
        )}

        {isClaimed && (
          <span className="text-xs font-semibold text-[#2b7a78] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Заслуженно
          </span>
        )}

        {isLocked && (
          <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Недоступно
          </span>
        )}
      </div>
    </div>
  );
};
