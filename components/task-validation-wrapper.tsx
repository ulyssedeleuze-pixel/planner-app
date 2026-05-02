import React from "react";
import { useTaskValidation } from "@/hooks/use-task-validation";
import { TaskValidationModal } from "./task-validation-modal";

/**
 * Wrapper qui affiche automatiquement la modale de validation
 * quand une tâche est terminée
 */
export function TaskValidationWrapper() {
  const { pendingValidation, dismissValidation } = useTaskValidation();

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
