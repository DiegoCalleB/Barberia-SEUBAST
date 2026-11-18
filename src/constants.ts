export const SERVICES = [
  {
    id: 'corte-pelo',
    name: 'Corte de pelo',
    description: 'Descubre el arte del corte de pelo en Barbería Seubast. Nuestros expertos barberos están dedicados a brindarte un servicio excepcional.',
    price: 14.90,
    duration: 30,
    category: 'Cabello',
    featured: true,
    requiresStyle: true
  },
  {
    id: 'perfilado-barba-maquina',
    name: 'Perfilado de Barba a Máquina',
    description: 'Perfilado preciso de barba utilizando máquina.',
    price: 7,
    duration: 15,
    category: 'Barba',
    featured: false
  },
  {
    id: 'camuflaje-canas-barba',
    name: 'Camuflaje de Canas para Barba',
    description: 'Tratamiento para disimular las canas de la barba de forma natural.',
    price: 12,
    duration: 15,
    category: 'Barba',
    featured: false
  },
  {
    id: 'corte-arreglo-barba-tradicional',
    name: 'Corte de Pelo + Arreglo de Barba tradicional (Completo)',
    description: 'Servicio completo de corte de pelo y arreglo de barba tradicional.',
    price: 25,
    duration: 50,
    category: 'Cabello y Barba',
    featured: true,
    discount: 'Ahorra un 13%',
    requiresStyle: true
  },
  {
    id: 'corte-arreglo-barba-express',
    name: 'Corte de Pelo + Arreglo express de Barba (Simple)',
    description: 'Corte de pelo acompañado de un arreglo rápido de barba.',
    price: 22.90,
    duration: 45,
    category: 'Cabello y Barba',
    featured: false,
    discount: 'Ahorra un 11%',
    requiresStyle: true
  },
  {
    id: 'afeitado-cabeza-arreglo-barba',
    name: 'Afeitado de Cabeza con Navaja + Arreglo de barba tradicional (completo)',
    description: 'Afeitado de cabeza con navaja y arreglo completo de barba tradicional.',
    price: 27,
    duration: 50,
    category: 'Cabello y Barba',
    featured: false,
    discount: 'Ahorra un 7%'
  }
];

export interface BarberRecipe {
  clipperGuard: string;
  scissorWork: string;
  contours: string;
  maintenanceDays: string;
}

export const SAMPLE_PORTRAITS = [
  {
    id: 'sample-classic',
    name: 'Rostro Ovalado',
    subtitle: 'Cabello medio',
    image: '/cortes_pelo/Corte_Clasico.jpg'
  },
  {
    id: 'sample-urban',
    name: 'Rostro Angular',
    subtitle: 'Cabello corto',
    image: '/cortes_pelo/corte_taper.jpg'
  },
  {
    id: 'sample-beard',
    name: 'Rostro con Barba',
    subtitle: 'Barba densa',
    image: '/cortes_barba/tres_dias.jpg'
  }
];

