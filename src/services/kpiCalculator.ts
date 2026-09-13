import { TaskKPI, KPIStats, TimePeriod, KPIAchievement } from '../types';

export const PALETTE = {
  coral: '#ffb6b9',
  softPink: '#ffb6b9',
  softPinkLight: '#fff0f3',
  softPinkBorder: '#ffd4dc',
  softPinkText: '#be185d',
  softPinkDark: '#9f1239',
  blush: '#fae3d9',
  mint: '#bbded6',
  teal: '#61c0bf',
  coralDark: '#d95c62',
  tealDark: '#2b7a78',
  mintDark: '#4d988b',
  charcoal: '#2d3748',
  cream: '#fffaf6',
};

export const KPI_ACHIEVEMENT_CONFIG: Record<KPIAchievement, {
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  chartColor: string;
  scoreWeight: number;
}> = {
  exceeded: {
    label: 'Превзошёл ожидания',
    shortLabel: 'Супер-результат',
    description: 'Фактический результат превзошел планируемую планку',
    badgeBg: 'bg-[#61c0bf]/20',
    badgeText: 'text-[#2b7a78]',
    borderColor: 'border-[#61c0bf]',
    chartColor: '#61c0bf',
    scoreWeight: 1.25,
  },
  planned: {
    label: 'Выполнил план',
    shortLabel: 'По плану',
    description: 'Достигнут намеченный планируемый результат',
    badgeBg: 'bg-[#bbded6]/35',
    badgeText: 'text-[#2d6f66]',
    borderColor: 'border-[#bbded6]',
    chartColor: '#bbded6',
    scoreWeight: 1.0,
  },
  satisfied: {
    label: 'Достиг планки радости',
    shortLabel: 'Рад результату',
    description: 'Достигнут результат, при котором я искренне доволен',
    badgeBg: 'bg-[#fff0f3]',
    badgeText: 'text-[#be185d]',
    borderColor: 'border-[#ffd4dc]',
    chartColor: '#ff8fa3',
    scoreWeight: 0.75,
  },
  below: {
    label: 'Ниже планки',
    shortLabel: 'Ниже ожиданий',
    description: 'Фактический результат оказался ниже планки радости',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-600',
    borderColor: 'border-stone-300',
    chartColor: '#cbd5e1',
    scoreWeight: 0.25,
  },
};

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function filterTasksByPeriod(tasks: TaskKPI[], period: TimePeriod, customStart?: string, customEnd?: string): TaskKPI[] {
  if (period === 'all') return tasks;

  const now = new Date();
  let startDate = new Date();

  if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (period === 'quarter') {
    startDate.setMonth(now.getMonth() - 3);
  } else if (period === 'year') {
    startDate.setFullYear(now.getFullYear() - 1);
  } else if (customStart && customEnd) {
    const start = parseISODate(customStart);
    const end = parseISODate(customEnd);
    end.setHours(23, 59, 59);
    return tasks.filter(task => {
      const taskDate = parseISODate(task.scheduledDate);
      return taskDate >= start && taskDate <= end;
    });
  }

  const startStr = formatISODate(startDate);
  return tasks.filter(task => task.scheduledDate >= startStr || (task.completedAt && task.completedAt >= startStr));
}

