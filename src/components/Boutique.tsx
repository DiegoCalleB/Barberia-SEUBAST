import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { CartDrawer } from './CartDrawer';

export function Boutique() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Pelo');
  const { addItem, itemCount } = useCartStore();

  const categories = useMemo(() => {
    return ['Pelo', 'Barba', 'Accesorios'];
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section id="boutique" className="py-16 md:py-32 bg-background relative">
      {/* Floating Cart Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary text-on-primary p-4 rounded-full shadow-2xl flex items-center justify-center group"
      >
        <ShoppingBag size={24} />
        {itemCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-on-surface text-surface text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">
            {itemCount()}
          </span>
        )}
        <span className="absolute right-full mr-4 bg-on-surface text-surface text-[10px] font-label uppercase tracking-widest px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ver Carrito
        </span>
      </motion.button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12">
        <header className="mb-12 md:mb-16 text-center md:text-left">
          <span className="text-primary font-label uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 md:mb-4 block">Curaduría de Productos</span>
          <h2 className="serif-display text-4xl md:text-6xl font-bold mb-4 md:mb-6">La Boutique</h2>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto md:mx-0 text-sm md:text-lg leading-relaxed font-light italic">
            Nuestra colección curada de productos esenciales de peluquería artesanal. Elaborados en Italia, diseñados para el caballero moderno que exige la excelencia en cada ritual.
          </p>
        </header>

        {/* Category Filters */}
        <div className="mb-12 flex flex-wrap items-center gap-3 justify-center md:justify-start">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all duration-300 border ${
                selectedCategory === category
                  ? 'bg-primary text-on-primary border-primary shadow-lg scale-105'
                  : 'bg-surface text-on-surface-variant border-outline-variant/20 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 md:gap-y-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.article
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group flex flex-col"
              >
                <div className="aspect-square bg-surface-container-highest overflow-hidden mb-4 relative rounded-xl border border-outline-variant/10 p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110 drop-shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center rounded-xl">
                    <button 
                      onClick={() => addItem(product)}
                      className="bg-primary text-on-primary p-2 md:px-4 md:py-2 font-label text-[10px] uppercase tracking-widest font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2 rounded-full hover:bg-on-primary hover:text-primary transition-colors"
                    >
                      <ShoppingCart size={14} className="md:w-4 md:h-4" />
                      <span className="hidden md:inline">Añadir</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 md:space-y-2 flex-grow flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 sm:gap-2">
                    <h3 className="serif-display text-base md:text-lg text-on-surface group-hover:text-primary transition-colors duration-300 leading-tight">
                      {product.name}
                    </h3>
                    <span className="font-headline text-primary text-sm md:text-base whitespace-nowrap">€{product.price}</span>
                  </div>
                  <p className="font-body text-[10px] md:text-xs text-on-surface-variant font-light leading-relaxed line-clamp-2 flex-grow">
                    {product.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-outline-variant/10 mt-auto">
                    <span className="text-[8px] md:text-[9px] font-label uppercase tracking-widest text-outline truncate max-w-[60%]">
                      {product.category}
                    </span>
                    <button className="text-[8px] md:text-[9px] font-label uppercase tracking-widest text-primary hover:text-on-surface transition-colors whitespace-nowrap">
                      Detalles
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-16 md:mt-24 text-center">
          <button className="serif-display text-lg md:text-xl text-primary border-b border-primary pb-1 md:pb-2 hover:opacity-70 transition-opacity italic">
            Descubrir más Tesoros
          </button>
        </div>
      </div>
    </section>
  );
}
