import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#1c1b1b] w-full py-20 px-6 md:px-12">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
        <div>
          <span className="serif-display italic text-primary text-4xl block mb-8">SEUBAST</span>
          <p className="font-body font-light tracking-tight text-on-background opacity-60 max-w-xs leading-loose">
            Definiendo la intersección entre la herencia artesanal y el cuidado contemporáneo. Ubicados en el corazón de Madrid como un Estudio de Corte referente.
          </p>
        </div>

        <div className="space-y-12">
          <div>
            <h4 className="font-label uppercase text-[10px] tracking-[0.3em] text-primary mb-6">Ubicación</h4>
            <p className="font-body font-light text-on-background text-lg leading-relaxed">
              C. de Suecia, 73<br />
              28022 Madrid, España
            </p>
          </div>
          <div>
            <h4 className="font-label uppercase text-[10px] tracking-[0.3em] text-primary mb-6">Horario</h4>
            <ul className="font-body font-light text-on-background opacity-80 text-sm space-y-2">
              <li className="flex justify-between max-w-[240px]"><span>Lun - Vie</span> <span>10:00 - 20:00</span></li>
              <li className="flex justify-between max-w-[240px]"><span>Sábado</span> <span>10:00 - 18:00</span></li>
              <li className="flex justify-between max-w-[240px]"><span>Domingo</span> <span>Cerrado</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-between h-full">
          <div className="flex flex-wrap gap-8 justify-start md:justify-end mb-12">
            <a href="#" className="font-body font-light text-on-background/60 hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="font-body font-light text-on-background/60 hover:text-primary transition-colors">Términos</a>
            <a href="#" className="font-body font-light text-on-background/60 hover:text-primary transition-colors">Instagram</a>
          </div>
          <div className="text-right">
            <p className="font-body font-light text-on-background/40 text-[10px] uppercase tracking-[0.2em]">
              © 2024 SEUBAST BARBERÍA SELECTA. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
