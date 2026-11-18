import React, { useState } from 'react';
import { Award, CheckCircle2, Gift, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export function LoyaltyPassport() {
  const [stamps, setStamps] = useState<number>(3); // 3 of 6 stamps
  const [claimed, setClaimed] = useState(false);

  const addStamp = () => {
    if (stamps < 6) {
      setStamps(prev => prev + 1);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-surface via-background to-surface border-y border-outline/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-surface-container border border-primary/30 p-8 md:p-12 rounded-sm relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary font-label text-xs uppercase tracking-[0.3em] mb-2">
                <Award className="w-4 h-4" />
                <span>Club Privado Seubast</span>
              </div>
              <h2 className="serif-display text-3xl md:text-4xl font-bold">Pasaporte Digital de Fidelidad</h2>
            </div>
            <div className="bg-background/80 border border-outline/20 px-6 py-3 rounded-sm text-center">
              <span className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Tu Nivel Actual</span>
              <span className="serif-display text-xl font-bold text-primary">Socio Caballero (Nivel 2)</span>
            </div>
          </div>

          <p className="font-body text-on-surface-variant text-sm md:text-base mb-8 max-w-2xl">
            Cada visita a nuestro estudio sella su pasaporte digital. Al completar los 6 sellos, disfrute de un arreglo de barba tradicional o un producto de nuestra boutique de cortesía.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isStamped = num <= stamps;
              return (
                <div 
                  key={num}
                  onClick={() => {
                    if (num === stamps + 1) addStamp();
                  }}
                  className={`h-32 border rounded-sm flex flex-col items-center justify-center p-4 transition-all duration-300 relative cursor-pointer group ${
                    isStamped 
                      ? 'bg-primary/10 border-primary text-primary shadow-inner' 
                      : 'bg-background/50 border-outline/20 text-on-surface-variant/40 hover:border-primary/50'
                  }`}
                >
                  <span className="absolute top-2 left-2 text-[10px] font-label">#{num}</span>
                  {isStamped ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-primary mb-2 animate-bounce-subtle" />
                      <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Sellado</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6 mb-2 opacity-40 group-hover:opacity-80 transition-opacity" />
                      <span className="text-[9px] font-label text-center">
                        {num === stamps + 1 ? '¡Clic para simular sello!' : 'Pendiente'}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-outline/10 text-xs font-label">
            <span className="text-on-surface-variant">
              {stamps === 6 ? '¡Felicidades! Tiene un servicio gratuito disponible.' : `Faltan ${6 - stamps} sellos para su próxima recompensa VIP.`}
            </span>
            {stamps === 6 && !claimed && (
              <button
                onClick={() => {
                  setClaimed(true);
                }}
                className="bg-primary text-on-primary px-6 py-3 uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity"
              >
                Canjear Recompensa
              </button>
            )}
            {claimed && (
              <span className="text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Recompensa Canjeada (Código: SEUBAST-VIP-2026)
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
