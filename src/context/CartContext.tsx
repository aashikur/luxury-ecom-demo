'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ============================================================================
 * LESSON: Zero-Login Guest Cart Context with LocalStorage Persistence
 * ============================================================================
 * 
 * Upgraded to Universal Multi-Niche E-Commerce:
 * Supports Regular Single-SKU products, Clothing Sizes, Gadget Multi-Axis Variants,
 * and Food/Service Modifiers without requiring strict `size` on items.
 */

export interface ICartItem {
  productId: string;
  variantId?: string;
  sku?: string;
  title: string;
  slug: string;
  image: string;
  size?: string;
  variantLabel?: string;
  attributes?: {
    key: string;
    value: string;
  }[];
  modifiers?: {
    label: string;
    priceDelta: number;
  }[];
  price: number;
  quantity: number;
}

export function getCartItemKey(item: {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  size?: string;
  modifiers?: { label: string }[];
}): string {
  const modKey = (item.modifiers || []).map((m) => m.label).sort().join('|');
  return [
    item.productId,
    item.variantId || '',
    item.variantLabel || item.size || '',
    modKey,
  ].join('::');
}

interface CartContextType {
  cart: ICartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<ICartItem, 'quantity'>, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, variantKeyOrSize?: string) => void;
  updateQuantity: (productId: string, variantKeyOrSize?: string, delta?: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Load cart from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('vf_guest_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load guest cart from localStorage:', e);
    }
  }, []);

  // 2. Persist cart changes to localStorage
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('vf_guest_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save guest cart to localStorage:', e);
      }
    }
  }, [cart, isMounted]);

  const addToCart = (
    item: Omit<ICartItem, 'quantity'>,
    quantity = 1,
    openDrawer = false
  ) => {
    setCart((prev) => {
      const itemKey = getCartItemKey(item);
      const existingIdx = prev.findIndex((i) => getCartItemKey(i) === itemKey);

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }

      return [...prev, { ...item, quantity }];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId: string, variantKeyOrSize = '') => {
    setCart((prev) =>
      prev.filter((item) => {
        const matchProduct = item.productId === productId;
        const matchKey =
          !variantKeyOrSize ||
          item.size === variantKeyOrSize ||
          item.variantLabel === variantKeyOrSize ||
          item.variantId === variantKeyOrSize ||
          getCartItemKey(item) === variantKeyOrSize;
        return !(matchProduct && matchKey);
      })
    );
  };

  const updateQuantity = (productId: string, variantKeyOrSize = '', delta = 1) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const matchProduct = item.productId === productId;
          const matchKey =
            !variantKeyOrSize ||
            item.size === variantKeyOrSize ||
            item.variantLabel === variantKeyOrSize ||
            item.variantId === variantKeyOrSize ||
            getCartItemKey(item) === variantKeyOrSize;

          if (matchProduct && matchKey) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as ICartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
