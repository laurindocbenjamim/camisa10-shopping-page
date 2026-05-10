import { motion, AnimatePresence } from 'motion/react';
import { X, Goal } from 'lucide-react';
import { useShop } from '../ShopContext';

interface CartSidebarProps {
  onCheckout: () => void;
}

export default function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    products, 
    removeFromCart, 
    updateQuantity, 
    cartTotal 
  } = useShop();

  return (
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
              <h2 className="font-display text-3xl font-bold tracking-tighter uppercase italic text-brand-white">CARRINHO</h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:text-brand-gold transition-colors text-brand-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Goal size={64} className="mx-auto mb-4 text-brand-gold" />
                  <p className="uppercase tracking-widest text-[10px] font-bold text-brand-white">O teu balneário está vazio</p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const productInfo = products.find(p => p.id === item.product_id);
                  return (
                    <div key={`${item.product_id}-${item.size || ''}-${idx}`} className="flex gap-4 group p-2 border border-brand-white/5 bg-brand-white/5">
                      <div className="w-20 h-24 bg-[#0f0f0f] overflow-hidden shrink-0">
                        {productInfo?.image && (
                          <img src={productInfo.image} alt={item.product_name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-[10px] font-bold uppercase tracking-wider truncate text-brand-white">{item.product_name}</h3>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product_id, item.size)}
                            className="text-brand-white/30 hover:text-brand-gold transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {item.size && <p className="text-[10px] text-brand-white/50 mb-1">Tamanho: {item.size}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-2 border border-brand-white/10 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size)}
                              className="w-6 h-6 flex items-center justify-center text-[12px] font-bold hover:text-brand-gold transition-colors cursor-pointer select-none text-brand-white"
                              aria-label="Diminuir quantidade"
                            >−</button>
                            <span className="text-[10px] font-bold min-w-[20px] text-center text-brand-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size)}
                              className="w-6 h-6 flex items-center justify-center text-[12px] font-bold hover:text-brand-gold transition-colors cursor-pointer select-none text-brand-white"
                              aria-label="Aumentar quantidade"
                            >+</button>
                          </div>
                          <p className="font-display font-bold text-brand-gold text-sm whitespace-nowrap">€{(item.price_at_addition * item.quantity).toFixed(2)}</p>
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
                  onClick={onCheckout}
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
  );
}
