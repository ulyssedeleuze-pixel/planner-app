import React, { useState, useCallback, useMemo } from "react";
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
import { useAdventure, EQUIPMENT_CATALOG, Equipment } from "@/lib/adventure-context";

const RARITY_COLORS: Record<string, string> = {
  common: "#95A5A6",
  uncommon: "#2ECC71",
  rare: "#3498DB",
  epic: "#9B59B6",
  legendary: "#F39C12",
};

type FilterType = "all" | "common" | "uncommon" | "rare" | "epic" | "legendary";

export default function ShopScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, buyEquipment } = useAdventure();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredItems = useMemo(() => {
    if (filter === "all") return EQUIPMENT_CATALOG;
    return EQUIPMENT_CATALOG.filter((item) => item.rarity === filter);
  }, [filter]);

  const handleBuy = useCallback(
    (item: Equipment) => {
      if (state.coins < item.cost) {
        Alert.alert(
          "Pièces insuffisantes",
          `Il vous faut ${item.cost - state.coins} pièces de plus.`
        );
        return;
      }

      Alert.alert(
        "Acheter",
        `Acheter "${item.name}" pour ${item.cost} pièces ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Acheter",
            style: "default",
            onPress: () => {
              buyEquipment(item);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Succès", `Vous avez acheté ${item.name} !`);
            },
          },
        ]
      );
    },
    [state.coins, buyEquipment]
  );

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
    },
    coinsBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    coinsText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 0,
    },
    filterBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.foreground,
    },
    filterBtnTextActive: {
      color: "#FFFFFF",
    },
    itemCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    itemIcon: {
      fontSize: 40,
      width: 50,
      textAlign: "center",
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
    },
    itemDesc: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    itemMeta: {
      flexDirection: "row",
      gap: 8,
      marginTop: 6,
      alignItems: "center",
    },
    rarityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    rarityText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    levelBadge: {
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    levelText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.muted,
    },
    buyBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    buyBtnDisabled: {
      backgroundColor: colors.muted + "40",
    },
    buyBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    costText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
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
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Boutique</Text>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsText}>💰</Text>
            <Text style={styles.coinsText}>{state.coins}</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["all", "common", "uncommon", "rare", "epic", "legendary"] as const).map(
            (f) => (
              <Pressable
                key={f}
                style={({ pressed }) => [
                  styles.filterBtn,
                  filter === f && styles.filterBtnActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filter === f && styles.filterBtnTextActive,
                  ]}
                >
                  {f === "all" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            )
          )}
        </View>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const canAfford = state.coins >= item.cost;
          const alreadyOwned = state.inventory.some((inv) => inv.id === item.id);

          return (
            <View style={styles.itemCard}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <View style={styles.itemMeta}>
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
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>Niv. {item.level}</Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={styles.costText}>{item.cost}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.buyBtn,
                    (!canAfford || alreadyOwned) && styles.buyBtnDisabled,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleBuy(item)}
                  disabled={!canAfford || alreadyOwned}
                >
                  <Text style={styles.buyBtnText}>
                    {alreadyOwned ? "Possédé" : "Acheter"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun équipement trouvé</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
