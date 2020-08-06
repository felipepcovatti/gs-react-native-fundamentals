import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    setProducts(prevState => {
      const productInCartIndex = prevState.findIndex(
        existingProduct => existingProduct.id === product.id,
      );

      if (productInCartIndex < 0) {
        return [...prevState, { ...product, quantity: 1 }];
      }

      return prevState.map(existingProduct => ({
        ...existingProduct,
        quantity:
          +(product.id === existingProduct.id) + existingProduct.quantity,
      }));
    });
  }, []);

  const increment = useCallback(
    async id => {
      const updatedProducts = products.map(product => ({
        ...product,
        quantity: +(product.id === id) + product.quantity,
      }));

      setProducts(updatedProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(
        existingProduct => existingProduct.id === id,
      );

      const updatedProducts =
        product?.quantity === 1
          ? products.filter(existingProduct => existingProduct.id !== id)
          : products.map(existingProduct => ({
              ...existingProduct,
              quantity: -(existingProduct.id === id) + existingProduct.quantity,
            }));

      setProducts(updatedProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
