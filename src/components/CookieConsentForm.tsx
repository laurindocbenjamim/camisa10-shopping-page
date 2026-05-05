import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import cookiePolicy from '../cookiePolicy.json';
import { X, Check } from 'lucide-react';

export default function CookieConsentForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsentPreferences');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(consent));
      } catch (e) {
        console.error("Failed to parse cookie preferences");
      }
    }
  }, []);

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsentPreferences', JSON.stringify(prefs));
    // Backwards compatibility with the old simple consent
    localStorage.setItem('cookieConsent', prefs.analytics || prefs.marketing ? 'all' : 'essential');
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const handleDecline = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'essential') return; // Cannot toggle essential
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 w-full z-[500] bg-brand-black/95 backdrop-blur-2xl border-t border-brand-white/10 p-6 md:p-8 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto">
            {!showSettings ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-brand-gold font-display font-bold uppercase tracking-widest text-sm">
                      {cookiePolicy.title}
                    </h3>
                  </div>
                  <p className="text-[11px] leading-relaxed text-brand-white/70">
                    {cookiePolicy.description}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-3 border border-brand-white/20 text-brand-white font-bold uppercase tracking-[0.1em] text-[10px] hover:border-brand-gold hover:text-brand-gold transition-colors"
                  >
                    {cookiePolicy.buttons.settings}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-6 py-3 border border-brand-white/20 text-brand-white font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-brand-white/5 transition-colors"
                  >
                    {cookiePolicy.buttons.decline}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-8 py-3 bg-brand-gold text-brand-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white transition-colors"
                  >
                    {cookiePolicy.buttons.acceptAll}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto"
              >
                <div className="flex justify-between items-center mb-6 border-b border-brand-white/10 pb-4">
                  <h3 className="text-brand-gold font-display font-bold uppercase tracking-widest text-lg">
                    Preferências de Privacidade
                  </h3>
                  <button onClick={() => setShowSettings(false)} className="text-brand-white/50 hover:text-brand-white">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6 mb-8">
                  {cookiePolicy.sections.map((section) => (
                    <div key={section.id} className="flex gap-4 items-start bg-brand-white/5 p-4 border border-brand-white/5">
                      <div className="pt-1">
                        <button 
                          onClick={() => togglePreference(section.id as any)}
                          disabled={section.required}
                          className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                            preferences[section.id as keyof typeof preferences] 
                              ? 'bg-brand-gold border-brand-gold text-brand-black' 
                              : 'border-brand-white/30 text-transparent'
                          } ${section.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-gold'}`}
                        >
                          <Check size={14} className={preferences[section.id as keyof typeof preferences] ? 'opacity-100' : 'opacity-0'} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold uppercase tracking-widest text-xs text-brand-white">
                            {section.title}
                          </h4>
                          {section.required && (
                            <span className="text-[9px] uppercase tracking-widest text-brand-gold">Obrigatório</span>
                          )}
                        </div>
                        <p className="text-[10px] text-brand-white/50 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-3 border border-brand-white/20 text-brand-white font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-brand-white/5 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-8 py-3 bg-brand-gold text-brand-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-white transition-colors"
                  >
                    Guardar Preferências
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