export function calculateKPIStats(tasks: TaskKPI[], period: TimePeriod, customStart?: string, customEnd?: string): KPIStats {
  const filtered = filterTasksByPeriod(tasks, period, customStart, customEnd);
  const totalTasks = filtered.length;
  const completedList = filtered.filter(t => t.status === 'completed');
  const completedTasks = completedList.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let exceededCount = 0;
  let plannedCount = 0;
  let satisfiedCount = 0;
  let belowCount = 0;
  const pendingCount = filtered.filter(t => t.status !== 'completed').length;

  completedList.forEach(t => {
    if (t.achievement === 'exceeded') exceededCount++;
    else if (t.achievement === 'planned') plannedCount++;
    else if (t.achievement === 'satisfied') satisfiedCount++;
    else if (t.achievement === 'below') belowCount++;
    else {
      // Default to planned if completed without specific flag
      plannedCount++;
    }
  });

  const joyHits = exceededCount + plannedCount + satisfiedCount;
  const joyRate = completedTasks > 0 ? Math.round((joyHits / completedTasks) * 100) : 0;
  const plannedHits = exceededCount + plannedCount;
  const plannedRate = completedTasks > 0 ? Math.round((plannedHits / completedTasks) * 100) : 0;
  const superRate = completedTasks > 0 ? Math.round((exceededCount / completedTasks) * 100) : 0;

  // Category breakdown
  const categoryMap = new Map<string, { total: number; completed: number; joyCount: number }>();
  filtered.forEach(t => {
    const current = categoryMap.get(t.category) || { total: 0, completed: 0, joyCount: 0 };
    current.total++;
    if (t.status === 'completed') {
      current.completed++;
      if (t.achievement && t.achievement !== 'below') {
        current.joyCount++;
      }
    }
    categoryMap.set(t.category, current);
  });

  const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    total: stats.total,
    completed: stats.completed,
    successRate: stats.completed > 0 ? Math.round((stats.joyCount / stats.completed) * 100) : 0,
  })).sort((a, b) => b.total - a.total);

  // Daily activity for the period
  const dailyActivity = generateDailyActivitySeries(filtered, period);

  // Streaks calculation (based on all completed tasks)
  const { currentStreak, bestStreak } = calculateStreaks(tasks);

  return {
    totalTasks,
    completedTasks,
    completionRate,
    exceededCount,
    plannedCount,
    satisfiedCount,
    belowCount,
    pendingCount,
    joyRate,
    plannedRate,
    superRate,
    currentStreak,
    bestStreak,
    categoryStats,
    dailyActivity,
  };
}

function generateDailyActivitySeries(tasks: TaskKPI[], period: TimePeriod) {
  const daysCount = period === 'week' ? 7 : period === 'month' ? 30 : 14;
  const result = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = formatISODate(d);
    const dayLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

    const completed = tasks.filter(t => t.completedAt === dateStr).length;
    const created = tasks.filter(t => t.scheduledDate === dateStr).length;

    // Daily progress logs recorded for this day
    const progressLogs = tasks.flatMap(t => t.dailyLogs || []).filter(l => l.date === dateStr);
    const avgProgress = progressLogs.length > 0
      ? Math.round(progressLogs.reduce((acc, curr) => acc + curr.progressPercent, 0) / progressLogs.length)
      : completed > 0 ? 100 : 0;

    result.push({
      date: dateStr,
      dayLabel,
      completed,
      created,
      avgProgress,
    });
  }

  return result;
}

function calculateStreaks(tasks: TaskKPI[]): { currentStreak: number; bestStreak: number } {
  const completedDates = new Set<string>();
  tasks.forEach(t => {
    if (t.status === 'completed' && t.completedAt) {
      completedDates.add(t.completedAt);
    }
  });

  const sortedDates = Array.from(completedDates).sort().reverse();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayStr = formatISODate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatISODate(yesterday);

  let currentStreak = 0;
  let checkDate = new Date();

  // If completed today or yesterday, streak is alive
  if (completedDates.has(todayStr)) {
    checkDate = new Date();
  } else if (completedDates.has(yesterdayStr)) {
    checkDate = yesterday;
  } else {
    currentStreak = 0;
  }

  if (completedDates.has(todayStr) || completedDates.has(yesterdayStr)) {
    while (true) {
      const dateStr = formatISODate(checkDate);
      if (completedDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best historical streak
  let bestStreak = currentStreak;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  const ascDates = Array.from(completedDates).sort();
  for (const dateStr of ascDates) {
    const curDate = parseISODate(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(curDate.getTime() - prevDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = curDate;
  }

  return { currentStreak, bestStreak };
}
