import React, { useMemo } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAdventure, EquipmentSlot } from "@/lib/adventure-context";

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

export default function EquipmentSlotScreen() {
  const colors = useColors();
  const router = useRouter();
  const { slot } = useLocalSearchParams<{ slot: string }>();
  const { state, equipItem, unequipItem, getInventoryForSlot } = useAdventure();

  const slotKey = slot as EquipmentSlot;
  const inventoryForSlot = useMemo(
    () => getInventoryForSlot(slotKey),
    [slotKey, getInventoryForSlot]
  );
  const currentEquipped = state.equippedItems[slotKey];

  const handleEquip = (itemId: string) => {
    const item = inventoryForSlot.find((i) => i.id === itemId);
    if (!item) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    equipItem(item);
    Alert.alert("Équipé", `${item.name} est maintenant équipé.`);
  };

  const handleUnequip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    unequipItem(slotKey);
    Alert.alert("Déséquipé", "L'équipement a été retiré.");
  };

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
    },
    currentEquipped: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.primary + "40",
    },
    equippedLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    equippedContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    equippedIcon: {
      fontSize: 32,
    },
    equippedInfo: {
      flex: 1,
    },
    equippedName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
    },
    equippedRarity: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    unequipBtn: {
      backgroundColor: colors.error + "20",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    unequipBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.error,
    },
    inventoryTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    itemCard: {
      marginHorizontal: 20,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    itemIcon: {
      fontSize: 28,
      width: 40,
      textAlign: "center",
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
    },
    itemDesc: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    rarityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
      alignSelf: "flex-start",
    },
    rarityText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    equipBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    equipBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#FFFFFF",
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
  });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{EQUIPMENT_SLOT_LABELS[slotKey]}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Currently Equipped */}
      {currentEquipped && (
        <View style={styles.currentEquipped}>
          <Text style={styles.equippedLabel}>Actuellement équipé</Text>
          <View style={styles.equippedContent}>
            <Text style={styles.equippedIcon}>{currentEquipped.icon}</Text>
            <View style={styles.equippedInfo}>
              <Text style={styles.equippedName}>{currentEquipped.name}</Text>
              <Text style={styles.equippedRarity}>
                {currentEquipped.rarity.toUpperCase()}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.unequipBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleUnequip}
            >
              <Text style={styles.unequipBtnText}>Retirer</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Inventory */}
      {inventoryForSlot.length > 0 && (
        <>
          <Text style={styles.inventoryTitle}>Inventaire</Text>
          <FlatList
            data={inventoryForSlot}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => handleEquip(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <View
                    style={[
                      styles.rarityBadge,
                      {
                        backgroundColor:
                          RARITY_COLORS[item.rarity] || colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.rarityText}>
                      {item.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.equipBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleEquip(item.id)}
                >
                  <Text style={styles.equipBtnText}>Équiper</Text>
                </Pressable>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {inventoryForSlot.length === 0 && !currentEquipped && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun équipement pour ce slot</Text>
          <Text style={[styles.emptyText, { marginTop: 8, fontSize: 14 }]}>
            Visitez la boutique pour en acheter
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
