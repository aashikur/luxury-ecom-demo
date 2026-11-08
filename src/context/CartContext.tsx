'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ============================================================================
 * LESSON: Zero-Login Guest Cart Context with LocalStorage Persistence
 * ============================================================================
 * 
 * WHY LOCALSTORAGE FOR GUEST CHECKOUT?
 * In Bangladesh e-commerce, forcing user registration drops conversion by 60%.
 * Storing the cart in localStorage gives customers a fast guest shopping bag 
 * that survives page refreshes and browser restarts without requiring an account.
 */

export interface ICartItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: ICartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<ICartItem, 'quantity'>, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
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
      const existingIdx = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );

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

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.size === size) {
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
