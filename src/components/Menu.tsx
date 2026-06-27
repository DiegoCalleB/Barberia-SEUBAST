import React, { useState } from 'react';
import { SERVICES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export function Menu() {
  const [activeTab, setActiveTab] = useState('Destacados');
  const tabs = ['Destacados', 'Cabello', 'Barba', 'Cabello y Barba'];

  const filteredServices = SERVICES.filter(service => {
    if (activeTab === 'Destacados') return service.featured;
    return service.category === activeTab;
  });

  return (
    <section id="menu" className="py-12 md:py-24 bg-surface-container-low">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 md:mb-12 gap-4 md:gap-8">
          <div className="max-w-2xl">
            <span className="text-primary font-label uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2 md:mb-4 block">Servicios Selectos</span>
            <h2 className="serif-display text-3xl md:text-5xl font-bold">El Menú</h2>
            <p className="mt-2 md:mt-4 text-on-surface-variant italic text-xs md:text-sm">Nota: Todos nuestros cortes estándar incluyen lavado con productos premium.</p>
          </div>
          <p className="max-w-xs font-body text-xs md:text-sm text-on-surface-variant uppercase tracking-[0.1em] leading-relaxed md:text-right hidden sm:block">
            Cada servicio es una composición personalizada de oficio y relajación.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-3 mb-6 md:mb-12 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-outline-variant/30">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap flex-shrink-0 snap-start px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-label uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group bg-surface rounded-xl p-5 md:p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="serif-display text-lg md:text-2xl group-hover:text-primary transition-colors duration-300 leading-tight">
                    {service.name}
                  </h3>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-headline text-primary text-lg md:text-xl">
                      {service.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                    {service.discount && (
                      <span className="text-[10px] font-label text-green-600 mt-0.5 bg-green-500/10 px-2 py-0.5 rounded-full">
                        {service.discount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="menu-divider mb-3 opacity-50"></div>
                <p className="text-on-surface-variant font-light leading-snug mb-5 flex-grow text-xs md:text-sm">
                  {service.description}
                </p>
                <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                  <span className="text-[9px] md:text-[10px] font-label uppercase tracking-widest text-outline">
                    {service.duration} Min
                  </span>
                  <button className="bg-primary text-on-primary py-2 px-4 md:py-3 md:px-6 rounded-full font-label uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary/90 transition-all shadow-sm">
                    Reservar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12 md:mt-24 relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-xl group">
          <img
            alt="Interior de una barbería selecta de lujo"
            className="w-full h-full object-cover grayscale opacity-50 group-hover:scale-105 transition-transform duration-1000"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSnIOi23B2X6Fl2wCd6zumAEZlFztl24Q8a-6_RBvB8FxGqHbvP9YKEG9DH-kzXXjO3cEYHH2R0jsQ_JXSULqiBieDrrAqQXF3FVbhKVZnZvAmP9T8O6MdMllGPFe1AJvOQAT0eEIefQdYf_cuOcNN3_eits03j8GxoGsCKx5gs45BYQgduuNsEn_dSiUUI7Bnu7oPpfHN7TieipohXJdyzkUR-Rrsrx9Tvqlfa1iVl_XAgQRHingEdlCVOuEk-c21nT0sc9FNx7da"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40"></div>
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 pr-6">
            <p className="serif-display text-lg md:text-2xl italic">"La excelencia no es un acto, sino un hábito."</p>
          </div>
        </div>
      </div>
    </section>
  );
}
