"use client";

import { createContext, useContext, useEffect, useReducer, useState, useCallback } from "react";

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
  maxStock: number; // live stock ceiling
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

function clampQty(qty: number, max: number) {
  return Math.min(Math.max(1, qty), max);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items };

    case "ADD_ITEM": {
      const existing = state.items.find(i => i.variantId === action.item.variantId);
      if (existing) {
        const newQty = clampQty(existing.quantity + action.item.quantity, action.item.maxStock);
        return {
          ...state,
          drawerOpen: true,
          items: state.items.map(i =>
            i.variantId === action.item.variantId ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return {
        ...state,
        drawerOpen: true,
        items: [...state.items, { ...action.item, quantity: clampQty(action.item.quantity, action.item.maxStock) }],
      };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.variantId !== action.variantId) };

    case "UPDATE_QTY": {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.variantId !== action.variantId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.variantId === action.variantId
            ? { ...i, quantity: clampQty(action.quantity, i.maxStock) }
            : i
        ),
      };
    }

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

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface CartContextValue {
  items: CartItem[];
  drawerOpen: boolean;
  totalItems: number;
  subtotal: number;
  toasts: Toast[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "mimi_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], drawerOpen: false });
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "HYDRATE", items: JSON.parse(stored) });
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items, hydrated]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", item });
    addToast(`${item.productName} added to bag`, "success");
  }, [addToast]);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        drawerOpen: state.drawerOpen,
        totalItems,
        subtotal,
        toasts,
        addItem,
        removeItem: id => dispatch({ type: "REMOVE_ITEM", variantId: id }),
        updateQty: (id, qty) => dispatch({ type: "UPDATE_QTY", variantId: id, quantity: qty }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
        closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
        addToast,
        dismissToast,
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
