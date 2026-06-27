import React from 'react';
import { motion } from 'motion/react';
import { Star, ExternalLink } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Alejandro Vargas',
    role: 'Cliente verificado',
    text: 'La meticulosidad en cada detalle es algo que rara vez se ve hoy en día. No solo es un corte, es una experiencia donde realmente respetan las facciones de tu rostro. Es mi ritual mensual indispensable.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    name: 'Carlos Montellano',
    role: 'Cliente verificado',
    text: 'He probado muchas barberías buscando ese equilibrio entre técnica clásica y estilo moderno. Aquí encontré exactamente eso. El ambiente de la sala, el trato y el cuidado de la barba son impecables.',
    image: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    name: 'Javier Domínguez',
    role: 'Cliente verificado',
    text: 'La suscripción al Estudio ha sido la mejor inversión en mi imagen. Siempre estoy presentable para mis compromisos profesionales. El asesoramiento y la calidad de los productos marcan la diferencia.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    name: 'Miguel Santamaría',
    role: 'Cliente verificado',
    text: 'Desde la primera visita supe que me quedaría. Te asesoran sobre el estilo que mejor va con la forma de tu cara y el resultado es de 10. Completamente recomendable para quien busca calidad.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    name: 'Roberto Navarro',
    role: 'Cliente verificado',
    text: 'El trato al cliente es inmejorable, la música, el lugar, cada detalle cuenta. Tienen una gran variedad de productos y te enseñan a usarlos para mantener el corte en casa.',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    name: 'Hugo Estévez',
    role: 'Cliente verificado',
    text: 'Increíble experiencia con el simulador de IA antes del corte. Luego pasas a la silla y el barbero transforma esa idea en realidad con una precisión milimétrica.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 5,
  }
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function Testimonials() {
  return (
    <section id="testimonios" className="py-24 md:py-32 bg-surface-container-lowest text-on-background border-t border-outline-variant/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 md:mb-24">
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 bg-surface px-6 py-3 rounded-full shadow-md border border-outline-variant/20 inline-flex">
            <GoogleIcon />
            <div className="flex items-center gap-1">
              <span className="font-bold text-on-surface">5.0</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-current" />
                ))}
              </div>
            </div>
          </div>
          
          <h2 className="serif-display text-4xl md:text-5xl font-bold mb-6">
            Reseñas de <span className="italic font-light opacity-60">nuestros clientes</span>
          </h2>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto">
            Descubre por qué nuestros clientes confían en nosotros para su cuidado personal. Lee las opiniones y experiencias reales en nuestra página de Google.
          </p>
        </div>
      </div>

      <div 
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 pb-16 px-6 md:px-12 xl:px-[calc((100vw-1280px)/2+1.5rem)] mb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          #testimonios ::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
            className="flex-none w-[85vw] sm:w-[400px] snap-center bg-surface p-8 md:p-10 flex flex-col items-center text-center shadow-lg relative rounded-2xl border border-outline-variant/5 mt-10"
          >
              <div className="absolute top-6 right-6 opacity-80">
                <GoogleIcon />
              </div>

              <div className="absolute -top-10 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-surface shadow-xl">
                <img 
                  src={testimonial.image} 
                  alt={`Retrato de ${testimonial.name}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex gap-1 mt-10 md:mt-12 mb-6 text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </div>

              <p className="font-body text-sm md:text-base text-on-surface-variant font-light italic leading-relaxed mb-8 flex-grow">
                "{testimonial.text}"
              </p>

              <div>
                <h4 className="font-label uppercase text-xs md:text-sm tracking-widest font-bold text-on-surface mb-1">
                  {testimonial.name}
                </h4>
                <p className="font-body text-[10px] md:text-xs text-on-surface-variant/50 flex items-center justify-center gap-1">
                  <svg viewBox="0 0 24 24" width="12" height="12" className="text-green-600 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
          <motion.a
            href="https://maps.app.goo.gl/hGMi1i1GqNLHNed46?g_st=ac"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-label uppercase text-xs tracking-widest font-bold shadow-xl border border-black/5 hover:shadow-2xl transition-all"
          >
            <GoogleIcon />
            Ver todas las reseñas en Google
            <ExternalLink size={16} className="text-black/40" />
          </motion.a>
        </div>
    </section>
  );
}
