import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEvents, CalendarEvent, ReminderOffset } from "@/lib/events-context";
import {
  formatFullDate,
  formatTime,
  getReminderLabel,
} from "@/lib/date-utils";

interface ReminderEntry {
  id: string;
  event: CalendarEvent;
  offset: ReminderOffset;
  triggerDate: Date;
}

export default function RemindersScreen() {
  const colors = useColors();
  const router = useRouter();
  const { events, updateEvent } = useEvents();

  // Build a flat list of all reminder entries
  const reminderEntries = useMemo<ReminderEntry[]>(() => {
    const entries: ReminderEntry[] = [];
    const now = new Date();

    for (const event of events) {
      const startDate = new Date(event.startDate);
      for (const offset of event.reminders) {
        const triggerDate = new Date(startDate.getTime() - offset * 60 * 1000);
        entries.push({
          id: `${event.id}_${offset}`,
          event,
          offset,
          triggerDate,
        });
      }
    }

    return entries.sort(
      (a, b) => a.triggerDate.getTime() - b.triggerDate.getTime()
    );
  }, [events]);

  const upcomingReminders = reminderEntries.filter(
    (r) => r.triggerDate > new Date()
  );
  const pastReminders = reminderEntries.filter(
    (r) => r.triggerDate <= new Date()
  );

  const handleRemoveReminder = useCallback(
    async (entry: ReminderEntry) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const updatedReminders = entry.event.reminders.filter(
        (r) => r !== entry.offset
      );
      await updateEvent({ ...entry.event, reminders: updatedReminders });
    },
    [updateEvent]
  );

  const handleEventPress = useCallback(
    (event: CalendarEvent) => {
      router.push({ pathname: "/event/[id]", params: { id: event.id } });
    },
    [router]
  );

  const handleAddEvent = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({ pathname: "/event/new", params: { date: new Date().toISOString() } });
  }, [router]);

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
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
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    reminderCard: {
      marginHorizontal: 20,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    reminderCardPast: {
      opacity: 0.5,
    },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    reminderInfo: {
      flex: 1,
    },
    reminderEventTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
    },
    reminderOffset: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "500",
      marginTop: 2,
    },
    reminderTrigger: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    removeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.error + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 8,
      textAlign: "center",
      paddingHorizontal: 40,
    },
    createBtn: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    createBtnText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 15,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
      textAlign: "center",
    },
  });

  const totalReminders = reminderEntries.length;
  const upcomingCount = upcomingReminders.length;

  if (totalReminders === 0) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rappels</Text>
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol name="bell.fill" size={56} color={colors.muted} />
          <Text style={styles.emptyTitle}>Aucun rappel</Text>
          <Text style={styles.emptySubtitle}>
            Créez des événements avec des rappels pour ne rien manquer.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.createBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleAddEvent}
          >
            <Text style={styles.createBtnText}>Créer un événement</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rappels</Text>
        <Text style={styles.headerSubtitle}>
          {upcomingCount} rappel{upcomingCount !== 1 ? "s" : ""} à venir
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>À venir</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalReminders}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pastReminders.length}</Text>
          <Text style={styles.statLabel}>Passés</Text>
        </View>
      </View>

      <FlatList
        data={[
          ...(upcomingReminders.length > 0
            ? [{ type: "section", label: "À venir" } as const]
            : []),
          ...upcomingReminders.map((r) => ({ type: "reminder", entry: r } as const)),
          ...(pastReminders.length > 0
            ? [{ type: "section", label: "Passés" } as const]
            : []),
          ...pastReminders.map((r) => ({ type: "reminder", entry: r } as const)),
        ]}
        keyExtractor={(item, idx) =>
          item.type === "section" ? `section_${item.label}` : `reminder_${item.entry.id}`
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          if (item.type === "section") {
            return <Text style={styles.sectionTitle}>{item.label}</Text>;
          }

          const { entry } = item;
          const isPast = entry.triggerDate <= new Date();

          return (
            <TouchableOpacity
              style={[
                styles.reminderCard,
                isPast && styles.reminderCardPast,
              ]}
              onPress={() => handleEventPress(entry.event)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: entry.event.color },
                ]}
              />
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderEventTitle} numberOfLines={1}>
                  {entry.event.title}
                </Text>
                <Text style={styles.reminderOffset}>
                  {getReminderLabel(entry.offset)}
                </Text>
                <Text style={styles.reminderTrigger}>
                  {formatFullDate(entry.triggerDate)},{" "}
                  {formatTime(entry.triggerDate)}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.removeBtn,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => handleRemoveReminder(entry)}
              >
                <IconSymbol name="xmark" size={14} color={colors.error} />
              </Pressable>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenContainer>
  );
}
