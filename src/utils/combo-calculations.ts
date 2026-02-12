/**
 * Dedicated combo calculation logic
 * Handles protein quantities vs sides/toppings differently
 */

export interface ComboSelectionWithQuantity {
  itemId: string;
  itemName: string;
  additionalPrice?: number;
  quantity?: number; // For proteins only
  price?: number; // Price for each item
}

export interface ComboCalculationResult {
  basePrice: number;
  proteinCosts: number;
  additionalCosts: number;
  totalPrice: number;
  totalCombosOrdered: number;
  breakdown: {
    category: string;
    items: Array<{
      name: string;
      quantity?: number;
      unitPrice: number;
      totalPrice: number;
      isProtein: boolean;
    }>;
  }[];
}

// Categories that should have quantity controls
const PROTEIN_CATEGORIES = [
  'protein', 'proteins', 'protien', 'protiens', // Include common typo
  'meat', 'meats', 
  'main', 'mains', 'main dish', 'main dishes',
  'entree', 'entrees', 'entrée', 'entrées',
  'main protein', 'main proteins'
];

export const isProteinCategory = (categoryName: string): boolean => {
  // Normalize: lowercase, trim, normalize unicode, fix common typos
  let normalizedName = categoryName.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  
  // Fix common typo: protien -> protein
  normalizedName = normalizedName.replace(/protien/g, 'protein');
  
  return PROTEIN_CATEGORIES.some(protein => 
    normalizedName.includes(protein) || 
    normalizedName === protein
  );
};

// Get category behavior (explicit or inferred from name)
export const getCategoryBehavior = (category: {
  name: string;
  selectionBehavior?: 'quantity' | 'choice';
}): { isProtein: boolean } => {
  // If explicit behavior is set, use it
  if (category.selectionBehavior) {
    return { isProtein: category.selectionBehavior === 'quantity' };
  }
  
  // Fallback to name-based heuristic
  return { isProtein: isProteinCategory(category.name) };
};

export const calculateComboTotal = (
  basePrice: number,
  categorySelections: Array<{
    categoryId: string;
    categoryName: string;
    selectedItems: ComboSelectionWithQuantity[];
  }>,
  headcount: number = 1
): ComboCalculationResult => {
  let proteinCosts = 0;
  let additionalCosts = 0;
  const breakdown: ComboCalculationResult['breakdown'] = [];

  // Calculate total protein quantity first
  let totalProteinQuantity = 0;
  categorySelections.forEach(category => {
    if (getCategoryBehavior({ name: category.categoryName }).isProtein) {
      category.selectedItems.forEach(item => {
        totalProteinQuantity += item.quantity || 0;
      });
    }
  });

  // Adjust base price by total protein quantity (total combos ordered)
  const adjustedBasePrice = basePrice * totalProteinQuantity;

  categorySelections.forEach(category => {
    const isProtein = getCategoryBehavior({ name: category.categoryName }).isProtein;
    const categoryBreakdown = {
      category: category.categoryName,
      items: [] as ComboCalculationResult['breakdown'][0]['items']
    };

    category.selectedItems.forEach(item => {
      const unitPrice = item.additionalPrice || 0;
      let totalItemPrice = 0;

      if (isProtein && item.quantity) {
        // For proteins: price per quantity specified
        totalItemPrice = unitPrice * item.quantity;
        proteinCosts += totalItemPrice;
      } else {
        // For sides/toppings: price based on headcount (if any additional cost)
        totalItemPrice = unitPrice * headcount;
        additionalCosts += totalItemPrice;
      }

      categoryBreakdown.items.push({
        name: item.itemName,
        quantity: isProtein ? item.quantity : headcount,
        unitPrice,
        totalPrice: totalItemPrice,
        isProtein
      });
    });

    breakdown.push(categoryBreakdown);
  });

  const totalPrice = adjustedBasePrice + proteinCosts + additionalCosts;

  return {
    basePrice: adjustedBasePrice,
    proteinCosts,
    additionalCosts,
    totalPrice,
    totalCombosOrdered: totalProteinQuantity,
    breakdown
  };
};

// Helper to convert combo calculations back to standard service selection format
export const convertComboToServiceSelection = (
  comboId: string,
  comboName: string,
  calculation: ComboCalculationResult,
  headcount: number
) => {
  return {
    id: comboId,
    name: comboName,
    price: calculation.totalPrice,
    quantity: 1, // Combo is always quantity 1, internal calculations handle the rest
    basePrice: calculation.basePrice,
    comboBreakdown: calculation.breakdown,
    headcount
  };
};