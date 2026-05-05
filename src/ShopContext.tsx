import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { catalogApi, cartApi, ordersApi } from './api';

export interface Product {
  id: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  status: string;
  image: string | null;
  hoverImage?: string | null;
  thirdImage?: string | null;
  fourthImage?: string | null;
  category: string;
  description: string;
  sizes: string[];
  flag?: string;
  nativeName?: string;
  stockQuantity: number;
}

const DEFAULT_IMAGE = "https://placehold.co/400x500/0f0f0f/c5a059?text=Sem+Imagem";

const mapBackendProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.base_price,
  promotionalPrice: p.promotional_price,
  status: p.status || 'normal',
  image: p.image_url || DEFAULT_IMAGE,
  hoverImage: p.hover_image_url || null,
  thirdImage: p.third_image_url || null,
  fourthImage: p.fourth_image_url || null,
  category: p.category || p.tags?.[0] || 'Equipamento',
  description: p.attributes?.description || p.name,
  sizes: p.attributes?.sizes || ["S", "M", "L", "XL"],
  flag: p.attributes?.flag,
  nativeName: p.attributes?.nativeName,
  stockQuantity: p.stock_quantity || 0
});

const mapBackendCartItem = (item: any) => ({
  ...item,
  product_id: item.product_id || item.productId || item.id,
  price_at_addition: item.price || item.price_at_addition || 0,
  product_name: item.product_name || 'Produto',
});

interface ShopContextType {
  products: Product[];
  mostSold: Product[];
  cart: any[];
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  cartTotal: number;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [mostSold, setMostSold] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const productData = await catalogApi.getProducts();
        setProducts(productData.items.map(mapBackendProduct));

        const mostSoldData = await catalogApi.getMostSold();
        setMostSold(Array.isArray(mostSoldData) ? mostSoldData.map(mapBackendProduct) : []);

        const cartData = await cartApi.getCart();
        setCart((cartData.items || []).map(mapBackendCartItem));
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price_at_addition * item.quantity), 0);
  }, [cart]);

  const addToCart = async (product: Product) => {
    try {
      const updatedCart = await cartApi.addItem(product.id, 1);
      if (updatedCart?.items) {
        setCart(updatedCart.items.map(mapBackendCartItem));
      } else {
        setCart(prev => {
          const existing = prev.find(i => i.product_id === product.id);
          if (existing) {
            return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, { product_id: product.id, product_name: product.name, quantity: 1, price_at_addition: product.promotionalPrice ?? product.price }];
        });
      }
      setIsCartOpen(true);
    } catch (err: any) {
      if (err.message?.includes("Insufficient stock")) {
        alert("Desculpe, este produto não tem stock suficiente.");
        return;
      }
      setCart(prev => {
        const existing = prev.find(i => i.product_id === product.id);
        if (existing) {
          return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { product_id: product.id, product_name: product.name, quantity: 1, price_at_addition: product.promotionalPrice ?? product.price }];
      });
      setIsCartOpen(true);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!productId) return;
    const previousCart = [...cart];
    setCart(prev => prev.filter(i => i.product_id !== productId));
    try {
      const updatedCart = await cartApi.removeItem(productId);
      if (updatedCart?.items) setCart(updatedCart.items.map(mapBackendCartItem));
      else if (updatedCart && Array.isArray(updatedCart)) setCart(updatedCart.map(mapBackendCartItem));
    } catch (err) {
      setCart(previousCart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!productId) return;
    if (quantity <= 0) return removeFromCart(productId);
    const previousCart = [...cart];
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity } : i));
    try {
      const updatedCart = await cartApi.updateItem(productId, quantity);
      if (updatedCart?.items) setCart(updatedCart.items.map(mapBackendCartItem));
      else if (updatedCart && Array.isArray(updatedCart)) setCart(updatedCart.map(mapBackendCartItem));
    } catch (err: any) {
      if (err.message?.includes("Insufficient stock")) alert("Desculpe, não há stock suficiente.");
      setCart(previousCart);
    }
  };

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ShopContext.Provider value={{ 
      products, mostSold, cart, isLoading, isCartOpen, setIsCartOpen, 
      addToCart, removeFromCart, updateQuantity, cartTotal, 
      selectedProduct, setSelectedProduct,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
