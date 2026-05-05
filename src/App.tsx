import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Menu, Instagram, Github, Trophy, Activity, Search, ChevronRight, ArrowRight, X as XIcon } from 'lucide-react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import CookieConsentForm from './components/CookieConsentForm';
import CartSidebar from './components/CartSidebar';
import { useShop, ShopProvider } from './ShopContext';
import { useCheckout, CheckoutProvider } from './CheckoutContext';
import FAQModal from './components/FAQModal';
import ShippingPolicyModal from './components/ShippingPolicyModal';
import { CategoryModal } from './components/CategoryModal';
import { History, Globe } from 'lucide-react';

const DEFAULT_IMAGE = "https://placehold.co/400x500/0f0f0f/c5a059?text=Sem+Imagem";

interface Product {
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

export default function App() {
  return (
    <HelmetProvider>
      <ShopProvider>
        <CheckoutProvider>
          <AppContent />
        </CheckoutProvider>
      </ShopProvider>
    </HelmetProvider>
  );
}

function AppContent() {
  const { 
    products, cart, isLoading, isCartOpen, setIsCartOpen, 
    searchQuery, setSearchQuery, activeCategory, setActiveCategory, addToCart
  } = useShop();
  
  const { checkoutStep, setCheckoutStep } = useCheckout();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isShippingPolicyOpen, setIsShippingPolicyOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div className="min-h-screen bg-brand-black text-brand-white selection:bg-brand-gold selection:text-brand-black">
      <Helmet>
        <title>{location.pathname === '/' ? 'Camisa 10 | Home' : `Camisa 10 | ${location.pathname.split('/').pop()?.toUpperCase() || 'Checkout'}`}</title>
        <meta name="description" content="A Melhor Loja de Camisas de Futebol" />
      </Helmet>
      
      <CookieConsentForm />

      {/* Navigation - Hidden during checkout for focus */}
      {location.pathname === '/' && (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand-black/90 backdrop-blur-md border-b border-brand-white/10 py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <button onClick={() => setIsMenuOpen(true)} className="hover:text-brand-gold transition-colors cursor-pointer">
                <Menu size={24} />
              </button>
              <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 0) {
                      if (location.pathname !== '/') {
                        navigate('/');
                      }
                      setTimeout(() => {
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="w-full bg-brand-white/5 border border-brand-white/10 rounded-full py-1.5 px-4 text-xs focus:outline-none focus:border-brand-gold transition-colors text-brand-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-brand-white/40 hover:text-brand-white cursor-pointer"
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className={`p-2 transition-colors cursor-pointer ${isSearchVisible ? 'text-brand-gold' : 'hover:text-brand-gold'}`}
              >
                <Search size={22} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:text-brand-gold transition-colors cursor-pointer"
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

      <Outlet />

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
                <li><button onClick={() => setIsShippingPolicyOpen(true)} className="hover:text-brand-white transition-colors uppercase tracking-widest cursor-pointer">Envios e Entregas</button></li>
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

      <CartSidebar onCheckout={() => {
        setIsCartOpen(false);
        navigate('/checkout');
      }} />

      {/* Category Modals */}
      <CategoryModal
        isOpen={isPrimeOpen}
        onClose={() => setIsPrimeOpen(false)}
        title="Novidades"
        icon={Trophy}
        items={['Novos Lançamentos', 'Edição Limitada', 'Mais Vendidos']}
        onSelect={(cat) => {
          setActiveCategory(cat);
          if (location.pathname !== '/') navigate('/');
          setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
      />

      <CategoryModal
        isOpen={isEquipamentosOpen}
        onClose={() => setIsEquipamentosOpen(false)}
        title="Equipamentos"
        icon={Activity}
        items={['Clubes Europeus', 'Brasil', 'Portugal', 'Outros']}
        onSelect={(cat) => {
          setActiveCategory(cat);
          if (location.pathname !== '/') navigate('/');
          setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
      />

      <CategoryModal
        isOpen={isRetroOpen}
        onClose={() => setIsRetroOpen(false)}
        title="Retro Classics"
        icon={History}
        items={['Anos 90', 'Anos 2000', 'Clássicos Imortais']}
        onSelect={(cat) => {
          setActiveCategory(cat);
          if (location.pathname !== '/') navigate('/');
          setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
      />

      <CategoryModal
        isOpen={isSelecaoOpen}
        onClose={() => setIsSelecaoOpen(false)}
        title="Seleção"
        icon={Globe}
        items={['Portugal', 'Brasil', 'Argentina', 'França', 'Inglaterra']}
        onSelect={(cat) => {
          setActiveCategory(cat);
          if (location.pathname !== '/') navigate('/');
          setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
      />

      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <ShippingPolicyModal isOpen={isShippingPolicyOpen} onClose={() => setIsShippingPolicyOpen(false)} />
      
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
                className="absolute top-6 right-6 z-20 p-2 bg-brand-black/50 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full cursor-pointer"
              >
                <XIcon size={20} />
              </button>

              <div className="w-full md:w-1/2 h-[400px] md:h-auto bg-[#0f0f0f] relative group/modal">
                <img
                  src={activeImage || selectedProduct.image || DEFAULT_IMAGE}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  {[selectedProduct.image, selectedProduct.hoverImage, selectedProduct.thirdImage, selectedProduct.fourthImage].filter(Boolean).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img!)}
                      className={`w-12 h-12 border-2 transition-all duration-300 overflow-hidden cursor-pointer ${activeImage === img ? 'border-brand-gold scale-110 shadow-lg' : 'border-brand-white/20 opacity-50 hover:opacity-100'
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
                <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tighter mb-4 leading-none">{selectedProduct.name}</h2>
                <p className="text-brand-white/60 text-xs md:text-sm uppercase tracking-wider leading-relaxed mb-6 md:mb-8 font-medium">{selectedProduct.description}</p>
                
                <div className="mb-6 md:mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white/30 block mb-4">Tamanhos Disponíveis</span>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 md:px-4 md:py-2 border text-[10px] font-bold transition-all duration-300 cursor-pointer ${selectedSize === size
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/30 block mb-1">Preço</span>
                    <span className="font-display text-3xl md:text-5xl font-bold text-brand-gold">€{selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <button
                    disabled={!selectedSize || selectedProduct.stockQuantity <= 0}
                    onClick={() => {
                      if (selectedSize && selectedProduct.stockQuantity > 0) {
                        addToCart({ ...selectedProduct, size: selectedSize });
                        setSelectedProduct(null);
                      }
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-brand-black font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-brand-white transition-all disabled:opacity-20 cursor-pointer"
                  >
                    {selectedProduct.stockQuantity <= 0 ? 'Esgotado' : selectedSize ? 'Adicionar ao Carrinho' : 'Selecione um Tamanho'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
