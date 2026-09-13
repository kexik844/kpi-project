import React, { useState } from 'react';
import { RewardItem, TaskKPI } from '../types';
import { RewardCard } from './RewardCard';
import { Gift, Plus, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface RewardsViewProps {
  rewards: RewardItem[];
  tasks: TaskKPI[];
  onOpenRewardModal: () => void;
  onClaimReward: (rewardId: string) => void;
  onDeleteReward: (rewardId: string) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  rewards,
  tasks,
  onOpenRewardModal,
  onClaimReward,
  onDeleteReward,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'claimed'>('all');

  const unlockedCount = rewards.filter(r => r.status === 'unlocked').length;
  const claimedCount = rewards.filter(r => r.status === 'claimed').length;
  const lockedCount = rewards.filter(r => r.status === 'locked').length;

  const filteredRewards = rewards.filter(r => {
    if (filter === 'unlocked') return r.status === 'unlocked';
    if (filter === 'claimed') return r.status === 'claimed';
    if (filter === 'locked') return r.status === 'locked';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#ffe4e8]/80 via-[#fff5f8] to-[#e6f4f1]/50 p-5 rounded-3xl border border-[#ffd4dc] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe4e8] border border-[#ffd4dc] flex items-center justify-center text-[#be185d] shrink-0 shadow-2xs">
            <Gift className="w-6 h-6 text-[#fb7185]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                Система поощрений и личных призов
              </h2>
              {unlockedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white animate-pulse shadow-2xs">
                  {unlockedCount} ждёт вас!
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
              Назначайте себе награды за закрытие важных дел или цепочки целей. Достигли намеченного — забирайте приз с чистой совестью!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRewardModal}
          className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[40px] px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#61c0bf] hover:opacity-95 active:scale-98 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Назначить приз</span>
        </button>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={() => setFilter('unlocked')}
          className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'unlocked'
              ? 'border-[#ffd4dc] bg-gradient-to-br from-[#fff0f3] to-white ring-2 ring-[#ffd4dc] shadow-xs'
              : 'border-stone-200/80 bg-white hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-stone-600 leading-tight">Доступно</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fb7185] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#be185d]">{unlockedCount}</div>
        </button>

        <button
          onClick={() => setFilter('locked')}
          className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'locked'
              ? 'border-stone-400 bg-white ring-2 ring-stone-200 shadow-xs'
              : 'border-stone-200/80 bg-white hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-stone-600 leading-tight">В процессе</span>
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-stone-800">{lockedCount}</div>
        </button>

        <button
          onClick={() => setFilter('claimed')}
          className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'claimed'
              ? 'border-[#bbded6] bg-white ring-2 ring-[#bbded6] shadow-xs'
              : 'border-stone-200/80 bg-white hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-stone-600 leading-tight">Получено</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#246158] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#246158]">{claimedCount}</div>
        </button>
      </div>

      {/* Rewards Grid or Empty State */}
      {rewards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#fae3d9] flex items-center justify-center mx-auto mb-4 text-[#d95c62]">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">
            Призы ещё не назначены
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto mb-6">
            Поощрения помогают поддерживать дисциплину без выгорания. Задайте себе награду: например, за сдачу сложного экзамена или за выполнение 3 дел на уровне радости.
          </p>
          <button
            onClick={onOpenRewardModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Добавить первый приз
          </button>
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center">
          <p className="text-xs text-stone-500">
            В этой категории пока нет призов.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-2 text-xs font-semibold text-[#2b7a78] hover:underline"
          >
            Показать все ({rewards.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              tasks={tasks}
              onClaim={onClaimReward}
              onDelete={onDeleteReward}
            />
          ))}
        </div>
      )}
    </div>
  );
};
