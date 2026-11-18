import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  ChevronLeft,
  Scissors,
  Crown,
  Loader2,
  Clock,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Settings,
  FileText
} from 'lucide-react';
import { SERVICES, SUBSCRIPTIONS, HAIRCUT_STYLES, BEARD_STYLES, COMBINED_STYLES } from '../constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStyleId?: string | null;
  initialBarberId?: string | null;
}

type Step = 'select-service' | 'select-style' | 'select-barber' | 'date-time' | 'details' | 'fresha-ready';

export const BARBERS = [
  { id: 'any', name: 'Cualquier Maestro Disponible', role: 'Asignación prioritaria', image: null },
  { id: 'don-vittorio', name: 'Don Vittorio Rossi', role: 'Maestro Fundador · Tijera Clásica', image: '/cortes_pelo/Corte_Clasico.jpg' },
  { id: 'marco-ferri', name: 'Marco Ferri', role: 'Master Barber · Fade Specialist', image: '/cortes_pelo/corte_fade.jpg' },
  { id: 'enzo-deluca', name: 'Enzo De Luca', role: 'Estilista Senior & Visagista', image: '/cortes_barba/hipster.jpg' },
  { id: 'gaston', name: 'Gastón', role: 'Barbero Tradicional', image: '/cortes_pelo/corte_pompadour.jpg' },
  { id: 'diego', name: 'Diego', role: 'Especialista Urbano & Barba', image: '/cortes_barba/tres_dias.jpg' }
];

const FRESHA_STORAGE_KEY = 'seubast_fresha_booking_url';
const DEFAULT_FRESHA_URL = 'https://www.fresha.com/es';

