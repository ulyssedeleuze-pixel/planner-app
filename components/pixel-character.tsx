import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { EquipmentSlot } from "@/lib/adventure-context";

interface EquippedItem {
  id: string;
  name: string;
  icon: string;
  slot: EquipmentSlot;
  rarity: string;
}

interface PixelCharacterProps {
  equippedItems: Partial<Record<EquipmentSlot, EquippedItem | null>>;
  size?: number;
}

// Position de chaque slot sur le personnage (en % de la taille de l'image)
const SLOT_POSITIONS: Record<EquipmentSlot, { top: number; left: number }> = {
  head:    { top: -14, left: 38 },  // au-dessus de la tête
  chest:   { top: 38,  left: 62 },  // torse droite
  hands:   { top: 52,  left: -14 }, // mains gauche
  legs:    { top: 62,  left: 62 },  // jambes droite
  feet:    { top: 80,  left: 38 },  // pieds bas
  weapon:  { top: 52,  left: -14 }, // arme gauche (même côté que mains)
};

// Taille de l'icône pour chaque slot
const SLOT_ICON_SIZE: Record<EquipmentSlot, number> = {
  head:   22,
  chest:  20,
  hands:  18,
  legs:   20,
  feet:   18,
  weapon: 22,
};

export function PixelCharacter({ equippedItems, size = 200 }: PixelCharacterProps) {
  const slots: EquipmentSlot[] = ["head", "chest", "hands", "legs", "feet", "weapon"];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Image de base du personnage */}
      <Image
        source={{
          uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663619789233/jJUmEzTwYt7UYT9DbPShs5/pixel-character-base-GQmK4MvgUovtMwkzEM8HZB.webp",
        }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />

      {/* Superposition des équipements */}
      {slots.map((slot) => {
        const item = equippedItems[slot];
        if (!item) return null;

        const pos = SLOT_POSITIONS[slot];
        const iconSize = SLOT_ICON_SIZE[slot];
        const bubbleSize = iconSize + 10;

        return (
          <View
            key={slot}
            style={[
              styles.equipmentBubble,
              {
                top: (pos.top / 100) * size,
                left: (pos.left / 100) * size,
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: bubbleSize / 2,
              },
            ]}
          >
            <Text style={{ fontSize: iconSize - 4 }}>{item.icon}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  equipmentBubble: {
    position: "absolute",
    backgroundColor: "rgba(15, 15, 20, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
});
