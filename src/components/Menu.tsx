import React from 'react';
import { SERVICES } from '../constants';
import { motion } from 'motion/react';

export function Menu() {
  return (
    <section id="menu" className="py-32 bg-surface-container-low">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-primary font-label uppercase tracking-[0.3em] text-xs mb-4 block">Servicios Selectos</span>
            <h2 className="serif-display text-6xl font-bold">El Menú</h2>
            <p className="mt-4 text-on-surface-variant italic">Nota: Todos nuestros cortes estándar incluyen lavado con productos premium.</p>
          </div>
          <p className="max-w-xs font-body text-sm text-on-surface-variant uppercase tracking-[0.15em] leading-relaxed text-right">
            Cada servicio es una composición personalizada de oficio y relajación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="serif-display text-2xl group-hover:text-primary transition-colors duration-300">
                  {service.name}
                </h3>
                <span className="font-headline text-primary text-xl">€{service.price}</span>
              </div>
              <div className="menu-divider mb-4"></div>
              <p className="text-on-surface-variant font-light leading-relaxed mb-6">
                {service.description}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-label uppercase tracking-widest text-outline">
                  {service.duration} Minutos
                </span>
                <button className="text-[10px] font-label uppercase tracking-widest text-primary border-b border-primary/30 pb-1 hover:border-primary transition-all">
                  Reservar Ritual
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 relative w-full aspect-[21/9] overflow-hidden rounded-sm group">
          <img
            alt="Interior de una barbería selecta de lujo"
            className="w-full h-full object-cover grayscale opacity-50 group-hover:scale-105 transition-transform duration-1000"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSnIOi23B2X6Fl2wCd6zumAEZlFztl24Q8a-6_RBvB8FxGqHbvP9YKEG9DH-kzXXjO3cEYHH2R0jsQ_JXSULqiBieDrrAqQXF3FVbhKVZnZvAmP9T8O6MdMllGPFe1AJvOQAT0eEIefQdYf_cuOcNN3_eits03j8GxoGsCKx5gs45BYQgduuNsEn_dSiUUI7Bnu7oPpfHN7TieipohXJdyzkUR-Rrsrx9Tvqlfa1iVl_XAgQRHingEdlCVOuEk-c21nT0sc9FNx7da"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40"></div>
          <div className="absolute bottom-12 left-12">
            <p className="serif-display text-2xl italic">"La excelencia no es un acto, sino un hábito."</p>
          </div>
        </div>
      </div>
    </section>
  );
}
