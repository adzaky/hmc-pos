export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export const CATEGORIES: Category[] = [
  { id: "all", name: "All", productCount: 48 },
  { id: "drinks", name: "Drinks", productCount: 15 },
  { id: "snacks", name: "Snacks", productCount: 12 },
  { id: "bakery", name: "Bakery", productCount: 8 },
  { id: "desserts", name: "Desserts", productCount: 13 },
  { id: "fast-food", name: "Fast Food", productCount: 10 },
  { id: "meals", name: "Meals", productCount: 7 },
  { id: "groceries", name: "Groceries", productCount: 20 },
  { id: "breakfast", name: "Breakfast", productCount: 5 },
  { id: "lunch", name: "Lunch", productCount: 9 },
];
