import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Equipment, EquipmentSlot } from "@/lib/adventure-context";

interface PixelCharacterProps {
  equippedItems: Record<EquipmentSlot, Equipment | null>;
  size?: number;
}

// ─── Helpers pixel art ───────────────────────────────────────────────────────

type PixelGrid = (string | null)[][];

function PixelArt({ grid, pixelSize }: { grid: PixelGrid; pixelSize: number }) {
  return (
    <View style={{ flexDirection: "column" }}>
      {grid.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((color, c) =>
            color ? (
              <View
                key={c}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color,
                }}
              />
            ) : (
              <View key={c} style={{ width: pixelSize, height: pixelSize }} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

// ─── Grilles pixel art par item ──────────────────────────────────────────────

// Chapeau haut de forme (helm_leather) — 10×8 pixels
const HAT_TOP_SILK: PixelGrid = [
  [null, null, null, "#2a2a2a","#2a2a2a","#2a2a2a","#2a2a2a", null, null, null],
  [null, null, "#2a2a2a","#3a3a3a","#3a3a3a","#3a3a3a","#3a3a3a","#2a2a2a", null, null],
  [null, null, "#2a2a2a","#444","#444","#444","#444","#2a2a2a", null, null],
  [null, null, "#2a2a2a","#444","#444","#444","#444","#2a2a2a", null, null],
  [null, null, "#2a2a2a","#3a3a3a","#3a3a3a","#3a3a3a","#3a3a3a","#2a2a2a", null, null],
  ["#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a","#1a1a1a"],
  [null,"#111","#111","#111","#111","#111","#111","#111","#111", null],
];

// Casque en fer (helm_iron) — 10×6 pixels
const HAT_IRON: PixelGrid = [
  [null, null,"#888","#999","#999","#999","#999","#888", null, null],
  [null,"#777","#aaa","#bbb","#bbb","#bbb","#bbb","#aaa","#777", null],
  [null,"#777","#aaa","#ccc","#ccc","#ccc","#ccc","#aaa","#777", null],
  [null,"#777","#999","#aaa","#aaa","#aaa","#aaa","#999","#777", null],
  [null,"#666","#888","#888","#888","#888","#888","#888","#666", null],
  [null,"#555","#555","#666","#666","#666","#666","#555","#555", null],
];

// Couronne (helm_steel) — 10×6 pixels
const CROWN: PixelGrid = [
  ["#FFD700", null,"#FFD700", null,"#FFD700", null,"#FFD700", null,"#FFD700", null],
  ["#FFD700","#FFD700","#FFD700","#FFD700","#FFD700","#FFD700","#FFD700","#FFD700","#FFD700","#FFD700"],
  ["#DAA520","#DAA520","#DAA520","#DAA520","#DAA520","#DAA520","#DAA520","#DAA520","#DAA520","#DAA520"],
  ["#DAA520","#B8860B","#DAA520","#B8860B","#DAA520","#B8860B","#DAA520","#B8860B","#DAA520","#B8860B"],
  ["#B8860B","#B8860B","#B8860B","#B8860B","#B8860B","#B8860B","#B8860B","#B8860B","#B8860B","#B8860B"],
];

// Casque de dragon (helm_dragon) — 10×7 pixels
const HAT_DRAGON: PixelGrid = [
  [null,"#8B0000", null, null, null, null, null, null,"#8B0000", null],
  ["#8B0000","#A00","#8B0000", null, null, null, null,"#8B0000","#A00","#8B0000"],
  ["#A00","#C00","#C00","#8B0000","#8B0000","#8B0000","#8B0000","#C00","#C00","#A00"],
  [null,"#B00","#D00","#E00","#E00","#E00","#E00","#D00","#B00", null],
  [null,"#A00","#C00","#D00","#D00","#D00","#D00","#C00","#A00", null],
  [null,"#900","#A00","#B00","#B00","#B00","#B00","#A00","#900", null],
  [null,"#800","#800","#900","#900","#900","#900","#800","#800", null],
];

// Armure torse cuir (chest_leather) — 10×8
const CHEST_LEATHER: PixelGrid = [
  [null,"#8B6914","#8B6914","#8B6914","#8B6914","#8B6914","#8B6914","#8B6914","#8B6914", null],
  ["#7A5C10","#A07820","#A07820","#9B7318","#9B7318","#9B7318","#9B7318","#A07820","#A07820","#7A5C10"],
  ["#7A5C10","#9B7318","#C8A028","#9B7318","#9B7318","#9B7318","#9B7318","#C8A028","#9B7318","#7A5C10"],
  ["#7A5C10","#9B7318","#9B7318","#8B6914","#8B6914","#8B6914","#8B6914","#9B7318","#9B7318","#7A5C10"],
  ["#7A5C10","#8B6914","#8B6914","#7A5C10","#8B6914","#8B6914","#7A5C10","#8B6914","#8B6914","#7A5C10"],
  ["#6A4C08","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#6A4C08"],
  ["#6A4C08","#6A4C08","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#7A5C10","#6A4C08","#6A4C08"],
  [null,"#6A4C08","#6A4C08","#6A4C08","#6A4C08","#6A4C08","#6A4C08","#6A4C08","#6A4C08", null],
];

// Bouclier / armure fer (chest_iron) — 10×8
const CHEST_IRON: PixelGrid = [
  [null,"#888","#999","#999","#999","#999","#999","#999","#888", null],
  ["#777","#aaa","#bbb","#ccc","#ccc","#ccc","#ccc","#bbb","#aaa","#777"],
  ["#777","#aaa","#ccc","#ddd","#ddd","#ddd","#ddd","#ccc","#aaa","#777"],
  ["#777","#999","#bbb","#ccc","#888","#888","#ccc","#bbb","#999","#777"],
  ["#777","#999","#aaa","#bbb","#ccc","#ccc","#bbb","#aaa","#999","#777"],
  ["#666","#888","#999","#aaa","#aaa","#aaa","#aaa","#999","#888","#666"],
  ["#666","#777","#888","#888","#888","#888","#888","#888","#777","#666"],
  [null,"#666","#666","#777","#777","#777","#777","#666","#666", null],
];

// Épée (weapon_sword) — 4×12
const SWORD: PixelGrid = [
  [null,"#ccc","#ccc", null],
  [null,"#ddd","#bbb", null],
  [null,"#ddd","#bbb", null],
  [null,"#ddd","#bbb", null],
  [null,"#ddd","#bbb", null],
  [null,"#ddd","#bbb", null],
  ["#aaa","#eee","#aaa","#aaa"],
  [null,"#8B6914","#8B6914", null],
  [null,"#8B6914","#8B6914", null],
  [null,"#6A4C08","#6A4C08", null],
];

// Dague (weapon_dagger) — 4×8
const DAGGER: PixelGrid = [
  [null,"#ccc","#ccc", null],
  [null,"#ddd","#bbb", null],
  [null,"#ddd","#bbb", null],
  ["#aaa","#eee","#aaa","#aaa"],
  [null,"#8B6914","#8B6914", null],
  [null,"#6A4C08","#6A4C08", null],
];

// Excalibur (weapon_excalibur) — 4×14
const EXCALIBUR: PixelGrid = [
  [null,"#FFD700","#FFD700", null],
  [null,"#FFE040","#DAA520", null],
  [null,"#FFE040","#DAA520", null],
  [null,"#FFE040","#DAA520", null],
  [null,"#FFE040","#DAA520", null],
  [null,"#FFE040","#DAA520", null],
  [null,"#FFE040","#DAA520", null],
  ["#DAA520","#FFE040","#DAA520","#DAA520"],
  [null,"#B8860B","#B8860B", null],
  [null,"#B8860B","#B8860B", null],
  [null,"#996515","#996515", null],
  [null,"#996515","#996515", null],
];

// Jambières en cuir (legs) — 10×6
const LEGS_LEATHER: PixelGrid = [
  ["#7A5C10","#7A5C10","#7A5C10","#7A5C10", null, null,"#7A5C10","#7A5C10","#7A5C10","#7A5C10"],
  ["#8B6914","#8B6914","#8B6914","#7A5C10", null, null,"#7A5C10","#8B6914","#8B6914","#8B6914"],
  ["#9B7318","#9B7318","#8B6914","#7A5C10", null, null,"#7A5C10","#8B6914","#9B7318","#9B7318"],
  ["#9B7318","#9B7318","#8B6914","#8B6914", null, null,"#8B6914","#8B6914","#9B7318","#9B7318"],
  ["#8B6914","#8B6914","#7A5C10","#7A5C10", null, null,"#7A5C10","#7A5C10","#8B6914","#8B6914"],
  ["#7A5C10","#7A5C10","#7A5C10","#7A5C10", null, null,"#7A5C10","#7A5C10","#7A5C10","#7A5C10"],
];

// Bottes (feet) — 10×5
const BOOTS: PixelGrid = [
  ["#5C3A10","#5C3A10", null, null, null, null, null, null,"#5C3A10","#5C3A10"],
  ["#6A4C14","#6A4C14","#5C3A10", null, null, null, null,"#5C3A10","#6A4C14","#6A4C14"],
  ["#7A5C20","#7A5C20","#6A4C14","#5C3A10","#5C3A10","#5C3A10","#5C3A10","#6A4C14","#7A5C20","#7A5C20"],
  ["#8B6914","#8B6914","#7A5C20","#7A5C20","#7A5C20","#7A5C20","#7A5C20","#7A5C20","#8B6914","#8B6914"],
  ["#9B7318","#9B7318","#9B7318","#9B7318","#9B7318","#9B7318","#9B7318","#9B7318","#9B7318","#9B7318"],
];

// ─── Map item id → grille ─────────────────────────────────────────────────────

const ITEM_PIXEL_ART: Record<string, PixelGrid> = {
  helm_leather:  HAT_TOP_SILK,
  helm_iron:     HAT_IRON,
  helm_steel:    CROWN,
  helm_dragon:   HAT_DRAGON,
  chest_leather: CHEST_LEATHER,
  chest_iron:    CHEST_IRON,
  chest_steel:   CHEST_IRON,   // réutilise fer avec teinte argentée (à améliorer)
  chest_mithril: CHEST_IRON,
  weapon_dagger: DAGGER,
  weapon_sword:  SWORD,
  weapon_greatsword: SWORD,
  weapon_excalibur:  EXCALIBUR,
  feet_leather:  BOOTS,
  feet_iron:     BOOTS,
  feet_steel:    BOOTS,
};

// ─── Positions absolues sur le personnage (en px pour size=200) ───────────────

function getSlotPosition(slot: EquipmentSlot, size: number): { top: number; left: number } {
  const s = size / 200; // facteur d'échelle
  switch (slot) {
    case "head":   return { top: -18 * s,  left: 72 * s  }; // au-dessus de la tête, centré
    case "chest":  return { top: 80 * s,   left: 50 * s  }; // torse centré
    case "hands":  return { top: 90 * s,   left: 155 * s }; // main droite
    case "legs":   return { top: 130 * s,  left: 55 * s  }; // jambes
    case "feet":   return { top: 165 * s,  left: 45 * s  }; // pieds
    case "weapon": return { top: 70 * s,   left: -20 * s }; // main gauche (arme)
  }
}

function getPixelSize(slot: EquipmentSlot, size: number): number {
  const s = size / 200;
  switch (slot) {
    case "head":   return Math.max(2, Math.round(4 * s));
    case "chest":  return Math.max(2, Math.round(3.5 * s));
    case "weapon": return Math.max(2, Math.round(4 * s));
    case "feet":   return Math.max(2, Math.round(3 * s));
    default:       return Math.max(2, Math.round(3 * s));
  }
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function PixelCharacter({ equippedItems, size = 200 }: PixelCharacterProps) {
  const slots: EquipmentSlot[] = ["head", "chest", "hands", "legs", "feet", "weapon"];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Personnage de base */}
      <Image
        source={{
          uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663619789233/jJUmEzTwYt7UYT9DbPShs5/pixel-character-base-GQmK4MvgUovtMwkzEM8HZB.webp",
        }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />

      {/* Équipements superposés en pixel art */}
      {slots.map((slot) => {
        const item = equippedItems[slot];
        if (!item) return null;

        const grid = ITEM_PIXEL_ART[item.id];
        if (!grid) return null;

        const pos = getSlotPosition(slot, size);
        const pixelSize = getPixelSize(slot, size);

        return (
          <View
            key={slot}
            style={[styles.overlay, { top: pos.top, left: pos.left }]}
          >
            <PixelArt grid={grid} pixelSize={pixelSize} />
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
  overlay: {
    position: "absolute",
  },
});
