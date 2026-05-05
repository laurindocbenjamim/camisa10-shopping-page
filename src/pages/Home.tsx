import { motion } from 'motion/react';
import { Activity, Goal, Trophy } from 'lucide-react';
import { useShop, Product } from '../ShopContext';

export default function Home() {
  const { 
    products, 
    mostSold, 
    searchQuery, 
    setSearchQuery, 
    activeCategory, 
    setActiveCategory, 
    setSelectedProduct,
    addToCart
  } = useShop();

  const recommendedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

  const categoryMap: Record<string, string> = {
    'Todos': 'Todos',
    'Retro': 'Retro',
    'Equipamentos': 'Equipamento',
    'Seleção': 'Seleção',
    'Novidades': 'prime',
    'Acessórios': 'Acessório'
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const targetCategory = categoryMap[activeCategory] || activeCategory;
    const matchesCategory = activeCategory === 'Todos' || product.category.toLowerCase() === targetCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
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
            {['Todos', 'Retro', 'Equipamentos', 'Seleção', 'Novidades', 'Acessórios'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
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
                    src={product.image || undefined}
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
  );
}
