import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '../lib/useAuth';
import { cn } from '../lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const navLinks = [
    { name: 'La Esencia', href: '#esencia' },
    { name: 'Espejo Virtual', href: '#ai-stylist' },
    { name: 'El Menú', href: '#menu' },
    { name: 'Maestros', href: '#maestros' },
    { name: 'La Boutique', href: '#boutique' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Suscripciones', href: '#suscripciones' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-12 py-4 md:py-6',
        isScrolled ? 'bg-background/80 backdrop-blur-xl py-3 md:py-4' : 'bg-transparent'
      )}
    >
      <div className="max-w-[1920px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-headline tracking-[0.2em] text-on-background">SEUBAST</span>
        </div>

        <div className="hidden lg:flex items-center gap-12 font-headline tracking-widest uppercase text-xs">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-on-background hover:text-primary transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button className="text-on-background hover:text-primary transition-colors">
            <ShoppingBag size={20} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="hidden md:block text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                Salir
              </button>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-primary/30">
                <img src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden md:flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-background hover:text-primary transition-colors"
            >
              <UserIcon size={16} />
              Acceder
            </button>
          )}

          <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-1.5 md:px-6 md:py-2 rounded-sm font-label uppercase text-[10px] md:text-xs tracking-widest font-semibold hover:opacity-90 transition-all active:scale-95">
            Reservar
          </button>

          <button
            className="lg:hidden text-on-background ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-surface-container-high border-t border-outline-variant/10 p-6 flex flex-col gap-6 lg:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-headline tracking-widest uppercase text-on-background hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
