export type KPIAchievement = 'exceeded' | 'planned' | 'satisfied' | 'below';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  progressPercent: number; // 0 to 100
  note?: string;
}

export type RewardTargetType = 'single_task' | 'tasks_count' | 'joy_count' | 'streak';
export type RewardStatus = 'locked' | 'unlocked' | 'claimed';

export interface RewardItem {
  id: string;
  title: string; // Приз (например: "Купить новые наушники", "Вечер любимой пиццы")
  description?: string;
  targetType: RewardTargetType;
  linkedTaskId?: string; // если привязано к конкретному делу
  requiredCount?: number; // количество дел или дней серии
  status: RewardStatus;
  createdAt: string;
  unlockedAt?: string;
  claimedAt?: string;
}

export interface TaskKPI {
  id: string;
  title: string; // Дело (Например: Экзамен по математике)
  description?: string;
  category: string; // Сфера: Учеба, Работа, Спорт, Личное, Финансы, Творчество
  scheduledDate: string; // YYYY-MM-DD
  completedAt?: string; // YYYY-MM-DD
  
  // Личностный KPI
  plannedTarget: string; // Планируемый результат (например: "Сдать на 4")
  joyThreshold: string; // Результат, достигнув который я буду рад (например: "Сдать на 3")
  actualResult?: string; // Фактический результат (например: "Получил 5")
  
  // Система поощрений / Приз за это дело
  rewardTitle?: string; // Например: "Купить любимый десерт"
  linkedRewardId?: string;
  
  status: TaskStatus;
  achievement?: KPIAchievement;
  reflection?: string; // Выводы и анализ
  dailyLogs: DailyLog[]; // Прогресс по дням
  
  createdAt: string;
  updatedAt: string;
}

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface PeriodFilter {
  period: TimePeriod;
  startDate?: string;
  endDate?: string;
}

export interface KPIStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0-100%
  
  exceededCount: number;
  plannedCount: number;
  satisfiedCount: number;
  belowCount: number;
  pendingCount: number;
  
  joyRate: number; // % of resolved tasks that achieved at least joyThreshold (satisfied + planned + exceeded)
  plannedRate: number; // % of resolved tasks that achieved plannedTarget (planned + exceeded)
  superRate: number; // % exceeded
  
  currentStreak: number;
  bestStreak: number;
  
  categoryStats: {
    category: string;
    total: number;
    completed: number;
    successRate: number;
  }[];
  
  dailyActivity: {
    date: string;
    dayLabel: string;
    completed: number;
    created: number;
    avgProgress: number;
  }[];
}
