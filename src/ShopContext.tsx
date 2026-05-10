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
  subcategory: string;
  description: string;
  sizes: string[];
  size?: string;
  flag?: string;
  nativeName?: string;
  stockQuantity: number;
}

const DEFAULT_IMAGE = "https://placehold.co/400x500/0f0f0f/c5a059?text=Sem+Imagem";

const mapBackendProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.base_price !== undefined ? p.base_price : p.price || 0,
  promotionalPrice: p.promotional_price,
  status: p.status || 'normal',
  image: p.image_url || DEFAULT_IMAGE,
  hoverImage: p.hover_image_url || null,
  thirdImage: p.third_image_url || null,
  fourthImage: p.fourth_image_url || null,
  category: p.category || p.tags?.[0] || 'Equipamento',
  subcategory: p.subcategory || '',
  description: p.attributes?.description || p.name,
  sizes: p.attributes?.sizes || ["S", "M", "L", "XL"],
  flag: p.attributes?.flag,
  nativeName: p.attributes?.nativeName,
  stockQuantity: p.stock_quantity || 0
});

const mapBackendCartItem = (item: any) => ({
  ...item,
  product_id: item.product_id || item.productId || item.id,
  price_at_addition: item.price !== undefined ? item.price : item.price_at_addition || 0,
  product_name: item.product_name || 'Produto',
  size: item.size || undefined,
});

interface ShopContextType {
  products: Product[];
  mostSold: Product[];
  cart: any[];
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string, size?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, size?: string) => Promise<void>;
  cartTotal: number;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeSubcategory: string;
  setActiveSubcategory: (subcategory: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  categoriesMap: Record<string, string[]>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [mostSold, setMostSold] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSubcategory, setActiveSubcategory] = useState('Todos');
  const [categories, setCategories] = useState<string[]>(['Todos', 'Equipamentos', 'Retro', 'Seleção', 'Novidades', 'Acessórios']);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string[]>>({});

  const categoryMap: Record<string, string> = {
    'Todos': '',
    'Retro': 'Retro',
    'Equipamentos': 'Equipamento',
    'Seleção': 'Selecao',
    'Novidades': 'Novidades',
    'Acessórios': 'Acessorios'
  };

  const fetchProducts = async () => {
    try {
      const categoryParam = categoryMap[activeCategory] || activeCategory;
      const params: any = { limit: 100 };
      if (searchQuery) params.name = searchQuery;
      if (categoryParam && categoryParam !== 'Todos') params.category = categoryParam;
      if (activeSubcategory) params.subcategory = activeSubcategory;
      
      const productData = await catalogApi.getProducts(params);
      setProducts(productData.items.map(mapBackendProduct));
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [productData, mostSoldData, cartData, categoriesData] = await Promise.all([
          catalogApi.getProducts({ limit: 100 }),
          catalogApi.getMostSold(),
          cartApi.getCart(),
          catalogApi.getCategories()
        ]);

        setProducts(productData.items.map(mapBackendProduct));
        setMostSold(Array.isArray(mostSoldData) ? mostSoldData.map(mapBackendProduct) : []);
        setCart((cartData.items || []).map(mapBackendCartItem));
        if (categoriesData && typeof categoriesData === 'object') {
          setCategories(['Todos', ...Object.keys(categoriesData)]);
          setCategoriesMap(categoriesData);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, activeCategory, activeSubcategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price_at_addition * item.quantity), 0);
  }, [cart]);

  const addToCart = async (product: Product) => {
    // 1. Optimistic Update: Add to local state immediately for better UX
    const itemToAdd = {
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      price_at_addition: product.promotionalPrice ?? product.price ?? 0,
      size: product.size
    };

    setCart(prev => {
      const existing = prev.find(i => i.product_id === itemToAdd.product_id && i.size === itemToAdd.size);
      if (existing) {
        return prev.map(i => i.product_id === itemToAdd.product_id && i.size === itemToAdd.size 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, itemToAdd];
    });

    // Open sidebar immediately
    setIsCartOpen(true);

    try {
      // 2. Sync with backend
      const updatedCart = await cartApi.addItem(product.id, 1, product.size);
      if (updatedCart?.items) {
        setCart(updatedCart.items.map(mapBackendCartItem));
      }
    } catch (err: any) {
      console.error("Failed to sync cart with backend", err);
      if (err.message?.includes("Insufficient stock")) {
        alert("Desculpe, este produto não tem stock suficiente.");
        // Revert local change if stock is insufficient
        setCart(prev => {
          const existing = prev.find(i => i.product_id === itemToAdd.product_id && i.size === itemToAdd.size);
          if (existing && existing.quantity > 1) {
            return prev.map(i => i.product_id === itemToAdd.product_id && i.size === itemToAdd.size 
              ? { ...i, quantity: i.quantity - 1 } 
              : i
            );
          }
          return prev.filter(i => !(i.product_id === itemToAdd.product_id && i.size === itemToAdd.size));
        });
      }
      // For other errors, we keep the optimistic local state so the user can at least see it in their session
    }
  };

  const removeFromCart = async (productId: string, size?: string) => {
    if (!productId) return;
    const previousCart = [...cart];
    setCart(prev => prev.filter(i => !(i.product_id === productId && i.size === size)));
    try {
      const updatedCart = await cartApi.removeItem(productId, size);
      if (updatedCart?.items) setCart(updatedCart.items.map(mapBackendCartItem));
      else if (updatedCart && Array.isArray(updatedCart)) setCart(updatedCart.map(mapBackendCartItem));
    } catch (err) {
      setCart(previousCart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number, size?: string) => {
    if (!productId) return;
    if (quantity <= 0) return removeFromCart(productId, size);
    const previousCart = [...cart];
    setCart(prev => prev.map(i => i.product_id === productId && i.size === size ? { ...i, quantity } : i));
    try {
      const updatedCart = await cartApi.updateItem(productId, quantity, size);
      if (updatedCart?.items) setCart(updatedCart.items.map(mapBackendCartItem));
      else if (updatedCart && Array.isArray(updatedCart)) setCart(updatedCart.map(mapBackendCartItem));
    } catch (err: any) {
      if (err.message?.includes("Insufficient stock")) alert("Desculpe, não há stock suficiente.");
      setCart(previousCart);
    }
  };

  return (
    <ShopContext.Provider value={{ 
      products, mostSold, cart, isLoading, isCartOpen, setIsCartOpen, 
      addToCart, removeFromCart, updateQuantity, cartTotal, 
      selectedProduct, setSelectedProduct,
      activeCategory, setActiveCategory,
      activeSubcategory, setActiveSubcategory,
      searchQuery, setSearchQuery,
      categories, categoriesMap
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
