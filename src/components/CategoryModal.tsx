import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Trophy, Activity, Globe, History } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  icon: any;
  onSelect?: (category: string) => void;
}

export function CategoryModal({ isOpen, onClose, title, items, icon: Icon, onSelect }: CategoryModalProps) {
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
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="fixed top-0 left-0 bottom-0 w-full max-w-lg bg-brand-black border-r border-brand-white/10 z-[610] p-12 overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-brand-white/40 hover:text-brand-gold transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-16">
              <div className="w-12 h-12 bg-brand-gold rounded-sm flex items-center justify-center text-brand-black">
                <Icon size={24} />
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tighter uppercase italic">{title}</h2>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect?.(item);
                    onClose();
                  }}
                  className="w-full group flex items-center justify-between p-6 bg-brand-white/5 border border-brand-white/10 hover:border-brand-gold hover:bg-brand-gold/10 transition-all text-left"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">{item}</span>
                  <ChevronRight size={16} className="text-brand-white/20 group-hover:text-brand-gold transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
