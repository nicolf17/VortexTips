// Dynamic Date Utilities strictly anchored to Colombia Time (America/Bogota, COT, UTC-5)

export interface DayTabInfo {
  label: string; // e.g. "27 Oct"
  dateKey: string; // e.g. "20261027"
  dayName: string; // e.g. "Hoy", "Mañana", "Ayer", "Mié", "Jue"
  fullDate: string; // e.g. "Martes, 27 de Octubre"
  weekdayShort: string; // e.g. "Mar"
  dayNumber: number; // e.g. 27
  monthShort: string; // e.g. "Oct"
  isToday: boolean;
}

/**
 * Returns the current date in Colombia timezone (America/Bogota)
 */
export function getColombiaCurrentDate(): Date {
  const now = new Date();
  const cotString = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // "YYYY-MM-DD"
  const [y, m, d] = cotString.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Returns formatted Colombia time string e.g. "2:30 PM COT" (12-hour format)
 */
export function getColombiaCurrentTimeStr(): string {
  return (
    new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/Bogota',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' COT'
  );
}

/**
 * Formats any kickoff time or time string to 12-hour Colombia format (e.g. "2:00 PM", "7:30 PM")
 */
export function formatColombia12h(timeStr?: string): string {
  if (!timeStr) return '';
  const cleaned = timeStr.replace(/COT/i, '').replace(/UTC-5/i, '').trim();
  if (/(am|pm|a\. m\.|p\. m\.)/i.test(cleaned)) {
    return cleaned.replace(/\s+/g, ' ').toUpperCase();
  }
  const match = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

const MONTH_NAMES_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const WEEKDAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const WEEKDAY_FULL_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

const MONTH_FULL_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Generates dynamic 7-day carousel anchored to today in Colombia Time.
 * If opened today (Oct 27), starts from yesterday (26 Oct), today (27 Oct - marked Hoy),
 * and continues to 28 Oct (Mañana), 29 Oct, 30 Oct, etc.
 * Automatically increments every day dynamically.
 */
export function getDynamicDaysCarousel(): DayTabInfo[] {
  const today = getColombiaCurrentDate();
  const days: DayTabInfo[] = [];

  // 1 day before, today, and 5 upcoming days
  for (let offset = -1; offset <= 5; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);

    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const dayNum = d.getDate();
    const weekdayIdx = d.getDay();

    const monthStr = String(monthIdx + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    const monthShort = MONTH_NAMES_ES[monthIdx];
    const label = `${dayNum} ${monthShort}`;

    let dayName = WEEKDAY_NAMES_ES[weekdayIdx];
    if (offset === 0) dayName = 'Hoy';
    else if (offset === 1) dayName = 'Mañana';
    else if (offset === -1) dayName = 'Ayer';

    const fullDate = `${WEEKDAY_FULL_ES[weekdayIdx]}, ${dayNum} de ${MONTH_FULL_ES[monthIdx]}`;

    days.push({
      label,
      dateKey,
      dayName,
      fullDate,
      weekdayShort: WEEKDAY_NAMES_ES[weekdayIdx],
      dayNumber: dayNum,
      monthShort,
      isToday: offset === 0,
    });
  }

  return days;
}

/**
 * Gets today's default tab info
 */
export function getTodayTabInfo(): DayTabInfo {
  const list = getDynamicDaysCarousel();
  return list.find((d) => d.isToday) || list[1] || list[0];
}
