import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary" size={24} />
                <h2 className="serif-display text-2xl text-on-surface">Tu Carrito</h2>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {itemCount()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                    <ShoppingBag size={32} className="text-outline" />
                  </div>
                  <div>
                    <h3 className="serif-display text-xl text-on-surface">Carrito vacío</h3>
                    <p className="text-on-surface-variant text-sm mt-2">
                      Parece que aún no has añadido ningún tesoro a tu colección.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="font-label uppercase text-[10px] tracking-widest text-primary border border-primary/20 px-6 py-3 rounded-full hover:bg-primary/5 transition-colors"
                  >
                    Seguir Comprando
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/10">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-body font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 bg-surface-container-high rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-headline text-primary text-sm font-bold">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="text-on-surface font-bold">€{total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Envío</span>
                    <span className="text-on-surface font-bold">Gratis</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
                    <span className="serif-display text-xl text-on-surface">Total</span>
                    <span className="serif-display text-2xl text-primary">€{total().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-label uppercase text-xs tracking-[0.2em] font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Finalizar Compra
                  <ArrowRight size={16} />
                </button>
                <p className="text-[10px] text-center text-on-surface-variant italic">
                  Impuestos incluidos. Envío premium asegurado.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
