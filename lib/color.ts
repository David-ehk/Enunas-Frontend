// lib/colors.ts

export interface Color {
    id: string;
    name: string;
    hex: string;
    sku?: string; // Optional: SKU für diese Farbe
  }
  
  // Alle verfügbaren Farben müssen überarbeitet werden
  export const AVAILABLE_COLORS: Color[] = [
    { id: "black", name: "Black", hex: "#000000" },
    { id: "brown", name: "Brown", hex: "#8B4513" },
    { id: "grey", name: "Grey", hex: "#E8E0D5" },
    { id: "purple", name: "Purple", hex: "#C19A6B" },
    { id: "white", name: "White", hex: "#FFFFFF" },
    { id: "colourful", name: "Muli Color", hex: "#8B0000" },
    { id: "beige", name: " Beige", hex: "#B8A78F" },
    { id: "pink", name: " Pink", hex: "#FFE4E1" },
    { id: "red", name: "Red", hex: "#FF0000" },
    { id: "green", name: "Green", hex: "#00FF00" },
    { id: "blue", name: "Blue", hex: "#00FF00" },
  ];
  
  // Helper-Funktion: Farbe anhand ID finden
  export const getColorById = (id: string): Color | undefined => {
    return AVAILABLE_COLORS.find(color => color.id === id);
  };
  
  // Helper-Funktion: Farben für ein bestimmtes Produkt
  export const getProductColors = (colorIds: string[]): Color[] => {
    return colorIds
      .map(id => getColorById(id))
      .filter((color): color is Color => color !== undefined);
  };