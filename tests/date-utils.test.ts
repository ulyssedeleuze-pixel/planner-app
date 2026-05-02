import { describe, it, expect } from "vitest";
import {
  isSameDay,
  isToday,
  formatTime,
  formatShortDate,
  getCalendarGrid,
  getWeekStart,
  getWeekDays,
  getReminderLabel,
  groupEventsByDate,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "../lib/date-utils";

describe("isSameDay", () => {
  it("returns true for same day", () => {
    const a = new Date("2026-05-02T10:00:00");
    const b = new Date("2026-05-02T22:00:00");
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date("2026-05-02");
    const b = new Date("2026-05-03");
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("isToday", () => {
  it("returns true for today", () => {
    expect(isToday(new Date())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe("formatTime", () => {
  it("formats time correctly", () => {
    const d = new Date("2026-05-02T09:05:00");
    expect(formatTime(d)).toBe("09:05");
  });

  it("formats midnight correctly", () => {
    const d = new Date("2026-05-02T00:00:00");
    expect(formatTime(d)).toBe("00:00");
  });

  it("formats noon correctly", () => {
    const d = new Date("2026-05-02T12:30:00");
    expect(formatTime(d)).toBe("12:30");
  });
});

describe("getDaysInMonth", () => {
  it("returns 31 for January", () => {
    expect(getDaysInMonth(2026, 0)).toBe(31);
  });

  it("returns 28 for February 2026 (non-leap year)", () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);
  });

  it("returns 29 for February 2024 (leap year)", () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it("returns 30 for April", () => {
    expect(getDaysInMonth(2026, 3)).toBe(30);
  });
});

describe("getCalendarGrid", () => {
  it("returns 42 cells for any month", () => {
    expect(getCalendarGrid(2026, 4).length).toBe(42); // May 2026
    expect(getCalendarGrid(2026, 0).length).toBe(42); // Jan 2026
    expect(getCalendarGrid(2024, 1).length).toBe(42); // Feb 2024
  });

  it("first cell is a Monday", () => {
    const grid = getCalendarGrid(2026, 4); // May 2026
    // May 1, 2026 is a Friday (day 5), so grid starts on Mon April 27
    expect(grid[0].getDay()).toBe(1); // Monday
  });
});

describe("getWeekStart", () => {
  it("returns Monday for a Wednesday", () => {
    const wed = new Date("2026-05-06"); // Wednesday
    const monday = getWeekStart(wed);
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(4); // May 4
  });

  it("returns Monday for a Sunday", () => {
    const sun = new Date("2026-05-03"); // Sunday
    const monday = getWeekStart(sun);
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(27); // April 27
  });

  it("returns same Monday for a Monday", () => {
    const mon = new Date(2026, 4, 4); // May 4, 2026 (local time)
    const result = getWeekStart(mon);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(4);
  });
});

describe("getWeekDays", () => {
  it("returns 7 days starting from Monday", () => {
    const monday = new Date(2026, 4, 4); // May 4, 2026 (local time)
    const days = getWeekDays(monday);
    expect(days.length).toBe(7);
    expect(days[0].getDay()).toBe(1); // Monday
    expect(days[6].getDay()).toBe(0); // Sunday
  });
});

describe("getReminderLabel", () => {
  it("returns correct label for 5 minutes", () => {
    expect(getReminderLabel(5)).toBe("5 minutes avant");
  });

  it("returns correct label for 60 minutes", () => {
    expect(getReminderLabel(60)).toBe("1 heure avant");
  });

  it("returns correct label for 1440 minutes", () => {
    expect(getReminderLabel(1440)).toBe("1 jour avant");
  });

  it("returns correct label for 120 minutes", () => {
    expect(getReminderLabel(120)).toBe("2 heures avant");
  });
});

describe("groupEventsByDate", () => {
  it("groups events by date", () => {
    const events = [
      { id: "1", startDate: "2026-05-10T10:00:00", title: "Event 1" },
      { id: "2", startDate: "2026-05-10T14:00:00", title: "Event 2" },
      { id: "3", startDate: "2026-05-11T09:00:00", title: "Event 3" },
    ];
    const groups = groupEventsByDate(events);
    expect(groups.length).toBe(2);
    expect(groups[0].events.length).toBe(2);
    expect(groups[1].events.length).toBe(1);
  });

  it("sorts groups by date ascending", () => {
    const events = [
      { id: "1", startDate: "2026-05-15T10:00:00", title: "Later" },
      { id: "2", startDate: "2026-05-10T10:00:00", title: "Earlier" },
    ];
    const groups = groupEventsByDate(events);
    expect(groups[0].events[0].title).toBe("Earlier");
    expect(groups[1].events[0].title).toBe("Later");
  });
});
