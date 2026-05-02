import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRewards, WEEKLY_COMPLETION_BONUS } from "@/lib/rewards-context";
import { useAdventure } from "@/lib/adventure-context";

export default function StatsScreen() {
  const colors = useColors();
  const { state: rewardsState, claimWeeklyBonus } = useRewards();
  const { state: adventureState } = useAdventure();

  const stats = useMemo(() => {
    const totalTasks = rewardsState.completedTasks.length;
    const validatedTasks = rewardsState.completedTasks.filter(
      (t) => t.validated
    ).length;
    const pendingTasks = rewardsState.pendingValidation.length;
    const totalCreditsEarned = rewardsState.totalCreditsEarned;
    const unclaimedBonuses = rewardsState.weeklyBonuses.filter(
      (b) => !b.claimedAt
    );

    return {
      totalTasks,
      validatedTasks,
      pendingTasks,
      totalCreditsEarned,
      unclaimedBonuses,
      validationRate:
        totalTasks > 0
          ? Math.round((validatedTasks / totalTasks) * 100)
          : 0,
    };
  }, [rewardsState]);

  const handleClaimBonus = (weekStart: string) => {
    Alert.alert(
      "Réclamer le bonus",
      `Vous allez recevoir ${WEEKLY_COMPLETION_BONUS} crédits pour avoir complété toute la semaine !`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réclamer",
          style: "default",
          onPress: () => {
            claimWeeklyBonus(weekStart);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("Succès", `+${WEEKLY_COMPLETION_BONUS} crédits bonus !`);
          },
        },
      ]
    );
  };

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
    section: {
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
    },
    statCard: {
      flex: 1,
      minWidth: "48%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.muted,
      textAlign: "center",
    },
    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
    },
    progressText: {
      fontSize: 12,
      color: colors.muted,
      textAlign: "right",
    },
    bonusCard: {
      backgroundColor: colors.primary + "10",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.primary + "40",
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bonusInfo: {
      flex: 1,
    },
    bonusTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
    },
    bonusDate: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
    bonusAmount: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
      marginRight: 12,
    },
    claimBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    claimBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    emptyText: {
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      marginTop: 12,
    },
  });

  const formatWeekDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <Text style={styles.headerSubtitle}>
          Suivez votre progression et vos récompenses
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Main Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalTasks}</Text>
              <Text style={styles.statLabel}>Tâches Complétées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.validatedTasks}</Text>
              <Text style={styles.statLabel}>Validées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingTasks}</Text>
              <Text style={styles.statLabel}>En Attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCreditsEarned}</Text>
              <Text style={styles.statLabel}>Crédits Gagnés</Text>
            </View>
          </View>
        </View>

        {/* Validation Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taux de Validation</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Tâches validées</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.validationRate}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{stats.validationRate}%</Text>
          </View>
        </View>

        {/* Weekly Bonuses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bonus Hebdomadaires</Text>
          {stats.unclaimedBonuses.length > 0 ? (
            stats.unclaimedBonuses.map((bonus) => (
              <View key={bonus.weekStart} style={styles.bonusCard}>
                <View style={styles.bonusInfo}>
                  <Text style={styles.bonusTitle}>Semaine Complète</Text>
                  <Text style={styles.bonusDate}>
                    {formatWeekDate(bonus.weekStart)} -{" "}
                    {formatWeekDate(bonus.weekEnd)}
                  </Text>
                </View>
                <Text style={styles.bonusAmount}>+{bonus.bonusCredits}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.claimBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleClaimBonus(bonus.weekStart)}
                >
                  <Text style={styles.claimBtnText}>Réclamer</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Aucun bonus disponible pour le moment
            </Text>
          )}
        </View>

        {/* Character Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre Héros</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{adventureState.level}</Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{adventureState.coins}</Text>
              <Text style={styles.statLabel}>Pièces</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {
                  Object.values(adventureState.equippedItems).filter(
                    (e) => e !== null
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>Équipements</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {adventureState.inventory.length}
              </Text>
              <Text style={styles.statLabel}>Inventaire</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
