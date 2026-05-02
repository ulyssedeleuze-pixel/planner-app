import { useEffect, useState, useCallback } from "react";
import { TaskCompletionService, TaskCompletionNotification } from "@/lib/task-completion-service";

export interface TaskValidation {
  eventId: string;
  eventTitle: string;
  endTime: string;
  estimatedDurationMinutes: number;
}

export function useTaskValidation() {
  const [pendingValidation, setPendingValidation] = useState<TaskCompletionNotification | null>(
    null
  );

  const checkPendingValidations = useCallback(async () => {
    const pending = await TaskCompletionService.getPendingNotifications();
    if (pending.length > 0) {
      setPendingValidation(pending[0]);
    } else {
      setPendingValidation(null);
    }
  }, []);

  useEffect(() => {
    // Vérifier immédiatement
    checkPendingValidations();

    // S'abonner aux changements
    const unsubscribe = TaskCompletionService.subscribe(() => {
      checkPendingValidations();
    });

    return () => unsubscribe();
  }, [checkPendingValidations]);

  const dismissValidation = useCallback(async () => {
    if (pendingValidation) {
      await TaskCompletionService.dismissNotification(pendingValidation.eventId);
      setPendingValidation(null);
    }
  }, [pendingValidation]);

  return {
    pendingValidation,
    dismissValidation,
    checkPendingValidations,
  };
}
