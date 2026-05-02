import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Equipment, EquipmentSlot } from "@/lib/adventure-context";

interface PixelCharacterProps {
  equippedItems: Record<EquipmentSlot, Equipment | null>;
  size?: number;
}

type PixelGrid = (string | null)[][];

function PixelArt({ grid, pixelSize }: { grid: PixelGrid; pixelSize: number }) {
  return (
    <View style={{ flexDirection: "column" }}>
      {grid.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((color, c) =>
            color ? (
              <View key={c} style={{ width: pixelSize, height: pixelSize, backgroundColor: color }} />
            ) : (
              <View key={c} style={{ width: pixelSize, height: pixelSize }} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

// ─── TÊTES ────────────────────────────────────────────────────────────────────

// Casque en Cuir — forme arrondie, teintes brunes chaudes
const HELM_LEATHER: PixelGrid = [
  [null, null,"#6B3A1F","#7C4A2A","#7C4A2A","#7C4A2A","#6B3A1F", null],
  [null,"#6B3A1F","#8C5A35","#9C6A40","#9C6A40","#9C6A40","#8C5A35","#6B3A1F"],
  ["#5A2E10","#7C4A2A","#9C6A40","#B07848","#B07848","#9C6A40","#7C4A2A","#5A2E10"],
  ["#5A2E10","#7C4A2A","#8C5A35","#9C6A40","#9C6A40","#8C5A35","#7C4A2A","#5A2E10"],
  ["#4A2008","#6B3A1F","#7C4A2A","#7C4A2A","#7C4A2A","#7C4A2A","#6B3A1F","#4A2008"],
  [null,"#4A2008","#5A2E10","#6B3A1F","#6B3A1F","#5A2E10","#4A2008", null],
];

// Casque en Fer — forme plus angulaire, métal gris avec reflets
const HELM_IRON: PixelGrid = [
  [null, null,"#777","#888","#888","#888","#777", null],
  [null,"#666","#999","#AAA","#AAA","#AAA","#999","#666"],
  ["#555","#888","#BBB","#CCC","#CCC","#BBB","#888","#555"],
  ["#555","#888","#AAA","#BBB","#BBB","#AAA","#888","#555"],
  ["#555","#888","#999","#AAA","#AAA","#999","#888","#555"],
  ["#444","#666","#777","#888","#888","#777","#666","#444"],
  [null,"#333","#444","#555","#555","#444","#333", null],
];

// Casque en Acier — plus élaboré, acier poli avec visière et panache
const HELM_STEEL: PixelGrid = [
  [null, null,"#778","#99A","#99A","#99A","#778", null],
  [null,"#667","#AAB","#BBC","#BBC","#BBC","#AAB","#667"],
  ["#556","#889","#CCD","#DDE","#DDE","#CCD","#889","#556"],
  ["#556","#889","#BBC","#CCD","#CCD","#BBC","#889","#556"],
  ["#334","#667","#889","#99A","#99A","#889","#667","#334"],
  ["#334","#556","#334","#778","#778","#334","#556","#334"],
  [null,"#223","#334","#445","#445","#334","#223", null],
];

// Casque de Dragon — cornes rouges, écailles sombres
const HELM_DRAGON: PixelGrid = [
  ["#8B0000", null, null, null, null, null, null,"#8B0000"],
  ["#A00","#8B0000", null, null, null, null,"#8B0000","#A00"],
  ["#C00","#A00","#8B0000","#6B0000","#6B0000","#8B0000","#A00","#C00"],
  [null,"#B00","#D00","#E00","#E00","#D00","#B00", null],
  [null,"#A00","#C00","#D00","#D00","#C00","#A00", null],
  [null,"#900","#B00","#C00","#C00","#B00","#900", null],
  [null,"#800","#900","#A00","#A00","#900","#800", null],
  [null, null,"#600","#800","#800","#600", null, null],
];

// ─── TORSES ───────────────────────────────────────────────────────────────────

// Armure en Cuir — rectangulaire, lanières brunes visibles
const CHEST_LEATHER: PixelGrid = [
  [null,"#6B3A1F","#7C4A2A","#7C4A2A","#7C4A2A","#7C4A2A","#6B3A1F", null],
  ["#5A2E10","#8C5A35","#9C6A40","#B07848","#B07848","#9C6A40","#8C5A35","#5A2E10"],
  ["#5A2E10","#9C6A40","#6B3A1F","#9C6A40","#9C6A40","#6B3A1F","#9C6A40","#5A2E10"],
  ["#4A2008","#8C5A35","#9C6A40","#8C5A35","#8C5A35","#9C6A40","#8C5A35","#4A2008"],
  ["#4A2008","#7C4A2A","#8C5A35","#9C6A40","#9C6A40","#8C5A35","#7C4A2A","#4A2008"],
  ["#3A1800","#6B3A1F","#7C4A2A","#8C5A35","#8C5A35","#7C4A2A","#6B3A1F","#3A1800"],
  [null,"#4A2008","#5A2E10","#6B3A1F","#6B3A1F","#5A2E10","#4A2008", null],
];

// Armure en Fer — plaques métalliques, jointures visibles
const CHEST_IRON: PixelGrid = [
  [null,"#666","#888","#888","#888","#888","#666", null],
  ["#555","#999","#AAA","#BBB","#BBB","#AAA","#999","#555"],
  ["#555","#AAA","#555","#BBB","#BBB","#555","#AAA","#555"],
  ["#444","#888","#AAA","#999","#999","#AAA","#888","#444"],
  ["#444","#888","#999","#AAA","#AAA","#999","#888","#444"],
  ["#333","#777","#888","#999","#999","#888","#777","#333"],
  [null,"#444","#555","#666","#666","#555","#444", null],
];

// Armure en Acier — acier bleui, plus élaborée avec ornements
const CHEST_STEEL: PixelGrid = [
  [null,"#556","#778","#889","#889","#778","#556", null],
  ["#445","#889","#99A","#AAB","#AAB","#99A","#889","#445"],
  ["#445","#99A","#445","#AAB","#AAB","#445","#99A","#445"],
  ["#334","#778","#99A","#889","#889","#99A","#778","#334"],
  ["#334","#778","#889","#99A","#99A","#889","#778","#334"],
  ["#223","#667","#778","#889","#889","#778","#667","#223"],
  [null,"#334","#445","#556","#556","#445","#334", null],
];

// Armure de Mithril — argentée brillante avec teintes bleutées magiques
const CHEST_MITHRIL: PixelGrid = [
  [null,"#8AF","#ADF","#BEF","#BEF","#ADF","#8AF", null],
  ["#79E","#ADF","#CEF","#DFF","#DFF","#CEF","#ADF","#79E"],
  ["#79E","#CEF","#79E","#DFF","#DFF","#79E","#CEF","#79E"],
  ["#68D","#ADF","#CEF","#ADF","#ADF","#CEF","#ADF","#68D"],
  ["#68D","#9CE","#ADF","#BEF","#BEF","#ADF","#9CE","#68D"],
  ["#57C","#8BD","#9CE","#ADF","#ADF","#9CE","#8BD","#57C"],
  [null,"#68D","#79E","#8AF","#8AF","#79E","#68D", null],
];

// ─── MAINS ────────────────────────────────────────────────────────────────────

// Gants en Cuir — simples, couvrent les doigts
const HANDS_LEATHER: PixelGrid = [
  ["#6B3A1F","#7C4A2A","#7C4A2A","#6B3A1F"],
  ["#7C4A2A","#9C6A40","#9C6A40","#7C4A2A"],
  ["#6B3A1F","#8C5A35","#8C5A35","#6B3A1F"],
  ["#5A2E10","#7C4A2A","#7C4A2A","#5A2E10"],
];

// Gants en Fer — doigts articulés métalliques
const HANDS_IRON: PixelGrid = [
  ["#666","#888","#888","#666"],
  ["#777","#AAA","#AAA","#777"],
  ["#555","#888","#888","#555"],
  ["#444","#666","#666","#444"],
];

// Gants en Acier — plaques d'acier, reflets bleutés
const HANDS_STEEL: PixelGrid = [
  ["#556","#778","#778","#556"],
  ["#667","#99A","#99A","#667"],
  ["#445","#778","#778","#445"],
  ["#334","#556","#556","#334"],
];

// ─── JAMBES ───────────────────────────────────────────────────────────────────

// Jambières en Cuir — deux panneaux bruns, ceinture centrale
const LEGS_LEATHER: PixelGrid = [
  ["#7C4A2A","#8C5A35", null, null,"#8C5A35","#7C4A2A"],
  ["#8C5A35","#9C6A40", null, null,"#9C6A40","#8C5A35"],
  ["#7C4A2A","#8C5A35", null, null,"#8C5A35","#7C4A2A"],
  ["#6B3A1F","#7C4A2A", null, null,"#7C4A2A","#6B3A1F"],
  ["#6B3A1F","#7C4A2A", null, null,"#7C4A2A","#6B3A1F"],
  ["#5A2E10","#6B3A1F", null, null,"#6B3A1F","#5A2E10"],
];

// Jambières en Fer — plaques de métal sur chaque jambe
const LEGS_IRON: PixelGrid = [
  ["#888","#999", null, null,"#999","#888"],
  ["#999","#BBB", null, null,"#BBB","#999"],
  ["#777","#AAA", null, null,"#AAA","#777"],
  ["#666","#888", null, null,"#888","#666"],
  ["#666","#888", null, null,"#888","#666"],
  ["#555","#777", null, null,"#777","#555"],
];

// Jambières en Acier — plaques bleues, plus épaisses
const LEGS_STEEL: PixelGrid = [
  ["#778","#889", null, null,"#889","#778"],
  ["#889","#AAB", null, null,"#AAB","#889"],
  ["#667","#99A", null, null,"#99A","#667"],
  ["#556","#778", null, null,"#778","#556"],
  ["#556","#778", null, null,"#778","#556"],
  ["#445","#667", null, null,"#667","#445"],
];

// ─── PIEDS ────────────────────────────────────────────────────────────────────

// Bottes en Cuir — semelle sombre, tige brune
const FEET_LEATHER: PixelGrid = [
  ["#6B3A1F","#7C4A2A", null, null,"#7C4A2A","#6B3A1F"],
  ["#7C4A2A","#9C6A40","#8C5A35","#8C5A35","#9C6A40","#7C4A2A"],
  ["#6B3A1F","#8C5A35","#9C6A40","#9C6A40","#8C5A35","#6B3A1F"],
  ["#3A1800","#4A2008","#5A2E10","#5A2E10","#4A2008","#3A1800"],
];

// Bottes en Fer — métal rigide, rivets visibles
const FEET_IRON: PixelGrid = [
  ["#666","#777", null, null,"#777","#666"],
  ["#777","#999","#888","#888","#999","#777"],
  ["#555","#888","#AAA","#AAA","#888","#555"],
  ["#333","#444","#555","#555","#444","#333"],
];

// Bottes en Acier — acier bleui poli
const FEET_STEEL: PixelGrid = [
  ["#556","#667", null, null,"#667","#556"],
  ["#667","#889","#778","#778","#889","#667"],
  ["#445","#778","#99A","#99A","#778","#445"],
  ["#223","#334","#445","#445","#334","#223"],
];

// ─── ARMES ────────────────────────────────────────────────────────────────────

// Poignard — lame courte, garde simple
const WEAPON_DAGGER: PixelGrid = [
  [null,"#DDD","#CCC", null],
  [null,"#EEE","#BBB", null],
  [null,"#EEE","#BBB", null],
  ["#AAA","#FFF","#AAA","#AAA"],
  [null,"#8B6914","#7A5800", null],
  [null,"#7A5800","#6A4800", null],
];

// Épée — lame plus longue, garde croisée dorée
const WEAPON_SWORD: PixelGrid = [
  [null,"#DDD","#CCC", null],
  [null,"#EEE","#BBB", null],
  [null,"#EEE","#BBB", null],
  [null,"#EEE","#BBB", null],
  [null,"#EEE","#BBB", null],
  [null,"#DDD","#BBB", null],
  ["#DAA520","#FFD700","#DAA520","#DAA520"],
  [null,"#9B7318","#8B6000", null],
  [null,"#8B6000","#7A5000", null],
  [null,"#7A5000","#6A4000", null],
];

// Grande Épée — lame large et longue, garde imposante
const WEAPON_GREATSWORD: PixelGrid = [
  [null,"#CCC","#DDD","#CCC", null],
  [null,"#DDD","#EEE","#DDD", null],
  [null,"#DDD","#EEE","#DDD", null],
  [null,"#CCC","#EEE","#CCC", null],
  [null,"#CCC","#DDD","#CCC", null],
  [null,"#BBB","#DDD","#BBB", null],
  [null,"#BBB","#CCC","#BBB", null],
  ["#999","#DAA520","#FFD700","#DAA520","#999"],
  [null,"#AAA","#B8860B","#AAA", null],
  [null,"#999","#9B7318","#999", null],
  [null,"#888","#8B6000","#888", null],
  [null, null,"#7A5000", null, null],
];

// Excalibur — lame légendaire dorée avec gemme bleue
const WEAPON_EXCALIBUR: PixelGrid = [
  [null,"#FFE040","#FFD700", null],
  [null,"#FFF080","#FFE040", null],
  [null,"#FFF080","#FFE040", null],
  [null,"#FFE040","#FFD700", null],
  [null,"#FFD700","#DAA520", null],
  [null,"#FFD700","#DAA520", null],
  [null,"#FFE040","#FFD700", null],
  ["#DAA520","#FFF","#4A90D9","#DAA520"],  // gemme bleue au centre
  [null,"#B8860B","#DAA520", null],
  [null,"#996515","#B8860B", null],
  [null,"#7A5000","#996515", null],
  [null,"#5A3800","#7A5000", null],
];

// ─── Map item id → grille ─────────────────────────────────────────────────────

const ITEM_PIXEL_ART: Record<string, PixelGrid> = {
  helm_leather:     HELM_LEATHER,
  helm_iron:        HELM_IRON,
  helm_steel:       HELM_STEEL,
  helm_dragon:      HELM_DRAGON,
  chest_leather:    CHEST_LEATHER,
  chest_iron:       CHEST_IRON,
  chest_steel:      CHEST_STEEL,
  chest_mithril:    CHEST_MITHRIL,
  hands_leather:    HANDS_LEATHER,
  hands_iron:       HANDS_IRON,
  hands_steel:      HANDS_STEEL,
  legs_leather:     LEGS_LEATHER,
  legs_iron:        LEGS_IRON,
  legs_steel:       LEGS_STEEL,
  feet_leather:     FEET_LEATHER,
  feet_iron:        FEET_IRON,
  feet_steel:       FEET_STEEL,
  weapon_dagger:    WEAPON_DAGGER,
  weapon_sword:     WEAPON_SWORD,
  weapon_greatsword:WEAPON_GREATSWORD,
  weapon_excalibur: WEAPON_EXCALIBUR,
};

// ─── Positions & taille des pixels ───────────────────────────────────────────

function getSlotPosition(slot: EquipmentSlot, size: number): { top: number; left: number } {
  const s = size / 200;
  switch (slot) {
    case "head":   return { top: 10 * s,  left: 78 * s  };
    case "chest":  return { top: 78 * s,  left: 72 * s  };
    case "hands":  return { top: 90 * s,  left: 140 * s };
    case "legs":   return { top: 118 * s, left: 68 * s  };
    case "feet":   return { top: 158 * s, left: 65 * s  };
    case "weapon": return { top: 75 * s,  left: 28 * s  };
  }
}

function getPixelSize(slot: EquipmentSlot, size: number): number {
  const s = size / 200;
  switch (slot) {
    case "head":   return Math.max(2, Math.round(4.5 * s));
    case "chest":  return Math.max(2, Math.round(4 * s));
    case "weapon": return Math.max(2, Math.round(4 * s));
    case "legs":   return Math.max(2, Math.round(4 * s));
    case "feet":   return Math.max(2, Math.round(3.5 * s));
    case "hands":  return Math.max(2, Math.round(3.5 * s));
    default:       return Math.max(2, Math.round(4 * s));
  }
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function PixelCharacter({ equippedItems, size = 200 }: PixelCharacterProps) {
  const slots: EquipmentSlot[] = ["weapon", "chest", "legs", "feet", "hands", "head"];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{
          uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663619789233/jJUmEzTwYt7UYT9DbPShs5/pixel-character-base-GQmK4MvgUovtMwkzEM8HZB.webp",
        }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {slots.map((slot) => {
        const item = equippedItems[slot];
        if (!item) return null;
        const grid = ITEM_PIXEL_ART[item.id];
        if (!grid) return null;
        const pos = getSlotPosition(slot, size);
        const pixelSize = getPixelSize(slot, size);
        return (
          <View key={slot} style={[styles.overlay, { top: pos.top, left: pos.left }]}>
            <PixelArt grid={grid} pixelSize={pixelSize} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative" },
  overlay:   { position: "absolute" },
});