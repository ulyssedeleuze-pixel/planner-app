import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRewards, CREDITS_PER_HOUR } from "@/lib/rewards-context";
import { useAdventure } from "@/lib/adventure-context";

export default function ValidationScreen() {
  const colors = useColors();
  const { state: rewardsState, validateTask, rejectTask, getCreditsForDuration } =
    useRewards();
  const { addCoins } = useAdventure();

  const pendingTasks = useMemo(() => {
    return rewardsState.pendingValidation.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [rewardsState.pendingValidation]);

  const handleValidate = useCallback(
    (taskId: string, actualDurationMinutes: number) => {
      const credits = getCreditsForDuration(actualDurationMinutes);

      Alert.alert(
        "Valider la tâche",
        `Vous allez recevoir ${credits} crédits pour cette tâche.\n\nContinuer ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Valider",
            style: "default",
            onPress: () => {
              validateTask(taskId, actualDurationMinutes);
              addCoins(credits);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Succès", `+${credits} crédits gagnés !`);
            },
          },
        ]
      );
    },
    [validateTask, addCoins, getCreditsForDuration]
  );

  const handleReject = useCallback(
    (taskId: string, taskTitle: string) => {
      Alert.alert(
        "Rejeter la tâche",
        `Êtes-vous sûr de rejeter "${taskTitle}" ?\n\nAucun crédit ne sera accordé.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Rejeter",
            style: "destructive",
            onPress: () => {
              rejectTask(taskId);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            },
          },
        ]
      );
    },
    [rejectTask]
  );

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 4,
    },
    badge: {
      backgroundColor: colors.error + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginTop: 8,
      alignSelf: "flex-start",
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.error,
    },
    taskCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      flex: 1,
    },
    timeText: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
    creditsPreview: {
      backgroundColor: colors.primary + "10",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginTop: 8,
      alignSelf: "flex-start",
    },
    creditsText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    actionBtn: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    validateBtn: {
      backgroundColor: colors.success + "20",
    },
    rejectBtn: {
      backgroundColor: colors.error + "20",
    },
    validateBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.success,
    },
    rejectBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.error,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.muted,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 8,
      textAlign: "center",
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
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Validation des Tâches</Text>
        <Text style={styles.headerSubtitle}>
          Confirmez vos tâches complétées pour gagner des crédits
        </Text>
        {pendingTasks.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {pendingTasks.length} tâche{pendingTasks.length > 1 ? "s" : ""} en attente
            </Text>
          </View>
        )}
      </View>

      {/* Tasks List */}
      {pendingTasks.length > 0 ? (
        <FlatList
          data={pendingTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const creditsAwarded = Math.round(
              (item.actualDurationMinutes / 60) * CREDITS_PER_HOUR
            );
            const completedTime = formatTime(item.completedAt);

            return (
              <View style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle} numberOfLines={2}>
                    {item.eventTitle}
                  </Text>
                </View>

                <Text style={styles.timeText}>
                  Complétée à {completedTime}
                </Text>
                <Text style={styles.timeText}>
                  Durée : {Math.round(item.actualDurationMinutes)} min
                </Text>

                <View style={styles.creditsPreview}>
                  <Text style={styles.creditsText}>
                    +{creditsAwarded} crédits
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.validateBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() =>
                      handleValidate(item.id, item.actualDurationMinutes)
                    }
                  >
                    <Text style={styles.validateBtnText}>✓ Valider</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.rejectBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleReject(item.id, item.eventTitle)}
                  >
                    <Text style={styles.rejectBtnText}>✕ Rejeter</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="checkmark.circle.fill" size={48} color={colors.muted} />
          <Text style={styles.emptyText}>Aucune tâche en attente</Text>
          <Text style={styles.emptySubtext}>
            Complétez des tâches pour les valider ici
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
