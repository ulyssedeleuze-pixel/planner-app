import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAdventure, EquipmentSlot } from "@/lib/adventure-context";
import { PixelCharacter } from "@/components/pixel-character";

const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: "Tête",
  chest: "Torse",
  hands: "Mains",
  legs: "Jambes",
  feet: "Pieds",
  weapon: "Arme",
};

const RARITY_COLORS: Record<string, string> = {
  common: "#95A5A6",
  uncommon: "#2ECC71",
  rare: "#3498DB",
  epic: "#9B59B6",
  legendary: "#F39C12",
};

export default function AdventureScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, equipItem, unequipItem } = useAdventure();

  const handleShop = useCallback(() => {
    router.push({ pathname: "/adventure/shop" as any });
  }, [router]);

  const handleEquipmentPress = useCallback(
    (slot: EquipmentSlot) => {
      router.push({
        pathname: "/adventure/[slot]" as any,
        params: { slot },
      });
    },
    [router]
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
    characterSection: {
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 20,
    },
    characterContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.primary + "40",
      alignItems: "center",
      marginBottom: 16,
      width: "100%",
    },
    characterImage: {
      width: 200,
      height: 200,
      marginBottom: 16,
    },
    characterName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      marginBottom: 8,
    },
    levelBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 12,
    },
    levelText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      marginTop: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
      textAlign: "center",
    },
    equipmentSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    equipmentGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    equipmentSlot: {
      flex: 1,
      minWidth: "48%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    slotLabel: {
      fontSize: 11,
      color: colors.muted,
      marginBottom: 8,
      fontWeight: "600",
    },
    equipmentName: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      textAlign: "center",
    },
    equipmentIcon: {
      fontSize: 28,
      marginVertical: 8,
    },
    emptySlot: {
      fontSize: 24,
      color: colors.muted + "60",
      marginVertical: 8,
    },
    rarityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    rarityText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    shopButton: {
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    shopButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });

  const slots: EquipmentSlot[] = ["head", "chest", "hands", "legs", "feet", "weapon"];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aventure</Text>
        <Text style={styles.headerSubtitle}>
          Complétez des tâches pour gagner des pièces
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Display */}
        <View style={styles.characterSection}>
          <View style={styles.characterContainer}>
            <PixelCharacter
              equippedItems={state.equippedItems}
              size={200}
            />
            <Text style={styles.characterName}>Votre Héros</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                Niveau {state.level} • {state.totalTasksCompleted} tâches complétées
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{state.coins}</Text>
                <Text style={styles.statLabel}>Pièces</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{state.level}</Text>
                <Text style={styles.statLabel}>Niveau</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Object.values(state.equippedItems).filter((e) => e !== null).length}
                </Text>
                <Text style={styles.statLabel}>Équipés</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Equipment Display */}
        <View style={styles.equipmentSection}>
          <Text style={styles.sectionTitle}>Équipement</Text>
          <View style={styles.equipmentGrid}>
            {slots.map((slot) => {
              const equipped = state.equippedItems[slot];
              return (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [
                    styles.equipmentSlot,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handleEquipmentPress(slot)}
                >
                  <Text style={styles.slotLabel}>
                    {EQUIPMENT_SLOT_LABELS[slot]}
                  </Text>
                  {equipped ? (
                    <>
                      <Text style={styles.equipmentIcon}>{equipped.icon}</Text>
                      <Text style={styles.equipmentName} numberOfLines={2}>
                        {equipped.name}
                      </Text>
                      <View
                        style={[
                          styles.rarityBadge,
                          {
                            backgroundColor:
                              RARITY_COLORS[equipped.rarity] || colors.primary,
                          },
                        ]}
                      >
                        <Text style={styles.rarityText}>
                          {equipped.rarity.toUpperCase()}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptySlot}>+</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Shop Button */}
        <Pressable
          style={({ pressed }) => [styles.shopButton, pressed && { opacity: 0.8 }]}
          onPress={handleShop}
        >
          <IconSymbol name="bag.fill" size={20} color="#FFFFFF" />
          <Text style={styles.shopButtonText}>Visiter la Boutique</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
