import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TaskKPI, KPIStats, TimePeriod } from '../types';
import { KPI_ACHIEVEMENT_CONFIG } from './kpiCalculator';

export async function exportReportToPDF(
  elementId: string,
  fileName: string = 'personal-kpi-report.pdf'
): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    // Capture the report container with html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    // Fallback: native print dialog
    window.print();
    return false;
  }
}

export function generateReportSummaryText(tasks: TaskKPI[], stats: KPIStats, period: TimePeriod): string {
  const periodMap: Record<TimePeriod, string> = {
    week: 'за последнюю неделю',
    month: 'за последний месяц',
    quarter: 'за последний квартал',
    year: 'за последний год',
    all: 'за всё время',
  };

  return `Отчёт по личному KPI (${periodMap[period]}): закрыто ${stats.completedTasks} из ${stats.totalTasks} задач (${stats.completionRate}%). Индекс радости: ${stats.joyRate}%. Превзойдено ожиданий: ${stats.exceededCount}.`;
}
