import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
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
  getWeekStart,
  getWeekDays,
  DAYS_FR,
  MONTHS_SHORT_FR,
  isToday,
  isSameDay,
  formatTime,
} from "@/lib/date-utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;

export default function WeekScreen() {
  const colors = useColors();
  const router = useRouter();
  const { getEventsForDate } = useEvents();

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const weekDays = getWeekDays(weekStart);

  const prevWeek = useCallback(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }, [weekStart]);

  const nextWeek = useCallback(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }, [weekStart]);

  const goToToday = useCallback(() => {
    setWeekStart(getWeekStart(new Date()));
  }, []);

  const handleAddEvent = useCallback(
    (date: Date, hour: number) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const d = new Date(date);
      d.setHours(hour, 0, 0, 0);
      router.push({ pathname: "/event/new", params: { date: d.toISOString() } });
    },
    [router]
  );

  const handleEventPress = useCallback(
    (event: CalendarEvent) => {
      router.push({ pathname: "/event/[id]", params: { id: event.id } });
    },
    [router]
  );

  // Format week range
  const weekEnd = weekDays[6];
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()}–${weekEnd.getDate()} ${MONTHS_SHORT_FR[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${weekStart.getDate()} ${MONTHS_SHORT_FR[weekStart.getMonth()]} – ${weekEnd.getDate()} ${MONTHS_SHORT_FR[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    weekLabel: {
      fontSize: 15,
      fontWeight: "600",
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
    todayBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary + "20",
    },
    todayBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
    dayHeaderRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingLeft: 44,
    },
    dayHeaderCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
    },
    dayName: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.muted,
      textTransform: "uppercase",
    },
    dayNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    dayNumText: {
      fontSize: 14,
      fontWeight: "600",
    },
    gridContainer: {
      flexDirection: "row",
    },
    timeColumn: {
      width: 44,
    },
    timeLabel: {
      height: HOUR_HEIGHT,
      justifyContent: "flex-start",
      paddingTop: 4,
      paddingRight: 6,
      alignItems: "flex-end",
    },
    timeLabelText: {
      fontSize: 10,
      color: colors.muted,
    },
    dayColumn: {
      flex: 1,
      borderLeftWidth: 0.5,
      borderLeftColor: colors.border,
    },
    hourCell: {
      height: HOUR_HEIGHT,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border + "80",
    },
    eventBlock: {
      position: "absolute",
      left: 2,
      right: 2,
      borderRadius: 4,
      padding: 3,
      overflow: "hidden",
    },
    eventBlockTitle: {
      fontSize: 10,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    eventBlockTime: {
      fontSize: 9,
      color: "#FFFFFF",
      opacity: 0.85,
    },
  });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            onPress={prevWeek}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.6 }]}
            onPress={nextWeek}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.foreground} />
          </Pressable>
        </View>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <Pressable
          style={({ pressed }) => [styles.todayBtn, pressed && { opacity: 0.7 }]}
          onPress={goToToday}
        >
          <Text style={styles.todayBtnText}>Aujourd'hui</Text>
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaderRow}>
        {weekDays.map((day, i) => {
          const isTodayDay = isToday(day);
          return (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={styles.dayName}>{DAYS_FR[(i + 1) % 7]}</Text>
              <View
                style={[
                  styles.dayNum,
                  isTodayDay && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumText,
                    { color: isTodayDay ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Time grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Time labels */}
          <View style={styles.timeColumn}>
            {HOURS.map((h) => (
              <View key={h} style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>
                  {h === 0 ? "" : `${h.toString().padStart(2, "0")}h`}
                </Text>
              </View>
            ))}
          </View>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const dayEvents = getEventsForDate(day).filter((e) => !e.allDay);

            return (
              <View key={dayIdx} style={styles.dayColumn}>
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={styles.hourCell}
                    onPress={() => handleAddEvent(day, h)}
                    activeOpacity={0.5}
                  />
                ))}

                {/* Event blocks */}
                {dayEvents.map((event) => {
                  const start = new Date(event.startDate);
                  const end = new Date(event.endDate);
                  const startHour = start.getHours() + start.getMinutes() / 60;
                  const endHour = end.getHours() + end.getMinutes() / 60;
                  const duration = Math.max(endHour - startHour, 0.5);

                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={[
                        styles.eventBlock,
                        {
                          top: startHour * HOUR_HEIGHT,
                          height: duration * HOUR_HEIGHT - 2,
                          backgroundColor: event.color,
                        },
                      ]}
                      onPress={() => handleEventPress(event)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.eventBlockTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <Text style={styles.eventBlockTime}>
                        {formatTime(start)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