export const HAIRCUT_STYLES = [
  {
    id: 'fade',
    name: 'Degradado / Fade',
    description: 'Transición perfecta de piel a cabello largo. Moderno y muy demandado.',
    aiPrompt: 'Genera un corte de pelo estilo "Fade" o Degradado. La transición debe ser muy limpia desde la piel (skin fade) sin líneas bruscas, difuminado progresivamente hacia la parte superior. Deja longitud y textura en la parte de arriba.',
    duration: 45,
    price: 16.90,
    image: '/cortes_pelo/corte_fade.jpg',
    recommendedProductId: 'polvos-volumen',
    barberRecipe: {
      clipperGuard: 'Navaja / #0.5 a #1.5 en laterales (transición media)',
      scissorWork: '4–5 cm en zona superior con texturizado point-cut',
      contours: 'Perfilado limpio a navaja en patillas y nuca',
      maintenanceDays: 'Cada 14–18 días'
    }
  },
  {
    id: 'classic',
    name: 'Corte Clásico a Tijera',
    description: 'Elegancia de toda la vida. Corte estructurado realizado íntegramente a tijera.',
    aiPrompt: 'Genera un corte clásico y elegante de caballero hecho todo a tijera (Executive contour). No debe haber zonas rapadas, manteniendo los laterales peinados e integrados perfectamente con la parte superior, con raya lateral y aspecto limpio.',
    duration: 40,
    price: 14.90,
    image: '/cortes_pelo/Corte_Clasico.jpg',
    recommendedProductId: 'pomada-fuerte',
    barberRecipe: {
      clipperGuard: 'Sin máquina (100% tijera sobre peine en laterales)',
      scissorWork: '6–7 cm arriba conectado en capas suaves con raya lateral',
      contours: 'Contorno natural en nuca y patilla clásica a media oreja',
      maintenanceDays: 'Cada 25–30 días'
    }
  },
  {
    id: 'crop',
    name: 'Flequillo Texturizado / French Crop',
    description: 'Estilo moderno con el pelo hacia adelante y los lados muy cortos.',
    aiPrompt: 'Genera un peinado "French Crop". Los laterales deben estar rapados o con un degradado alto. La parte superior debe ir peinada hacia adelante con flequillo corto y texturizado para que note mucho movimiento y desorden ordenado.',
    duration: 35,
    price: 15.90,
    image: '/cortes_pelo/Corte_flequillo.jpg',
    recommendedProductId: 'cera-mate',
    barberRecipe: {
      clipperGuard: '#0 a #1.5 con caída suave tras la sien (Drop Fade)',
      scissorWork: '3–4 cm arriba peinado hacia adelante con tijera de entresacar',
      contours: 'Flequillo recto texturizado a mitad de frente',
      maintenanceDays: 'Cada 15–20 días'
    }
  },
  {
    id: 'mullet',
    name: 'Corto a los lados, largo atrás / Mullet',
    description: 'Rebeldía con estilo. Laterales cortos y volumen en la nuca.',
    aiPrompt: 'Genera un corte estilo "Mullet" moderno. Laterales cortos o rapados, mientras que debe conservar mucha longitud y volumen en la zona de la nuca y el cuello trasero. Zona frontal desaliñada.',
    duration: 50,
    price: 17.90,
    image: '/cortes_pelo/Corte_seta.jpg',
    recommendedProductId: 'polvos-volumen',
    barberRecipe: {
      clipperGuard: 'Taper Fade #0.5 a #2 solo en zona de patillas y sienes',
      scissorWork: 'Desfilado a navaja en coronilla y nuca larga desconectada',
      contours: 'Arco limpio sobre la oreja respetando caída trasera',
      maintenanceDays: 'Cada 20–25 días'
    }
  },
  {
    id: 'buzz',
    name: 'Rapado a Máquina / Buzz Cut',
    description: 'Uniforme, rápido y muy cómodo. Ideal para no tener que peinarse.',
    aiPrompt: 'Genera un corte "Buzz Cut" (rapado a máquina completo). Todo el cabello debe verse de una longitud muy reducida de manera uniforme (1-3 milímetros) y perfilado perfectamente en la frente.',
    duration: 20,
    price: 12.90,
    image: '/cortes_pelo/corte_rapado.jpg',
    recommendedProductId: 'aftershave-balm',
    barberRecipe: {
      clipperGuard: '#2 en zona superior con degradado #0.5 en laterales',
      scissorWork: 'Sin tijera (repaso de precisión a máquina en remolinos)',
      contours: 'Línea frontal geométrica marcada con trimmer y navaja',
      maintenanceDays: 'Cada 10–14 días'
    }
  },
  {
    id: 'pompadour',
    name: 'Tupé Clásico / Pompadour',
    description: 'Gran volumen en la parte superior bien domado. Estilo rockabilly o clásico audaz.',
    aiPrompt: 'Genera un "Pompadour" o tupé clásico muy voluminoso. Los laterales en degradado y muchísimo volumen en el flequillo que se echa hacia atrás con fijador fuerte. Debe verse muy pulcro.',
    duration: 50,
    price: 18.90,
    image: '/cortes_pelo/corte_pompadour.jpg',
    recommendedProductId: 'pomada-fuerte',
    barberRecipe: {
      clipperGuard: '#1 a #2 en laterales con compresión en parietal',
      scissorWork: '8–10 cm en frontal decreciendo hacia coronilla con secador',
      contours: 'Nuca en degradado limpio y patilla afilada',
      maintenanceDays: 'Cada 18–21 días'
    }
  },
  {
    id: 'mohawk',
    name: 'Cresta / Mohawk',
    description: 'Línea de pelo central con los lados rapados al límite.',
    aiPrompt: 'Genera una cresta "Mohawk". Laterales afeitados a cero y una franja central de cabello largo levantada o despeinada en punta con mucha textura y rebeldía.',
    duration: 45,
    price: 16.90,
    image: '/cortes_pelo/corte_mohicano.jpg',
    recommendedProductId: 'cera-mate',
    barberRecipe: {
      clipperGuard: '#0 a #1 en laterales en curva hacia la nuca (Burst Fade)',
      scissorWork: 'Franja central de 5–6 cm texturizada en picos',
      contours: 'Diseño lateral marcado a navaja en sien',
      maintenanceDays: 'Cada 14–18 días'
    }
  },
  {
    id: 'top-knot',
    name: 'Moño Superior / Top Knot',
    description: 'Largo por arriba recogido en coleta o moño, y laterales al ras.',
    aiPrompt: 'Genera un "Top Knot" (moño de samurai). Los lados y la parte posterior muy rapados (undercut), y un moño tirante o coleta pequeña amarrada en la parte alta de la coronilla.',
    duration: 40,
    price: 15.90,
    image: '/cortes_pelo/corte_cabello_largo.jpg',
    recommendedProductId: 'aceite-barba',
    barberRecipe: {
      clipperGuard: 'Undercut #1 o degradado alto desconectado de la zona larga',
      scissorWork: 'Saneado de puntas en zona superior (+15 cm) para recogido',
      contours: 'Línea de desconexión nítida y nuca afeitada a navaja',
      maintenanceDays: 'Cada 20–25 días'
    }
  },
  {
    id: 'slick-back',
    name: 'Engominado hacia atrás / Slick Back',
    description: 'Control absoluto con fijador. Un aspecto pulcro de mafia de los años 20.',
    aiPrompt: 'Genera un "Slick Back" estilo años 20. Todo el cabello engominado, tirante y peinado hacia atrás de forma ultra elegante y brillante. Sin volumen superior, todo muy pegado a la cabeza.',
    duration: 35,
    price: 14.90,
    image: '/cortes_pelo/corte_comb_over.jpg',
    recommendedProductId: 'pomada-fuerte',
    barberRecipe: {
      clipperGuard: '#1.5 a #3 en laterales o tijera pulida hacia atrás',
      scissorWork: '7–8 cm arriba vaciado internamente para caída plana hacia atrás',
      contours: 'Contorno de oreja despejado a tijera y navaja',
      maintenanceDays: 'Cada 21–25 días'
    }
  }
];

