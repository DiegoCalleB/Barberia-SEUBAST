import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HAIRCUT_STYLES, BEARD_STYLES, COMBINED_STYLES } from '../constants';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

export function Styles() {
  const [activeCategory, setActiveCategory] = useState<'hair' | 'beard' | 'both'>('hair');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const styles = activeCategory === 'hair' ? HAIRCUT_STYLES : (activeCategory === 'beard' ? BEARD_STYLES : COMBINED_STYLES);
  
  const INITIAL_COUNT = 6;
  const displayedStyles = isExpanded ? styles : styles.slice(0, INITIAL_COUNT);
  const hasMore = styles.length > INITIAL_COUNT;

  const handleCategoryChange = (category: 'hair' | 'beard' | 'both') => {
    setActiveCategory(category);
    setIsExpanded(false);
  };

  return (
    <section id="estilos" className="py-16 md:py-32 bg-surface-container-lowest relative overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <span className="text-primary font-label uppercase tracking-[0.3em] text-[10px] md:text-xs mb-2 md:mb-4 block">Inspiración</span>
          <h2 className="serif-display text-3xl md:text-6xl font-bold mb-3 md:mb-6">Estilos Más Solicitados</h2>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto text-xs md:text-lg leading-relaxed font-light mb-12">
            Conoce los cortes que marcan tendencia en nuestro estudio. Cada estilo requiere un tiempo específico de ejecución para garantizar un acabado impecable.
          </p>

          {/* Category Switcher */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
            <button
              onClick={() => handleCategoryChange('hair')}
              className={`font-label uppercase text-[10px] md:text-xs tracking-[0.3em] pb-2 border-b-2 transition-all duration-300 ${activeCategory === 'hair' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary/60'}`}
            >
              Cortes de Pelo
            </button>
            <button
              onClick={() => handleCategoryChange('beard')}
              className={`font-label uppercase text-[10px] md:text-xs tracking-[0.3em] pb-2 border-b-2 transition-all duration-300 ${activeCategory === 'beard' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary/60'}`}
            >
              Arreglos de Barba
            </button>
            <button
              onClick={() => handleCategoryChange('both')}
              className={`font-label uppercase text-[10px] md:text-xs tracking-[0.3em] pb-2 border-b-2 transition-all duration-300 ${activeCategory === 'both' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary/60'}`}
            >
              Pelo + Barba
            </button>
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {displayedStyles.map((style, index) => (
              <motion.div
                key={style.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg aspect-[4/5] mb-4">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" />
                    <span className="font-label uppercase tracking-widest text-[9px] font-bold">{style.duration} Min</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="serif-display text-xl md:text-2xl mb-2 group-hover:text-primary transition-colors">{style.name}</h3>
                  <p className="font-body text-xs md:text-sm text-on-surface-variant font-light leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Expand/Collapse Button */}
        {hasMore && (
          <div className="mt-16 flex justify-center w-full">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex flex-col items-center gap-3 text-on-surface hover:text-primary transition-colors duration-300"
            >
              <span className="font-label uppercase text-[10px] md:text-xs tracking-[0.3em] font-bold">
                {isExpanded ? 'Ver Menos' : 'Ver Todos los Estilos'}
              </span>
              <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center group-hover:border-primary transition-colors">
                {isExpanded ? (
                  <ChevronUp size={16} className="text-on-surface-variant group-hover:text-primary" />
                ) : (
                  <ChevronDown size={16} className="text-on-surface-variant group-hover:text-primary" />
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
