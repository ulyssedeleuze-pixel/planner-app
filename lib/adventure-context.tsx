import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type EquipmentSlot = "head" | "chest" | "hands" | "legs" | "feet" | "weapon";

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  cost: number;
  description: string;
  icon: string; // emoji or color
  level: number;
}

export interface PlayerEquipment {
  slot: EquipmentSlot;
  equipment: Equipment | null;
}

export interface AdventureState {
  coins: number;
  equippedItems: Record<EquipmentSlot, Equipment | null>;
  inventory: Equipment[];
  totalTasksCompleted: number;
  level: number;
}

interface AdventureAction {
  type:
    | "SET_COINS"
    | "ADD_COINS"
    | "BUY_EQUIPMENT"
    | "EQUIP_ITEM"
    | "UNEQUIP_ITEM"
    | "INCREMENT_TASKS"
    | "SET_STATE";
  payload?: any;
}

const INITIAL_STATE: AdventureState = {
  coins: 0,
  equippedItems: {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
    weapon: null,
  },
  inventory: [],
  totalTasksCompleted: 0,
  level: 1,
};

// Equipment shop catalog
export const EQUIPMENT_CATALOG: Equipment[] = [
  // Helmets
  {
    id: "helm_leather",
    name: "Casque en Cuir",
    slot: "head",
    rarity: "common",
    cost: 50,
    description: "Un casque en cuir basique",
    icon: "🎩",
    level: 1,
  },
  {
    id: "helm_iron",
    name: "Casque en Fer",
    slot: "head",
    rarity: "uncommon",
    cost: 150,
    description: "Un casque en fer renforcé",
    icon: "⚔️",
    level: 5,
  },
  {
    id: "helm_steel",
    name: "Casque en Acier",
    slot: "head",
    rarity: "rare",
    cost: 400,
    description: "Un casque en acier brillant",
    icon: "👑",
    level: 10,
  },
  {
    id: "helm_dragon",
    name: "Casque de Dragon",
    slot: "head",
    rarity: "epic",
    cost: 1000,
    description: "Casque forgé avec des écailles de dragon",
    icon: "🐉",
    level: 20,
  },

  // Chest armor
  {
    id: "chest_leather",
    name: "Armure en Cuir",
    slot: "chest",
    rarity: "common",
    cost: 75,
    description: "Une armure en cuir simple",
    icon: "🦺",
    level: 1,
  },
  {
    id: "chest_iron",
    name: "Armure en Fer",
    slot: "chest",
    rarity: "uncommon",
    cost: 200,
    description: "Une armure en fer solide",
    icon: "🛡️",
    level: 5,
  },
  {
    id: "chest_steel",
    name: "Armure en Acier",
    slot: "chest",
    rarity: "rare",
    cost: 500,
    description: "Une armure en acier de haute qualité",
    icon: "⚒️",
    level: 10,
  },
  {
    id: "chest_mithril",
    name: "Armure de Mithril",
    slot: "chest",
    rarity: "epic",
    cost: 1200,
    description: "Armure légendaire en mithril",
    icon: "✨",
    level: 20,
  },

  // Hands
  {
    id: "hands_leather",
    name: "Gants en Cuir",
    slot: "hands",
    rarity: "common",
    cost: 40,
    description: "Des gants en cuir simples",
    icon: "🧤",
    level: 1,
  },
  {
    id: "hands_iron",
    name: "Gants en Fer",
    slot: "hands",
    rarity: "uncommon",
    cost: 120,
    description: "Des gants en fer renforcés",
    icon: "👊",
    level: 5,
  },
  {
    id: "hands_steel",
    name: "Gants en Acier",
    slot: "hands",
    rarity: "rare",
    cost: 300,
    description: "Des gants en acier brillants",
    icon: "⚡",
    level: 10,
  },

  // Legs
  {
    id: "legs_leather",
    name: "Jambières en Cuir",
    slot: "legs",
    rarity: "common",
    cost: 50,
    description: "Des jambières en cuir",
    icon: "👖",
    level: 1,
  },
  {
    id: "legs_iron",
    name: "Jambières en Fer",
    slot: "legs",
    rarity: "uncommon",
    cost: 150,
    description: "Des jambières en fer",
    icon: "🔗",
    level: 5,
  },
  {
    id: "legs_steel",
    name: "Jambières en Acier",
    slot: "legs",
    rarity: "rare",
    cost: 400,
    description: "Des jambières en acier",
    icon: "⚙️",
    level: 10,
  },

  // Feet
  {
    id: "feet_leather",
    name: "Bottes en Cuir",
    slot: "feet",
    rarity: "common",
    cost: 35,
    description: "Des bottes en cuir simples",
    icon: "👢",
    level: 1,
  },
  {
    id: "feet_iron",
    name: "Bottes en Fer",
    slot: "feet",
    rarity: "uncommon",
    cost: 100,
    description: "Des bottes en fer",
    icon: "🥾",
    level: 5,
  },
  {
    id: "feet_steel",
    name: "Bottes en Acier",
    slot: "feet",
    rarity: "rare",
    cost: 300,
    description: "Des bottes en acier",
    icon: "🔥",
    level: 10,
  },

  // Weapons
  {
    id: "weapon_dagger",
    name: "Poignard",
    slot: "weapon",
    rarity: "common",
    cost: 60,
    description: "Un poignard simple mais efficace",
    icon: "🗡️",
    level: 1,
  },
  {
    id: "weapon_sword",
    name: "Épée",
    slot: "weapon",
    rarity: "uncommon",
    cost: 200,
    description: "Une épée bien équilibrée",
    icon: "⚔️",
    level: 5,
  },
  {
    id: "weapon_greatsword",
    name: "Grande Épée",
    slot: "weapon",
    rarity: "rare",
    cost: 500,
    description: "Une grande épée puissante",
    icon: "🗡️",
    level: 10,
  },
  {
    id: "weapon_excalibur",
    name: "Excalibur",
    slot: "weapon",
    rarity: "legendary",
    cost: 2000,
    description: "L'épée légendaire elle-même",
    icon: "✨",
    level: 30,
  },
];