export function BookingModal({ isOpen, onClose, initialStyleId, initialBarberId }: BookingModalProps) {
  const [step, setStep] = useState<Step>('select-service');
  const [tab, setTab] = useState<'services' | 'subscriptions'>('services');
  const [styleCategory, setStyleCategory] = useState<'hair' | 'beard' | 'combined'>('hair');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // Fresha Connection State
  const [freshaUrl, setFreshaUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(FRESHA_STORAGE_KEY) || DEFAULT_FRESHA_URL;
    } catch {
      return DEFAULT_FRESHA_URL;
    }
  });
  const [showUrlConfig, setShowUrlConfig] = useState(false);
  const [tempUrlInput, setTempUrlInput] = useState(freshaUrl);
  const [isPreparingFresha, setIsPreparingFresha] = useState(false);
  const [freshaPayload, setFreshaPayload] = useState<{
    freshaUrl: string;
    bookingSummary: string;
    referenceCode: string;
  } | null>(null);
  const [copiedNote, setCopiedNote] = useState(false);

  const handleSaveFreshaUrl = () => {
    const cleaned = tempUrlInput.trim() || DEFAULT_FRESHA_URL;
    const validUrl = cleaned.startsWith('http://') || cleaned.startsWith('https://')
      ? cleaned
      : `https://${cleaned}`;
    setFreshaUrl(validUrl);
    setTempUrlInput(validUrl);
    try {
      localStorage.setItem(FRESHA_STORAGE_KEY, validUrl);
    } catch {
      // ignore storage error
    }
    setShowUrlConfig(false);
  };

  // Build technical recipe text for the selected style
  const getSelectedStyleRecipeText = (styleObj: any) => {
    if (!styleObj) return '';
    if (styleObj.barberRecipe) {
      return `Máquina: ${styleObj.barberRecipe.clipperGuard} · Tijera: ${styleObj.barberRecipe.scissorWork} · Contornos: ${styleObj.barberRecipe.contours}`;
    }
    if (styleObj.id && styleObj.id.includes('+')) {
      const [hId, bId] = styleObj.id.split('+');
      const h = HAIRCUT_STYLES.find(s => s.id === hId);
      const b = BEARD_STYLES.find(s => s.id === bId);
      if (h && b) {
        return `Pelo (${h.name}): ${h.barberRecipe.clipperGuard}, ${h.barberRecipe.scissorWork} | Barba (${b.name}): ${b.barberRecipe.clipperGuard}`;
      }
    }
    return '';
  };

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setFreshaPayload(null);
      setCopiedNote(false);

      // Pre-select barber if passed
      if (initialBarberId) {
        const foundBarber = BARBERS.find(b => b.id === initialBarberId);
        setSelectedBarber(foundBarber || null);
      } else {
        setSelectedBarber(null);
      }

      if (initialStyleId) {
        let foundStyle: any =
          COMBINED_STYLES.find(s => s.id === initialStyleId) ||
          HAIRCUT_STYLES.find(s => s.id === initialStyleId) ||
          BEARD_STYLES.find(s => s.id === initialStyleId);

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
            };
          }
        }

        const serviceId = initialStyleId.includes('+')
          ? 'corte-arreglo-barba-tradicional'
          : HAIRCUT_STYLES.some(s => s.id === initialStyleId)
            ? 'corte-pelo'
            : 'perfilado-barba-maquina';
        const service = SERVICES.find(s => s.id === serviceId);

        const cat = initialStyleId.includes('+')
          ? 'combined'
          : HAIRCUT_STYLES.some(s => s.id === initialStyleId)
            ? 'hair'
            : 'beard';
        setStyleCategory(cat);
        setSelectedItem(service || null);
        setSelectedStyle(foundStyle || null);
        setStep(initialBarberId ? 'date-time' : 'select-barber');
      } else {
        setStep('select-service');
        setSelectedItem(null);
        setSelectedStyle(null);
      }

      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ name: '', email: '', phone: '' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialStyleId, initialBarberId]);

  const availableDays = useMemo(() => {
    const days = [];
    const d = new Date();
    for (let i = 0; i < 14; i++) {
      if (d.getDay() !== 0) {
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
    if (step === 'details') {
      return formData.name.trim().length > 1 && formData.phone.trim().length > 5;
    }
    return true;
  };

  const prepareFreshaConnection = async () => {
    setIsPreparingFresha(true);
    setStep('fresha-ready');

    const dateFormatted = selectedDate
      ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      : '';
    const styleRecipe = getSelectedStyleRecipeText(selectedStyle);
    const estimatedPrice = Math.round(selectedStyle?.price ?? selectedItem?.price ?? 0);

    try {
      const response = await fetch('/api/fresha/booking-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          serviceName: selectedItem?.name,
          styleName: selectedStyle?.name,
          styleRecipe,
          barberName: selectedBarber?.name,
          dateFormatted,
          timeSlot: selectedTime,
          estimatedPrice,
          customFreshaUrl: freshaUrl
        })
      });

      const data = await response.json();
      const summaryText =
        data.bookingSummary ||
        `Estilo: ${selectedStyle?.name || selectedItem?.name} | Barbero: ${selectedBarber?.name} | ${styleRecipe}`;

      setFreshaPayload({
        freshaUrl: data.freshaUrl || freshaUrl,
        bookingSummary: summaryText,
        referenceCode: data.referenceCode || 'SB-FRESHA'
      });

      try {
        await navigator.clipboard.writeText(summaryText);
        setCopiedNote(true);
      } catch {
        // Clipboard may require explicit click in some contexts
      }
    } catch (err) {
      console.error('Error preparing Fresha connection:', err);
      const fallbackSummary = `Reserva SEUBAST: ${selectedItem?.name || ''}${
        selectedStyle ? ` · Estilo: ${selectedStyle.name}` : ''
      }${selectedBarber ? ` · Barbero: ${selectedBarber.name}` : ''}`;
      setFreshaPayload({
        freshaUrl,
        bookingSummary: fallbackSummary,
        referenceCode: 'SB-DIRECT'
      });
    } finally {
      setIsPreparingFresha(false);
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    const currentIndex = stepsFlow.indexOf(step);
    if (currentIndex < stepsFlow.length - 1) {
      setStep(stepsFlow[currentIndex + 1]);
    } else {
      prepareFreshaConnection();
    }
  };

  const handleBack = () => {
    if (step === 'fresha-ready') {
      setStep('details');
      return;
    }
    const currentIndex = stepsFlow.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepsFlow[currentIndex - 1]);
    }
  };

  const handleCopySummary = async () => {
    if (!freshaPayload?.bookingSummary) return;
    try {
      await navigator.clipboard.writeText(freshaPayload.bookingSummary);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 3000);
    } catch {
      // ignore
    }
  };

  const getProgressDots = () => {
    const currentIndex = stepsFlow.indexOf(step);
    const totalSteps = stepsFlow.length;

    return (
      <div className="flex gap-1 mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full ${i <= currentIndex ? 'bg-primary' : 'bg-outline-variant/20'}`}
          />
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
          onClick={onClose}
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
              {step !== 'select-service' && (
                <button
                  onClick={handleBack}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <div>
                <h2 className="serif-display text-2xl text-on-surface">
                  {step === 'select-service' && 'Selecciona tu Experiencia'}
                  {step === 'select-style' && 'Elige tu Estilo'}
                  {step === 'select-barber' && 'Elige a tu Barbero'}
                  {step === 'date-time' && 'Fecha y Hora Preferida'}
                  {step === 'details' && 'Tus Datos para la Reserva'}
                  {step === 'fresha-ready' && 'Pase de Reserva para Fresha'}
                </h2>
                {step !== 'fresha-ready' && getProgressDots()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUrlConfig(!showUrlConfig)}
                className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container"
                title="Configurar enlace de tu barbería en Fresha"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-primary transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Configurable Fresha Store Link Bar */}
          <AnimatePresence>
            {showUrlConfig && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-surface border-b border-primary/30 px-6 py-4 overflow-hidden"
              >
                <label className="block text-[11px] font-label uppercase tracking-wider text-primary font-bold mb-1.5">
                  URL Oficial de tu Barbería en Fresha:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={tempUrlInput}
                    onChange={(e) => setTempUrlInput(e.target.value)}
                    placeholder="https://www.fresha.com/es/a/tu-barberia..."
                    className="flex-1 bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                  />
                  <button
                    onClick={handleSaveFreshaUrl}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label uppercase text-xs tracking-wider font-bold hover:bg-primary/90 transition-all shrink-0"
                  >
                    Guardar Enlace
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5">
                  Pega aquí el enlace directo de tu perfil de Fresha para que todos los botones de reserva lleven directamente a tu agenda.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
                  {/* Direct Quick-Link to Fresha for users who want to jump straight in */}
                  <div className="bg-primary/10 border border-primary/25 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-primary block">
                        Conectado con Agenda Fresha
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Configura tu corte abajo para llevar tu Ficha Técnica o abre directamente Fresha.
                      </span>
                    </div>
                    <a
                      href={freshaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface hover:bg-primary hover:text-on-primary text-primary border border-primary/40 px-4 py-2 rounded-lg font-label uppercase text-[11px] tracking-wider font-bold transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Abrir Fresha Directo</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className="flex gap-6 border-b border-outline-variant/20">
                    <button
                      onClick={() => setTab('services')}
                      className={`pb-3 font-label uppercase tracking-widest text-xs flex items-center gap-2 transition-colors ${
                        tab === 'services'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <Scissors size={16} /> Servicios
                    </button>
                    <button
                      onClick={() => setTab('subscriptions')}
                      className={`pb-3 font-label uppercase tracking-widest text-xs flex items-center gap-2 transition-colors ${
                        tab === 'subscriptions'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
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
                          if (!('requiresStyle' in item && item.requiresStyle)) setSelectedStyle(null);
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
                            <span className="inline-block mt-2 text-[10px] font-label uppercase tracking-widest text-outline tabular-nums">
                              {item.duration} Min
                            </span>
                          )}
                          {'requiresStyle' in item && item.requiresStyle && (
                            <span className="inline-block mt-2 text-[10px] font-label uppercase tracking-widest text-primary">
                              Incluye elección de estilo y ficha técnica
                            </span>
                          )}
                        </div>
                        <div className="text-right pl-4 shrink-0">
                          <span className="font-headline text-primary text-xl tabular-nums">
                            €{item.price.toFixed(2)}
                          </span>
                          {'period' in item && (
                            <span className="block text-[9px] font-label uppercase tracking-widest text-on-surface-variant">
                              / {item.period}
                            </span>
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
                    Selecciona el estilo que deseas realizarte. Generaremos la nota técnica para que quede registrada en tu cita de Fresha.
                  </p>

                  <div className="flex overflow-x-auto gap-4 border-b border-outline-variant/20 mb-4 pb-2 [scrollbar-width:none]">
                    <button
                      onClick={() => setStyleCategory('hair')}
                      className={`pb-2 font-label uppercase tracking-widest text-xs whitespace-nowrap transition-colors ${
                        styleCategory === 'hair'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Corte de Pelo
                    </button>
                    <button
                      onClick={() => setStyleCategory('beard')}
                      className={`pb-2 font-label uppercase tracking-widest text-xs whitespace-nowrap transition-colors ${
                        styleCategory === 'beard'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Estilos de Barba
                    </button>
                    <button
                      onClick={() => setStyleCategory('combined')}
                      className={`pb-2 font-label uppercase tracking-widest text-xs whitespace-nowrap transition-colors ${
                        styleCategory === 'combined'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Looks Combinados
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(styleCategory === 'hair'
                      ? HAIRCUT_STYLES
                      : styleCategory === 'beard'
                        ? BEARD_STYLES
                        : COMBINED_STYLES
                    ).map((style: any) => (
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
                          <img
                            src={style.image}
                            alt={style.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4 relative z-20 bg-background flex justify-between items-end">
                          <div>
                            <h4 className="serif-display text-lg text-on-surface mb-1 leading-tight pr-4">
                              {style.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-primary">
                              <Clock size={14} />
                              <span className="font-label uppercase tracking-widest text-[10px] font-bold tabular-nums">
                                {style.duration} Min
                              </span>
                            </div>
                          </div>
                          {style.price && (
                            <span className="font-headline text-primary text-lg tabular-nums">
                              €{style.price.toFixed(2)}
                            </span>
                          )}
                        </div>
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
                    Selecciona el Maestro Barbero con el que deseas agendar en Fresha.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BARBERS.map((barber) => (
                      <div
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 text-left transition-all duration-300 ${
                          selectedBarber?.id === barber.id
                            ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(233,193,118,0.1)]'
                            : 'border-outline-variant/15 hover:border-primary/40 bg-surface'
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-full overflow-hidden border-2 shrink-0 ${
                            selectedBarber?.id === barber.id ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          {barber.image ? (
                            <img
                              src={barber.image}
                              alt={barber.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                              <User size={24} className="text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-headline font-bold text-on-surface text-base truncate">
                            {barber.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant truncate">{barber.role}</p>
                        </div>
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
                      <Calendar size={16} /> Día Preferido
                    </h3>
                    <div className="flex overflow-x-auto gap-3 pb-4 [scrollbar-width:none] snap-x">
                      {availableDays.map((date, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                          className={`flex-shrink-0 snap-start flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-xl border transition-all duration-300 ${
                            selectedDate?.getTime() === date.getTime()
                              ? 'border-primary bg-primary text-on-primary shadow-lg'
                              : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/50 bg-surface'
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-widest mb-1">
                            {date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                          </span>
                          <span className="text-2xl font-light leading-none mb-1 tabular-nums">
                            {date.getDate()}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest">
                            {date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                          </span>
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
                          <Clock size={16} /> Franja Horaria Preferida
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 rounded-lg border font-mono tabular-nums text-sm transition-all duration-300 ${
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
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant/15 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText size={22} className="text-primary" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <h4 className="serif-display text-base text-on-surface font-bold">
                        Resumen de tu Selección para Fresha
                      </h4>
                      <p className="text-on-surface">
                        <strong>Servicio:</strong> {selectedItem?.name}
                      </p>
                      {selectedStyle && (
                        <>
                          <p className="text-primary font-medium">
                            <strong>Estilo:</strong> {selectedStyle.name} ({selectedStyle.duration} min)
                          </p>
                          {getSelectedStyleRecipeText(selectedStyle) && (
                            <p className="text-on-surface-variant text-[11px]">
                              <strong>Ficha Técnica:</strong> {getSelectedStyleRecipeText(selectedStyle)}
                            </p>
                          )}
                        </>
                      )}
                      <p className="text-on-surface-variant">
                        <strong>Barbero:</strong> {selectedBarber?.name} ·{' '}
                        {selectedDate?.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}{' '}
                        a las {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-label uppercase tracking-widest text-[10px] text-on-surface-variant mb-2 ml-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl p-3.5 text-sm text-on-surface focus:border-primary outline-none transition-all font-body"
                        placeholder="Ej. Alejandro Rossi"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-label uppercase tracking-widest text-[10px] text-on-surface-variant mb-2 ml-1">
                          Teléfono Móvil
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-surface border border-outline-variant/20 rounded-xl p-3.5 text-sm text-on-surface focus:border-primary outline-none transition-all font-body"
                          placeholder="+34 600 000 000"
                        />
                      </div>
                      <div>
                        <label className="block font-label uppercase tracking-widest text-[10px] text-on-surface-variant mb-2 ml-1">
                          Correo Electrónico (Opcional)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-surface border border-outline-variant/20 rounded-xl p-3.5 text-sm text-on-surface focus:border-primary outline-none transition-all font-body"
                          placeholder="cliente@ejemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'fresha-ready' && (
                <motion.div
                  key="step-fresha-ready"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 space-y-6"
                >
                  {isPreparingFresha ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Loader2 size={44} className="text-primary animate-spin mb-4" />
                      <h3 className="serif-display text-2xl text-on-surface mb-2">
                        Preparando tu Ficha para Fresha...
                      </h3>
                      <p className="font-body text-sm text-on-surface-variant max-w-sm">
                        Generando el resumen técnico de tu estilo para que puedas adjuntarlo en tu cita oficial.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-3">
                          <Check size={28} />
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
                          Referencia {freshaPayload?.referenceCode}
                        </span>
                        <h3 className="serif-display text-3xl text-on-surface">
                          Todo listo para confirmar en Fresha
                        </h3>
                        <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
                          Hemos preparado la nota con tu estilo y receta técnica. Pégala en el campo <strong>"Notas de la cita"</strong> al finalizar en Fresha.
                        </p>
                      </div>

                      {/* Copyable Technical Summary Box for Fresha Notes */}
                      <div className="bg-surface p-4 rounded-xl border border-primary/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-label uppercase tracking-wider text-primary font-bold">
                            Nota Técnica para pegar en Fresha:
                          </span>
                          <button
                            onClick={handleCopySummary}
                            className="text-xs font-label uppercase tracking-wider bg-primary/15 hover:bg-primary hover:text-on-primary text-primary px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5"
                          >
                            {copiedNote ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copiedNote ? '¡Copiada al portapapeles!' : 'Copiar Nota'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-on-surface font-mono bg-surface-container p-3 rounded-lg border border-outline-variant/15 leading-relaxed select-all">
                          {freshaPayload?.bookingSummary}
                        </p>
                      </div>

                      {/* Primary Action: Open Fresha in a New Tab (Bypasses iframe X-Frame-Options block!) */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <a
                          href={freshaPayload?.freshaUrl || freshaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto flex-1 bg-primary text-on-primary py-4 px-8 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-xl flex items-center justify-center gap-2 text-center"
                        >
                          <span>Abrir Agenda en Fresha y Confirmar</span>
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          {step !== 'fresha-ready' && (
            <div className="p-6 border-t border-outline-variant/10 bg-surface/50 flex justify-between items-center">
              <div>
                {(selectedItem || selectedStyle) && (
                  <>
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">
                      Total Estimado
                    </p>
                    <p className="text-2xl font-headline text-primary tabular-nums">
                      €{Math.round(selectedStyle?.price ?? selectedItem?.price ?? 0)}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label uppercase text-xs tracking-widest font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
              >
                <span>{step === 'details' ? 'Conectar con Fresha' : 'Continuar'}</span>
                {step === 'details' && <ExternalLink size={14} />}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
