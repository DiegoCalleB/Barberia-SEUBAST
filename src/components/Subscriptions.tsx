import React from 'react';
import { SUBSCRIPTIONS } from '../constants';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export function Subscriptions() {
  return (
    <section id="suscripciones" className="py-16 md:py-32 bg-surface-container-low relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <span className="text-primary font-label uppercase tracking-[0.3em] text-[10px] md:text-xs mb-2 md:mb-4 block">Membresía Exclusiva</span>
          <h2 className="serif-display text-3xl md:text-6xl font-bold mb-3 md:mb-6">The Gentleman's Club</h2>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto text-xs md:text-lg leading-relaxed font-light">
            Únete a nuestro círculo íntimo. Una experiencia de cuidado personal sin límites, diseñada para el caballero que mantiene su imagen con rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {SUBSCRIPTIONS.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`bg-background border p-6 md:p-10 rounded-lg md:rounded-sm relative group transition-all duration-500 flex flex-col ${
                sub.highlight ? 'border-primary shadow-[0_0_30px_rgba(233,193,118,0.1)]' : 'border-outline-variant/10 hover:border-primary/30'
              }`}
            >
              {sub.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full font-label text-[10px] uppercase tracking-widest font-bold">
                  Más Rentable
                </div>
              )}
              <h3 className="serif-display text-xl md:text-2xl mb-2">{sub.name}</h3>
              <p className="font-body text-[10px] md:text-xs text-on-surface-variant font-light mb-4 min-h-[40px]">
                {sub.target}
              </p>
              <div className="flex items-baseline gap-2 mb-6 md:mb-8">
                <span className="text-3xl md:text-4xl font-headline text-primary">€{sub.price.toFixed(2)}</span>
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-[9px] md:text-[10px]">/ {sub.period}</span>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-8 md:mb-12 flex-grow">
                {sub.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 md:gap-3 text-on-surface-variant font-light text-xs md:text-sm">
                    <Check size={16} className="text-primary mt-0.5 shrink-0 md:w-[16px] md:h-[16px]" />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 md:py-4 border font-label uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] font-bold transition-all duration-500 rounded-full md:rounded-none mt-auto ${
                sub.highlight ? 'bg-primary text-on-primary border-primary hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary hover:text-on-primary'
              }`}>
                Suscribirse Ahora
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 md:mt-24 bg-surface-container-high max-w-4xl mx-auto py-8 px-5 md:py-16 md:px-12 rounded-lg md:rounded-sm border border-outline-variant/10 text-center">
          <h3 className="serif-display text-xl md:text-3xl mb-3 md:mb-6">Asesoramiento de Autor</h3>
          <p className="text-on-surface-variant font-light leading-relaxed mb-5 md:mb-8 text-xs md:text-base">
            Nuestros maestros barberos no solo ejecutan, sino que asesoran. En cada visita, analizamos tus facciones y tipo de cabello para proponerte ideas que eleven tu estilo personal.
          </p>
          <button className="text-primary font-label uppercase text-[10px] md:text-xs tracking-widest border-b border-primary/30 pb-1 hover:border-primary transition-all">
            Hablar con un Maestro
          </button>
        </div>
      </div>
    </section>
  );
}
