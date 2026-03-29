import React from 'react';
import { motion } from 'motion/react';

export function Essence() {
  return (
    <section id="esencia" className="py-32 bg-surface text-on-background">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              <img
                alt="Maestro barbero trabajando con precisión"
                className="w-full aspect-[4/5] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtjErY789OezLR2JBIXFY7Tmctbacq3CpZAnEjCBXK0DzcKsm7DOmeaLqwPA0hdzRZHV2whlX_qO5ciTV9Q21MtCCMOT33O1_ugjfBjaJtvl9K5v4TLr5q1HmrQn0SPCMFAsh2eYdTf69FZeBnqRnAOIChvfBRHZlN3K918PqDm8rpoJVemgmpj7qutKDbEwMyAF1zdWyY-oS7-czOaV4mSdilAvCbD7W71xgqIsw36kjjwdcxtq0hTv_honNpmckR9OHl5S7FiTzY"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 w-2/3 hidden md:block border-8 border-surface p-0 shadow-2xl">
                <img
                  alt="Estilo sofisticado"
                  className="w-full aspect-square object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA96uePmKLnPAExjr7PscYv2NT31M6tkE_NwX5fSPrUUnsPE7mH0-kaEdxS4fISSC5--jS8RfzVfhjg50KCINkDi_6_fK7E-xjZw125IAXBRSw8fG6dLyLY8GicVeBUFhl_rrILq62VRQIHN3GbQ9z7gRyB1aetD31ZRllcrXeBYSUrcVtARB3nUrsnvcwA8CujrF2PrJV04JNKHw6U3bmfB-lHwQ-1itelpNUgUaSEonVzkldIHfT1Y7K1ZLh1nRETU2fbfCkGKN_e"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="max-w-xl lg:ml-auto">
              <h2 className="serif-display text-5xl font-bold mb-10 leading-tight">
                La Esencia <span className="italic font-light opacity-60">Italiana</span>
              </h2>
              <div className="space-y-8 font-body text-lg text-on-surface-variant font-light leading-relaxed">
                <p>
                  Nacido del linaje de maestros barberos en Florencia, SEUBAST representa la culminación de tres generaciones de excelencia sartorial y cuidado personal de precisión.
                </p>
                <p>
                  Hemos traído las tradiciones eternas de la península italiana a este barrio para crear algo más que una simple barbería: hemos creado un santuario. Aquí, el zumbido de la maquinilla y el aroma del sándalo se funden en un ritual que respeta al individuo.
                </p>
              </div>
              <div className="mt-12 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-primary text-2xl serif-display font-bold">99%</span>
                  <span className="font-label uppercase text-[10px] tracking-widest text-outline">Índice de Precisión</span>
                </div>
                <div className="w-full h-[1px] bg-outline-variant/20"></div>
                <a className="inline-flex items-center gap-2 text-primary font-label uppercase text-sm tracking-widest hover:translate-x-2 transition-transform" href="#">
                  Conozca Nuestra Historia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
