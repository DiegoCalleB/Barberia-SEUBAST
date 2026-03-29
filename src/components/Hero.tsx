import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative h-screen min-h-[800px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="Barbería de lujo vintage"
          className="w-full h-screen object-cover brightness-[0.4]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBHoEsXZjE8uORFPGK2sq9reoQ9Id61vy_LzvmsI5azp7rZ19xU4zMG10K9T2rrF4EbBUh1rjYxIBXssKmMP_Y2W3Jm8y3O2kEPoXw9H-y0D9rsMJyNdrLofcFNdjmCcoqigpAq6j9sA7Qm-ZDcd0_obQnI0WGE7BuV_K1FP0FR69zjzm3ZmowikaurXs_kjqLHIcYXNnSIizFIi7p98h6ywYFzooOk0gslaNM7PGgIddi6yDCTicTh89Rash9kM26g9ipg7DDkD0U"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background"></div>
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1920px] mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <span className="inline-block text-primary font-label uppercase tracking-[0.4em] text-xs mb-6">
            Establecido MCMXCIX
          </span>
          <h1 className="serif-display text-6xl md:text-9xl font-bold leading-tight tracking-tight text-on-background mb-8">
            La Artesanía <br />
            <span className="italic font-normal text-primary">del Corte</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10 mt-12">
            <button className="bg-primary text-on-primary px-10 py-5 rounded-sm font-label uppercase text-sm tracking-widest font-bold flex items-center gap-3 hover:shadow-[0_0_30px_rgba(233,193,118,0.2)] transition-all duration-500 group">
              Reservar Experiencia
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="hidden md:block h-[1px] w-24 bg-outline-variant/30"></div>
            <p className="font-body text-on-surface-variant max-w-xs text-sm uppercase tracking-widest leading-loose">
              La Barbería Selecta definitiva para el caballero moderno.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-12 right-12 hidden lg:block"
      >
        <img
          alt="Corte de cabello moderno premium"
          className="w-[300px] h-[400px] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border border-outline-variant/10"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqC4SRomrQAnNzKlCeC_NkdfLLf4Pr2gI7Z_Qd5qs--YSCaiYRuHVzxh52ldd2xJSqxjenhTlRtnuav0YAHpw4NELb3XFLYP1ShfoFPZfT7gxvvR3g3xGtdmlte5jxD6mbQS9lBxjuc8p5jMXOoOA0MUJ0hA2eHLTHQ-4GlYOETUnNWlj9Rk8K6xO0wFL-OTzCV7gxdK81rzKIxyHPvOFLXqmwAdtBhGWyMxOiPtsO3SG6x7x8w82Rxi4N5Qa8qsHmo_-o5qbyrQcr"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </section>
  );
}