export const BEARD_STYLES = [
  {
    id: 'beard-short',
    name: 'Barba Corta (de 3 Días)',
    description: 'Aspecto relajado pero controlado. Muy atractiva y marca la mandíbula.',
    aiPrompt: 'Coloca una barba tipo "stubble" o de pocos días (3 días aprox). Es un sombreado uniforme que debe marcar muy bien la línea de la mandíbula pero con un aspecto relajado y sin longitud sobrante.',
    duration: 15,
    price: 7.00,
    image: '/cortes_barba/tres_dias.jpg',
    recommendedProductId: 'aftershave-balm',
    barberRecipe: {
      clipperGuard: 'Máquina #1 (3 mm) en mejillas y #1.5 (4.5 mm) en mentón',
      scissorWork: 'Despeje de labio superior con trimmer de precisión',
      contours: 'Línea de cuello 2 dedos sobre la nuez y mejilla natural a navaja',
      maintenanceDays: 'Cada 7–10 días'
    }
  },
  {
    id: 'beard-corporate',
    name: 'Barba Arreglada / Corporativa',
    description: 'Tupida pero muy bien recortada. Formal y perfecta para ir a la oficina.',
    aiPrompt: 'Coloca una barba completa o "Corporate Beard". Tiene longitud pero está cuidada al milímetro. La línea de debajo del cuello debe estar perfectamente afeitada y las líneas de perfilado de mejilla deben ser hiper precisas.',
    duration: 25,
    price: 12.00,
    image: '/cortes_barba/hipster.jpg',
    recommendedProductId: 'aceite-barba',
    barberRecipe: {
      clipperGuard: 'Degradado de patilla #1 hacia #3 (10 mm) en mandíbula',
      scissorWork: 'Esculpido a mano alzada con tijera sobre peine para simetría',
      contours: 'Líneas de mejilla y cuello definidas con toalla caliente y navaja',
      maintenanceDays: 'Cada 12–15 días'
    }
  },
  {
    id: 'beard-viking',
    name: 'Barba Larga / Vikinga',
    description: 'Para hombres con paciencia. Mantenemos el orden pero dejamos crecer la longitud.',
    aiPrompt: 'Añade una barba vikinga épica. Muy larga y abundante que cuelgue del mentón, pero se debe notar cuidada y peinada con un suave acabado final. Must be robust and massive.',
    duration: 35,
    price: 15.00,
    image: '/cortes_barba/full_bear_oso.jpg',
    recommendedProductId: 'cepillo-barba-viking',
    barberRecipe: {
      clipperGuard: 'Solo transición en patilla (#1.5 a libre caída)',
      scissorWork: 'Estructura cuadrada a tijera manteniendo máximo volumen en mentón',
      contours: 'Limpieza alta en pómulo con aceite térmico y navaja',
      maintenanceDays: 'Cada 20–25 días'
    }
  },
  {
    id: 'beard-goatee',
    name: 'Perilla / Goatee',
    description: 'Corte que aísla y resalta la zona de la barbilla y bigote.',
    aiPrompt: 'Coloca una perilla "Goatee" tradicional. Barba confinada únicamente a la barbilla y unida al bigote. El resto de mejillas y mandíbula deben estar completamente afeitadas.',
    duration: 20,
    price: 9.00,
    image: '/cortes_barba/candado.jpg',
    recommendedProductId: 'aftershave-balm',
    barberRecipe: {
      clipperGuard: '#2 a #3 en el candado central de bigote y mentón',
      scissorWork: 'Perfilado de unión en comisuras al ancho de la sonrisa',
      contours: 'Afeitado apurado a navaja con espuma caliente en ambas mejillas',
      maintenanceDays: 'Cada 10–14 días'
    }
  },
  {
    id: 'beard-balbo',
    name: 'Barba sin patillas / Balbo',
    description: 'Como la perilla, pero se extiende un poco más por la mandíbula, separada del bigote.',
    aiPrompt: 'Añade un estilo "Balbo". El bigote largo flotante separado de la barba, y una barba espesa en la barbilla que se estira un poco por la mandíbula formando una T invertida. Mejillas afeitadas.',
    duration: 30,
    price: 14.00,
    image: '/cortes_barba/ancla.jpg',
    recommendedProductId: 'peine-sandalo',
    barberRecipe: {
      clipperGuard: '#2 en arco inferior de mandíbula y #3 en mosca y mentón',
      scissorWork: 'Bigote independiente peinado y desconectado 5 mm de la barba',
      contours: 'Patillas y mejillas rasuradas al ras con navaja recta',
      maintenanceDays: 'Cada 10–14 días'
    }
  },
  {
    id: 'beard-van-dyke',
    name: 'Perilla y Bigote / Van Dyke',
    description: 'Bigote separado de una perilla de pico. Un toque muy bohemio e intelectual.',
    aiPrompt: 'Coloca un "Van Dyke". Un bigote con las puntas ligeramente rizadas o estiradas, separado de un pequeño parche de pelo afilado y puntiagudo en la barbilla. Muy teatral.',
    duration: 25,
    price: 12.00,
    image: '/cortes_barba/van_dyke.jpg',
    recommendedProductId: 'peine-sandalo',
    barberRecipe: {
      clipperGuard: '#2.5 en barbilla estrechándose hacia la punta del mentón',
      scissorWork: 'Tijera fina en puntas del bigote para forma ascendente',
      contours: 'Afeitado total de mandíbula lateral y mejillas a navaja',
      maintenanceDays: 'Cada 10–12 días'
    }
  },
  {
    id: 'beard-mutton-chops',
    name: 'Patillas Anchas / Mutton Chops',
    description: 'Patillas exageradas uniéndose casi a la boca, pero barbilla al descubierto.',
    aiPrompt: 'Ponle "Mutton Chops". Unas enormes patillas retro que dominan toda la mejilla uniéndose al bigote, mientras el área entera de la barbilla o mentón está completamente rapada al ras.',
    duration: 30,
    price: 14.00,
    image: '/cortes_barba/chevron.jpg',
    recommendedProductId: 'shampoo-barba',
    barberRecipe: {
      clipperGuard: '#3 a #4 en patillas ensanchadas hacia la comisura labial',
      scissorWork: 'Conexión continua entre patilla y bigote sin escalones',
      contours: 'Mentón y bajo labio afeitados a navaja con contraste limpio',
      maintenanceDays: 'Cada 12–15 días'
    }
  },
  {
    id: 'beard-garibaldi',
    name: 'Barba Ancha y Redondeada / Garibaldi',
    description: 'Frondosa pero se recorta la base para mantener una forma ovalada compacta.',
    aiPrompt: 'Añade una barba "Garibaldi". Una gran barba abundante, algo salvaje arriba, pero que en la base o borde inferior se ha recortado con máquina formando una perfecta curva ancha circular y simétrica.',
    duration: 40,
    price: 16.00,
    image: '/cortes_barba/garibaldi.jpg',
    recommendedProductId: 'cepillo-barba-viking',
    barberRecipe: {
      clipperGuard: 'Degradado suave en patilla con base densa de 10–15 cm',
      scissorWork: 'Base inferior redondeada a tijera en forma de U amplia',
      contours: 'Bigote natural integrado y línea de pómulo natural limpia',
      maintenanceDays: 'Cada 18–22 días'
    }
  }
];

