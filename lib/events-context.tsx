import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventColor =
  | "#6366F1"
  | "#10B981"
  | "#F59E0B"
  | "#EF4444"
  | "#3B82F6"
  | "#EC4899";

export type ReminderOffset =
  | 5
  | 15
  | 30
  | 60
  | 1440; // minutes before event

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  color: EventColor;
  reminders: ReminderOffset[];
  notificationIds?: string[];
  allDay?: boolean;
}

export interface EventsState {
  events: CalendarEvent[];
  loaded: boolean;
}

type EventsAction =
  | { type: "LOAD"; payload: CalendarEvent[] }
  | { type: "ADD"; payload: CalendarEvent }
  | { type: "UPDATE"; payload: CalendarEvent }
  | { type: "DELETE"; payload: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case "LOAD":
      return { events: action.payload, loaded: true };
    case "ADD":
      return { ...state, events: [...state.events, action.payload] };
    case "UPDATE":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case "DELETE":
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface EventsContextValue {
  events: CalendarEvent[];
  loaded: boolean;
  addEvent: (event: Omit<CalendarEvent, "id" | "notificationIds">) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForWeek: (weekStart: Date) => CalendarEvent[];
  getUpcomingEvents: () => CalendarEvent[];
}

const EventsContext = createContext<EventsContextValue | null>(null);

const STORAGE_KEY = "@planmaster_events";

// ─── Notification helpers ─────────────────────────────────────────────────────

async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleEventNotifications(
  event: CalendarEvent
): Promise<string[]> {
  if (Platform.OS === "web") return [];
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];

  const ids: string[] = [];
  const startDate = new Date(event.startDate);

  for (const offset of event.reminders) {
    const triggerDate = new Date(startDate.getTime() - offset * 60 * 1000);
    if (triggerDate <= new Date()) continue;

    const label =
      offset === 1440
        ? "1 jour"
        : offset >= 60
        ? `${offset / 60}h`
        : `${offset} min`;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Rappel : ${event.title}`,
          body: `Dans ${label}`,
          data: { eventId: event.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      ids.push(id);
    } catch {
      // ignore scheduling errors
    }
  }
  return ids;
}

async function cancelEventNotifications(ids?: string[]): Promise<void> {
  if (!ids || Platform.OS === "web") return;
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, {
    events: [],
    loaded: false,
  });

  // Setup notification handler
  useEffect(() => {
    if (Platform.OS !== "web") {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("planmaster", {
          name: "PlanMaster Rappels",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    }
  }, []);

  // Load events from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: CalendarEvent[] = raw ? JSON.parse(raw) : [];
        dispatch({ type: "LOAD", payload: parsed });
      } catch {
        dispatch({ type: "LOAD", payload: [] });
      }
    })();
  }, []);

  const persist = useCallback(async (events: CalendarEvent[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, []);

  const addEvent = useCallback(
    async (eventData: Omit<CalendarEvent, "id" | "notificationIds">) => {
      const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const notificationIds = await scheduleEventNotifications({
        ...eventData,
        id,
        notificationIds: [],
      });
      const event: CalendarEvent = { ...eventData, id, notificationIds };
      dispatch({ type: "ADD", payload: event });
      await persist([...state.events, event]);
    },
    [state.events, persist]
  );

  const updateEvent = useCallback(
    async (event: CalendarEvent) => {
      const old = state.events.find((e) => e.id === event.id);
      await cancelEventNotifications(old?.notificationIds);
      const notificationIds = await scheduleEventNotifications(event);
      const updated = { ...event, notificationIds };
      dispatch({ type: "UPDATE", payload: updated });
      const newEvents = state.events.map((e) =>
        e.id === event.id ? updated : e
      );
      await persist(newEvents);
    },
    [state.events, persist]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const event = state.events.find((e) => e.id === id);
      await cancelEventNotifications(event?.notificationIds);
      dispatch({ type: "DELETE", payload: id });
      await persist(state.events.filter((e) => e.id !== id));
    },
    [state.events, persist]
  );

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      const d = date.toDateString();
      return state.events.filter((e) => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        // include events that span this date
        const startStr = start.toDateString();
        const endStr = end.toDateString();
        return startStr === d || endStr === d ||
          (start <= date && end >= date);
      }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    },
    [state.events]
  );

  const getEventsForWeek = useCallback(
    (weekStart: Date): CalendarEvent[] => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return state.events.filter((e) => {
        const start = new Date(e.startDate);
        return start >= weekStart && start < weekEnd;
      }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    },
    [state.events]
  );

  const getUpcomingEvents = useCallback((): CalendarEvent[] => {
    const now = new Date();
    return state.events
      .filter((e) => new Date(e.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [state.events]);

  return (
    <EventsContext.Provider
      value={{
        events: state.events,
        loaded: state.loaded,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsForDate,
        getEventsForWeek,
        getUpcomingEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used inside EventsProvider");
  return ctx;
}
