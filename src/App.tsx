import { useState, useEffect, useMemo } from 'react';
import cookiePolicy from './cookiePolicy.json';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Menu, ArrowRight, Instagram, Github, Trophy, Goal, Activity, Search, ChevronLeft, ChevronRight, Minus, Plus, Trash2, Package, CheckCircle2, AlertTriangle, Printer, Download, Mail, Loader2 } from 'lucide-react';
import { catalogApi, cartApi, ordersApi } from './api';

interface Product {
  id: string; // Backend uses string UUIDs
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

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mostSold, setMostSold] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isPrimeOpen, setIsPrimeOpen] = useState(false);
  const [isEquipamentosOpen, setIsEquipamentosOpen] = useState(false);
  const [isRetroOpen, setIsRetroOpen] = useState(false);
  const [isSelecaoOpen, setIsSelecaoOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Product | null>(null);
  const [showAllPrime, setShowAllPrime] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isShippingPolicyOpen, setIsShippingPolicyOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'home' | 'checkout' | 'shipping' | 'success' | 'error' | 'notFound' | 'methodNotAllowed'>('home');
  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{ discount: number, finalTotal: number, code: string, type: string, value: number } | null>(null);
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [invoiceSending, setInvoiceSending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order_id');
    if (id) {
      const fetchOrder = async () => {
        try {
          const data = await ordersApi.getOrder(id);
          setOrderData(data);
          setOrderId(id);
          setInvoiceEmail(data.guest_email || '');
          setCheckoutStep('success');
          // Clear cart
          await cartApi.clearCart();
          setCart([]);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (err) {
          console.error("Failed to fetch order", err);
        }
      };
      fetchOrder();
    }
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price_at_addition * item.quantity), 0);
  }, [cart]);

  const recommendedProducts = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [products]);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('');
      setDiscountInfo(null);
      return;
    }
    try {
      const response = await ordersApi.validateCoupon(code);
      if (response.valid) {
        setCouponError('');
        let discount = 0;
        if (response.discount_type === 'percent') {
          discount = cartTotal * (response.value / 100);
        } else {
          discount = response.value;
        }
        setDiscountInfo({
          discount,
          finalTotal: cartTotal - discount,
          code: response.code,
          type: response.discount_type,
          value: response.value
        });
      } else {
        setCouponError(response.message || 'Invalid coupon');
        setDiscountInfo(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon');
      setDiscountInfo(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (couponCode.trim()) {
        validateCoupon(couponCode);
      } else {
        setDiscountInfo(null);
        setCouponError('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [couponCode, cartTotal]);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setShowCookieConsent(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCookieConsent = (type: 'all' | 'essential') => {
    localStorage.setItem('cookieConsent', type);
    setShowCookieConsent(false);
  };

  // Fetch initial data
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSelectedSize(null);
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
    }
  }, [selectedProduct]);

  const addToCart = async (product: Product) => {
    try {
      const updatedCart = await cartApi.addItem(product.id, 1);
      // Merge returned cart items; if backend already merges, use its response.
      // If items list comes back, replace state so we reflect server truth.
      if (updatedCart?.items) {
        setCart(updatedCart.items.map(mapBackendCartItem));
      } else {
        // Optimistic fallback: increment quantity locally if product already in cart
        setCart(prev => {
          const existing = prev.find(i => i.product_id === product.id);
          if (existing) {
            return prev.map(i =>
              i.product_id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }
          return [
            ...prev,
            {
              product_id: product.id,
              product_name: product.name,
              quantity: 1,
              price_at_addition: product.promotionalPrice ?? product.price,
            },
          ];
        });
      }
      setIsCartOpen(true);
    } catch (err: any) {
      // If it's a business error (e.g. 400 Insufficient stock), don't add optimistically
      const errorMsg = err.message || "";
      if (errorMsg.includes("Insufficient stock")) {
        alert("Desculpe, este produto não tem stock suficiente.");
        return;
      }

      // For other errors (network etc), keep optimistic fallback
      setCart(prev => {
        const existing = prev.find(i => i.product_id === product.id);
        if (existing) {
          return prev.map(i =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [
          ...prev,
          {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            price_at_addition: product.promotionalPrice ?? product.price,
          },
        ];
      });
      setIsCartOpen(true);
      console.warn("Cart API unavailable – using local state:", err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!productId) {
      console.warn("Attempted to remove item with undefined productId", { cart });
      return;
    }

    // Optimistic removal first for immediate UX response
    const previousCart = [...cart];
    setCart(prev => {
      const filtered = prev.filter(i => i.product_id !== productId);
      console.log(`Cart filter: removing ${productId}. Count before: ${prev.length}, after: ${filtered.length}`);
      return filtered;
    });

    try {
      const updatedCart = await cartApi.removeItem(productId);
      if (updatedCart?.items) {
        // Only update if we get items back or it's a valid empty response
        setCart(updatedCart.items.map(mapBackendCartItem));
      } else if (updatedCart && Array.isArray(updatedCart)) {
        // Handle case where backend returns array directly
        setCart(updatedCart.map(mapBackendCartItem));
      }
    } catch (err: any) {
      console.error("Failed to remove item from server cart", err);
      // Fallback: if server fails, revert to previous local state to avoid "empty cart" ghosting
      setCart(previousCart);
      
      const errorMsg = err.message || "";
      if (errorMsg.includes("401") || errorMsg.includes("403")) {
        console.warn("Session error detected on remove. Cart might be out of sync.");
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!productId) {
      console.warn("Attempted to update quantity with undefined productId", { cart });
      return;
    }
    if (quantity <= 0) return removeFromCart(productId);

    // Save current state for revert
    const previousCart = [...cart];

    // Optimistic update for immediate UI response
    setCart(prev => {
      const updated = prev.map(i =>
        i.product_id === productId ? { ...i, quantity } : i
      );
      console.log(`Cart update: ${productId} to ${quantity}.`);
      return updated;
    });

    try {
      const updatedCart = await cartApi.updateItem(productId, quantity);
      if (updatedCart?.items) {
        setCart(updatedCart.items.map(mapBackendCartItem));
      } else if (updatedCart && Array.isArray(updatedCart)) {
        setCart(updatedCart.map(mapBackendCartItem));
      }
    } catch (err: any) {
      console.error("Failed to update item quantity on server", err);
      const errorMsg = err.message || "";
      if (errorMsg.includes("Insufficient stock")) {
        alert("Desculpe, não há stock suficiente para esta quantidade.");
      }

      // Revert to local truth first to keep UI stable
      setCart(previousCart);

      // Try to refresh truth from server if it wasn't a 404
      if (!errorMsg.includes("404") && !errorMsg.includes("not found")) {
        try {
          const cartData = await cartApi.getCart();
          if (cartData?.items && cartData.items.length > 0) {
            setCart(cartData.items.map(mapBackendCartItem));
          }
        } catch (refreshErr) {
          console.error("Failed to refresh cart after error", refreshErr);
        }
      }
    }
  };
  const handleCheckout = () => {
    setCheckoutStep('shipping');
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      // Create session on backend
      const response = await ordersApi.createCheckout({
        email: shippingData.email,
        user_id: "guest",
        coupon_code: couponCode || undefined
      });
      if (response.checkout_url || response.session_url) {
        window.location.href = response.checkout_url || response.session_url;
      } else {
        setOrderId(response.id);
        setCheckoutStep('success');
        // Clear cart locally since order is created
        setCart([]);
        await cartApi.clearCart();
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RecommendedSection = () => (
    <section className="py-20 border-t border-brand-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 text-brand-gold mb-4">
          <Activity size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Recomendados para Ti</span>
        </div>
        <h2 className="font-display text-4xl font-bold tracking-tighter mb-12 uppercase italic">Poderás também gostar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendedProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f] border border-brand-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-brand-gold/10">
                <img
                  src={product.image || undefined}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">{product.name}</h3>
                  <p className="text-[8px] text-brand-white/40 uppercase mt-1">{product.category}</p>
                  {product.stockQuantity <= 0 && <p className="text-red-600 text-[8px] font-bold uppercase tracking-widest mt-1">Stock esgotado</p>}
                </div>
                <span className="font-display font-bold text-brand-gold text-lg">€{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brand-black text-brand-white selection:bg-brand-gold selection:text-brand-black">
      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-[400px] z-[500] bg-brand-black/80 backdrop-blur-2xl border border-brand-gold/20 p-8 rounded-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
              </div>
              <h3 className="text-brand-gold font-display font-bold uppercase tracking-widest text-sm">
                {cookiePolicy.title}
              </h3>
            </div>

            <p className="text-[11px] leading-relaxed text-brand-white/70 mb-8">
              {cookiePolicy.description}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleCookieConsent('all')}
                className="w-full bg-brand-gold text-brand-black py-3 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white transition-colors"
              >
                {cookiePolicy.buttons.acceptAll}
              </button>
              <button
                onClick={() => handleCookieConsent('essential')}
                className="w-full border border-brand-white/10 text-brand-white py-3 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white/5 transition-colors"
              >
                {cookiePolicy.buttons.decline}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - Hidden during checkout for focus */}
      {checkoutStep === 'home' && (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand-black/90 backdrop-blur-md border-b border-brand-white/10 py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <button onClick={() => setIsMenuOpen(true)} className="hover:text-brand-gold transition-colors">
                <Menu size={24} />
              </button>
              <div className="flex flex-col cursor-pointer" onClick={() => setCheckoutStep('home')}>
                <span className="font-display text-2xl font-bold tracking-tighter flex items-center gap-2 leading-none text-brand-white">
                  <div className="w-8 h-8 bg-brand-gold rounded-sm flex items-center justify-center text-brand-black text-xs font-black italic">10</div>
                  CAMISA 10
                </span>
                <span className="text-[8px] uppercase tracking-[0.4em] text-brand-gold font-bold ml-10">Vista a Lenda.</span>
              </div>
            </div>

            <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest">
              <button onClick={() => setIsEquipamentosOpen(true)} className="hover:text-brand-gold transition-colors uppercase tracking-widest cursor-pointer">Equipamentos</button>
              <button onClick={() => setIsRetroOpen(true)} className="hover:text-brand-gold transition-colors uppercase tracking-widest cursor-pointer">Retro</button>
              <button onClick={() => setIsSelecaoOpen(true)} className="hover:text-brand-gold transition-colors uppercase tracking-widest cursor-pointer">Seleção</button>
              <button onClick={() => setIsPrimeOpen(true)} className="hover:text-brand-gold transition-colors uppercase tracking-widest cursor-pointer">Novidades</button>
            </div>

            <div className="flex items-center gap-4">
              <div className={`relative flex items-center transition-all duration-500 ${isSearchVisible ? 'w-48 md:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                <input
                  type="text"
                  placeholder="Procurar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-white/5 border border-brand-white/10 rounded-full py-1.5 px-4 text-xs focus:outline-none focus:border-brand-gold transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-brand-white/40 hover:text-brand-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className={`p-2 transition-colors ${isSearchVisible ? 'text-brand-gold' : 'hover:text-brand-gold'}`}
              >
                <Search size={22} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:text-brand-gold transition-colors"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      )}

      {checkoutStep === 'home' ? (
        <>

          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1920"
                alt="Stadium Background"
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-transparent to-brand-black" />
            </div>

            <div className="relative z-10 text-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-gold rounded-sm flex items-center justify-center text-brand-black text-4xl md:text-6xl font-black italic shadow-2xl">
                      10
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 md:w-16 md:h-16 bg-brand-white rounded-full flex items-center justify-center border-4 border-brand-navy shadow-xl">
                      <Goal className="text-brand-navy" size={24} />
                    </div>
                  </div>
                </div>
                <span className="inline-block px-4 py-1 border border-brand-gold text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                  A Marca dos Campeões
                </span>
                <h1 className="font-display text-6xl md:text-9xl font-bold tracking-tighter mb-4 leading-none">
                  CAMISA 10
                </h1>
                <p className="text-brand-white/50 text-sm uppercase tracking-[0.5em] mb-12 font-bold">Vista a Lenda.</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <a
                    href="#products"
                    className="group relative px-10 py-4 bg-brand-gold text-brand-black font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-brand-white hover:scale-105"
                  >
                    <span className="relative z-10">Explorar Loja</span>
                  </a>
                  <button
                    onClick={() => setIsPrimeOpen(true)}
                    className="px-10 py-4 border border-brand-white/20 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Novidades
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Marquee */}
          <div className="marquee-container bg-brand-white text-brand-black font-display font-bold text-sm uppercase tracking-widest">
            <div className="marquee-content">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="mx-12 flex items-center gap-4">
                  <Activity size={16} /> CAMISA 10 FOOTBALL STORE — VISTA A LENDA — EQUIPAMENTO DE ELITE — RETRO CLASSICS —
                </span>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <section id="products" className="max-w-7xl mx-auto px-6 py-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <div className="flex items-center gap-2 text-brand-gold mb-2">
                  <Activity size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Em Destaque</span>
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter">COLEÇÃO 2026</h2>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-2 w-full md:w-auto">
                {['Todos', 'Retro', 'Equipamento', 'Seleção', 'Novidades', 'Acessórios'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors border-b-2 pb-1 ${activeCategory === cat ? 'text-brand-gold border-brand-gold' : 'text-brand-white/50 border-transparent hover:text-brand-gold'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (idx % 4) * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f] mb-4 border border-brand-white/5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (product.hoverImage && target.src !== product.hoverImage) {
                            target.src = product.hoverImage;
                          }
                        }}
                      />
                      {product.hoverImage && (
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} hover`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-105 opacity-0 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                        <button
                          type="button"
                          disabled={product.stockQuantity <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-full bg-brand-white text-brand-black py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {product.stockQuantity <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                        </button>
                      </div>
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-gold text-brand-black px-2 py-1 w-fit">
                          {product.category}
                        </span>
                        {product.status === 'promotion' && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-red-600 text-white px-2 py-1 w-fit animate-pulse">
                            PROMOÇÃO
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-start px-1">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider group-hover:text-brand-gold transition-colors">{product.name}</h3>
                        <p className="text-brand-white/40 text-[9px] mt-1 uppercase tracking-widest text-red-600">
                          {product.stockQuantity <= 0 ? 'Stock esgotado' : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {product.status === 'promotion' && product.promotionalPrice ? (
                          <>
                            <span className="text-brand-white/40 text-[10px] line-through">€{product.price.toFixed(2)}</span>
                            <span className="font-display font-bold text-brand-gold">€{product.promotionalPrice.toFixed(2)}</span>
                            <span className="text-red-500 text-[9px] font-bold mt-0.5">
                              -{Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span className="font-display font-bold text-brand-gold">€{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-brand-white/40 uppercase tracking-[0.3em] text-sm">Nenhum produto encontrado para "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('Todos');
                    }}
                    className="mt-6 text-brand-gold font-bold uppercase tracking-widest text-[10px] hover:text-brand-white transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Most Sold Section */}
          {mostSold.length > 0 && (
            <section className="bg-brand-white/5 py-24 mb-10">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-2 text-brand-gold mb-2">
                  <Trophy size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Os Favoritos</span>
                </div>
                <h2 className="font-display text-4xl font-bold tracking-tighter mb-12">MAIS <span className="text-brand-gold">VENDIDOS</span></h2>

                <style>
                  {`
                @keyframes scroll-infinite {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                  animation: scroll-infinite ${mostSold.length * 5}s linear infinite;
                }
                .animate-scroll:hover {
                  animation-play-state: paused;
                }
              `}
                </style>
                <div className="relative overflow-hidden group/slider">
                  <div
                    className="flex gap-8 animate-scroll"
                    style={{ width: "fit-content" }}
                  >
                    {[...mostSold, ...mostSold].map((product, idx) => (
                      <div
                        key={`most-sold-${product.id}-${idx}`}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-brand-black border border-brand-white/10 p-4 flex gap-6 group cursor-pointer hover:border-brand-gold transition-colors min-w-[350px]"
                      >
                        <div className="w-24 h-32 overflow-hidden bg-[#0f0f0f] shrink-0">
                          <img
                            src={product.image || undefined}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (product.hoverImage && target.src !== product.hoverImage) {
                                target.src = product.hoverImage;
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-[10px] uppercase tracking-wider mb-2">{product.name}</h3>
                          {product.status === 'promotion' && product.promotionalPrice ? (
                            <div className="flex items-center gap-3">
                              <p className="text-brand-gold font-display font-bold text-lg">€{product.promotionalPrice.toFixed(2)}</p>
                              <p className="text-brand-white/40 text-[10px] line-through">€{product.price.toFixed(2)}</p>
                            </div>
                          ) : (
                            <p className="text-brand-gold font-display font-bold text-lg">€{product.price.toFixed(2)}</p>
                          )}
                          {product.stockQuantity <= 0 && <p className="text-red-600 text-[9px] font-bold uppercase tracking-widest mt-1">Stock esgotado</p>}
                          <button className="mt-4 text-[9px] font-black uppercase tracking-widest text-brand-white/40 group-hover:text-brand-gold transition-colors text-left">Ver Detalhes</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : checkoutStep === 'checkout' ? (
        <div className="min-h-screen pt-20 flex flex-col">
          <div className="max-w-7xl mx-auto px-6 w-full py-20 flex-1">
            <div className="flex items-center gap-4 mb-12">
              <button
                onClick={() => setCheckoutStep('home')}
                className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase italic">CHECKOUT</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-brand-white/5 border border-brand-white/10 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="border-b border-brand-white/10 bg-brand-white/5">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Produto</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40 text-center">Quantidade</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Preço</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Acção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-white/10">
                      {cart.map((item) => {
                        const productInfo = products.find(p => p.id === item.product_id);
                        return (
                          <motion.tr key={item.product_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <td className="px-6 py-8">
                              <div className="flex gap-6">
                                <div className="w-16 h-20 bg-[#0f0f0f] shrink-0">
                                  {productInfo?.image && (
                                    <img src={productInfo.image} alt={item.product_name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-xs font-bold uppercase tracking-widest mb-1 text-brand-white">{item.product_name}</h3>
                                  <p className="text-[10px] text-brand-white/40 uppercase">Tamanho: Único</p>
                                </div>
                              </div>
                            </td>
                             <td className="px-6 py-8">
                              <div className="flex items-center justify-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-brand-white/10 flex items-center justify-center hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="font-display font-bold text-sm min-w-[20px] text-center text-brand-white">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-brand-white/10 flex items-center justify-center hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-8 font-display font-bold text-brand-gold">€{(item.price_at_addition * item.quantity).toFixed(2)}</td>
                            <td className="px-6 py-8">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product_id)}
                                className="p-3 text-brand-white/20 hover:text-brand-gold hover:bg-brand-gold/10 transition-all rounded-full cursor-pointer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {cart.length === 0 && (
                    <div className="py-20 text-center text-brand-white/20 uppercase tracking-widest text-xs">
                      Nada por aqui... <button onClick={() => setCheckoutStep('home')} className="text-brand-gold underline ml-2">Explorar Loja</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 lg:col-span-1 lg:row-span-2">
                <div className="bg-brand-white/5 border border-brand-white/10 p-8 space-y-8">
                  <h2 className="font-display text-2xl font-bold tracking-tighter uppercase italic">Resumo do Pedido</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm uppercase tracking-widest text-brand-white/40">
                      <span>Subtotal</span>
                      <span className="text-brand-white font-bold">€{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm uppercase tracking-widest text-brand-white/40">
                      <span>Envio</span>
                      <span className="text-brand-gold font-bold italic">Grátis</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-brand-white/10">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-3">Código Promocional</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Digite o código"
                        className="bg-brand-white/5 border border-brand-white/10 px-4 py-3 flex-1 text-xs focus:outline-none focus:border-brand-gold uppercase tracking-widest"
                      />
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-[10px] mt-2">{couponError}</p>
                    )}
                    {discountInfo && (
                      <p className="text-green-500 text-[10px] mt-2">
                        {discountInfo.type === 'percent' ? `${discountInfo.value}%` : `€${discountInfo.value.toFixed(2)}`} de desconto aplicado
                      </p>
                    )}
                  </div>

                  <div className="pt-8 border-t border-brand-white/10 flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Total</span>
                    <span className="font-display text-4xl font-bold text-brand-gold leading-none">€{(discountInfo ? discountInfo.finalTotal : cartTotal).toFixed(2)}</span>
                  </div>

                  <button
                    disabled={cart.length === 0 || isSubmitting}
                    onClick={handleCheckout}
                    className="w-full bg-brand-gold text-brand-black px-8 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? 'A Processar...' : 'Continuar'} <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <RecommendedSection />
              </div>
            </div>
          </div>
        </div>
      ) : checkoutStep === 'shipping' ? (
        <div className="min-h-screen pt-20">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-center gap-4 mb-12">
              <button
                onClick={() => setCheckoutStep('checkout')}
                className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase italic">Dados de <span className="text-brand-gold">Envio</span></h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleFinalize(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Nome Completo</label>
                      <input
                        required
                        type="text"
                        maxLength={60}
                        placeholder="Ex: Cristiano Ronaldo"
                        className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm"
                        value={shippingData.name}
                        onChange={(e) => setShippingData({ ...shippingData, name: e.target.value.slice(0, 60) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">E-mail</label>
                      <input
                        required
                        type="email"
                        maxLength={60}
                        placeholder="Ex: cr7@vitoria.pt"
                        className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm"
                        value={shippingData.email}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value.slice(0, 60) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Telemóvel</label>
                    <input
                      required
                      type="tel"
                      maxLength={20}
                      placeholder="+351 912 345 678"
                      className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value.slice(0, 20) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Morada Completa</label>
                    <textarea
                      required
                      rows={3}
                      maxLength={60}
                      placeholder="Rua, Nº, Andar, Porta..."
                      className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm resize-none"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value.slice(0, 60) })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Cidade</label>
                      <input
                        required
                        type="text"
                        maxLength={60}
                        className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value.slice(0, 60) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Código Postal</label>
                      <input
                        required
                        type="text"
                        maxLength={10}
                        placeholder="0000-000"
                        className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm"
                        value={shippingData.zip}
                        onChange={(e) => setShippingData({ ...shippingData, zip: e.target.value.slice(0, 10) })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-gold text-brand-black px-8 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-white transition-all shadow-[0_0_20px_rgba(231,186,76,0.3)] hover:shadow-[0_0_30px_rgba(231,186,76,0.5)] flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? 'A Finalizar...' : 'Finalizar Pedido'} <Package size={18} />
                  </button>
                </form>
              </div>

              <div className="bg-brand-white/5 border border-brand-white/10 p-12 h-fit space-y-8 sticky top-32">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] italic">Resumo Final</h3>
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs opacity-60">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>€{(item.price_at_addition * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {discountInfo && discountInfo.discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-brand-gold">
                      <span>Desconto ({discountInfo.code})</span>
                      <span>- €{discountInfo.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-8 border-t border-brand-white/10 flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Valor Total</span>
                  <span className="font-display text-4xl font-bold text-brand-gold">€{(discountInfo ? discountInfo.finalTotal : cartTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : checkoutStep === 'error' ? (
        <div className="min-h-screen flex items-center justify-center text-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xl space-y-12"
          >
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto text-brand-white shadow-[0_0_50px_rgba(239,68,68,0.5)]">
              <AlertTriangle size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-6xl font-bold tracking-tighter uppercase italic line-height-none">Erro no <span className="text-red-500 underline">Pagamento</span></h1>
              <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Ocorreu um problema ao processar o seu pedido. Por favor, tente novamente.</p>
            </div>
            <button
              onClick={() => setCheckoutStep('shipping')}
              className="px-12 py-5 border border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black transition-all font-bold uppercase tracking-[0.2em] text-xs"
            >
              Tentar Novamente
            </button>
          </motion.div>
        </div>
      ) : checkoutStep === 'notFound' ? (
        <div className="min-h-screen flex items-center justify-center text-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xl space-y-12"
          >
            <div className="w-24 h-24 bg-brand-white/10 rounded-full flex items-center justify-center mx-auto text-brand-white">
              <Search size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-6xl font-bold tracking-tighter uppercase italic line-height-none">404</h1>
              <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Página não encontrada. A página que procuras não existe.</p>
            </div>
            <button
              onClick={() => setCheckoutStep('home')}
              className="px-12 py-5 bg-brand-gold text-brand-black hover:bg-brand-white transition-all font-bold uppercase tracking-[0.2em] text-xs"
            >
              Voltar ao Início
            </button>
          </motion.div>
        </div>
      ) : checkoutStep === 'methodNotAllowed' ? (
        <div className="min-h-screen flex items-center justify-center text-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xl space-y-12"
          >
            <div className="w-24 h-24 bg-brand-white/10 rounded-full flex items-center justify-center mx-auto text-brand-white">
              <AlertTriangle size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-6xl font-bold tracking-tighter uppercase italic line-height-none">405</h1>
              <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Método não permitido. O pedido não é permitido neste endpoint.</p>
            </div>
            <button
              onClick={() => setCheckoutStep('home')}
              className="px-12 py-5 bg-brand-gold text-brand-black hover:bg-brand-white transition-all font-bold uppercase tracking-[0.2em] text-xs"
            >
              Voltar ao Início
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="min-h-screen py-32 px-6 bg-brand-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header Success Message */}
            <div className="text-center mb-16 no-print">
              <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-8 text-brand-black shadow-[0_0_50px_rgba(231,186,76,0.3)]">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase italic mb-4">Pedido <span className="text-brand-gold underline">Confirmado</span></h1>
              <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Obrigado pela tua compra. O teu equipamento está a ser preparado.</p>
            </div>

            {/* Invoice Model */}
            <div id="invoice" className="bg-white text-black p-8 md:p-16 rounded-sm shadow-2xl relative overflow-hidden">
              {/* Invoice Watermark/Design */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                {/* Invoice Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 border-b-2 border-brand-black/5 pb-12">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-black rounded-sm flex items-center justify-center text-brand-gold text-lg font-black italic">10</div>
                      <span className="font-display text-2xl font-bold tracking-tighter uppercase">Camisa 10</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-black/60 leading-relaxed">
                      Loja Oficial de Equipamentos<br />
                      Avenida da Liberdade, 123<br />
                      1250-001 Lisboa, Portugal
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="font-display text-4xl font-bold uppercase italic mb-2">Fatura</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Nº do Pedido: <span className="text-black">{orderId}</span></p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1">Data: <span className="text-black">{new Date().toLocaleDateString('pt-PT')}</span></p>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 border-b border-brand-gold/20 pb-2">Cliente</h3>
                    <p className="font-bold text-sm uppercase mb-1">{orderData?.user_name || orderData?.guest_email || 'Cliente Camisa 10'}</p>
                    <p className="text-[10px] uppercase text-black/60">{orderData?.guest_email}</p>
                  </div>
                  <div className="md:text-right">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 border-b border-brand-gold/20 pb-2 md:ml-auto md:w-fit">Estado do Pagamento</h3>
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pago via Stripe</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full mb-16">
                    <thead>
                      <tr className="border-b-2 border-brand-black">
                        <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest">Item</th>
                        <th className="text-center py-4 text-[10px] font-bold uppercase tracking-widest">Qtd</th>
                        <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest">Preço</th>
                        <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {orderData?.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-6">
                            <p className="font-bold text-xs uppercase tracking-wider">{item.product_name}</p>
                            <p className="text-[9px] text-black/40 uppercase mt-1">Ref: {item.product_id?.slice(0, 8)}</p>
                          </td>
                          <td className="py-6 text-center text-xs font-bold">{item.quantity}</td>
                          <td className="py-6 text-right text-xs">
                            {item.original_price ? (
                              <div className="flex flex-col items-end">
                                <span className="line-through text-black/40">€{item.original_price.toFixed(2)}</span>
                                <span className="text-green-600 font-bold">€{item.unit_price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span>€{(item.unit_price || 0).toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-6 text-right text-xs font-bold">€{((item.unit_price || 0) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end border-t-2 border-brand-black pt-8">
                  <div className="w-full md:w-64 space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black/40">
                      <span>Subtotal</span>
                      <span className="text-black">€{(orderData?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {orderData?.items?.some((item: any) => item.discount_amount > 0) && (
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                        <span>Desconto Produto</span>
                        <span>-€{orderData.items.reduce((sum: number, item: any) => sum + ((item.discount_amount || 0) * item.quantity), 0).toFixed(2)}</span>
                      </div>
                    )}
                    {orderData?.coupon_code && (
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                        <span>Cupão ({orderData.coupon_code})</span>
                        <span>-€{(orderData.coupon_discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black/40">
                      <span>Envio</span>
                      <span className="text-green-600 italic font-bold">Grátis</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-black/10">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Total Pago</span>
                      <span className="font-display text-3xl font-bold text-brand-gold leading-none">€{(orderData?.final_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Message */}
                <div className="mt-20 pt-12 border-t border-black/5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Obrigado por escolheres a Camisa 10 — Onde as lendas se vestem.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-gold text-brand-black font-bold uppercase tracking-widest text-[10px] hover:bg-brand-white transition-all shadow-xl"
              >
                <Printer size={16} /> Imprimir Fatura
              </button>
              <button
                onClick={() => setCheckoutStep('home')}
                className="flex items-center justify-center gap-3 px-8 py-4 border border-brand-white/20 text-brand-white font-bold uppercase tracking-widest text-[10px] hover:bg-brand-white hover:text-brand-black transition-all"
              >
                Voltar à Loja <ArrowRight size={16} />
              </button>
            </div>

            {/* Email Invoice Form */}
            <div className="mt-12 p-6 bg-brand-white/5 border border border-brand-gold/20 rounded-lg max-w-md mx-auto no-print">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4">Enviar Fatura por Email</h3>
              {invoiceSent ? (
                <div className="text-green-600 text-sm font-bold flex items-center gap-2">
                  <Mail size={16} /> Fatura enviada com sucesso!
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!invoiceEmail || !orderId) return;
                    setInvoiceSending(true);
                    try {
                      await ordersApi.sendInvoice(orderId, invoiceEmail);
                      setInvoiceSent(true);
                    } catch (err: any) {
                      console.error("Failed to send invoice", err);
                      alert(err?.response?.data?.detail || err?.message || "Failed to send invoice");
                    } finally {
                      setInvoiceSending(false);
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="email"
                    value={invoiceEmail}
                    onChange={(e) => setInvoiceEmail(e.target.value)}
                    placeholder="Seu email"
                    className="px-4 py-3 bg-brand-black/50 border border-brand-white/20 text-brand-white text-sm focus:border-brand-gold focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={invoiceSending || !invoiceEmail}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-brand-black font-bold uppercase tracking-widest text-[10px] hover:bg-brand-white transition-all disabled:opacity-50"
                  >
                    {invoiceSending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> A enviar...
                      </>
                    ) : (
                      <>
                        <Mail size={16} /> Enviar Fatura
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-brand-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-col mb-6">
                <span className="font-display text-4xl font-bold tracking-tighter flex items-center gap-3 leading-none text-brand-white">
                  <div className="w-12 h-12 bg-brand-gold rounded-sm flex items-center justify-center text-brand-black text-xl font-black italic">10</div>
                  CAMISA 10
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold ml-15 mt-1">Vista a Lenda.</span>
              </div>
              <p className="text-brand-white/40 max-w-sm mb-8 text-sm uppercase tracking-wider leading-relaxed">
                A marca dos verdadeiros craques. Equipamento profissional e clássicos retro para quem vive o futebol 24/7.
              </p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-brand-gold transition-colors"><Instagram size={20} /></a>
                <a href="#" className="hover:text-brand-gold transition-colors"><Github size={20} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-brand-gold mb-8">Categorias</h4>
              <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">
                <li><a href="#" className="hover:text-brand-white transition-colors">Equipamentos</a></li>
                <li><a href="#" className="hover:text-brand-white transition-colors">Retro Classics</a></li>
                <li><a href="#" className="hover:text-brand-white transition-colors">Botas de Elite</a></li>
                <li><a href="#" className="hover:text-brand-white transition-colors">Acessórios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-brand-gold mb-8">Info</h4>
              <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">
                <li><a href="#" className="hover:text-brand-white transition-colors">Tamanhos</a></li>
                <li><a href="#" className="hover:text-brand-white transition-colors">Apoio ao Cliente</a></li>
                <li><button onClick={() => setIsFAQOpen(true)} className="hover:text-brand-white transition-colors uppercase tracking-widest cursor-pointer">Perguntas Frequentes (FAQ)</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-brand-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-brand-white/20">
            <p>© 2026 CAMISA 10 FOOTBALL STORE. O JOGO COMEÇA AQUI.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-brand-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-brand-white transition-colors">Termos de Serviço</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-brand-black/90 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-black border-l border-brand-white/10 z-[70] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="font-display text-3xl font-bold tracking-tighter">CARRINHO</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:text-brand-gold transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <Goal size={64} className="mx-auto mb-4 text-brand-gold" />
                    <p className="uppercase tracking-widest text-[10px] font-bold">O teu balneário está vazio</p>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const productInfo = products.find(p => p.id === item.product_id);
                    return (
                      <div key={item.product_id || idx} className="flex gap-4 group p-2 border border-brand-white/5 bg-brand-white/5">
                        <div className="w-20 h-24 bg-[#0f0f0f] overflow-hidden">
                          {productInfo?.image && (
                            <img src={productInfo.image} alt={item.product_name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider">{item.product_name}</h3>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product_id)}
                              className="text-brand-white/30 hover:text-brand-gold transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2 border border-brand-white/10 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-[12px] font-bold hover:text-brand-gold transition-colors cursor-pointer select-none"
                                aria-label="Diminuir quantidade"
                              >−</button>
                              <span className="text-[10px] font-bold min-w-[20px] text-center">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-[12px] font-bold hover:text-brand-gold transition-colors cursor-pointer select-none"
                                aria-label="Aumentar quantidade"
                              >+</button>
                            </div>
                            <p className="font-display font-bold text-brand-gold text-sm">€{(item.price_at_addition * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-8 border-t border-brand-white/10 mt-8">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Subtotal</span>
                    <span className="font-display text-3xl font-bold text-brand-gold">€{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('checkout');
                    }}
                    className="w-full bg-brand-gold text-brand-black py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-white transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-brand-black z-[100] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-20">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold tracking-tighter flex items-center gap-2 leading-none text-brand-white">
                  <div className="w-8 h-8 bg-brand-gold rounded-sm flex items-center justify-center text-brand-black text-xs font-black italic">10</div>
                  CAMISA 10
                </span>
                <span className="text-[8px] uppercase tracking-[0.4em] text-brand-gold font-bold ml-10">Vista a Lenda.</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="hover:text-brand-gold transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-8 text-5xl font-display font-bold tracking-tighter">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEquipamentosOpen(true);
                }}
                className="text-left hover:text-brand-gold transition-colors"
              >
                Equipamentos
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsRetroOpen(true);
                }}
                className="text-left hover:text-brand-gold transition-colors"
              >
                Retro
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSelecaoOpen(true);
                }}
                className="text-left hover:text-brand-gold transition-colors"
              >
                Seleção
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsPrimeOpen(true);
                }}
                className="text-left hover:text-brand-gold transition-colors"
              >
                Novidades
              </button>
              <a href="#" className="hover:text-brand-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Acessórios</a>
            </div>
            <div className="mt-auto flex justify-between items-end">
              <div className="flex gap-6">
                <Instagram size={24} className="hover:text-brand-gold transition-colors cursor-pointer" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold/50">Lisboa, PT</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-[500]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-[90%] max-w-4xl h-fit max-h-[90vh] bg-brand-black border border-brand-white/10 z-[510] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-brand-black/50 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 h-[400px] md:h-auto bg-[#0f0f0f] relative group/modal">
                <img
                  src={activeImage || selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (selectedProduct.hoverImage && target.src !== selectedProduct.hoverImage) {
                      target.src = selectedProduct.hoverImage;
                    }
                  }}
                />

                {/* Thumbnails */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  {[selectedProduct.image, selectedProduct.hoverImage, selectedProduct.thirdImage, selectedProduct.fourthImage].filter(Boolean).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img!)}
                      className={`w-12 h-12 border-2 transition-all duration-300 overflow-hidden ${activeImage === img ? 'border-brand-gold scale-110 shadow-lg' : 'border-brand-white/20 opacity-50 hover:opacity-100'
                        }`}
                    >
                      <img src={img!} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
                <div className="flex items-center gap-2 text-brand-gold mb-4">
                  <Activity size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{selectedProduct.category}</span>
                </div>

                <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tighter mb-4 leading-none">
                  {selectedProduct.name}
                </h2>

                <p className="text-brand-white/60 text-xs md:text-sm uppercase tracking-wider leading-relaxed mb-6 md:mb-8 font-medium">
                  {selectedProduct.description}
                </p>

                <div className="mb-6 md:mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white/30 block mb-4">Tamanhos Disponíveis</span>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 md:px-4 md:py-2 border text-[10px] font-bold transition-all duration-300 ${selectedSize === size
                          ? 'border-brand-gold bg-brand-gold text-brand-black scale-110 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                          : 'border-brand-white/10 text-brand-white hover:border-brand-gold/50 hover:text-brand-gold'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 mt-auto pt-6 md:pt-8 border-t border-brand-white/5">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/30 block mb-1">
                      {selectedProduct.status === 'promotion' ? 'Preço Promocional' : 'Preço'}
                    </span>
                    <div className="flex items-center gap-4">
                      {selectedProduct.status === 'promotion' && selectedProduct.promotionalPrice ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-brand-white/30 text-xs md:text-sm line-through">€{selectedProduct.price.toFixed(2)}</span>
                            <span className="font-display text-3xl md:text-5xl font-bold text-brand-gold">€{selectedProduct.promotionalPrice.toFixed(2)}</span>
                          </div>
                          <div className="bg-red-600 text-white px-2 py-1 rounded-sm text-[10px] md:text-xs font-black self-center animate-bounce">
                            -{Math.round(((selectedProduct.price - selectedProduct.promotionalPrice) / selectedProduct.price) * 100)}% OFF
                          </div>
                        </>
                      ) : (
                        <span className="font-display text-3xl md:text-5xl font-bold text-brand-gold">€{selectedProduct.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedSize || selectedProduct.stockQuantity <= 0}
                    onClick={() => {
                      if (selectedSize && selectedProduct.stockQuantity > 0) {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }
                    }}
                    className={`w-full sm:w-auto px-8 py-4 font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 ${!selectedSize || selectedProduct.stockQuantity <= 0
                      ? 'bg-brand-white/10 text-brand-white/30 cursor-not-allowed'
                      : 'bg-brand-gold text-brand-black hover:bg-brand-white cursor-pointer'
                      }`}
                  >
                    {selectedProduct.stockQuantity <= 0 ? 'Esgotado' : selectedSize ? 'Adicionar ao Carrinho' : 'Selecione um Tamanho'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PRIME Products Overlay */}
      <AnimatePresence>
        {isPrimeOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-black z-[200] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <div className="flex items-center gap-2 text-brand-gold mb-2">
                    <Trophy size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Coleção Exclusiva</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">PRODUTOS <span className="text-brand-gold">PRIME</span></h2>
                </div>
                <button
                  onClick={() => {
                    setIsPrimeOpen(false);
                    setShowAllPrime(false);
                  }}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products
                  .filter(p => p.category.toLowerCase() === 'prime')
                  .slice(0, showAllPrime ? 8 : 4)
                  .map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f] mb-4 border border-brand-gold/20">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (product.hoverImage && target.src !== product.hoverImage) {
                              target.src = product.hoverImage;
                            }
                          }}
                        />
                        {product.hoverImage && (
                          <img
                            src={product.hoverImage}
                            alt={`${product.name} hover`}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-105 opacity-0 group-hover:opacity-100"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-brand-gold text-brand-black px-2 py-1">PRIME</span>
                          {product.status === 'promotion' && (
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-red-600 text-white px-2 py-1 animate-pulse">PROMO</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-start px-1">
                        <h3 className="font-bold text-xs uppercase tracking-wider group-hover:text-brand-gold transition-colors">{product.name}</h3>
                        <div className="flex flex-col items-end">
                          {product.status === 'promotion' && product.promotionalPrice ? (
                            <>
                              <span className="text-brand-white/40 text-[9px] line-through">€{product.price.toFixed(2)}</span>
                              <span className="font-display font-bold text-brand-gold">€{product.promotionalPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="font-display font-bold text-brand-gold">€{product.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>

              {!showAllPrime && (
                <div className="mt-20 text-center">
                  <button
                    onClick={() => setShowAllPrime(true)}
                    className="group flex items-center gap-4 mx-auto text-[10px] font-bold uppercase tracking-[0.4em] hover:text-brand-gold transition-colors"
                  >
                    Mostrar Mais <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EQUIPAMENTOS Products Overlay */}
      <AnimatePresence>
        {isEquipamentosOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-black z-[200] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <div className="flex items-center gap-2 text-brand-gold mb-2">
                    <Activity size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Performance & Seleção</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">EQUIPAMENTOS</h2>
                </div>
                <button
                  onClick={() => setIsEquipamentosOpen(false)}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.filter(p => p.category === 'Equipamento').map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 4) * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f] mb-4 border border-brand-white/5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                      {product.hoverImage && (
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} hover`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-105 opacity-0 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {product.status === 'promotion' && (
                        <div className="absolute top-4 left-4">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-red-600 text-white px-2 py-1 animate-pulse">PROMOÇÃO</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start px-1">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider group-hover:text-brand-gold transition-colors">{product.name}</h3>
                        <span className="text-[8px] uppercase tracking-widest text-brand-white/30 font-bold">{product.category}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        {product.status === 'promotion' && product.promotionalPrice ? (
                          <>
                            <span className="text-brand-white/40 text-[9px] line-through">€{product.price.toFixed(2)}</span>
                            <span className="font-display font-bold text-brand-gold">€{product.promotionalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-display font-bold text-brand-gold">€{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RETRO Products Overlay */}
      <AnimatePresence>
        {isRetroOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-black z-[200] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <div className="flex items-center gap-2 text-brand-gold mb-2">
                    <Trophy size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Clássicos Eternos</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">COLECÇÃO <span className="text-brand-gold">RETRO</span></h2>
                </div>
                <button
                  onClick={() => setIsRetroOpen(false)}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.filter(p => p.category === 'Retro').map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 4) * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f] mb-4 border border-brand-white/5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                      {product.hoverImage && (
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} hover`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-105 opacity-0 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {product.status === 'promotion' && (
                        <div className="absolute top-4 left-4">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-red-600 text-white px-2 py-1 animate-pulse">PROMOÇÃO</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start px-1">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider group-hover:text-brand-gold transition-colors">{product.name}</h3>
                        <span className="text-[8px] uppercase tracking-widest text-brand-white/30 font-bold">{product.category}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        {product.status === 'promotion' && product.promotionalPrice ? (
                          <>
                            <span className="text-brand-white/40 text-[9px] line-through">€{product.price.toFixed(2)}</span>
                            <span className="font-display font-bold text-brand-gold">€{product.promotionalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-display font-bold text-brand-gold">€{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SELEÇÃO Products Overlay */}
      <AnimatePresence>
        {isSelecaoOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-black z-[200] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <div className="flex items-center gap-2 text-brand-gold mb-2">
                    <Activity size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Alta Performance</span>
                  </div>
                  <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">EQUIPAMENTO <span className="text-brand-gold">SELEÇÃO</span></h2>
                </div>
                <button
                  onClick={() => setIsSelecaoOpen(false)}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.filter(p => p.category === 'Seleção').map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 4) * 0.1 }}
                    className="group cursor-pointer relative"
                    onClick={() => setSelectedCountry(product)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f] mb-4 border border-brand-white/5">
                      {/* Flag Background */}
                      {product.flag && (
                        <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                          <img
                            src={product.flag}
                            alt="Flag Background"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <img
                        src={product.image}
                        alt={product.name}
                        className={`relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 ${product.hoverImage ? 'group-hover:opacity-0' : 'group-hover:opacity-100'}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (product.hoverImage && target.src !== product.hoverImage) {
                            target.src = product.hoverImage;
                          }
                        }}
                      />

                      {product.hoverImage && (
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} hover`}
                          className="absolute inset-0 z-20 w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-105 opacity-0 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Native Name Overlay on Hover */}
                      <div className="absolute inset-0 bg-brand-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <span className="font-display text-3xl font-bold tracking-tighter text-brand-gold uppercase">
                          {product.nativeName}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity z-25" />
                      {product.status === 'promotion' && (
                        <div className="absolute top-4 left-4 z-40">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-red-600 text-white px-2 py-1 animate-pulse">PROMOÇÃO</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start px-1">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider group-hover:text-brand-gold transition-colors">{product.name}</h3>
                        <span className="text-[8px] uppercase tracking-widest text-brand-white/30 font-bold">{product.category}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        {product.status === 'promotion' && product.promotionalPrice ? (
                          <>
                            <span className="text-brand-white/40 text-[9px] line-through">€{product.price.toFixed(2)}</span>
                            <span className="font-display font-bold text-brand-gold">€{product.promotionalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-display font-bold text-brand-gold">€{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* FAQ Overlay */}
      <AnimatePresence>
        {isFAQOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFAQOpen(false)}
              className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-[600]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-[90%] max-w-2xl h-fit max-h-[80vh] bg-brand-black border border-brand-white/10 z-[610] p-8 md:p-12 shadow-2xl overflow-y-auto"
            >
              <button
                onClick={() => setIsFAQOpen(false)}
                className="absolute top-6 right-6 z-20 p-2 bg-brand-black/50 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
              >
                <X size={20} />
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-2 text-brand-gold mb-4">
                  <Activity size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Apoio ao Cliente</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-none">
                  PERGUNTAS <span className="text-brand-gold">FREQUENTES</span>
                </h2>
              </div>

              <div className="space-y-8">
                {[
                  {
                    q: "Quanto tempo demora a chegar a minha encomenda?",
                    a: (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col gap-4">
                          <div className="border-l-2 border-brand-gold pl-4 py-1">
                            <p className="font-bold text-brand-white text-[10px] tracking-widest uppercase mb-2">Processamento da Encomenda</p>
                            <p className="text-brand-white/60">Todas as encomendas são processadas e produzidas em 48 a 72 horas antes do envio.</p>
                          </div>

                          <div className="border-l-2 border-brand-gold pl-4 py-1">
                            <p className="font-bold text-brand-white text-[10px] tracking-widest uppercase mb-2">Prazos de Entrega (após envio):</p>
                            <ul className="space-y-2 text-brand-white/60">
                              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> Envio Standard: 10 a 20 dias úteis.</li>
                              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> Envio Expresso: 5 a 10 dias úteis.</li>
                              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> Regiões Autónomas: 15-25 dias úteis</li>
                            </ul>
                          </div>

                          <div className="bg-brand-white/5 p-4 rounded-sm border border-brand-white/10">
                            <p className="text-brand-gold flex items-start gap-2 mb-3">
                              <span className="shrink-0">⚠️</span>
                              <span>Atenção: Os prazos acima referem-se apenas ao tempo de envio. Não incluem o tempo de processamento e produção da encomenda.</span>
                            </p>
                            <p className="text-brand-white/80 flex items-center gap-2">
                              <span className="shrink-0">👉</span>
                              <span>
                                Para mais informações,{' '}
                                <button
                                  onClick={() => setIsShippingPolicyOpen(true)}
                                  className="underline hover:text-brand-gold transition-colors cursor-pointer"
                                >
                                  consulta a nossa Política de Envio
                                </button>.
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    q: "fazemos envio a cobrança?",
                    a: "Percebemos perfeitamente que prefiras o envio à cobrança — é uma opção mais confortável para muitos clientes 😊\nNo entanto, na Camisa10 trabalhamos com produtos importados e personalizados ao teu gosto, o que implica produção específica para cada encomenda. Por esse motivo, não conseguimos realizar envios à cobrança.\n\nSe tiveres alguma dúvida ou precisares de ajuda com o processo, estamos aqui para ajudar!"
                  },
                  {
                    q: "qualidade do produto?",
                    a: "Trabalhamos apenas com materiais de alta qualidade, garantindo durabilidade e conforto em todas as nossas peças. Todos os detalhes são verificados para assegurar a máxima satisfação."
                  }
                ].map((item, i) => (
                  <div key={i} className="border-b border-brand-white/5 pb-6 last:border-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs mt-1">
                        {item.q}
                      </h3>
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                        className="text-[9px] font-black uppercase tracking-[0.2em] bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black px-3 py-1.5 transition-all shrink-0"
                      >
                        {expandedFAQ === i ? 'Fechar' : 'Ver mais'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedFAQ === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 text-brand-white/50 text-[11px] uppercase tracking-wider leading-relaxed font-medium max-h-[300px] overflow-y-auto pr-4 custom-scrollbar whitespace-pre-line">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shipping Policy Overlay */}
      <AnimatePresence>
        {isShippingPolicyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShippingPolicyOpen(false)}
              className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-[700]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-[95%] max-w-4xl h-fit max-h-[90vh] bg-brand-black border border-brand-white/10 z-[710] p-8 md:p-16 shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setIsShippingPolicyOpen(false)}
                className="absolute top-6 right-6 z-20 p-2 bg-brand-black/50 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
              >
                <X size={24} />
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-2 text-brand-gold mb-4">
                  <Activity size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Informação Legal</span>
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter leading-none">
                  POLÍTICA DE <span className="text-brand-gold">ENVIO</span>
                </h2>
              </div>

              <div className="space-y-10 text-brand-white/70 text-sm md:text-base leading-relaxed">
                <section>
                  <p className="text-brand-white font-medium mb-4">
                    Obrigado por escolher a <span className="text-brand-gold">Camisa10</span>!
                    Estamos encantados por lhe proporcionar uma experiência de compras excepcional.
                    Por favor, reserve um momento para rever a nossa política de envio antes de efetuar a sua encomenda.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <section className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Tempo de Processamento</h3>
                    <p>
                      Por serem artigos de caráter personalizado, as encomendas são normalmente processadas dentro de
                      <span className="text-brand-white font-bold"> 3 a 5 dias úteis</span> após a confirmação do pagamento.
                      Este prazo corresponde ao tempo entre o pagamento e a preparação da encomenda para envio.
                    </p>
                    <p className="text-xs italic opacity-60">
                      * Durante épocas de maior movimento ou períodos promocionais, os tempos de processamento podem ser ligeiramente mais longos.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Prazos de Entrega</h3>
                    <p>
                      O tempo de entrega varia com base na sua localização:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-gold mt-1">•</span>
                        <span>Geralmente entre <span className="text-brand-white font-bold">10 a 20 dias úteis</span> após o processamento.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-gold mt-1">•</span>
                        <span>Pode estender-se a <span className="text-brand-white font-bold">25 dias úteis</span> em épocas de maior afluência.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-gold mt-1">•</span>
                        <span>Envios para as Regiões Autónomas podem ter um prazo mais alargado.</span>
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Acompanhamento</h3>
                    <p>
                      Assim que a sua encomenda for enviada, iremos fornecer-lhe um número de rastreamento por e-mail ou SMS.
                      Pode utilizar este número para monitorizar o estado de entrega em tempo real.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Custos de Envio</h3>
                    <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-sm">
                      <p className="text-brand-gold font-bold text-center uppercase tracking-widest">
                        O envio é gratuito para Portugal e Ilhas a partir de 2 unidades!
                      </p>
                    </div>
                  </section>
                </div>

                <section className="space-y-4 border-t border-brand-white/10 pt-10">
                  <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Envio Internacional e Alfândega</h3>
                  <p>
                    As encomendas internacionais podem estar sujeitas a direitos aduaneiros, impostos ou outras taxas impostas pelas regulamentações do seu país.
                    Estas taxas são da <span className="text-brand-white font-bold underline">responsabilidade do destinatário</span> e não estão incluídas no preço do produto.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Precisão do Endereço</h3>
                  <p>
                    Forneça informações de envio precisas e completas durante o checkout.
                    Não somos responsáveis por atrasos ou problemas de entrega causados por detalhes de endereço incorretos ou incompletos.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-brand-white/10 pt-10">
                  <section className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Atrasos na Entrega</h3>
                    <p>
                      Embora façamos todos os esforços para cumprir os prazos, fatores como condições climáticas ou inspeções alfandegárias
                      podem causar atrasos além do nosso controlo. Agradecemos a sua compreensão.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Perdas ou Danos</h3>
                    <p>
                      No raro caso de a sua encomenda se perder ou danificar, entre imediatamente em contacto connosco.
                      Trabalharemos diligentemente para oferecer soluções adequadas.
                    </p>
                  </section>
                </div>

                <section className="bg-brand-white/5 p-8 rounded-sm text-center space-y-4">
                  <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs">Apoio ao Cliente</h3>
                  <p>
                    Para qualquer questão sobre o estado do seu envio, contacte-nos através do email:
                  </p>
                  <p className="text-brand-gold font-bold text-xl md:text-2xl">
                    camisa10@gmail.com
                  </p>
                  <p className="text-xs opacity-50">
                    Estamos aqui para ajudá-lo em cada passo do caminho.
                  </p>
                </section>

                <section className="text-[10px] uppercase tracking-[0.2em] opacity-40 text-center pt-10">
                  <p>
                    Esta política de envio está sujeita a alterações sem aviso prévio.
                    Ao efetuar uma encomenda, reconhece e concorda com os termos aqui descritos.
                  </p>
                  <p className="mt-4 font-bold text-brand-gold">
                    Obrigado por comprar na Camisa10!
                  </p>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Country Sub-Options Overlay */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-brand-black/95 z-[300] flex items-start md:items-center justify-center p-4 md:p-6 backdrop-blur-xl overflow-y-auto"
          >
            <div className="max-w-5xl w-full py-12 md:py-0">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2 block">Coleção Oficial</span>
                  <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter">
                    {selectedCountry.nativeName} <span className="text-brand-gold">OPTIONS</span>
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { type: 'Principal', price: 89.99, img: selectedCountry.image },
                  { type: 'Alternativo', price: 84.99, img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800" },
                  { type: 'Treino', price: 114.99, img: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&q=80&w=800" },
                  { type: 'Lifestyle', price: 59.99, img: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=800" }
                ].map((opt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedProduct({
                        ...selectedCountry,
                        id: `${selectedCountry.id}-${i}`,
                        name: `Equipamento ${opt.type} - ${selectedCountry.nativeName}`,
                        price: opt.price,
                        image: opt.img,
                        description: `A versão oficial ${opt.type.toLowerCase()} da seleção de ${selectedCountry.nativeName}. Qualidade elite para os adeptos mais exigentes.`
                      });
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-brand-white/5 border border-brand-white/10 mb-4">
                      <img
                        src={opt.img}
                        alt={opt.type}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-brand-gold font-bold uppercase tracking-widest text-xs">Ver Detalhes</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-[10px] uppercase tracking-widest mb-1 group-hover:text-brand-gold transition-colors">{opt.type}</h3>
                    <span className="font-display font-bold text-brand-gold">€{opt.price}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
