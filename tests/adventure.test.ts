import { describe, it, expect } from "vitest";
import { EQUIPMENT_CATALOG } from "../lib/adventure-context";

describe("Adventure System", () => {
  describe("Equipment Catalog", () => {
    it("should have equipment items", () => {
      expect(EQUIPMENT_CATALOG.length).toBeGreaterThan(0);
    });

    it("should have helmets", () => {
      const helmets = EQUIPMENT_CATALOG.filter((e) => e.slot === "head");
      expect(helmets.length).toBeGreaterThan(0);
    });

    it("should have chest armor", () => {
      const chest = EQUIPMENT_CATALOG.filter((e) => e.slot === "chest");
      expect(chest.length).toBeGreaterThan(0);
    });

    it("should have weapons", () => {
      const weapons = EQUIPMENT_CATALOG.filter((e) => e.slot === "weapon");
      expect(weapons.length).toBeGreaterThan(0);
    });

    it("should have valid rarity levels", () => {
      const validRarities = [
        "common",
        "uncommon",
        "rare",
        "epic",
        "legendary",
      ];
      for (const item of EQUIPMENT_CATALOG) {
        expect(validRarities).toContain(item.rarity);
      }
    });

    it("should have positive costs", () => {
      for (const item of EQUIPMENT_CATALOG) {
        expect(item.cost).toBeGreaterThan(0);
      }
    });

    it("should have unique IDs", () => {
      const ids = EQUIPMENT_CATALOG.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have items for all slots", () => {
      const slots = ["head", "chest", "hands", "legs", "feet", "weapon"];
      for (const slot of slots) {
        const itemsForSlot = EQUIPMENT_CATALOG.filter((e) => e.slot === slot);
        expect(itemsForSlot.length).toBeGreaterThan(0);
      }
    });

    it("should have legendary items", () => {
      const legendary = EQUIPMENT_CATALOG.filter((e) => e.rarity === "legendary");
      expect(legendary.length).toBeGreaterThan(0);
    });

    it("should have common items cheaper than rare", () => {
      const common = EQUIPMENT_CATALOG.filter((e) => e.rarity === "common");
      const rare = EQUIPMENT_CATALOG.filter((e) => e.rarity === "rare");

      const avgCommonCost =
        common.reduce((sum, e) => sum + e.cost, 0) / common.length;
      const avgRareCost =
        rare.reduce((sum, e) => sum + e.cost, 0) / rare.length;

      expect(avgCommonCost).toBeLessThan(avgRareCost);
    });

    it("should have level progression", () => {
      const common = EQUIPMENT_CATALOG.filter((e) => e.rarity === "common");
      const legendary = EQUIPMENT_CATALOG.filter(
        (e) => e.rarity === "legendary"
      );

      const avgCommonLevel =
        common.reduce((sum, e) => sum + e.level, 0) / common.length;
      const avgLegendaryLevel =
        legendary.reduce((sum, e) => sum + e.level, 0) / legendary.length;

      expect(avgCommonLevel).toBeLessThan(avgLegendaryLevel);
    });
  });
});
