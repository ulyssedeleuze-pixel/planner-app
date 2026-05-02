import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEvents, CalendarEvent } from "@/lib/events-context";
import {
  groupEventsByDate,
  formatTime,
  isToday,
  isSameDay,
} from "@/lib/date-utils";

type SectionItem =
  | { type: "header"; label: string; date: Date }
  | { type: "event"; event: CalendarEvent };

export default function EventsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { events, deleteEvent, getUpcomingEvents } = useEvents();

  const upcomingEvents = getUpcomingEvents();
  const grouped = groupEventsByDate(upcomingEvents);

  const flatData = useMemo<SectionItem[]>(() => {
    const items: SectionItem[] = [];
    for (const group of grouped) {
      items.push({ type: "header", label: group.label, date: group.date });
      for (const event of group.events) {
        items.push({ type: "event", event });
      }
    }
    return items;
  }, [grouped]);

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

  const handleDelete = useCallback(
    (event: CalendarEvent) => {
      Alert.alert(
        "Supprimer",
        `Supprimer "${event.title}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              await deleteEvent(event.id);
            },
          },
        ]
      );
    },
    [deleteEvent]
  );

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 6,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    eventRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
    },
    colorBar: {
      width: 4,
      height: 44,
      borderRadius: 2,
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
    },
    eventTime: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    eventDesc: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error + "15",
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
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Événements</Text>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
          onPress={handleAddEvent}
        >
          <IconSymbol name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {flatData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar.badge.plus" size={56} color={colors.muted} />
          <Text style={styles.emptyTitle}>Aucun événement à venir</Text>
          <Text style={styles.emptySubtitle}>
            Appuyez sur + pour créer votre premier événement.
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item, idx) =>
            item.type === "header"
              ? `header_${item.date.toISOString()}`
              : `event_${item.event.id}`
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>{item.label}</Text>
                </View>
              );
            }

            const { event } = item;
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);

            return (
              <TouchableOpacity
                style={styles.eventRow}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.colorBar, { backgroundColor: event.color }]}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventTime}>
                    {event.allDay
                      ? "Toute la journée"
                      : `${formatTime(start)} – ${formatTime(end)}`}
                  </Text>
                  {event.description ? (
                    <Text style={styles.eventDesc} numberOfLines={1}>
                      {event.description}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => handleDelete(event)}
                >
                  <IconSymbol name="trash" size={16} color={colors.error} />
                </Pressable>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
        onPress={handleAddEvent}
      >
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </ScreenContainer>
  );
}
