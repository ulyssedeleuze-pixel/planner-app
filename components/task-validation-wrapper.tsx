import React, { useEffect } from "react";
import { useTaskValidation } from "@/hooks/use-task-validation";
import { TaskValidationModal } from "./task-validation-modal";
import { TaskCompletionService } from "@/lib/task-completion-service";

/**
 * Wrapper qui affiche automatiquement la modale de validation
 * quand une tâche est terminée
 */
export function TaskValidationWrapper() {
  // DESACTIF: Le wrapper causait une boucle infinie
  // Les notifications sont maintenant gérées via l'onglet Validation
  return null;
}
