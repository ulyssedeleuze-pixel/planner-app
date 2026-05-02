import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEvents, CalendarEvent, EventColor, ReminderOffset } from "@/lib/events-context";
import {
  formatFullDate,
  formatTime,
  getReminderLabel,
  MONTHS_FR,
} from "@/lib/date-utils";

const EVENT_COLORS: EventColor[] = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
];

const REMINDER_OPTIONS: ReminderOffset[] = [5, 15, 30, 60, 1440];

function formatDateDisplay(date: Date): string {
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

export default function EventDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, deleteEvent, updateEvent } = useEvents();

  const event = events.find((e) => e.id === id);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startDate, setStartDate] = useState(
    event ? new Date(event.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    event ? new Date(event.endDate) : new Date()
  );
  const [color, setColor] = useState<EventColor>(event?.color ?? "#6366F1");
  const [reminders, setReminders] = useState<ReminderOffset[]>(
    event?.reminders ?? []
  );
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [saving, setSaving] = useState(false);

  const toggleReminder = useCallback((offset: ReminderOffset) => {
    setReminders((prev) =>
      prev.includes(offset) ? prev.filter((r) => r !== offset) : [...prev, offset]
    );
  }, []);

  const adjustDate = (field: "start" | "end", delta: number) => {
    if (field === "start") {
      const d = new Date(startDate);
      d.setDate(d.getDate() + delta);
      setStartDate(d);
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
    } else {
      const d = new Date(endDate);
      d.setMinutes(d.getMinutes() + deltaMin);
      if (d > startDate) setEndDate(d);
    }
  };

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Supprimer l'événement",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await deleteEvent(id!);
            router.back();
          },
        },
      ]
    );
  }, [deleteEvent, id, router]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !event) return;
    setSaving(true);
    try {
      await updateEvent({
        ...event,
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
      setEditing(false);
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour l'événement.");
    } finally {
      setSaving(false);
    }
  }, [event, title, description, startDate, endDate, color, reminders, allDay, updateEvent]);

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
    colorStripe: {
      height: 6,
    },
    section: {
      marginTop: 20,
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    titleText: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
    },
    descText: {
      fontSize: 15,
      color: colors.muted,
      lineHeight: 22,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },
    infoText: {
      fontSize: 15,
      color: colors.foreground,
    },
    reminderBadge: {
      backgroundColor: colors.primary + "20",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 8,
    },
    reminderBadgeText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "500",
    },
    deleteBtn: {
      marginHorizontal: 20,
      marginTop: 24,
      backgroundColor: colors.error + "15",
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.error + "30",
    },
    deleteBtnText: {
      color: colors.error,
      fontSize: 15,
      fontWeight: "600",
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
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
    timeValue: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
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
  });

  if (!event) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Événement introuvable</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>Cet événement n'existe plus.</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (editing) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable onPress={() => setEditing(false)}>
            <Text style={{ fontSize: 16, color: colors.muted }}>Annuler</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Modifier</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.primary,
                opacity: saving ? 0.5 : 1,
              }}
            >
              Enregistrer
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Titre</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor={colors.muted}
            />
          </View>

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
                    idx === REMINDER_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.reminderLabel}>{getReminderLabel(offset)}</Text>
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

  // Read-only view
  const startDateObj = new Date(event.startDate);
  const endDateObj = new Date(event.endDate);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Détail</Text>
        <Pressable
          onPress={() => setEditing(true)}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="pencil" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Color stripe */}
      <View style={[styles.colorStripe, { backgroundColor: event.color }]} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.titleText}>{event.title}</Text>
          {event.description ? (
            <Text style={[styles.descText, { marginTop: 8 }]}>
              {event.description}
            </Text>
          ) : null}
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Heure</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={18} color={colors.primary} />
              <Text style={styles.infoText}>
                {formatFullDate(startDateObj)}
              </Text>
            </View>
            {!event.allDay && (
              <View style={styles.infoRow}>
                <IconSymbol name="clock.fill" size={18} color={colors.primary} />
                <Text style={styles.infoText}>
                  {formatTime(startDateObj)} – {formatTime(endDateObj)}
                </Text>
              </View>
            )}
            {event.allDay && (
              <View style={styles.infoRow}>
                <IconSymbol name="clock.fill" size={18} color={colors.primary} />
                <Text style={styles.infoText}>Toute la journée</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reminders */}
        {event.reminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rappels</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {event.reminders.map((r) => (
                <View key={r} style={styles.reminderBadge}>
                  <Text style={styles.reminderBadgeText}>
                    {getReminderLabel(r)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Delete */}
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteBtnText}>Supprimer l'événement</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
