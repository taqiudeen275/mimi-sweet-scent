"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productType: "PERFUME" | "JEWELRY";
  variantLabel: string;
  price: number; // pesewas
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "UPDATE_QTY"; variantId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items };
    case "ADD_ITEM": {
      const existing = state.items.find(i => i.variantId === action.item.variantId);
      const items = existing
        ? state.items.map(i =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          )
        : [...state.items, action.item];
      return { ...state, items, drawerOpen: true };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.variantId !== action.variantId) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: action.quantity <= 0
          ? state.items.filter(i => i.variantId !== action.variantId)
          : state.items.map(i =>
              i.variantId === action.variantId ? { ...i, quantity: action.quantity } : i
            ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN_DRAWER":
      return { ...state, drawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, drawerOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  drawerOpen: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "mimi_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], drawerOpen: false });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "HYDRATE", items: JSON.parse(stored) });
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items, hydrated]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        drawerOpen: state.drawerOpen,
        totalItems,
        subtotal,
        addItem: item => dispatch({ type: "ADD_ITEM", item }),
        removeItem: id => dispatch({ type: "REMOVE_ITEM", variantId: id }),
        updateQty: (id, qty) => dispatch({ type: "UPDATE_QTY", variantId: id, quantity: qty }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
        closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
