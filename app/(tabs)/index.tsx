import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEvents, CalendarEvent } from "@/lib/events-context";
import {
  DAYS_FR,
  MONTHS_FR,
  getCalendarGrid,
  isSameDay,
  isToday,
  formatTime,
} from "@/lib/date-utils";

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { getEventsForDate } = useEvents();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const grid = getCalendarGrid(currentYear, currentMonth);
  const selectedEvents = getEventsForDate(selectedDate);

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const handleDayPress = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    []
  );

  const handleAddEvent = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({
      pathname: "/event/new",
      params: {
        date: selectedDate.toISOString(),
      },
    });
  }, [router, selectedDate]);

  const handleEventPress = useCallback(
    (event: CalendarEvent) => {
      router.push({ pathname: "/event/[id]", params: { id: event.id } });
    },
    [router]
  );

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    monthTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
    },
    navBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    daysRow: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    dayLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
    },
    dayCell: {
      width: "14.28%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 2,
    },
    dayInner: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      fontSize: 14,
      fontWeight: "500",
    },
    dotRow: {
      flexDirection: "row",
      gap: 2,
      marginTop: 2,
      height: 5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
      marginVertical: 12,
    },
    selectedDateLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.muted,
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    emptyText: {
      textAlign: "center",
      color: colors.muted,
      fontSize: 14,
      paddingVertical: 24,
    },
    eventItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 12,
    },
    colorBar: {
      width: 4,
      height: 40,
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
        <Pressable
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
          onPress={prevMonth}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTHS_FR[currentMonth]} {currentYear}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
          onPress={nextMonth}
        >
          <IconSymbol name="chevron.right" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Day labels */}
      <View style={styles.daysRow}>
        {DAYS_FR.slice(1).concat(DAYS_FR[0]).map((d) => (
          <Text key={d} style={styles.dayLabel}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {grid.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const dayEvents = getEventsForDate(date);
          const dots = dayEvents.slice(0, 3);

          return (
            <Pressable
              key={idx}
              style={styles.dayCell}
              onPress={() => handleDayPress(date)}
            >
              <View
                style={[
                  styles.dayInner,
                  isSelected && { backgroundColor: colors.primary },
                  !isSelected && isTodayDate && {
                    borderWidth: 2,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isSelected
                        ? "#FFFFFF"
                        : isCurrentMonth
                        ? colors.foreground
                        : colors.muted,
                      opacity: isCurrentMonth ? 1 : 0.4,
                    },
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
              {dots.length > 0 && (
                <View style={styles.dotRow}>
                  {dots.map((e, i) => (
                    <View
                      key={i}
                      style={[styles.dot, { backgroundColor: e.color }]}
                    />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Selected day events */}
      <Text style={styles.selectedDateLabel}>
        {selectedDate.getDate()}{" "}
        {MONTHS_FR[selectedDate.getMonth()].toLowerCase()}{" "}
        {selectedDate.getFullYear()}
      </Text>

      <FlatList
        data={selectedEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun événement ce jour</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventItem}
            onPress={() => handleEventPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.eventTime}>
                {item.allDay
                  ? "Toute la journée"
                  : `${formatTime(new Date(item.startDate))} – ${formatTime(
                      new Date(item.endDate)
                    )}`}
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
        onPress={handleAddEvent}
      >
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </ScreenContainer>
  );
}