function adventureReducer(state: AdventureState, action: AdventureAction): AdventureState {
  switch (action.type) {
    case "SET_COINS":
      return { ...state, coins: action.payload };
    case "ADD_COINS":
      return { ...state, coins: state.coins + action.payload };
    case "BUY_EQUIPMENT": {
      const equipment = action.payload as Equipment;
      if (state.coins < equipment.cost) return state;
      return {
        ...state,
        coins: state.coins - equipment.cost,
        inventory: [...state.inventory, equipment],
      };
    }
    case "EQUIP_ITEM": {
      const equipment = action.payload as Equipment;
      return {
        ...state,
        equippedItems: {
          ...state.equippedItems,
          [equipment.slot]: equipment,
        },
      };
    }
    case "UNEQUIP_ITEM": {
      const slot = action.payload as EquipmentSlot;
      return {
        ...state,
        equippedItems: {
          ...state.equippedItems,
          [slot]: null,
        },
      };
    }
    case "INCREMENT_TASKS": {
      const newLevel = Math.floor(state.totalTasksCompleted / 5) + 1;
      return {
        ...state,
        totalTasksCompleted: state.totalTasksCompleted + 1,
        level: newLevel,
        coins: state.coins + 10, // 10 pièces par tâche complétée
      };
    }
    case "SET_STATE":
      return action.payload;
    default:
      return state;
  }
}

interface AdventureContextType {
  state: AdventureState;
  buyEquipment: (equipment: Equipment) => void;
  equipItem: (equipment: Equipment) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  addCoins: (amount: number) => void;
  completeTask: () => void;
  getInventoryForSlot: (slot: EquipmentSlot) => Equipment[];
}

const AdventureContext = createContext<AdventureContextType | undefined>(undefined);

export function AdventureProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adventureReducer, INITIAL_STATE);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem("adventure_state");
        if (saved) {
          dispatch({ type: "SET_STATE", payload: JSON.parse(saved) });
        }
      } catch (error) {
        console.error("Failed to load adventure state:", error);
      }
    };
    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem("adventure_state", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save adventure state:", error);
      }
    };
    saveState();
  }, [state]);

  const buyEquipment = useCallback((equipment: Equipment) => {
    dispatch({ type: "BUY_EQUIPMENT", payload: equipment });
  }, []);

  const equipItem = useCallback((equipment: Equipment) => {
    dispatch({ type: "EQUIP_ITEM", payload: equipment });
  }, []);

  const unequipItem = useCallback((slot: EquipmentSlot) => {
    dispatch({ type: "UNEQUIP_ITEM", payload: slot });
  }, []);

  const addCoins = useCallback((amount: number) => {
    dispatch({ type: "ADD_COINS", payload: amount });
  }, []);

  const completeTask = useCallback(() => {
    dispatch({ type: "INCREMENT_TASKS" });
  }, []);

  const getInventoryForSlot = useCallback(
    (slot: EquipmentSlot) => {
      return state.inventory.filter((item) => item.slot === slot);
    },
    [state.inventory]
  );

  return (
    <AdventureContext.Provider
      value={{
        state,
        buyEquipment,
        equipItem,
        unequipItem,
        addCoins,
        completeTask,
        getInventoryForSlot,
      }}
    >
      {children}
    </AdventureContext.Provider>
  );
}

export function useAdventure() {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error("useAdventure must be used within AdventureProvider");
  }
  return context;
}