export const COMBINED_STYLES = [
  {
    id: 'look-executive',
    name: 'Look Ejecutivo / Executive Look',
    description: 'Corte clásico a tijera y barba arreglada impecable. Ideal para transmitir confianza.',
    duration: 60,
    price: 25.00,
    image: '/cortes_pelo/Corte_Clasico.jpg',
    hairId: 'classic',
    beardId: 'beard-corporate'
  },
  {
    id: 'look-modern-viking',
    name: 'Look Vikingo / Modern Viking',
    description: 'Rapado o degradado alto y barba vikinga. El contraste más duro y llamativo.',
    duration: 55,
    price: 26.00,
    image: '/cortes_barba/full_bear_oso.jpg',
    hairId: 'fade',
    beardId: 'beard-viking'
  },
  {
    id: 'look-urban-fade',
    name: 'Look Urbano / Urban Fade & Stubble',
    description: 'Degradado medio muy perfilado y barba sombreada de pocos días. Frescura total.',
    duration: 50,
    price: 22.00,
    image: '/cortes_pelo/corte_fade.jpg',
    hairId: 'fade',
    beardId: 'beard-short'
  }
];

export const PRODUCTS = [
  {
    id: 'aceite-barba',
    name: 'Aceite para Barba Cítrico (Men Matter)',
    description: 'Aceite para barba con infusión cítrica. 30ml de cuidado premium para mantener el vello facial hidratado y con un aroma fresco.',
    price: 42,
    image: '/boutique/men-matter-oil.jpg',
    category: 'Barba'
  },
  {
    id: 'cepillo-barba-viking',
    name: 'Cepillo para Barba de Jabalí (Striking Viking)',
    description: 'Cepillo de madera 100% natural con cerdas de jabalí negro. Ideal para distribuir aceites y desenredar la barba.',
    price: 25,
    image: '/boutique/striking-viking-brush.jpg',
    category: 'Accesorios'
  },
  {
    id: 'cera-mate',
    name: 'Cera de Fijación Mate (The Pure)',
    description: 'Cera de acabado mate puro. Proporciona una fijación excelente sin dejar brillos indeseados en el cabello.',
    price: 38,
    image: '/boutique/pure-matte-wax.jpg',
    category: 'Pelo'
  },
  {
    id: 'polvos-volumen',
    name: 'Polvos Voluminizadores (Beardburys)',
    description: 'Polvos de volumen para el cabello con aplicador preciso. Aporta textura y cuerpo al instante con aspecto natural y mate.',
    price: 28,
    image: '/boutique/beardburys-hover.jpg',
    category: 'Pelo'
  },
  {
    id: 'aftershave-balm',
    name: 'Bálsamo Aftershave Calmante (Tahe)',
    description: 'Bálsamo aftershave calmante e hidratante con Bisabolol, Alantoína y Ginseng Indio. Protege la piel irritada.',
    price: 35,
    image: '/boutique/tahe-aftershave.jpg',
    category: 'Barba'
  },
  {
    id: 'shampoo-barba',
    name: 'Champú para Barba Refrescante (Proraso)',
    description: 'Champú para barba refrescante formulado para limpiezas profundas respetando el vello facial.',
    price: 32,
    image: '/boutique/proraso-wash.jpg',
    category: 'Barba'
  },
  {
    id: 'pomada-fuerte',
    name: 'Pomada Clásica Fijación Fuerte (Doctor Barber)',
    description: 'Pomada clásica original de bajo brillo. Fijación de alta calidad estilo barbershop desde 1948.',
    price: 40,
    image: '/boutique/doctor-barber-pomade.jpg',
    category: 'Pelo'
  },
  {
    id: 'peine-sandalo',
    name: 'Peine Pequeño de Sándalo (ZilberHaar)',
    description: 'Cuidado artesanal: peine especializado para desenredar y dar forma a barbas y bigotes con la máxima delicadeza.',
    price: 25,
    image: '/boutique/peine_de_sandalo.jpg', // Using the alternative naming that was created
    category: 'Accesorios'
  }
];

