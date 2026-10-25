import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppliedPromo, Product } from '../types/models';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscount: (productId: string, quantity: number) => number;
  /** Code promo validé au panier, transmis à la commande par le checkout */
  promo: AppliedPromo | null;
  setPromo: (promo: AppliedPromo | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sma_cart';
const PROMO_STORAGE_KEY = 'sma_cart_promo';

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStored(CART_STORAGE_KEY, []));
  const [promo, setPromo] = useState<AppliedPromo | null>(() => readStored(PROMO_STORAGE_KEY, null));

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promo) localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promo));
    else localStorage.removeItem(PROMO_STORAGE_KEY);
  }, [promo]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      
      return [...prevItems, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromo(null);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const discount = getDiscount(item.product.id, item.quantity);
      const discountedPrice = item.product.price * (1 - discount / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  const getDiscount = (productId: string, quantity: number) => {
    const item = items.find(i => i.product.id === productId);
    if (!item) return 0;

    const applicable = item.product.volumeDiscounts
      .filter(d => quantity >= d.quantity)
      .sort((a, b) => b.discount - a.discount);
    
    return applicable.length > 0 ? applicable[0].discount : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        getDiscount,
        promo,
        setPromo,
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