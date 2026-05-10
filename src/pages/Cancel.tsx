import { motion } from 'motion/react';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Helmet>
        <title>Camisa 10 | Pagamento Cancelado</title>
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-brand-white/5 p-12 text-center"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle size={40} className="text-red-500" />
        </div>
        
        <h1 className="font-display text-3xl font-bold tracking-tighter mb-4 text-brand-white">
          Pagamento Cancelado
        </h1>
        
        <p className="text-brand-white/40 text-sm uppercase tracking-widest leading-relaxed mb-12 font-bold">
          O seu processo de pagamento foi interrompido. Nenhum valor foi cobrado.
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-brand-gold text-brand-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            Tentar Novamente
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-brand-white/5 text-brand-white/60 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white/10 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Voltar à Loja
          </button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-brand-white/5">
          <p className="text-[9px] text-brand-white/20 font-bold uppercase tracking-[0.3em]">
            Se tiver alguma dúvida, entre em contacto com o suporte.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
