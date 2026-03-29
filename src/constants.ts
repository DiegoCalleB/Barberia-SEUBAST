export const SERVICES = [
  {
    id: 'corte-estudio',
    name: 'Corte de Pelo de Estudio',
    description: 'Sastrería de precisión que incluye consulta detallada, lavado de autor con extractos botánicos y peinado personalizado. Finalizado con limpieza de cuello a navaja clásica.',
    price: 75,
    duration: 60,
    category: 'hair'
  },
  {
    id: 'tratamiento-capilar',
    name: 'Tratamiento Capilar',
    description: 'Un ritual de desintoxicación vigorizante. Incluye una mascarilla refrescante de mentol, masaje craneal profundo y terapia de vapor para revitalizar el folículo piloso.',
    price: 45,
    duration: 30,
    category: 'hair'
  },
  {
    id: 'afeitado-lujo',
    name: 'Afeitado de Lujo',
    description: 'La máxima indulgencia. Proceso de siete pasos que incluye aplicación de aceite caliente, múltiples toallas al vapor, espumado con brocha de tejón y afeitado a navaja de dos pasadas.',
    price: 60,
    duration: 45,
    category: 'beard'
  },
  {
    id: 'esculpido-barba',
    name: 'Esculpido de Barba',
    description: 'Modelado arquitectónico meticuloso con tijeras y máquinas. Incluye perfilado a navaja y acondicionamiento con aceite orgánico de cedro para barba.',
    price: 40,
    duration: 30,
    category: 'beard'
  }
];

export const PRODUCTS = [
  {
    id: 'aceite-barba',
    name: 'Aceite de Barba',
    description: 'Infusión de cítricos sicilianos y sándalo para un acabado majestuoso.',
    price: 42,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFVMeboq3f4vrtzqWExwEUyaalv44Hm0JXlMrfeWovFax4JR-tLfbcURKK1x6vYmTs3lzWmJYrLy-JPJcgq3ZhtATDC_dQ6gVwtfcFchSlq0_XrgKTYrRJtQrANZ-PMS5bXw50XHhn9xeILk58BilNzTMgtGS32v5El0GXMrFRrK05MhLMq48v5DCETMvqMAl8gQ6mDFYSLdWEPz4at8HlCllkGPMfoHVhEh2zxbx8wzz2SzqoK3TuV41ZvfkwDu8unKPAP74WT21Y',
    category: 'Beard Care'
  },
  {
    id: 'cepillo-ebano',
    name: 'Cepillo de Ébano',
    description: 'Madera de ébano tallada a mano con cerdas de jabalí de origen ético.',
    price: 65,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGuL5Zfs_iSb-nlzl9s3eE6K5w0Q-6--FLF3Qi2Uwc7u_tAho3C94j4C5n8k55qtqNK2Y5tq4JVk03Rm-ciYr4yxNWV8bVUmEjBMzS3CFLPAYZ47dR9Dcczb6UEKwis2eJt4Z71DqY8qPEbGkw8BODz5_cXyF9_h09IB748HwQep-onQljIjM3aztKlbROqVNoql3XWRaJ7DA9EI962sbFfMObUhqOZdJ9Ml15923LJqoU4cIDZ9_1L3M0EeslP-rJ4-Wde-cpm6zc',
    category: 'Accessories'
  },
  {
    id: 'cera-mate',
    name: 'Cera Mate',
    description: 'Arcilla mate de alta fijación con minerales volcánicos del Etna.',
    price: 38,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtM3gdpGoAATfQTsqCloFa_VeEF82k-tkPEqo6VbL-yLYQDjhgbYinzzhnGxA-NTCCUovYF6lSR1YoGUpnC045hRIx--QBzA6QiCsEiZnlXdlOWf3EquAVQNgDFFSPUrZwkizMYOCK90bZJJE7C0GFNAr1ki23BLk5pycQxCIePo0zV_QNgk0pAKYS8vPjPD4ZN9oLJBUFg21zDm01qPRijja6P56Z2FZFK4gl4b2IFSQo5GpO_N30LPw7YshCQAwJoY5FQjXJtWg',
    category: 'Hair Styling'
  }
];

export const SUBSCRIPTIONS = [
  {
    id: 'standard',
    name: 'Tarifa Plana Standard',
    price: 45,
    period: 'mes',
    features: ['1 Corte de pelo al mes', 'Lavado incluido', 'Asesoramiento personalizado', '10% dto en productos']
  },
  {
    id: 'premium',
    name: 'Tarifa Plana Premium',
    price: 75,
    period: 'mes',
    features: ['Cortes ilimitados', 'Lavado y tratamiento incluido', 'Arreglo de barba ilimitado', '20% dto en productos', 'Acceso a eventos exclusivos']
  }
];
