import React, { useState } from 'react';
import { TaskKPI, TimePeriod, KPIStats } from '../types';
import { calculateKPIStats, KPI_ACHIEVEMENT_CONFIG, PALETTE } from '../services/kpiCalculator';
import { exportReportToPDF } from '../services/pdfExport';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Award, 
  Smile, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  FileDown, 
  Calendar, 
  Filter, 
  Sparkles,
  Loader2
} from 'lucide-react';

interface StatisticsViewProps {
  tasks: TaskKPI[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ tasks }) => {
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [isExporting, setIsExporting] = useState(false);

  const stats: KPIStats = calculateKPIStats(tasks, period);

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#fae3d9] flex items-center justify-center mx-auto mb-4 text-[#9c594b]">
          <TrendingUp className="w-7 h-7 text-[#d95c62]" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 mb-2">
          Нет данных для аналитики
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Создайте ваши первые дела с личностным KPI (Дело ➔ Планируемый результат ➔ Планка радости ➔ Факт). Как только вы начнёте отмечать дневной прогресс и фиксировать результаты, здесь появятся графики распределения, динамика по дням и возможность выгрузки PDF-отчёта.
        </p>
      </div>
    );
  }

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportReportToPDF('kpi-pdf-printable-report', `kpi-report-${period}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare data for KPI achievement distribution bar chart
  const achievementChartData = [
    {
      name: 'Превзошёл',
      count: stats.exceededCount,
      fill: PALETTE.teal,
    },
    {
      name: 'По плану',
      count: stats.plannedCount,
      fill: PALETTE.mint,
    },
    {
      name: 'Рад итогу',
      count: stats.satisfiedCount,
      fill: '#f3c7b7',
    },
    {
      name: 'Ниже планки',
      count: stats.belowCount,
      fill: PALETTE.coral,
    },
  ];

  // Donut chart data
  const donutData = [
    { name: 'Превзошёл', value: stats.exceededCount, color: PALETTE.teal },
    { name: 'По плану', value: stats.plannedCount, color: PALETTE.mint },
    { name: 'Рад итогу', value: stats.satisfiedCount, color: '#f3c7b7' },
    { name: 'Ниже планки', value: stats.belowCount, color: PALETTE.coral },
    { name: 'В процессе', value: stats.pendingCount, color: '#e2e8f0' },
  ].filter(d => d.value > 0);

  const periodButtons: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'quarter', label: 'Квартал' },
    { key: 'year', label: 'Год' },
    { key: 'all', label: 'Всё время' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Period Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#61c0bf]/15 text-[#2b7a78]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Статистика личного KPI
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Анализ эффективности, соблюдения планки радости и динамики дел
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Period Toggle with smooth horizontal scroll for small screens */}
          <div className="flex bg-stone-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {periodButtons.map((btn) => (
              <button
                key={btn.key}
                id={`period-btn-${btn.key}`}
                onClick={() => setPeriod(btn.key)}
                className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  period === btn.key
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Export PDF Button */}
          <button
            id="export-pdf-action-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#246158] bg-[#bbded6]/60 hover:bg-[#bbded6] active:bg-[#a6d1c8] transition-all cursor-pointer border border-[#bbded6] disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Создание PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-[#2b7a78]" />
                <span>Экспорт в PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* 1. Joy Index */}
        <div className="bg-gradient-to-br from-[#fff0f3] via-[#fff7f9] to-white p-4 rounded-2xl border border-[#ffd4dc] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#9f1239]">Индекс радости</span>
            <div className="w-7 h-7 rounded-xl bg-[#ffe4e8] border border-[#ffd4dc] flex items-center justify-center text-[#be185d]">
              <Smile className="w-4 h-4 text-[#fb7185]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#881337]">
              {stats.joyRate}%
            </div>
            <span className="text-[11px] text-[#9f1239]/80 font-medium">
              дел завершено на уровне радости или выше
            </span>
          </div>
        </div>

        {/* 2. Hit Plan */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-600">План выполнен</span>
            <div className="w-7 h-7 rounded-xl bg-[#bbded6]/50 flex items-center justify-center text-[#246158]">
              <CheckCircle2 className="w-4 h-4 text-[#2b7a78]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              {stats.plannedRate}%
            </div>
            <span className="text-[11px] text-stone-500">
              достигли намеченного плана ({stats.plannedCount + stats.exceededCount} шт.)
            </span>
          </div>
        </div>

        {/* 3. Exceeded */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-600">Превзойдено</span>
            <div className="w-7 h-7 rounded-xl bg-[#61c0bf]/20 flex items-center justify-center text-[#2b7a78]">
              <Sparkles className="w-4 h-4 text-[#2b7a78]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              {stats.exceededCount}
            </div>
            <span className="text-[11px] text-stone-500">
              сверх-результатов ({stats.superRate}%)
            </span>
          </div>
        </div>

        {/* 4. Active Streak */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-600">Дневная серия</span>
            <div className="w-7 h-7 rounded-xl bg-[#ffb6b9]/30 flex items-center justify-center text-[#c24b51]">
              <Flame className="w-4 h-4 text-[#d95c62]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              {stats.currentStreak} <span className="text-xs font-normal text-stone-500">дней</span>
            </div>
            <span className="text-[11px] text-stone-500">
              Рекорд серии: {stats.bestStreak} дн.
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart: KPI Level Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Распределение результатов по шкале KPI
              </h3>
              <p className="text-xs text-stone-500">
                Соотношение выполненных дел по уровню удовлетворённости
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={achievementChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-2 rounded-xl text-xs shadow-lg">
                          <div className="font-bold">{data.name}</div>
                          <div>Количество: {data.count} дел</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#61c0bf]" />
              <span className="text-stone-600">Превзошёл ({stats.exceededCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#bbded6]" />
              <span className="text-stone-600">По плану ({stats.plannedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#f3c7b7]" />
              <span className="text-stone-600">Рад итогу ({stats.satisfiedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ffb6b9]" />
              <span className="text-stone-600">Ниже планки ({stats.belowCount})</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: Overall Ratio */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">
              Баланс продуктивности
            </h3>
            <p className="text-xs text-stone-500">
              Общая структура задач за выбранный период
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white px-2.5 py-1.5 rounded-xl text-xs shadow-lg">
                          <span className="font-semibold">{data.name}:</span> {data.value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-stone-900">{stats.completedTasks} / {stats.totalTasks}</span>
              <span className="text-[10px] text-stone-500">завершено</span>
            </div>
          </div>

          <div className="text-xs text-center text-stone-500 pt-2 border-t border-stone-100">
            {stats.completionRate}% всех намеченных дел закрыто
          </div>
        </div>
      </div>

      {/* Daily Progress Timeline Chart */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Динамика выполнения и активности по дням
            </h3>
            <p className="text-xs text-stone-500">
              Количество завершённых дел и средний дневной прогресс
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#61c0bf" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#61c0bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                        <div className="font-bold text-[#bbded6]">{data.dayLabel} ({data.date})</div>
                        <div>Завершено дел: {data.completed}</div>
                        <div>Средний прогресс: {data.avgProgress}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#2b7a78" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      {stats.categoryStats.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-3">
            Эффективность по сферам жизни
          </h3>
          <div className="space-y-3">
            {stats.categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">{cat.category}</span>
                  <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                    <span>{cat.completed} из {cat.total} дел</span>
                    <span className="font-bold text-[#2b7a78]">{cat.successRate}% успеха</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${cat.total > 0 ? (cat.completed / cat.total) * 100 : 0}%`,
                      backgroundColor: '#61c0bf'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable / Exportable PDF DOM Template (rendered for html2canvas) */}
      <div className="overflow-hidden h-0 w-0 opacity-0 pointer-events-none">
        <div 
          id="kpi-pdf-printable-report"
          className="p-8 bg-white text-stone-900 w-[800px] font-sans"
        >
          {/* Header */}
          <div className="border-b-2 border-[#61c0bf] pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-[#2b7a78] tracking-tight">
                Личный KPI: Аналитический отчёт
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Глубокий анализ достижений, планки радости и фактических результатов
              </p>
            </div>
            <div className="text-right text-xs text-stone-500">
              <div>Период: <span className="font-bold text-stone-800">{periodButtons.find(p => p.key === period)?.label}</span></div>
              <div>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-[#fae3d9]/40 border border-[#fae3d9] rounded-xl text-center">
              <div className="text-[10px] uppercase text-stone-600 font-bold">Всего задач</div>
              <div className="text-xl font-bold text-stone-900">{stats.totalTasks}</div>
              <div className="text-[10px] text-stone-500">Закрыто: {stats.completedTasks}</div>
            </div>
            <div className="p-3 bg-[#bbded6]/40 border border-[#bbded6] rounded-xl text-center">
              <div className="text-[10px] uppercase text-stone-600 font-bold">Индекс радости</div>
              <div className="text-xl font-bold text-[#2b7a78]">{stats.joyRate}%</div>
              <div className="text-[10px] text-stone-500">Удовлетворили планку</div>
            </div>
            <div className="p-3 bg-[#61c0bf]/20 border border-[#61c0bf] rounded-xl text-center">
              <div className="text-[10px] uppercase text-stone-600 font-bold">План выполнен</div>
              <div className="text-xl font-bold text-[#246158]">{stats.plannedRate}%</div>
              <div className="text-[10px] text-stone-500">{stats.plannedCount + stats.exceededCount} задач</div>
            </div>
            <div className="p-3 bg-[#ffb6b9]/30 border border-[#ffb6b9] rounded-xl text-center">
              <div className="text-[10px] uppercase text-stone-600 font-bold">Сверх плана</div>
              <div className="text-xl font-bold text-[#c24b51]">{stats.exceededCount}</div>
              <div className="text-[10px] text-stone-500">{stats.superRate}% от закрытых</div>
            </div>
          </div>

          {/* Table of Tasks & KPIs */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wide mb-2">
              Детализация дел и результатов
            </h2>
            <table className="w-full text-left text-xs border-collapse border border-stone-200">
              <thead>
                <tr className="bg-stone-100 text-stone-700">
                  <th className="p-2 border border-stone-200">Дело</th>
                  <th className="p-2 border border-stone-200">Сфера</th>
                  <th className="p-2 border border-stone-200">План</th>
                  <th className="p-2 border border-stone-200">Буду рад</th>
                  <th className="p-2 border border-stone-200">Факт</th>
                  <th className="p-2 border border-stone-200">Итог KPI</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-stone-200">
                    <td className="p-2 border border-stone-200 font-semibold">{task.title}</td>
                    <td className="p-2 border border-stone-200 text-stone-600">{task.category}</td>
                    <td className="p-2 border border-stone-200 text-stone-700">{task.plannedTarget}</td>
                    <td className="p-2 border border-stone-200 text-[#9c594b]">{task.joyThreshold}</td>
                    <td className="p-2 border border-stone-200 font-semibold">{task.actualResult || '—'}</td>
                    <td className="p-2 border border-stone-200">
                      {task.achievement ? (
                        <span className="font-bold text-stone-800">
                          {KPI_ACHIEVEMENT_CONFIG[task.achievement].shortLabel}
                        </span>
                      ) : (
                        <span className="text-stone-400">В процессе</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Reflections & Insights */}
          <div>
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wide mb-2">
              Заметки и выводы рефлексии
            </h2>
            <div className="space-y-1.5">
              {tasks.filter(t => t.reflection).map(t => (
                <div key={t.id} className="text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg">
                  <span className="font-semibold text-stone-900">{t.title}: </span>
                  <span className="italic text-stone-700">«{t.reflection}»</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
