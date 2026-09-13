import React, { useEffect } from 'react';
import { RewardItem } from '../types';
import { RewardService } from '../services/rewardService';
import { X, Gift, Sparkles, CheckCircle2 } from 'lucide-react';

interface RewardUnlockedCelebrationProps {
  reward: RewardItem | null;
  onClose: () => void;
  onConfirmClaim: (rewardId: string) => void;
}

export const RewardUnlockedCelebration: React.FC<RewardUnlockedCelebrationProps> = ({
  reward,
  onClose,
  onConfirmClaim,
}) => {
  useEffect(() => {
    if (reward) {
      RewardService.triggerConfetti();
    }
  }, [reward]);

  if (!reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in zoom-in-95 duration-200">
      <div 
        id="reward-celebration-dialog"
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-[#fae3d9] relative overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ffd4dc] via-[#fb7185] to-[#61c0bf] p-1 mx-auto mb-4 shadow-md flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <Gift className="w-10 h-10 text-[#fb7185]" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe4e8] text-[#9f1239] border border-[#ffd4dc] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#fb7185]" />
          <span>Цель достигнута!</span>
        </div>

        <h3 className="text-xl font-extrabold text-stone-900 mb-2">
          Вы заслужили свой приз!
        </h3>

        <div className="bg-gradient-to-br from-[#fff0f3] to-white border border-[#ffd4dc] rounded-2xl p-4 my-4 shadow-2xs">
          <div className="text-sm font-extrabold text-stone-900 leading-snug">
            {reward.title}
          </div>
          {reward.description && (
            <div className="text-xs text-[#9f1239]/90 mt-1 italic">
              «{reward.description}»
            </div>
          )}
        </div>

        <p className="text-xs text-stone-500 leading-relaxed mb-6">
          Вы выполнили поставленный план и достигли нужного результата. Обязательно порадуйте себя — это укрепляет привычку к осознанным достижениям!
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              RewardService.triggerConfetti();
              onConfirmClaim(reward.id);
            }}
            className="w-full px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#61c0bf] hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Отметить приз полученным
          </button>
        </div>
      </div>
    </div>
  );
};
