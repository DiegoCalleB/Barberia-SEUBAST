import React from 'react';
import { PRODUCTS } from '../constants';
import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';

export function Boutique() {
  return (
    <section id="boutique" className="py-32 bg-background">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <header className="mb-20 text-center md:text-left">
          <span className="text-primary font-label uppercase tracking-[0.3em] text-xs mb-4 block">Curaduría de Productos</span>
          <h2 className="serif-display text-6xl font-bold mb-6">La Boutique</h2>
          <p className="font-body text-on-surface-variant max-w-2xl text-lg leading-relaxed font-light italic">
            Nuestra colección curada de productos esenciales de peluquería artesanal. Elaborados en Italia, diseñados para el caballero moderno que exige la excelencia en cada ritual.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {PRODUCTS.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="aspect-[4/5] bg-surface-container-low overflow-hidden mb-8 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <button className="bg-primary text-on-primary px-8 py-3 font-label text-xs uppercase tracking-widest font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2">
                    <ShoppingCart size={16} />
                    Añadir al Carrito
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="serif-display text-2xl text-on-surface group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>
                  <span className="font-headline text-primary text-xl">€{product.price}</span>
                </div>
                <p className="font-body text-sm text-on-surface-variant font-light leading-relaxed">
                  {product.description}
                </p>
                <div className="pt-4 flex items-center justify-between border-t border-outline-variant/10">
                  <span className="text-[10px] font-label uppercase tracking-widest text-outline">
                    {product.category}
                  </span>
                  <button className="text-[10px] font-label uppercase tracking-widest text-primary hover:text-on-surface transition-colors">
                    Detalles
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-24 text-center">
          <button className="serif-display text-xl text-primary border-b border-primary pb-2 hover:opacity-70 transition-opacity italic">
            Descubrir más Tesoros
          </button>
        </div>
      </div>
    </section>
  );
}
