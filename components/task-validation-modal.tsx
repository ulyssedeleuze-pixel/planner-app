import React, { useCallback } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";
import { useRewards } from "@/lib/rewards-context";
import { useAdventure } from "@/lib/adventure-context";
import { TaskCompletionService } from "@/lib/task-completion-service";

export interface TaskValidationModalProps {
  visible: boolean;
  eventId: string;
  eventTitle: string;
  endTime: string;
  estimatedDurationMinutes?: number;
  onClose: () => void;
}

export function TaskValidationModal({
  visible,
  eventId,
  eventTitle,
  endTime,
  estimatedDurationMinutes = 60,
  onClose,
}: TaskValidationModalProps) {
  const colors = useColors();
  const { addCompletedTask, getCreditsForDuration } = useRewards();
  const { addCoins } = useAdventure();

  const creditsPreview = getCreditsForDuration(estimatedDurationMinutes);

  const handleValidate = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Ajouter la tâche complétée
    addCompletedTask({
      eventId,
      eventTitle,
      estimatedDurationMinutes,
      actualDurationMinutes: estimatedDurationMinutes,
      completedAt: new Date().toISOString(),
      validated: false,
      creditsAwarded: 0,
    });

    // Ajouter les crédits immédiatement
    addCoins(creditsPreview);

    // Marquer la notification comme rejetée
    await TaskCompletionService.dismissNotification(eventId);

    Alert.alert(
      "Succès !",
      `+${creditsPreview} crédits gagnés pour "${eventTitle}" !`
    );

    onClose();
  }, [eventId, eventTitle, estimatedDurationMinutes, creditsPreview, addCompletedTask, addCoins, onClose]);

  const handleReject = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Marquer la notification comme rejetée
    await TaskCompletionService.dismissNotification(eventId);

    onClose();
  }, [eventId, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 32,
    },
    icon: {
      fontSize: 48,
      textAlign: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 20,
    },
    taskCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 8,
    },
    taskDetails: {
      fontSize: 13,
      color: colors.muted,
      marginBottom: 4,
    },
    creditsPreview: {
      backgroundColor: colors.primary + "10",
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
      alignItems: "center",
    },
    creditsText: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 4,
    },
    creditsAmount: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.primary,
    },
    actionRow: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    validateBtn: {
      backgroundColor: colors.success + "20",
    },
    rejectBtn: {
      backgroundColor: colors.error + "20",
    },
    validateBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.success,
    },
    rejectBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.error,
    },
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Tâche Terminée</Text>
          <Text style={styles.subtitle}>
            Avez-vous réussi à compléter cette tâche ?
          </Text>

          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{eventTitle}</Text>
            <Text style={styles.taskDetails}>
              Fin prévue : {formatTime(endTime)}
            </Text>
            <Text style={styles.taskDetails}>
              Durée estimée : {estimatedDurationMinutes} min
            </Text>
          </View>

          <View style={styles.creditsPreview}>
            <Text style={styles.creditsText}>Crédits à gagner</Text>
            <Text style={styles.creditsAmount}>+{creditsPreview}</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.validateBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleValidate}
            >
              <Text style={styles.validateBtnText}>✓ Oui, j'ai complété</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.rejectBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleReject}
            >
              <Text style={styles.rejectBtnText}>✕ Non, pas fini</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
