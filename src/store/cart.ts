import { create } from "zustand";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type AddToCartItem = Omit<CartItem, "quantity">;

interface CartState {
  items: CartItem[];
  addToCart: (newItem: AddToCartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addToCart: (newItem) => {
    set((state) => {
      const duplicateItems = [...state.items];

      const existingItemIndex = duplicateItems.findIndex(
        (item) => item.productId === newItem.productId,
      );

      if (existingItemIndex === -1) {
        duplicateItems.push({
          ...newItem,
          quantity: 1,
        });
      } else {
        const itemsToUpdate = duplicateItems[existingItemIndex];

        if (!itemsToUpdate) {
          return {
            ...state,
          };
        }

        itemsToUpdate.quantity += 1;
      }

      return {
        items: duplicateItems,
      };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      );

      return {
        items: updatedItems,
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const removedItems = state.items.filter(
        (item) => item.productId !== productId,
      );

      return {
        items: removedItems,
      };
    });
  },

  clearCart: () => {
    set((state) => {
      return {
        ...state,
        items: [],
      };
    });
  },
}));
