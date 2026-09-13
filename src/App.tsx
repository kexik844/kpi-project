import React, { useState, useEffect } from 'react';
import { TaskKPI, KPIAchievement, RewardItem, RewardTargetType } from './types';
import { StorageService } from './services/storageService';
import { RewardService } from './services/rewardService';
import { formatISODate, calculateKPIStats } from './services/kpiCalculator';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { RecordOutcomeModal } from './components/RecordOutcomeModal';
import { DailyProgressModal } from './components/DailyProgressModal';
import { DailyTrackerView } from './components/DailyTrackerView';
import { StatisticsView } from './components/StatisticsView';
import { RewardsView } from './components/RewardsView';
import { RewardModal } from './components/RewardModal';
import { RewardUnlockedCelebration } from './components/RewardUnlockedCelebration';
import { ReactNativeInfoModal } from './components/ReactNativeInfoModal';
import { ConfirmModal } from './components/ConfirmModal';
import { exportReportToPDF } from './services/pdfExport';
import { 
  Plus, 
  Search, 
  Target, 
  Smile, 
  CheckSquare, 
  CalendarDays, 
  TrendingUp, 
  FileDown, 
  Smartphone, 
  RotateCcw, 
  Filter,
  Sparkles,
  Flame,
  Layers,
  Award,
  Gift,
  X
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<TaskKPI[]>(() => StorageService.loadTasks());
  const [rewards, setRewards] = useState<RewardItem[]>(() => RewardService.loadRewards());
  const [currentTab, setCurrentTab] = useState<'tasks' | 'daily' | 'statistics' | 'rewards'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskKPI | null>(null);

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [taskForOutcome, setTaskForOutcome] = useState<TaskKPI | null>(null);

  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [taskForDaily, setTaskForDaily] = useState<TaskKPI | null>(null);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [celebrationReward, setCelebrationReward] = useState<RewardItem | null>(null);

  const [isRNModalOpen, setIsRNModalOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // In-app confirmation dialog state (replaces blocked window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Sync to localStorage and re-evaluate rewards on task changes
  useEffect(() => {
    StorageService.saveTasks(tasks);
    const { updatedRewards, newlyUnlocked } = RewardService.evaluateRewards(rewards, tasks);
    if (newlyUnlocked.length > 0) {
      setCelebrationReward(newlyUnlocked[0]);
    }
    setRewards(updatedRewards);
  }, [tasks]);

  useEffect(() => {
    RewardService.saveRewards(rewards);
  }, [rewards]);

  // Overall quick stats
  const overallStats = calculateKPIStats(tasks, 'all');

  // Categories list
  const categories = Array.from(new Set(tasks.map(t => t.category))).filter(Boolean);

  // Filter tasks for the 'tasks' tab
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.plannedTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.joyThreshold.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.actualResult && task.actualResult.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;

    const matchesStatus = 
      selectedStatus === 'all' ||
      (selectedStatus === 'in_progress' && task.status !== 'completed') ||
      (selectedStatus === 'completed' && task.status === 'completed') ||
      (selectedStatus === 'exceeded' && task.achievement === 'exceeded') ||
      (selectedStatus === 'joy' && (task.achievement === 'satisfied' || task.achievement === 'planned' || task.achievement === 'exceeded'));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Task Handlers
  const handleSaveTask = (taskData: Partial<TaskKPI>) => {
    const now = new Date();
    const nowStr = formatISODate(now);

    if (taskToEdit) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskToEdit.id) {
          return {
            ...t,
            ...taskData,
            updatedAt: nowStr,
          };
        }
        return t;
      }));

      // Update linked reward if rewardTitle changed
      if (taskData.rewardTitle) {
        setRewards(prev => {
          const existing = prev.find(r => r.linkedTaskId === taskToEdit.id);
          if (existing) {
            return prev.map(r => r.id === existing.id ? { ...r, title: taskData.rewardTitle! } : r);
          } else {
            const newReward: RewardItem = {
              id: `reward-${Date.now()}`,
              title: taskData.rewardTitle!,
              description: `За дело «${taskData.title || taskToEdit.title}»`,
              targetType: 'single_task',
              linkedTaskId: taskToEdit.id,
              status: 'locked',
              createdAt: nowStr,
            };
            return [newReward, ...prev];
          }
        });
      }
    } else {
      const newTaskId = `task-${Date.now()}`;
      const newTask: TaskKPI = {
        id: newTaskId,
        title: taskData.title || '',
        description: taskData.description,
        category: taskData.category || 'Общее',
        scheduledDate: taskData.scheduledDate || nowStr,
        plannedTarget: taskData.plannedTarget || '',
        joyThreshold: taskData.joyThreshold || '',
        rewardTitle: taskData.rewardTitle,
        status: 'in_progress',
        dailyLogs: [{ date: nowStr, progressPercent: 10, note: 'Дело создано' }],
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setTasks(prev => [newTask, ...prev]);

      // If user specified a reward in the task modal, automatically create the linked reward
      if (taskData.rewardTitle) {
        const newReward: RewardItem = {
          id: `reward-${Date.now()}`,
          title: taskData.rewardTitle,
          description: `За дело «${newTask.title}»`,
          targetType: 'single_task',
          linkedTaskId: newTaskId,
          status: 'locked',
          createdAt: nowStr,
        };
        setRewards(prev => [newReward, ...prev]);
      }
    }
    setTaskToEdit(null);
  };

  // Reward Handlers
  const handleCreateReward = (rewardData: {
    title: string;
    description?: string;
    targetType: RewardTargetType;
    linkedTaskId?: string;
    requiredCount?: number;
  }) => {
    const nowStr = formatISODate(new Date());
    const newReward: RewardItem = {
      id: `reward-${Date.now()}`,
      title: rewardData.title,
      description: rewardData.description,
      targetType: rewardData.targetType,
      linkedTaskId: rewardData.linkedTaskId,
      requiredCount: rewardData.requiredCount,
      status: 'locked',
      createdAt: nowStr,
    };

    const allRewards = [newReward, ...rewards];
    const { updatedRewards, newlyUnlocked } = RewardService.evaluateRewards(allRewards, tasks);
    setRewards(updatedRewards);
    if (newlyUnlocked.length > 0) {
      setCelebrationReward(newlyUnlocked[0]);
    }
  };

  const handleClaimReward = (rewardId: string) => {
    const nowStr = formatISODate(new Date());
    RewardService.triggerConfetti();
    setRewards(prev => prev.map(r => {
      if (r.id === rewardId) {
        return {
          ...r,
          status: 'claimed',
          claimedAt: nowStr,
        };
      }
      return r;
    }));
    setCelebrationReward(null);
  };

  const handleDeleteReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    const rewardTitle = reward ? `«${reward.title}»` : 'этот приз';
    setConfirmDialog({
      isOpen: true,
      title: 'Удалить приз?',
      message: `Вы уверены, что хотите удалить ${rewardTitle} из витрины наград?`,
      confirmText: 'Удалить приз',
      cancelText: 'Отмена',
      isDestructive: true,
      onConfirm: () => {
        setRewards(prev => prev.filter(r => r.id !== rewardId));
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const taskTitle = task ? `«${task.title}»` : 'это дело';
    setConfirmDialog({
      isOpen: true,
      title: 'Удалить дело?',
      message: `Вы действительно хотите удалить дело ${taskTitle}? Записи прогресса по нему также будут удалены.`,
      confirmText: 'Удалить дело',
      cancelText: 'Отмена',
      isDestructive: true,
      onConfirm: () => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      },
    });
  };

  const handleSaveOutcome = (
    taskId: string,
    actualResult: string,
    achievement: KPIAchievement,
    reflection: string,
    completedAt: string
  ) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Add 100% daily log on completion date if not present
        const logs = [...t.dailyLogs];
        if (!logs.some(l => l.date === completedAt)) {
          logs.push({ date: completedAt, progressPercent: 100, note: 'Дело завершено' });
        }
        return {
          ...t,
          actualResult,
          achievement,
          reflection,
          completedAt,
          status: 'completed',
          dailyLogs: logs,
          updatedAt: formatISODate(new Date()),
        };
      }
      return t;
    }));
  };

  const handleSaveDailyLog = (
    taskId: string,
    date: string,
    progressPercent: number,
    note?: string
  ) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const existingLogs = [...t.dailyLogs];
        const index = existingLogs.findIndex(l => l.date === date);
        if (index >= 0) {
          existingLogs[index] = { date, progressPercent, note };
        } else {
          existingLogs.push({ date, progressPercent, note });
        }
        existingLogs.sort((a, b) => a.date.localeCompare(b.date));

        const isFullyDone = progressPercent >= 100;
        return {
          ...t,
          dailyLogs: existingLogs,
          status: isFullyDone ? 'completed' : (t.status === 'completed' && progressPercent < 100 ? 'in_progress' : t.status),
          completedAt: isFullyDone ? date : t.completedAt,
          updatedAt: formatISODate(new Date()),
        };
      }
      return t;
    }));
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Очистить все данные?',
      message: 'Все дела, призы и отметки прогресса будут удалены. Начать с чистого листа?',
      confirmText: 'Очистить всё',
      cancelText: 'Отмена',
      isDestructive: true,
      onConfirm: () => {
        StorageService.clearAllTasks();
        RewardService.clearAll();
        setTasks([]);
        setRewards([]);
      },
    });
  };

  const handleLoadSamples = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Загрузить демо-примеры?',
      message: 'Будет загружен набор демонстрационных дел с личностными KPI и призами.',
      confirmText: 'Загрузить',
      cancelText: 'Отмена',
      isDestructive: false,
      onConfirm: () => {
        const samples = StorageService.loadSampleTasks();
        setTasks(samples);
        const sampleRewards: RewardItem[] = [
          {
            id: 'reward-sample-1',
            title: 'Поход в любимый ресторан',
            description: 'Награда за успешную сдачу экзамена на отлично',
            targetType: 'single_task',
            linkedTaskId: 'task-sample-1',
            status: 'unlocked',
            createdAt: formatISODate(new Date()),
          },
          {
            id: 'reward-sample-2',
            title: 'Выходной день без работы и гаджетов',
            description: 'Награда за закрытие 2 важных целей',
            targetType: 'tasks_count',
            requiredCount: 2,
            status: 'locked',
            createdAt: formatISODate(new Date()),
          },
        ];
        setRewards(sampleRewards);
      },
    });
  };

  const handleQuickExportPDF = async () => {
    setIsExportingPDF(true);
    // Switch to statistics tab to ensure report DOM is populated
    setCurrentTab('statistics');
    setTimeout(async () => {
      await exportReportToPDF('kpi-pdf-printable-report', `kpi-analysis-report.pdf`);
      setIsExportingPDF(false);
    }, 400);
  };

  return (
    <div className="min-h-[100dvh] bg-[#fffaf6] text-stone-900 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pb-12 flex flex-col">
      {/* Top Navigation Bar with iOS safe area top inset */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#ffb6b9] via-[#fae3d9] to-[#61c0bf] p-0.5 shadow-xs flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#2b7a78]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight leading-tight whitespace-nowrap">
                  Личный KPI
                </h1>
                <span className="hidden xl:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#bbded6]/40 text-[#246158] whitespace-nowrap">
                  План • Радость • Факт
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden xl:block whitespace-nowrap">
                Трекер осознанных достижений с личной планкой радости
              </p>
            </div>
          </div>

          {/* Center Tabs (Desktop) */}
          <nav className="hidden md:flex items-center bg-stone-100 p-1 rounded-2xl shrink-0">
            <button
              id="tab-btn-tasks"
              onClick={() => setCurrentTab('tasks')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                currentTab === 'tasks'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-[#61c0bf] shrink-0" />
              <span className="whitespace-nowrap">Дела и KPI</span>
              <span className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-bold shrink-0">
                {tasks.length}
              </span>
            </button>

            <button
              id="tab-btn-daily"
              onClick={() => setCurrentTab('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                currentTab === 'daily'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-[#2b7a78] shrink-0" />
              <span className="whitespace-nowrap">По дням</span>
            </button>

            <button
              id="tab-btn-statistics"
              onClick={() => setCurrentTab('statistics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                currentTab === 'statistics'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#d95c62] shrink-0" />
              <span className="whitespace-nowrap">Статистика</span>
            </button>

            <button
              id="tab-btn-rewards"
              onClick={() => setCurrentTab('rewards')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer relative ${
                currentTab === 'rewards'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Gift className="w-4 h-4 text-[#d95c62] shrink-0" />
              <span className="whitespace-nowrap">Призы</span>
              {rewards.filter(r => r.status === 'unlocked').length > 0 && (
                <span className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#61c0bf] text-white font-bold animate-pulse shrink-0">
                  {rewards.filter(r => r.status === 'unlocked').length}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Joy Index Badge */}
            <div 
              title="Индекс радости (% задач, достигших планки радости или выше)"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#fae3d9] text-[#7a483e] text-xs font-semibold border border-[#fae3d9] whitespace-nowrap shrink-0"
            >
              <Smile className="w-3.5 h-3.5 text-[#d95c62]" />
              <span>Радость: {overallStats.joyRate}%</span>
            </div>

            {/* Streak Badge */}
            {overallStats.currentStreak > 0 && (
              <div 
                title="Дней подряд с выполненными делами"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#ffb6b9]/25 text-[#c24b51] text-xs font-semibold border border-[#ffb6b9]/50 whitespace-nowrap shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-[#d95c62]" />
                <span>{overallStats.currentStreak} дн.</span>
              </div>
            )}

            {/* Mobile / iOS guide button */}
            <button
              id="open-rn-info-btn"
              onClick={() => setIsRNModalOpen(true)}
              title="Установка на iOS (iPhone) и мобильная архитектура"
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors border border-stone-200/80 cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              <Smartphone className="w-4 h-4 text-[#2b7a78]" />
              <span className="hidden sm:inline">iOS PWA</span>
            </button>

            {/* New Task Button */}
            <button
              id="header-create-task-btn"
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 min-h-[38px] px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Новое дело</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* TAB 1: Tasks & KPI Overview */}
        {currentTab === 'tasks' && (
          <div className="space-y-6">
            {/* KPI Principle Highlight Banner */}
            <div className="bg-gradient-to-r from-[#fae3d9]/60 via-white to-[#bbded6]/30 border border-[#fae3d9] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#61c0bf] text-white">
                    Формула KPI
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Дело ➔ План ➔ Планка радости ➔ Факт
                  </span>
                </div>
                <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                  Пример: <strong>Экзамен</strong> • План: <strong>сдать на 4</strong> • Буду рад: <strong>сдать на 3</strong> • Факт: <strong>получил 5</strong>. Этот подход снимает токсичный перфекционизм и дарит честную радость от прогресса.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {tasks.length > 0 ? (
                  <button
                    id="clear-all-btn"
                    onClick={handleClearAll}
                    title="Очистить все задачи"
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                    Очистить всё
                  </button>
                ) : (
                  <button
                    id="demo-samples-btn"
                    onClick={handleLoadSamples}
                    title="Загрузить примеры для ознакомления"
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#7a483e] bg-[#fae3d9] hover:bg-[#fae3d9]/80 border border-[#fae3d9] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#d95c62]" />
                    Загрузить примеры
                  </button>
                )}

                {tasks.length > 0 && (
                  <button
                    id="quick-pdf-btn"
                    onClick={handleQuickExportPDF}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#246158] bg-[#bbded6]/60 hover:bg-[#bbded6] transition-colors border border-[#bbded6] flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#2b7a78]" />
                    PDF Отчёт
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Bar (only if tasks exist) */}
            {tasks.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="tasks-search-input"
                    type="text"
                    placeholder="Поиск по названию, плану или результату..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#61c0bf] text-stone-800 placeholder:text-stone-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Очистить поиск"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status & Category Selectors */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <select
                    id="status-filter-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 sm:flex-initial px-3 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs font-medium border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#61c0bf]"
                  >
                    <option value="all">Все статусы ({tasks.length})</option>
                    <option value="in_progress">В процессе ({tasks.filter(t => t.status !== 'completed').length})</option>
                    <option value="completed">Завершены ({tasks.filter(t => t.status === 'completed').length})</option>
                    <option value="joy">Планка радости + ({overallStats.joyRate}%)</option>
                    <option value="exceeded">Превзойдено ({overallStats.exceededCount})</option>
                  </select>

                  {categories.length > 0 && (
                    <select
                      id="category-filter-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 sm:flex-initial px-3 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs font-medium border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#61c0bf]"
                    >
                      <option value="all">Все сферы</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Task Cards Grid or Empty State */}
            {tasks.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#fae3d9] to-[#bbded6]/50 flex items-center justify-center mx-auto mb-4 text-[#2b7a78]">
                  <Target className="w-8 h-8 text-[#2b7a78]" />
                </div>

                <h2 className="text-xl font-bold text-stone-900 mb-2">
                  Приложение готово к работе
                </h2>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed mb-8">
                  Здесь пока нет дел. Добавьте вашу первую цель с личностным KPI, чтобы отслеживать прогресс по дням и формировать объективную статистику.
                </p>

                {/* 4 Steps visual guide */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left mb-8">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                    <div className="text-[11px] font-extrabold text-[#2b7a78] uppercase mb-1">Шаг 1</div>
                    <div className="font-bold text-xs text-stone-900">Дело</div>
                    <div className="text-[11px] text-stone-500 mt-1">Что предстоит выполнить</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                    <div className="text-[11px] font-extrabold text-[#61c0bf] uppercase mb-1">Шаг 2</div>
                    <div className="font-bold text-xs text-stone-900">План</div>
                    <div className="text-[11px] text-stone-500 mt-1">Планируемый ориентир</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-[#fae3d9]">
                    <div className="text-[11px] font-extrabold text-[#d95c62] uppercase mb-1">Шаг 3</div>
                    <div className="font-bold text-xs text-stone-900">Буду рад</div>
                    <div className="text-[11px] text-stone-500 mt-1">Планка личной радости</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                    <div className="text-[11px] font-extrabold text-[#2b7a78] uppercase mb-1">Шаг 4</div>
                    <div className="font-bold text-xs text-stone-900">Факт</div>
                    <div className="text-[11px] text-stone-500 mt-1">Реальный полученный итог</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="empty-create-first-task-btn"
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Создать первое дело
                  </button>

                  <button
                    id="empty-load-samples-btn"
                    onClick={handleLoadSamples}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-semibold text-[#7a483e] bg-[#fae3d9] hover:bg-[#fae3d9]/80 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#d95c62]" />
                    Посмотреть примеры
                  </button>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-stone-200 p-12 text-center">
                <Target className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">
                  Дела не найдены
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Попробуйте изменить поисковый запрос или фильтр, либо создайте новое дело.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#246158] bg-[#bbded6]/50 hover:bg-[#bbded6] cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(t) => {
                      setTaskToEdit(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onRecordOutcome={(t) => {
                      setTaskForOutcome(t);
                      setIsOutcomeModalOpen(true);
                    }}
                    onAddDailyProgress={(t) => {
                      setTaskForDaily(t);
                      setIsDailyModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Daily Progress Tracker */}
        {currentTab === 'daily' && (
          <DailyTrackerView
            tasks={tasks}
            onOpenTaskModal={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onRecordOutcome={(t) => {
              setTaskForOutcome(t);
              setIsOutcomeModalOpen(true);
            }}
            onAddDailyProgress={(t) => {
              setTaskForDaily(t);
              setIsDailyModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: Statistics & Graphs & PDF Export */}
        {currentTab === 'statistics' && (
          <StatisticsView tasks={tasks} />
        )}

        {/* TAB 4: Rewards & Prizes System */}
        {currentTab === 'rewards' && (
          <RewardsView
            rewards={rewards}
            tasks={tasks}
            onOpenRewardModal={() => setIsRewardModalOpen(true)}
            onClaimReward={handleClaimReward}
            onDeleteReward={handleDeleteReward}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Tab Bar with safe-area-inset-bottom support */}
      <nav 
        aria-label="Мобильная навигация"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg"
      >
        <button
          id="mobile-tab-tasks"
          onClick={() => setCurrentTab('tasks')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'tasks' ? 'text-[#2b7a78] font-bold' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {tasks.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-stone-100 text-stone-700 font-bold border border-stone-200">
                {tasks.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Дела</span>
        </button>

        <button
          id="mobile-tab-daily"
          onClick={() => setCurrentTab('daily')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'daily' ? 'text-[#2b7a78] font-bold' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">По дням</span>
        </button>

        {/* Central mobile FAB button with elevated safe hit target */}
        <button
          id="mobile-fab-add-task"
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-[#61c0bf] text-white flex items-center justify-center -mt-6 shadow-md border-4 border-white cursor-pointer hover:bg-[#4db2b1] active:scale-90 transition-transform"
          aria-label="Добавить дело"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          id="mobile-tab-rewards"
          onClick={() => setCurrentTab('rewards')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            currentTab === 'rewards' ? 'text-[#d95c62] font-bold' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <Gift className="w-5 h-5" />
            {rewards.filter(r => r.status === 'unlocked').length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#fb7185] animate-ping" />
            )}
            {rewards.filter(r => r.status === 'unlocked').length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#fb7185]" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Призы</span>
        </button>

        <button
          id="mobile-tab-statistics"
          onClick={() => setCurrentTab('statistics')}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'statistics' ? 'text-[#2b7a78] font-bold' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Статы</span>
        </button>
      </nav>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
      />

      <RecordOutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        task={taskForOutcome}
        onSaveOutcome={handleSaveOutcome}
      />

      <DailyProgressModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        task={taskForDaily}
        onSaveDailyLog={handleSaveDailyLog}
      />

      <RewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        tasks={tasks}
        onSaveReward={handleCreateReward}
      />

      <RewardUnlockedCelebration
        reward={celebrationReward}
        onClose={() => setCelebrationReward(null)}
        onConfirmClaim={handleClaimReward}
      />

      <ReactNativeInfoModal
        isOpen={isRNModalOpen}
        onClose={() => setIsRNModalOpen(false)}
      />

      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