export const SUBSCRIPTIONS = [
  {
    id: 'essential-look',
    name: 'Essential Look',
    price: 24.90,
    period: 'mes',
    features: [
      '1 Corte de pelo al mes (incluye lavado)',
      'Perfilado de cejas con navaja (cortesía)',
      '10% de descuento en productos de fijación y barba'
    ],
    target: 'El cliente estándar que se corta el pelo una vez al mes.',
    highlight: false
  },
  {
    id: 'executive-grooming',
    name: 'Executive Grooming',
    price: 39.90,
    period: 'mes',
    features: [
      'Cortes de pelo ilimitados (Máx. 1/semana)',
      '1 Arreglo de barba tradicional al mes',
      'Lavado con masaje capilar en cada visita',
      '15% de descuento en todos los productos'
    ],
    target: 'El hombre que cuida su imagen semanalmente y lleva barba.',
    highlight: true
  },
  {
    id: 'total-prestige',
    name: 'Total Prestige',
    price: 54.90,
    period: 'mes',
    features: [
      'Corte de pelo y lavado ilimitados',
      'Arreglo de barba ilimitado',
      '1 Camuflaje de canas para barba al mes',
      'Perfilado de cejas en cada visita',
      '20% de descuento en productos',
      'Reserva prioritaria vía web'
    ],
    target: 'El perfil VIP que quiere olvidarse de la cartera y estar siempre impecable.',
    highlight: false
  }
];
