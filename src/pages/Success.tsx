import { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useShop } from '../ShopContext';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { clearCart } = useShop();

  useEffect(() => {
    // Clear cart on success
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Helmet>
        <title>Camisa 10 | Encomenda Confirmada</title>
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-brand-white/5 p-12 text-center"
      >
        <div className="w-20 h-20 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} className="text-[#CCFF00]" />
        </div>
        
        <h1 className="font-display text-3xl font-bold tracking-tighter mb-4 text-brand-white">
          Encomenda Confirmada!
        </h1>
        
        <p className="text-brand-white/40 text-sm uppercase tracking-widest leading-relaxed mb-8 font-bold">
          O seu pagamento foi processado com sucesso. O seu equipamento está a caminho!
        </p>
        
        {orderId && (
          <div className="bg-brand-white/5 border border-brand-white/10 p-4 mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-brand-gold" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-white/40">ID da Encomenda</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-brand-white">{orderId.slice(0, 8)}...</span>
          </div>
        )}
        
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-brand-gold text-brand-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white transition-all flex items-center justify-center gap-2"
        >
          Continuar a Comprar
          <ArrowRight size={14} />
        </button>
        
        <div className="mt-12 pt-8 border-t border-brand-white/5">
          <p className="text-[9px] text-brand-white/20 font-bold uppercase tracking-[0.3em]">
            Receberá um email com os detalhes da sua encomenda em breve.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
