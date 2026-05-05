import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { useShop, Product } from '../ShopContext';
import { useMemo } from 'react';

export default function RecommendedSection() {
  const { products, setSelectedProduct } = useShop();

  const recommendedProducts = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [products]);

  if (recommendedProducts.length === 0) return null;

  return (
    <section className="py-20 border-t border-brand-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 text-brand-gold mb-4">
          <Activity size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Recomendados para Ti</span>
        </div>
        <h2 className="font-display text-4xl font-bold tracking-tighter mb-12 uppercase italic text-brand-white">Poderás também gostar</h2>
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-white">{product.name}</h3>
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
}
