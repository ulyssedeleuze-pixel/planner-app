import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEvents, EventColor, ReminderOffset } from "@/lib/events-context";
import { getReminderLabel, formatTime, MONTHS_FR } from "@/lib/date-utils";

const EVENT_COLORS: EventColor[] = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
];

const REMINDER_OPTIONS: ReminderOffset[] = [5, 15, 30, 60, 1440];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDateDisplay(date: Date): string {
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

export default function NewEventScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const { addEvent } = useEvents();

  const initialDate = params.date ? new Date(params.date) : new Date();
  // Round to next 30 min
  const roundedStart = new Date(initialDate);
  roundedStart.setMinutes(Math.ceil(roundedStart.getMinutes() / 30) * 30, 0, 0);
  const roundedEnd = new Date(roundedStart);
  roundedEnd.setHours(roundedEnd.getHours() + 1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(roundedStart);
  const [endDate, setEndDate] = useState(roundedEnd);
  const [color, setColor] = useState<EventColor>("#6366F1");
  const [reminders, setReminders] = useState<ReminderOffset[]>([]);
  const [allDay, setAllDay] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simple inline time/date picker state
  const [editingField, setEditingField] = useState<
    "startDate" | "startTime" | "endDate" | "endTime" | null
  >(null);

  const toggleReminder = useCallback((offset: ReminderOffset) => {
    setReminders((prev) =>
      prev.includes(offset) ? prev.filter((r) => r !== offset) : [...prev, offset]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Titre requis", "Veuillez saisir un titre pour l'événement.");
      return;
    }
    if (endDate <= startDate && !allDay) {
      Alert.alert("Dates invalides", "La date de fin doit être après la date de début.");
      return;
    }
    setSaving(true);
    try {
      await addEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate.toISOString(),
        endDate: allDay ? startDate.toISOString() : endDate.toISOString(),
        color,
        reminders,
        allDay,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de créer l'événement.");
    } finally {
      setSaving(false);
    }
  }, [title, description, startDate, endDate, color, reminders, allDay, addEvent, router]);

  // Adjust date by delta days
  const adjustDate = (field: "start" | "end", delta: number) => {
    if (field === "start") {
      const d = new Date(startDate);
      d.setDate(d.getDate() + delta);
      setStartDate(d);
      if (d > endDate) {
        const e = new Date(d);
        e.setHours(e.getHours() + 1);
        setEndDate(e);
      }
    } else {
      const d = new Date(endDate);
      d.setDate(d.getDate() + delta);
      if (d >= startDate) setEndDate(d);
    }
  };

  const adjustTime = (field: "start" | "end", deltaMin: number) => {
    if (field === "start") {
      const d = new Date(startDate);
      d.setMinutes(d.getMinutes() + deltaMin);
      setStartDate(d);
      if (d >= endDate) {
        const e = new Date(d);
        e.setHours(e.getHours() + 1);
        setEndDate(e);
      }
    } else {
      const d = new Date(endDate);
      d.setMinutes(d.getMinutes() + deltaMin);
      if (d > startDate) setEndDate(d);
    }
  };

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.foreground,
    },
    cancelBtn: {
      fontSize: 16,
      color: colors.muted,
    },
    saveBtn: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
    },
    rowValue: {
      fontSize: 15,
      color: colors.primary,
      fontWeight: "500",
    },
    timeAdjuster: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    timeLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.muted,
    },
    timeValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
      minWidth: 80,
      textAlign: "center",
    },
    adjBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    colorRow: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
    },
    colorDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    reminderLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
    },
  });

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelBtn}>Annuler</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nouvel événement</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveBtn, saving && { opacity: 0.5 }]}>
            Enregistrer
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Titre</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'événement"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ajouter une description..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* All day toggle */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Toute la journée</Text>
            <Switch
              value={allDay}
              onValueChange={setAllDay}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date de début</Text>
          <View style={styles.timeAdjuster}>
            <Pressable style={styles.adjBtn} onPress={() => adjustDate("start", -1)}>
              <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
            </Pressable>
            <Text style={styles.timeValue}>{formatDateDisplay(startDate)}</Text>
            <Pressable style={styles.adjBtn} onPress={() => adjustDate("start", 1)}>
              <IconSymbol name="chevron.right" size={16} color={colors.foreground} />
            </Pressable>
          </View>

          {!allDay && (
            <View style={styles.timeAdjuster}>
              <Pressable style={styles.adjBtn} onPress={() => adjustTime("start", -30)}>
                <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
              </Pressable>
              <Text style={styles.timeValue}>{formatTime(startDate)}</Text>
              <Pressable style={styles.adjBtn} onPress={() => adjustTime("start", 30)}>
                <IconSymbol name="chevron.right" size={16} color={colors.foreground} />
              </Pressable>
            </View>
          )}
        </View>

        {!allDay && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date de fin</Text>
            <View style={styles.timeAdjuster}>
              <Pressable style={styles.adjBtn} onPress={() => adjustDate("end", -1)}>
                <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
              </Pressable>
              <Text style={styles.timeValue}>{formatDateDisplay(endDate)}</Text>
              <Pressable style={styles.adjBtn} onPress={() => adjustDate("end", 1)}>
                <IconSymbol name="chevron.right" size={16} color={colors.foreground} />
              </Pressable>
            </View>
            <View style={styles.timeAdjuster}>
              <Pressable style={styles.adjBtn} onPress={() => adjustTime("end", -30)}>
                <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
              </Pressable>
              <Text style={styles.timeValue}>{formatTime(endDate)}</Text>
              <Pressable style={styles.adjBtn} onPress={() => adjustTime("end", 30)}>
                <IconSymbol name="chevron.right" size={16} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Couleur</Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={({ pressed }) => [
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && {
                    borderWidth: 3,
                    borderColor: colors.foreground,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rappels</Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {REMINDER_OPTIONS.map((offset, idx) => (
              <View
                key={offset}
                style={[
                  styles.reminderRow,
                  idx === REMINDER_OPTIONS.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <Text style={styles.reminderLabel}>
                  {getReminderLabel(offset)}
                </Text>
                <Switch
                  value={reminders.includes(offset)}
                  onValueChange={() => toggleReminder(offset)}
                  trackColor={{ true: colors.primary }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
