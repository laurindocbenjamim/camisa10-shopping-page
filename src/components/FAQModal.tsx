import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "Quanto tempo demora a entrega?",
    answer: "O prazo médio de entrega em Portugal Continental é de 5-10 dias úteis. Para as ilhas e outros países europeus, o prazo pode estender-se até 15 dias úteis."
  },
  {
    question: "Como posso acompanhar o meu pedido?",
    answer: "Após o envio, receberá um e-mail com o código de seguimento (tracking number) e um link para acompanhar a entrega em tempo real."
  },
  {
    question: "Os produtos são originais?",
    answer: "Trabalhamos com equipamentos de alta qualidade (versão jogador e adepto) que garantem a melhor durabilidade e conforto, idênticos aos usados pelos profissionais."
  },
  {
    question: "Posso devolver ou trocar um produto?",
    answer: "Sim, aceitamos trocas e devoluções num prazo de 14 dias após a receção, desde que o produto esteja nas condições originais e com as etiquetas. Equipamentos personalizados não podem ser devolvidos."
  }
];

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
                <HelpCircle size={24} />
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tighter uppercase italic">Perguntas <span className="text-brand-gold">Frequentes</span></h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-brand-white/10 bg-brand-white/5 overflow-hidden">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-brand-white/5 transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{faq.question}</span>
                    {expandedIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-xs text-brand-white/40 leading-relaxed uppercase tracking-wider"
                      >
                        {faq.answer}
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
  );
}
