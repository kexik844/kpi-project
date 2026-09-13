import { TaskKPI } from '../types';
import { formatISODate } from './kpiCalculator';

const STORAGE_KEY = 'personal_kpi_tasks_clean_v2';

export const DEFAULT_CATEGORIES = [
  'Учёба и экзамены',
  'Работа и проекты',
  'Здоровье и спорт',
  'Личное развитие',
  'Финансы',
  'Творчество',
];

export function getSampleTasks(): TaskKPI[] {
  const today = new Date();
  const todayStr = formatISODate(today);

  const d1 = new Date(today);
  d1.setDate(today.getDate() - 1);
  const d1Str = formatISODate(d1);

  const d2 = new Date(today);
  d2.setDate(today.getDate() - 2);
  const d2Str = formatISODate(d2);

  const d3 = new Date(today);
  d3.setDate(today.getDate() - 4);
  const d3Str = formatISODate(d3);

  return [
    {
      id: 'task-sample-1',
      title: 'Экзамен по теории вероятностей',
      description: 'Финальная сессия, подготовка по билетам и разбор типовых задач',
      category: 'Учёба и экзамены',
      scheduledDate: d2Str,
      completedAt: d1Str,
      plannedTarget: 'Сдать на 4',
      joyThreshold: 'Сдать на 3',
      actualResult: 'Получил 5!',
      status: 'completed',
      achievement: 'exceeded',
      reflection: 'Сфокусированная подготовка превзошла все ожидания!',
      dailyLogs: [
        { date: d3Str, progressPercent: 40, note: 'Теоремы' },
        { date: d2Str, progressPercent: 85, note: 'Варианты прошлых лет' },
        { date: d1Str, progressPercent: 100, note: 'Экзамен сдан' },
      ],
      createdAt: d3Str,
      updatedAt: d1Str,
    },
    {
      id: 'task-sample-2',
      title: 'Запустить MVP нового функционала',
      description: 'Внедрение первого рабочего прототипа',
      category: 'Работа и проекты',
      scheduledDate: todayStr,
      plannedTarget: '5 ключевых экранов без багов',
      joyThreshold: '3 базовых экрана с рабочим вводом',
      status: 'in_progress',
      dailyLogs: [
        { date: d1Str, progressPercent: 45, note: 'Макеты и типы' },
        { date: todayStr, progressPercent: 75, note: 'Логика валидации' },
      ],
      createdAt: d2Str,
      updatedAt: todayStr,
    },
  ];
}

/**
 * Storage Service
 * Starts completely empty by default.
 */
export const StorageService = {
  loadTasks(): TaskKPI[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // App starts 100% empty by default
        return [];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
      return [];
    }
  },

  saveTasks(tasks: TaskKPI[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  },

  clearAllTasks(): TaskKPI[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear tasks from localStorage', e);
    }
    return [];
  },

  loadSampleTasks(): TaskKPI[] {
    const samples = getSampleTasks();
    this.saveTasks(samples);
    return samples;
  },

  exportJSON(tasks: TaskKPI[]): string {
    return JSON.stringify(tasks, null, 2);
  },

  importJSON(jsonString: string): TaskKPI[] | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.saveTasks(parsed);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }
};
