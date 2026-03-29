import React from 'react';
import { SUBSCRIPTIONS } from '../constants';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export function Subscriptions() {
  return (
    <section id="suscripciones" className="py-32 bg-surface-container-low relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <span className="text-primary font-label uppercase tracking-[0.3em] text-xs mb-4 block">Membresía Exclusiva</span>
          <h2 className="serif-display text-6xl font-bold mb-6">Tarifa Plana</h2>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Únete a nuestro círculo íntimo. Una experiencia de cuidado personal sin límites, diseñada para el caballero que mantiene su imagen con rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {SUBSCRIPTIONS.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-background border border-outline-variant/10 p-12 rounded-sm relative group hover:border-primary/30 transition-all duration-500"
            >
              <h3 className="serif-display text-3xl mb-4">{sub.name}</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-headline text-primary">€{sub.price}</span>
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-xs">/ {sub.period}</span>
              </div>

              <ul className="space-y-6 mb-12">
                {sub.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4 text-on-surface-variant font-light">
                    <Check size={18} className="text-primary mt-1 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-5 border border-primary text-primary font-label uppercase text-xs tracking-[0.3em] font-bold hover:bg-primary hover:text-on-primary transition-all duration-500">
                Suscribirse Ahora
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 bg-surface-container-high max-w-4xl mx-auto py-16 px-12 rounded-sm border border-outline-variant/10 text-center">
          <h3 className="serif-display text-3xl mb-6">Asesoramiento de Autor</h3>
          <p className="text-on-surface-variant font-light leading-relaxed mb-8">
            Nuestros maestros barberos no solo ejecutan, sino que asesoran. En cada visita, analizamos tus facciones y tipo de cabello para proponerte ideas que eleven tu estilo personal.
          </p>
          <button className="text-primary font-label uppercase text-xs tracking-widest border-b border-primary/30 pb-1 hover:border-primary transition-all">
            Hablar con un Maestro
          </button>
        </div>
      </div>
    </section>
  );
}
