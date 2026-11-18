import React from 'react';
import { Scissors, Star, Award, Clock } from 'lucide-react';

export const MASTER_BARBERS = [
  {
    id: 'don-vittorio',
    name: 'Don Vittorio Rossi',
    role: 'Maestro Fundador & Director Artístico',
    experience: '32 años de oficio',
    specialty: 'Corte Clásico a Tijera & Afeitado con Toalla Caliente',
    bio: 'Formado en las tradicionales barberías de Milán en los años 90. Vittorio cree que cada corte es un ritual de respeto y precisión.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'marco-ferri',
    name: 'Marco Ferri',
    role: 'Master Barber & Fade Specialist',
    experience: '14 años de oficio',
    specialty: 'Skin Fade, Crop Moderno & Barbas Esculpidas',
    bio: 'Especialista en geometría capilar moderna y degradados milimétricos. Combina la vanguardia urbana con la elegancia italiana.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'enzo-deluca',
    name: 'Enzo De Luca',
    role: 'Estilista Senior & Visagista',
    experience: '10 años de oficio',
    specialty: 'Diseño de Barba Vikinga & Asesoramiento de Imagen',
    bio: 'Apasionado del visagismo facial. Experto en encontrar el equilibrio exacto entre las facciones del cliente y las tendencias globales.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
  }
];

export function MasterBarbers({ onBookBarber }: { onBookBarber: (barberId: string) => void }) {
  return (
    <section id="maestros" className="py-24 bg-surface relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-label uppercase text-xs tracking-[0.3em] block mb-3">Legado y Maestría</span>
          <h2 className="serif-display text-4xl md:text-5xl font-bold mb-6">Nuestros Maestros Barberos</h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-6"></div>
          <p className="font-body text-on-surface-variant text-base md:text-lg">
            Manos expertas con décadas de experiencia combinando la escuela clásica italiana y las técnicas más depuradas de la barbería contemporánea.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MASTER_BARBERS.map((barber) => (
            <div 
              key={barber.id}
              className="bg-background border border-outline/20 rounded-sm overflow-hidden group hover:border-primary/50 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={barber.image} 
                  alt={barber.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                <span className="absolute bottom-4 left-4 bg-primary text-on-primary px-3 py-1 font-label text-[10px] uppercase tracking-widest font-semibold">
                  {barber.experience}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="serif-display text-2xl font-bold mb-1">{barber.name}</h3>
                  <p className="text-primary font-label text-xs tracking-wider uppercase mb-4">{barber.role}</p>
                  <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {barber.bio}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-label text-on-surface mb-6 bg-surface/50 p-3 rounded-sm border border-outline/10">
                    <Scissors className="w-4 h-4 text-primary shrink-0" />
                    <span>Especialidad: {barber.specialty}</span>
                  </div>
                </div>
                <button
                  onClick={() => onBookBarber(barber.id)}
                  className="w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface border border-outline/30 hover:border-primary py-3 font-label text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Reservar con {barber.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
