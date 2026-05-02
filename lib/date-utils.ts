/**
 * Utilitaires de date pour PlanMaster
 */

export const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
export const DAYS_FULL_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
export const MONTHS_SHORT_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

/** Retourne le premier jour du mois */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/** Retourne le nombre de jours dans un mois */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Retourne le lundi de la semaine contenant la date */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Vérifie si deux dates sont le même jour */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Vérifie si une date est aujourd'hui */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** Formate une heure en HH:MM */
export function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Formate une date en "Lun 2 Jan" */
export function formatShortDate(date: Date): string {
  return `${DAYS_FR[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT_FR[date.getMonth()]}`;
}

/** Formate une date en "Lundi 2 Janvier 2026" */
export function formatFullDate(date: Date): string {
  return `${DAYS_FULL_FR[date.getDay()]} ${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

/** Formate une plage de dates pour l'affichage */
export function formatDateRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return `${formatShortDate(start)}, ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${formatShortDate(start)} ${formatTime(start)} – ${formatShortDate(end)} ${formatTime(end)}`;
}

/** Retourne "Aujourd'hui", "Demain" ou la date formatée */
export function getRelativeLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) return "Aujourd'hui";
  if (isSameDay(date, tomorrow)) return "Demain";
  return formatFullDate(date);
}

/** Retourne le libellé d'un rappel en minutes */
export function getReminderLabel(minutes: number): string {
  if (minutes === 1440) return "1 jour avant";
  if (minutes === 60) return "1 heure avant";
  if (minutes >= 60) return `${minutes / 60} heures avant`;
  return `${minutes} minutes avant`;
}

/** Génère un tableau de dates pour la grille mensuelle (6 semaines) */
export function getCalendarGrid(year: number, month: number): Date[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  // Adjust: week starts on Monday (0=Mon, 6=Sun)
  let startDow = firstDay.getDay(); // 0=Sun
  if (startDow === 0) startDow = 7;
  const offset = startDow - 1; // days before first of month

  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - offset + i);
    grid.push(d);
  }
  return grid;
}

/** Retourne les 7 jours de la semaine à partir du lundi */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Groupe les événements par date relative */
export function groupEventsByDate<T extends { startDate: string }>(
  events: T[]
): { label: string; date: Date; events: T[] }[] {
  const map = new Map<string, { label: string; date: Date; events: T[] }>();

  for (const event of events) {
    const date = new Date(event.startDate);
    const key = date.toDateString();
    if (!map.has(key)) {
      map.set(key, { label: getRelativeLabel(date), date, events: [] });
    }
    map.get(key)!.events.push(event);
  }

  return Array.from(map.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}
