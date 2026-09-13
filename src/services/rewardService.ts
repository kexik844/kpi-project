import { RewardItem, TaskKPI } from '../types';
import { calculateKPIStats, formatISODate } from './kpiCalculator';
import confetti from 'canvas-confetti';

const REWARDS_STORAGE_KEY = 'personal_kpi_rewards_v1';

export const RewardService = {
  loadRewards(): RewardItem[] {
    try {
      const data = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load rewards', e);
      return [];
    }
  },

  saveRewards(rewards: RewardItem[]): void {
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
    } catch (e) {
      console.error('Failed to save rewards', e);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(REWARDS_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear rewards', e);
    }
  },

  /**
   * Re-evaluates all rewards based on updated tasks list.
   * Returns updated rewards list and any newly unlocked rewards (to trigger celebrations).
   */
  evaluateRewards(rewards: RewardItem[], tasks: TaskKPI[]): { updatedRewards: RewardItem[]; newlyUnlocked: RewardItem[] } {
    const stats = calculateKPIStats(tasks, 'all');
    const nowStr = formatISODate(new Date());
    const newlyUnlocked: RewardItem[] = [];

    const updatedRewards = rewards.map(reward => {
      // If already claimed, don't change
      if (reward.status === 'claimed') return reward;

      let isEligible = false;

      if (reward.targetType === 'single_task') {
        const linkedTask = tasks.find(t => t.id === reward.linkedTaskId);
        if (linkedTask && linkedTask.status === 'completed' && linkedTask.achievement !== 'below') {
          isEligible = true;
        }
      } else if (reward.targetType === 'tasks_count') {
        const count = stats.completedTasks;
        if (count >= (reward.requiredCount || 1)) {
          isEligible = true;
        }
      } else if (reward.targetType === 'joy_count') {
        const joyCount = stats.exceededCount + stats.plannedCount + stats.satisfiedCount;
        if (joyCount >= (reward.requiredCount || 1)) {
          isEligible = true;
        }
      } else if (reward.targetType === 'streak') {
        if (stats.currentStreak >= (reward.requiredCount || 1) || stats.bestStreak >= (reward.requiredCount || 1)) {
          isEligible = true;
        }
      }

      if (isEligible && reward.status === 'locked') {
        const unlockedReward: RewardItem = {
          ...reward,
          status: 'unlocked',
          unlockedAt: nowStr,
        };
        newlyUnlocked.push(unlockedReward);
        return unlockedReward;
      }

      return reward;
    });

    this.saveRewards(updatedRewards);
    return { updatedRewards, newlyUnlocked };
  },

  /**
   * Fires a vibrant celebratory confetti burst!
   */
  triggerConfetti(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffb6b9', '#fae3d9', '#bbded6', '#61c0bf', '#ffd166'],
      });
    } catch {
      // ignore
    }
  },
};
