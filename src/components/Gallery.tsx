import React from 'react';
import { motion } from 'motion/react';

const GALLERY_IMAGES = [
  'https://images.fresha.com/locations/location-profile-images/1009549/5594269/df72e876-e5ff-40e3-92b0-225ada2d81b0-BarberaSeubastLasRosas-ES-ComunidadDeMadrid-Madrid-SanBlas-canillejas-Fresha.jpg?class=fallback',
  'https://images.fresha.com/locations/location-profile-images/1009549/5594270/d45a70d5-ff9a-485b-8b9d-499819229498-BarberaSeubastLasRosas-ES-ComunidadDeMadrid-Madrid-SanBlas-canillejas-Fresha.jpg?class=fallback',
  'https://images.fresha.com/locations/location-profile-images/1009549/5594271/4643d416-60be-4f7b-a058-017eeeeb5e98-BarberaSeubastLasRosas-ES-ComunidadDeMadrid-Madrid-SanBlas-canillejas-Fresha.jpg?class=fallback',
  'https://images.fresha.com/locations/location-profile-images/1009549/5594272/9354dd5e-e208-488e-9ec3-8062372455a1-BarberaSeubastLasRosas-ES-ComunidadDeMadrid-Madrid-SanBlas-canillejas-Fresha.jpg?class=fallback'
];

export function Gallery() {
  return (
    <section id="galeria" className="py-16 md:py-32 bg-background">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12">
        <header className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-outline-variant/20 pb-8 md:pb-12">
          <div className="max-w-2xl">
            <span className="font-label uppercase tracking-[0.3em] text-primary text-[10px] md:text-xs mb-3 md:mb-4 block">Nuestra Barbería Selecta</span>
            <h2 className="serif-display text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none mb-4 md:mb-6">Galería de Arte</h2>
            <p className="font-body text-on-surface-variant text-sm md:text-lg lg:text-xl font-light leading-relaxed">
              Peinados de barbería actual. Un viaje visual curado a través de nuestros cortes insignia.
            </p>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer group">
            <span className="font-label text-[10px] md:text-sm tracking-widest uppercase">Seguir @SEUBAST</span>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {GALLERY_IMAGES.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden bg-surface-container-low p-1 md:p-2 transition-all duration-500 hover:bg-surface-container"
            >
              <div className="relative overflow-hidden aspect-square outline outline-1 outline-outline-variant/10 group-hover:outline-primary/40 transition-all duration-700">
                <img
                  src={img}
                  alt={`Galería ${index + 1}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500 flex flex-col justify-end p-4 md:p-8">
                  <span className="text-primary font-label text-[8px] md:text-xs tracking-widest uppercase mb-1 md:mb-2">Estudio de Corte</span>
                  <h3 className="serif-display text-sm md:text-xl">Artesanía Visual</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
