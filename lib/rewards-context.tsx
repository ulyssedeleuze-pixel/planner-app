import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompletedTask {
  id: string;
  eventId: string;
  eventTitle: string;
  estimatedDurationMinutes: number;
  actualDurationMinutes: number;
  completedAt: string; // ISO string
  validated: boolean;
  creditsAwarded: number;
  validatedAt?: string;
}

export interface WeeklyBonus {
  weekStart: string; // ISO string (Monday)
  weekEnd: string;   // ISO string (Sunday)
  allTasksCompleted: boolean;
  bonusCredits: number;
  claimedAt?: string;
}

export interface RewardsState {
  completedTasks: CompletedTask[];
  weeklyBonuses: WeeklyBonus[];
  totalCreditsEarned: number;
  pendingValidation: CompletedTask[];
  loaded: boolean;
}

type RewardsAction =
  | { type: "LOAD"; payload: RewardsState }
  | { type: "ADD_COMPLETED_TASK"; payload: CompletedTask }
  | { type: "VALIDATE_TASK"; payload: { taskId: string; creditsAwarded: number } }
  | { type: "REJECT_TASK"; payload: string }
  | { type: "ADD_WEEKLY_BONUS"; payload: WeeklyBonus }
  | { type: "CLAIM_WEEKLY_BONUS"; payload: string };

// ─── Constants ────────────────────────────────────────────────────────────────

export const CREDITS_PER_HOUR = 100; // 1 heure = 100 crédits
export const WEEKLY_COMPLETION_BONUS = 500; // Bonus pour avoir complété toute une semaine
export const VALIDATION_TIMEOUT_HOURS = 24; // Délai pour valider une tâche

// ─── Reducer ──────────────────────────────────────────────────────────────────

function rewardsReducer(state: RewardsState, action: RewardsAction): RewardsState {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "ADD_COMPLETED_TASK": {
      const newTask = action.payload;
      return {
        ...state,
        completedTasks: [...state.completedTasks, newTask],
        pendingValidation: [...state.pendingValidation, newTask],
      };
    }

    case "VALIDATE_TASK": {
      const { taskId, creditsAwarded } = action.payload;
      const validatedTask = state.pendingValidation.find((t) => t.id === taskId);
      if (!validatedTask) return state;

      const updatedTask: CompletedTask = {
        ...validatedTask,
        validated: true,
        creditsAwarded,
        validatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        completedTasks: state.completedTasks.map((t) =>
          t.id === taskId ? updatedTask : t
        ),
        pendingValidation: state.pendingValidation.filter((t) => t.id !== taskId),
        totalCreditsEarned: state.totalCreditsEarned + creditsAwarded,
      };
    }

    case "REJECT_TASK": {
      const taskId = action.payload;
      return {
        ...state,
        completedTasks: state.completedTasks.filter((t) => t.id !== taskId),
        pendingValidation: state.pendingValidation.filter((t) => t.id !== taskId),
      };
    }

    case "ADD_WEEKLY_BONUS": {
      return {
        ...state,
        weeklyBonuses: [...state.weeklyBonuses, action.payload],
      };
    }

    case "CLAIM_WEEKLY_BONUS": {
      const bonusId = action.payload;
      const bonus = state.weeklyBonuses.find((b) => b.weekStart === bonusId);
      if (!bonus) return state;

      return {
        ...state,
        weeklyBonuses: state.weeklyBonuses.map((b) =>
          b.weekStart === bonusId ? { ...b, claimedAt: new Date().toISOString() } : b
        ),
        totalCreditsEarned: state.totalCreditsEarned + bonus.bonusCredits,
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface RewardsContextValue {
  state: RewardsState;
  addCompletedTask: (task: Omit<CompletedTask, "id">) => void;
  validateTask: (taskId: string, actualDurationMinutes: number) => void;
  rejectTask: (taskId: string) => void;
  addWeeklyBonus: (weekStart: string) => void;
  claimWeeklyBonus: (weekStart: string) => void;
  getPendingValidationCount: () => number;
  getCreditsForDuration: (minutes: number) => number;
  getWeeklyStats: (weekStart: string) => {
    completedCount: number;
    totalTasks: number;
    isComplete: boolean;
  };
}

const RewardsContext = createContext<RewardsContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const INITIAL_STATE: RewardsState = {
  completedTasks: [],
  weeklyBonuses: [],
  totalCreditsEarned: 0,
  pendingValidation: [],
  loaded: false,
};

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rewardsReducer, INITIAL_STATE);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem("rewards_state");
        if (saved) {
          dispatch({ type: "LOAD", payload: JSON.parse(saved) });
        } else {
          // Mark as loaded even if no saved state
          dispatch({
            type: "LOAD",
            payload: { ...INITIAL_STATE, loaded: true },
          });
        }
      } catch (error) {
        console.error("Failed to load rewards state:", error);
        dispatch({
          type: "LOAD",
          payload: { ...INITIAL_STATE, loaded: true },
        });
      }
    };
    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem("rewards_state", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save rewards state:", error);
      }
    };
    if (state.loaded) {
      saveState();
    }
  }, [state]);

  const addCompletedTask = useCallback(
    (task: Omit<CompletedTask, "id">) => {
      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch({
        type: "ADD_COMPLETED_TASK",
        payload: { ...task, id },
      });
    },
    []
  );

  const validateTask = useCallback((taskId: string, actualDurationMinutes: number) => {
    // Calculer les crédits basés sur la durée réelle
    const creditsAwarded = Math.round((actualDurationMinutes / 60) * CREDITS_PER_HOUR);
    dispatch({
      type: "VALIDATE_TASK",
      payload: { taskId, creditsAwarded },
    });
  }, []);

  const rejectTask = useCallback((taskId: string) => {
    dispatch({ type: "REJECT_TASK", payload: taskId });
  }, []);

  const addWeeklyBonus = useCallback((weekStart: string) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const bonus: WeeklyBonus = {
      weekStart,
      weekEnd: weekEnd.toISOString(),
      allTasksCompleted: true,
      bonusCredits: WEEKLY_COMPLETION_BONUS,
    };
    dispatch({ type: "ADD_WEEKLY_BONUS", payload: bonus });
  }, []);

  const claimWeeklyBonus = useCallback((weekStart: string) => {
    dispatch({ type: "CLAIM_WEEKLY_BONUS", payload: weekStart });
  }, []);

  const getPendingValidationCount = useCallback(() => {
    return state.pendingValidation.length;
  }, [state.pendingValidation]);

  const getCreditsForDuration = useCallback((minutes: number) => {
    return Math.round((minutes / 60) * CREDITS_PER_HOUR);
  }, []);

  const getWeeklyStats = useCallback(
    (weekStart: string) => {
      // Logique pour calculer les stats d'une semaine
      // À implémenter selon vos besoins
      return {
        completedCount: 0,
        totalTasks: 0,
        isComplete: false,
      };
    },
    []
  );

  return (
    <RewardsContext.Provider
      value={{
        state,
        addCompletedTask,
        validateTask,
        rejectTask,
        addWeeklyBonus,
        claimWeeklyBonus,
        getPendingValidationCount,
        getCreditsForDuration,
        getWeeklyStats,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error("useRewards must be used within RewardsProvider");
  }
  return context;
}
