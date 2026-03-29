import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Essence } from './components/Essence';
import { Menu } from './components/Menu';
import { Boutique } from './components/Boutique';
import { Gallery } from './components/Gallery';
import { Subscriptions } from './components/Subscriptions';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  // Global click handler to redirect to Taplink from any "Reservar" button
  const handleOpenBooking = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.innerText.toLowerCase().includes('reservar')) {
      window.location.href = 'https://taplink.cc/seubast';
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background" onClick={handleOpenBooking}>
        <Navbar />
        <main>
          <Hero />
          <Essence />
          <Menu />
          <Boutique />
          <Gallery />
          <Subscriptions />
          
          {/* Final CTA Section */}
          <section className="relative py-40 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                alt="Vista atmosférica de la Barbería Selecta"
                className="w-full h-full object-cover brightness-[0.3]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChhLyFBlgg5_TxVZOw6ilLwcx_4Cw7fqedn52Id0-Ry-Ze42jg9FISWj34tgJ1THei2xdcOMVn59Qy7_R4B10CTy-9pg3AseiTITOWE_baXgvwwwIeHJPNFiRN3e3-N9HD5YcCFXRim4YfGMQb7jJFmr0KfStzI83ETjgRCJ_E8PglixPaGboDr_lUJMHlM0s7HOu8KTfgtSljUn_rwjEdOG5A77fEZReTpin8Mr8Ad3-vj-Wojqjm08mqZp03OsEbX4YPY-PQ7p2b"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
              <h2 className="serif-display text-6xl md:text-8xl font-bold mb-10 leading-tight">Reserve Ahora</h2>
              <p className="font-body text-xl text-on-surface-variant font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                Asegure su tiempo en nuestro Estudio de Corte. Operamos solo con cita previa para garantizar que cada cliente reciba nuestro oficio indiviso.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <button
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary px-16 py-6 rounded-sm font-label uppercase text-sm tracking-[0.3em] font-bold hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Reservar un Sillón
                </button>
                <a
                  href="tel:+34912571742"
                  className="font-label uppercase text-sm tracking-widest text-on-background border-b border-on-background/30 pb-2 hover:text-primary hover:border-primary transition-all"
                >
                  Llamar al Estudio
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

