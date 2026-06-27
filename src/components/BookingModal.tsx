import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ChevronLeft, Scissors, Crown, Loader2, Clock, Calendar } from 'lucide-react';
import { SERVICES, SUBSCRIPTIONS, HAIRCUT_STYLES, BEARD_STYLES, COMBINED_STYLES } from '../constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStyleId?: string | null;
}

type Step = 'select-service' | 'select-style' | 'select-barber' | 'date-time' | 'details' | 'connecting';

const BARBERS = [
  { id: 'any', name: 'Cualquiera', image: null },
  { id: 'gaston', name: 'Gastón', image: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200' },
  { id: 'diego', name: 'Diego', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' },
  { id: 'gabriel', name: 'Gabriel', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: 'carlos', name: 'Carlos Rivero', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200' }
];

export function BookingModal({ isOpen, onClose, initialStyleId }: BookingModalProps) {
  const [step, setStep] = useState<Step>('select-service');
  const [tab, setTab] = useState<'services' | 'subscriptions'>('services');
  const [styleCategory, setStyleCategory] = useState<'hair' | 'beard' | 'combined'>('hair');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      if (initialStyleId) {
        let foundStyle = COMBINED_STYLES.find(s => s.id === initialStyleId) ||
                         HAIRCUT_STYLES.find(s => s.id === initialStyleId) ||
                         BEARD_STYLES.find(s => s.id === initialStyleId);

        // Dynamically build the style if it's a + separated combined look
        if (!foundStyle && initialStyleId.includes('+')) {
          const [hairId, beardId] = initialStyleId.split('+');
          const part1 = HAIRCUT_STYLES.find(s => s.id === hairId);
          const part2 = BEARD_STYLES.find(s => s.id === beardId);
          if (part1 && part2) {
            const rawPrice = (part1.price || 0) + (part2.price || 0);
            const rawDuration = (part1.duration || 0) + (part2.duration || 0);
            foundStyle = {
               id: initialStyleId,
               name: `${part1.name} & ${part2.name}`,
               image: part1.image,
               price: Math.round(rawPrice * 0.85),
               duration: Math.max(rawDuration - 10, 30)
            } as any;
          }
        }

        const serviceId = initialStyleId.includes('+') ? 'corte-arreglo-barba-tradicional' : (HAIRCUT_STYLES.some(s => s.id === initialStyleId) ? 'corte-pelo' : 'perfilado-barba-maquina');
        const service = SERVICES.find(s => s.id === serviceId);

        
        const cat = initialStyleId.includes('+') ? 'combined' : (HAIRCUT_STYLES.some(s => s.id === initialStyleId) ? 'hair' : 'beard');
        setStyleCategory(cat);
        setSelectedItem(service || null);
        setSelectedStyle(foundStyle || null);
        setStep('select-barber');
      } else {
        setStep('select-service');
        setSelectedItem(null);
        setSelectedStyle(null);
      }
      
      setSelectedBarber(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ name: '', email: '', phone: '' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialStyleId]);

  // Handle redirection on connecting step
  useEffect(() => {
    if (step === 'connecting') {
      // Simulate saving lead data to a database/CRM
      const timer = setTimeout(() => {
        // Redirect to Fresha
        window.location.href = 'https://www.fresha.com/';
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const availableDays = useMemo(() => {
    const days = [];
    let d = new Date();
    for (let i = 0; i < 14; i++) {
      if (d.getDay() !== 0) { // Skip Sundays
        days.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, []);

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const slots = [];
    for (let h = 10; h < 20; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }
    return slots;
  }, [selectedDate]);

  const stepsFlow = useMemo(() => {
    return [
      'select-service',
      selectedItem?.requiresStyle ? 'select-style' : null,
      'select-barber',
      'date-time',
      'details'
    ].filter(Boolean) as Step[];
  }, [selectedItem]);

  const canProceed = () => {
    if (step === 'select-service') return selectedItem !== null;
    if (step === 'select-style') return selectedStyle !== null;
    if (step === 'select-barber') return selectedBarber !== null;
    if (step === 'date-time') return selectedDate !== null && selectedTime !== null;
    if (step === 'details') return formData.name.length > 2 && formData.email.includes('@') && formData.phone.length > 6;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    const currentIndex = stepsFlow.indexOf(step);
    if (currentIndex < stepsFlow.length - 1) {
      setStep(stepsFlow[currentIndex + 1]);
    } else {
      setStep('connecting');
    }
  };

  const handleBack = () => {
    const currentIndex = stepsFlow.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepsFlow[currentIndex - 1]);
    }
  };

  const getProgressDots = () => {
    const currentIndex = stepsFlow.indexOf(step);
    const totalSteps = stepsFlow.length;

    return (
      <div className="flex gap-1 mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1 w-8 rounded-full ${i <= currentIndex ? 'bg-primary' : 'bg-outline-variant/20'}`} />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 'connecting' ? undefined : onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface/50">
            <div className="flex items-center gap-4">
              {step !== 'select-service' && step !== 'connecting' && (
                <button onClick={handleBack} className="text-on-surface-variant hover:text-primary transition-colors">
                  <ChevronLeft size={24} />
                </button>
              )}
              <div>
                <h2 className="serif-display text-2xl text-on-surface">
                  {step === 'select-service' && 'Selecciona tu Experiencia'}
                  {step === 'select-style' && 'Elige tu Estilo'}
                  {step === 'select-barber' && 'Elige a tu Barbero'}
                  {step === 'date-time' && 'Fecha y Hora'}
                  {step === 'details' && 'Tus Datos'}
                  {step === 'connecting' && 'Conectando a Fresha...'}
                </h2>
                {step !== 'connecting' && getProgressDots()}
              </div>
            </div>
            {step !== 'connecting' && (
              <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors p-2">
                <X size={24} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow [scrollbar-width:thin]">
            <AnimatePresence mode="wait">
              {step === 'select-service' && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex gap-6 border-b border-outline-variant/20">
                    <button
                      onClick={() => setTab('services')}
                      className={`pb-3 font-label uppercase tracking-widest text-xs flex items-center gap-2 transition-colors ${tab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      <Scissors size={16} /> Servicios
                    </button>
                    <button
                      onClick={() => setTab('subscriptions')}
                      className={`pb-3 font-label uppercase tracking-widest text-xs flex items-center gap-2 transition-colors ${tab === 'subscriptions' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      <Crown size={16} /> Membresías
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(tab === 'services' ? SERVICES : SUBSCRIPTIONS).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          if (!item.requiresStyle) setSelectedStyle(null);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex justify-between items-center ${
                          selectedItem?.id === item.id
                            ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(233,193,118,0.1)]'
                            : 'border-outline-variant/10 hover:border-primary/30 bg-surface'
                        }`}
                      >
                        <div>
                          <h4 className="serif-display text-lg text-on-surface mb-1">{item.name}</h4>
                          <p className="font-body text-xs text-on-surface-variant line-clamp-1 max-w-sm">
                            {'description' in item ? item.description : item.target}
                          </p>
                          {'duration' in item && !item.requiresStyle && (
                            <span className="inline-block mt-2 text-[10px] font-label uppercase tracking-widest text-outline">
                              {item.duration} Min
                            </span>
                          )}
                          {item.requiresStyle && (
                            <span className="inline-block mt-2 text-[10px] font-label uppercase tracking-widest text-primary">
                              Requiere elección de estilo
                            </span>
                          )}
                        </div>
                        <div className="text-right pl-4 shrink-0">
                          <span className="font-headline text-primary text-xl">€{item.price.toFixed(2)}</span>
                          {'period' in item && (
                            <span className="block text-[9px] font-label uppercase tracking-widest text-on-surface-variant">/ {item.period}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'select-style' && (
                <motion.div
                  key="step-style"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="font-body text-sm text-on-surface-variant mb-4">
                    Para organizar mejor la agenda, por favor indícanos qué estilo deseas realizarte. Cada estilo tiene un tiempo y precio estimado diferente.
                  </p>

                  <div className="flex overflow-x-auto gap-4 border-b border-outline-variant/20 mb-4 pb-2 [scrollbar-width:none]">
                    <button
                      onClick={() => setStyleCategory('hair')}
                      className={`pb-2 font-label uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors ${styleCategory === 'hair' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Corte de Pelo
                    </button>
                    <button
                      onClick={() => setStyleCategory('beard')}
                      className={`pb-2 font-label uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors ${styleCategory === 'beard' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Estilos de Barba
                    </button>
                    <button
                      onClick={() => setStyleCategory('combined')}
                      className={`pb-2 font-label uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors ${styleCategory === 'combined' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Looks Combinados
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(styleCategory === 'hair' ? HAIRCUT_STYLES : styleCategory === 'beard' ? BEARD_STYLES : COMBINED_STYLES).map((style: any) => (
                      <div
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedStyle?.id === style.id
                            ? 'border-primary shadow-[0_0_15px_rgba(233,193,118,0.2)]'
                            : 'border-outline-variant/10 hover:border-primary/50'
                        }`}
                      >
                        <div className="h-32 w-full relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                          <img src={style.image} alt={style.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-4 relative z-20 bg-background flex justify-between items-end">
                          <div>
                            <h4 className="serif-display text-lg text-on-surface mb-1 leading-tight pr-4">{style.name}</h4>
                            <div className="flex items-center gap-1.5 text-primary">
                              <Clock size={14} />
                              <span className="font-label uppercase tracking-widest text-[10px] font-bold">{style.duration} Min</span>
                            </div>
                          </div>
                          {style.price && (
                            <span className="font-headline text-primary text-lg">€{style.price.toFixed(2)}</span>
                          )}
                        </div>
                        {selectedStyle?.id === style.id && (
                          <div className="absolute top-3 right-3 z-30 bg-primary text-on-primary w-6 h-6 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-on-primary rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'select-barber' && (
                <motion.div
                  key="step-barber"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <p className="font-body text-sm text-on-surface-variant mb-2">
                    Empleados disponibles para tu servicio.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {BARBERS.map((barber) => (
                      <div
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center text-center transition-all duration-300 ${
                          selectedBarber?.id === barber.id
                            ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(233,193,118,0.1)]'
                            : 'border-outline-variant/10 hover:border-primary/30 bg-surface'
                        }`}
                      >
                        <div className={`w-20 h-20 rounded-full mb-3 overflow-hidden border-2 ${selectedBarber?.id === barber.id ? 'border-primary' : 'border-transparent'}`}>
                          {barber.image ? (
                            <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                              <User size={32} className="text-on-surface-variant" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-body font-medium text-on-surface">{barber.name}</h4>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'date-time' && (
                <motion.div
                  key="step-datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="font-label uppercase tracking-widest text-xs text-primary mb-4 flex items-center gap-2">
                      <Calendar size={16} /> Días Disponibles
                    </h3>
                    {/* Horizontal Scroll for Days (Mobile Friendly) */}
                    <div className="flex overflow-x-auto gap-3 pb-4 [scrollbar-width:none] snap-x">
                      {availableDays.map((date, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                          className={`flex-shrink-0 snap-start flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-xl border transition-all duration-300 ${
                            selectedDate?.getTime() === date.getTime()
                              ? 'border-primary bg-primary text-on-primary shadow-lg'
                              : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/50 bg-surface'
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-widest mb-1">{date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</span>
                          <span className="text-2xl font-light leading-none mb-1">{date.getDate()}</span>
                          <span className="text-[10px] uppercase tracking-widest">{date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                      >
                        <h3 className="font-label uppercase tracking-widest text-xs text-primary mb-4 flex items-center gap-2">
                          <Clock size={16} /> Horas Disponibles
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 rounded-lg border font-mono text-sm transition-all duration-300 ${
                                selectedTime === time
                                  ? 'border-primary bg-primary text-on-primary shadow-md'
                                  : 'border-outline-variant/20 text-on-surface hover:border-primary/50 bg-surface'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  key="step-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant/10 mb-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="serif-display text-lg text-on-surface mb-1">Resumen de Selección</h4>
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                        {selectedItem?.name}
                        {selectedStyle && (
                          <>
                            <br />
                            <span className="text-primary font-medium">Estilo: {selectedStyle.name} ({selectedStyle.duration} min)</span>
                          </>
                        )}
                        <br />
                        <span className="text-on-surface opacity-80">
                          Barbero: {selectedBarber?.name}
                        </span>
                        <br />
                        <span className="text-on-surface opacity-80">
                          {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedTime}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-label uppercase tracking-widest text-[10px] text-on-surface-variant mb-2 ml-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl p-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body"
                        placeholder="Ej. Alejandro Magno"
                      />
                    </div>
                    <div>
                      <label className="block font-label uppercase tracking-widest text-[10px] text-on-surface-variant mb-2 ml-1">Correo Electrónico</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl p-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body"
                        placeholder="alejandro@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block font-label uppercase tracking-widest text-[10px] text-on-surface-variant mb-2 ml-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl p-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'connecting' && (
                <motion.div
                  key="step-connecting"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Loader2 size={48} className="text-primary animate-spin mb-6" />
                  <h3 className="serif-display text-3xl text-on-surface mb-4">Conectando con Fresha...</h3>
                  <p className="font-body text-on-surface-variant text-base max-w-sm mx-auto">
                    Hemos guardado tus preferencias, {formData.name.split(' ')[0]}. Te estamos redirigiendo a nuestra agenda oficial en Fresha para confirmar tu cita con {selectedBarber?.name}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          {step !== 'connecting' && (
            <div className="p-6 border-t border-outline-variant/10 bg-surface/50 flex justify-between items-center">
              <div>
                {(selectedItem || selectedStyle) && (
                  <>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Total Estimado</p>
                    <p className="text-2xl font-headline text-primary">€{Math.round(selectedStyle?.price ?? selectedItem?.price ?? 0)}</p>
                  </>
                )}
              </div>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary text-on-primary px-8 py-3 md:px-10 md:py-4 rounded-full font-label uppercase text-[10px] md:text-xs tracking-widest font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-lg"
              >
                {step === 'details' ? 'Ir a Fresha' : 'Continuar'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
