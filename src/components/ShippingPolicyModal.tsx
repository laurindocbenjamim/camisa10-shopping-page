import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface ShippingPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingPolicyModal({ isOpen, onClose }: ShippingPolicyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-[600]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-[90%] max-w-2xl h-fit max-h-[80vh] bg-brand-black border border-brand-white/10 z-[610] overflow-y-auto p-12 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-brand-white/40 hover:text-brand-gold transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-brand-gold rounded-sm flex items-center justify-center text-brand-black">
                <Truck size={24} />
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tighter uppercase italic">Política de <span className="text-brand-gold">Envio</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-white/5 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Prazos de Entrega</h4>
                    <p className="text-[10px] text-brand-white/40 uppercase tracking-wider leading-relaxed">
                      Portugal Continental: 5-10 dias úteis.<br />
                      Ilhas (Madeira e Açores): 10-15 dias úteis.<br />
                      Internacional: 15-20 dias úteis.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-white/5 flex items-center justify-center shrink-0">
                    <Truck size={16} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Custos de Envio</h4>
                    <p className="text-[10px] text-brand-white/40 uppercase tracking-wider leading-relaxed">
                      Oferecemos envio gratuito para todo o território português em encomendas superiores a 50€. Para valores inferiores, aplica-se uma taxa fixa de 5€.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-white/5 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Garantia de Envio</h4>
                    <p className="text-[10px] text-brand-white/40 uppercase tracking-wider leading-relaxed">
                      Todos os nossos envios são segurados. Caso a encomenda se perca ou chegue danificada, garantimos o reenvio sem custos adicionais.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-white/5 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Seguimento de Encomenda</h4>
                    <p className="text-[10px] text-brand-white/40 uppercase tracking-wider leading-relaxed">
                      Receberá um e-mail com o link de seguimento assim que a sua encomenda for processada pelo nosso centro logístico.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-brand-white/5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white/20">Camisa 10 — Onde o Futebol nunca para.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
