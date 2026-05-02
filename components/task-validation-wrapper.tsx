import React, { useEffect } from "react";
import { useTaskValidation } from "@/hooks/use-task-validation";
import { TaskValidationModal } from "./task-validation-modal";
import { TaskCompletionService } from "@/lib/task-completion-service";

/**
 * Wrapper qui affiche automatiquement la modale de validation
 * quand une tâche est terminée
 */
export function TaskValidationWrapper() {
  const { pendingValidation, dismissValidation } = useTaskValidation();

  // Marquer comme affichee des qu'elle est visible
  useEffect(() => {
    if (pendingValidation) {
      TaskCompletionService.markAsShown(pendingValidation.eventId);
    }
  }, [pendingValidation?.eventId]);

  if (!pendingValidation) {
    return null;
  }

  return (
    <TaskValidationModal
      visible={true}
      eventId={pendingValidation.eventId}
      eventTitle={pendingValidation.eventTitle}
      endTime={pendingValidation.endTime}
      estimatedDurationMinutes={pendingValidation.estimatedDurationMinutes}
      onClose={dismissValidation}
    />
  );
}
