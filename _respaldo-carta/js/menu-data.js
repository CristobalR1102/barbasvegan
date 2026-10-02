// ==========================================
// CARTA OFICIAL BARBAS VEGAN - FOOD TRUCK
// ==========================================

const MENU_CATEGORIES = [
  { id: 'all', name: 'Toda la Carta', icon: 'zap' },
  { id: 'compartir', name: 'Para Compartir', icon: 'share-2' },
  { id: 'sandwiches', name: 'Sandwiches & Completos', icon: 'utensils' },
  { id: 'promos', name: 'Promociones', icon: 'tag' },
  { id: 'ensaladas', name: 'Ensaladas & Colaciones', icon: 'leaf' }
];

// Tipos del formato "As / Salchicha / Champipleto" (se pregunta al agregar)
const COMPLETO_TYPES = [
  { id: 'as', label: 'As', desc: 'Con seitán' },
  { id: 'salchicha', label: 'Salchicha', desc: 'Con vienesa vegana' },
  { id: 'champipleto', label: 'Champipleto', desc: 'Con champiñones' }
];

const MENU_ITEMS = [
  // --- PARA COMPARTIR ---
  {
    id: 'aros-cebolla',
    name: 'Aros de Cebolla',
    category: 'compartir',
    price: 3790,
    portion: '12 aritos',
    description: '12 aritos de cebolla crujientes y dorados a la perfección, servidos calientes con salsa a elección.',
    tags: ['100% Vegano', 'Crujiente', 'Para Picar'],
    badge: 'Crujiente'
  },
  {
    id: 'papas-fritas',
    name: 'Porción de Papas Fritas',
    category: 'compartir',
    price: 3750,
    portion: 'Porción grande',
    description: 'Papas fritas rústicas y crocantes por fuera, tiernas por dentro, con sazón especial de la casa.',
    tags: ['100% Vegano', 'Clásico Callejero'],
    badge: 'Favorito'
  },
  {
    id: 'arrollados-primavera',
    name: 'Arrollados Primavera',
    category: 'compartir',
    price: 3990,
    portion: '5 unidades',
    description: '5 arrollados crocantes rellenos de verduras frescas salteadas al wok y tofu sazonado.',
    tags: ['100% Vegano', '5 Unidades', 'Tofu & Verduras'],
    badge: 'Receta Propia'
  },
  {
    id: 'tofu-pop',
    name: 'Tofu Pop',
    category: 'compartir',
    price: 3500,
    portion: 'Porción de bolitas',
    description: 'Porción de bolitas de tofu ultra crispy marinadas con especias secretas Barbas Vegan.',
    tags: ['100% Vegano', 'Alto en Proteína', 'Super Crispy'],
    badge: 'Recomendado'
  },
  {
    id: 'papas-suprema',
    name: 'Papas Suprema',
    category: 'compartir',
    price: 6790,
    portion: 'Para 2 personas',
    description: 'Papas fritas montadas con seitán artesanal o champiñones, cremosa salsa cheddar vegana, tomate fresco en cubos, ciboulette fresco y mayo vegan.',
    tags: ['100% Vegano', 'Seitán o Champiñones', 'Cheddar Vegano'],
    badge: 'Estrella',
    featured: true
  },
  {
    id: 'vegellana',
    name: 'Vegellana',
    category: 'compartir',
    price: 7000,
    portion: 'Para compartir contundente',
    description: 'La reina de la noche: papas fritas doradas, seitán de la casa, champiñones salteados, cheddar vegano derretido, pimientos salteados, cebolla grillada, aceitunas y mayo vegan.',
    tags: ['100% Vegano', 'La Más Contundente', 'Seitán & Champiñones'],
    badge: 'Bajón Supremo',
    featured: true
  },

  // --- SANDWICH Y COMPLETOS (todos vienen con papas) ---
  {
    id: 'italiano',
    name: 'Italiano',
    category: 'sandwiches',
    hasVariants: true,
    defaultVariant: 'sandwich',
    variants: [
      { id: 'sandwich', label: 'Sandwich (con papas)', price: 6790 },
      { id: 'as', label: 'As / Salchicha / Champipleto', price: 3990 }
    ],
    price: 6790,
    description: 'El clásico chileno definitivo: seitán artesanal de la casa, abundante palta fresca molida, tomate maduro y mayonesa vegana casera en pan crujiente.',
    tags: ['100% Vegano', 'Seitán Artesanal', 'Palta Fresca', 'Incluye Papas'],
    badge: 'Clásico Chileno',
    featured: true
  },
  {
    id: 'xuxu-k',
    name: 'Xuxu-K',
    category: 'sandwiches',
    hasVariants: true,
    defaultVariant: 'sandwich',
    variants: [
      { id: 'sandwich', label: 'Sandwich (con papas)', price: 6790 },
      { id: 'as', label: 'As / Salchicha / Champipleto', price: 3990 }
    ],
    price: 6790,
    description: 'Combinación legendaria de seitán a la plancha, palta hass cremosa, queso vegano fundido y un toque generoso de mayo vegan.',
    tags: ['100% Vegano', 'Queso Fundido', 'Palta', 'Incluye Papas'],
    badge: 'Favorito'
  },
  {
    id: 'barros-lucco',
    name: 'Barros Lucco',
    category: 'sandwiches',
    hasVariants: true,
    defaultVariant: 'sandwich',
    variants: [
      { id: 'sandwich', label: 'Sandwich (con papas)', price: 6200 },
      { id: 'as', label: 'As / Salchicha / Champipleto', price: 3990 }
    ],
    price: 6200,
    description: 'Seitán jugoso a la plancha cubierto con abundante queso vegano derretido. Opcional con mayo vegan si quieres.',
    tags: ['100% Vegano', 'Extra Queso Vegano', 'Seitán Dorado', 'Incluye Papas'],
    badge: 'Doble Queso Veg'
  },
  {
    id: 'fauna',
    name: 'Fauna',
    category: 'sandwiches',
    hasVariants: false,
    price: 6790,
    description: 'Creación original de Barbas Vegan: seitán artesanal, palta fresca, tomate, lechuga crocante, queso cheddar vegano, lluvia de papas al hilo y mayo vegan.',
    tags: ['100% Vegano', 'Papas al Hilo', 'Cheddar Veg', 'Incluye Papas'],
    badge: 'Especial Barbas',
    featured: true
  },
  {
    id: 'chacarero',
    name: 'Chacarero',
    category: 'sandwiches',
    hasVariants: true,
    defaultVariant: 'sandwich',
    variants: [
      { id: 'sandwich', label: 'Sandwich (con papas)', price: 6790 },
      { id: 'as', label: 'As / Salchicha / Champipleto', price: 3990 }
    ],
    price: 6790,
    description: 'Seitán sabroso, poroto verde fresco al dente, tomate en rodajas, ají verde encurtido en su punto justo de picor y mayo vegan si quieres.',
    tags: ['100% Vegano', 'Poroto Verde', 'Ají Encurtido', 'Incluye Papas'],
    badge: 'Tradición Criolla'
  },
  {
    id: 'napolitano',
    name: 'Napolitano',
    category: 'sandwiches',
    hasVariants: false,
    price: 6790,
    description: 'Seitán a la plancha con tomate asado a la plancha, queso vegano fundido, orégano seleccionado, aceitunas negras, choclo dulce y mayo vegan.',
    tags: ['100% Vegano', 'Tomate Plancha', 'Orégano & Aceitunas', 'Incluye Papas'],
    badge: 'Sabor Horno Plancha'
  },
  {
    id: 'dinamico',
    name: 'Dinámico',
    category: 'sandwiches',
    hasVariants: true,
    defaultVariant: 'sandwich',
    variants: [
      { id: 'sandwich', label: 'Sandwich (con papas)', price: 6790 },
      { id: 'as', label: 'As / Salchicha / Champipleto', price: 3990 }
    ],
    price: 6790,
    description: 'La cumbre de la sanguchería callejera: seitán a la plancha, tomate, palta hass fresca, chucrut/americana y deliciosa mayo vegan.',
    tags: ['100% Vegano', 'Todo en Uno', 'Chucrut & Salsa', 'Incluye Papas'],
    badge: 'Super Clásico'
  },

  // --- PROMOCIONES ---
  {
    id: 'promo-proletariado',
    name: 'Promo del Proletariado',
    category: 'promos',
    price: 6500,
    portion: '2 Sandwiches completos',
    description: 'Dos sandwiches contundentes preparados con la receta especial de la semana. ¡El mejor precio y porciones generosas para tu bajón!',
    tags: ['100% Vegano', 'Promo de la Semana', '2 Sandwiches', 'Super Ahorro'],
    badge: 'Promo Destacada',
    featured: true
  },
  {
    id: 'completo-papas-bebida',
    name: 'Completo + Papas + Bebida',
    category: 'promos',
    price: 5390,
    portion: 'Combo personal',
    completoChoices: 1,
    description: '1 Completo a elección (As, Salchicha o Champipleto) + porción individual de papas fritas doradas + 1 lata de bebida bien fría (350cc).',
    tags: ['100% Vegano', 'Combo Completo', 'Papas & Bebida'],
    badge: 'Combo Individual'
  },
  {
    id: 'dos-completos-bebida',
    name: '2 Completos + Bebida',
    category: 'promos',
    price: 6380,
    portion: 'Para 2 personas',
    completoChoices: 2,
    description: '2 Completos a elección (As, Salchicha o Champipleto) con los ingredientes frescos que tú elijas + 1 lata de bebida bien fría para acompañar.',
    tags: ['100% Vegano', 'Doble Completo', 'Incluye Bebida'],
    badge: 'Para Compartir'
  },
  {
    id: 'dos-completos',
    name: '2 Completos',
    category: 'promos',
    price: 4980,
    portion: '2 Unidades',
    completoChoices: 2,
    description: '2 Completos a elección (As, Salchicha o Champipleto) cargados con palta, tomate y mayo vegana casera.',
    tags: ['100% Vegano', 'Precio Popular', 'Doble Sabor'],
    badge: 'Precio Popular'
  },

  // --- ENSALADAS Y COLACIONES ---
  {
    id: 'ensalada-temporada',
    name: 'Ensalada de Temporada',
    category: 'ensaladas',
    price: 5790,
    portion: 'Bowl contundente',
    description: 'Verduras frescas de la estación con distintas preparaciones artesanales, acompañadas de láminas de seitán dorado y suave hummus casero.',
    tags: ['100% Vegano', 'Hummus Casero', 'Verduras Frescas', 'Seitán'],
    badge: 'Fresca & Sana'
  },
  {
    id: 'fake-salad',
    name: 'Fake Salad',
    category: 'ensaladas',
    price: 5790,
    portion: 'Bowl para bajoneros',
    description: 'Para los que quieren ensalada pero con corazón de food truck: lechuga fresca con tomates cherry, coronada con papas fritas crocantes, salsa de queso vegano, seitán a la plancha y mayo vegan.',
    tags: ['100% Vegano', 'Papas Fritas + Queso', 'Seitán', 'Rebelde'],
    badge: 'Fan Favorite',
    featured: true
  },
  {
    id: 'colacion-dia',
    name: 'Colación del Día',
    category: 'ensaladas',
    price: 5790,
    portion: 'Plato completo',
    description: 'El almuerzo perfecto para recargar fuerzas: porción contundente de proteína vegetal artesanal, carbohidrato del día y ensalada fresca variada.',
    tags: ['100% Vegano', 'Almuerzo Equilibrado', 'Contundente'],
    badge: 'Almuerzo Diario'
  }
];

// --- SEITÁN PARA COCINAR EN CASA (sección propia, no aparece en la carta) ---
// EJEMPLO: formatos, precios y descripciones por confirmar con el cliente.
const SEITAN_PRODUCTS = [
  {
    id: 'seitan-natural-500',
    name: 'Seitán natural 500 g',
    shortName: 'Seitán natural',
    category: 'seitan',
    weight: '500 g',
    price: 4500,
    description: 'Nuestro seitán artesanal sin aliñar, firme y jugoso. Para darle tu propio sabor a la plancha, salteado o en guiso.',
    badge: 'Clásico'
  },
  {
    id: 'seitan-marinado-500',
    name: 'Seitán marinado 500 g',
    shortName: 'Seitán marinado',
    category: 'seitan',
    weight: '500 g',
    price: 5000,
    description: 'Con el aliño de la casa, el mismo que usamos en el food truck. Solo tienes que dorarlo en el sartén.',
    badge: 'Listo para dorar'
  },
  {
    id: 'seitan-natural-1kg',
    name: 'Seitán natural 1 kg',
    shortName: 'Seitán natural',
    category: 'seitan',
    weight: '1 kg',
    price: 8500,
    description: 'Formato familiar para cocinar varias comidas de la semana o preparar algo para compartir.',
    badge: 'Formato familiar'
  }
];

// Ideas de preparación que se muestran en la sección
const SEITAN_IDEAS = ['A la plancha', 'Salteado con verduras', 'Mechado', 'En guiso', 'Apanado', 'En sándwich'];

// Configuración general del negocio
const BUSINESS_CONFIG = {
  name: 'Barbas Vegan',
  slogan: 'Comida Callejera 100% Vegana & Artesanal',
  phone: '+56912345678', // Reemplazable fácilmente
  whatsappPhone: '56912345678',
  instagram: 'https://instagram.com/barbasvegan',
  currency: 'CLP',
  location: {
    name: 'Barbas Vegan',
    city: 'Santiago, Chile',
    lat: -33.5090364,
    lng: -70.7569641,
    mapsUrl: 'https://www.google.com/maps/place/Barbas+Vegan/@-33.5090319,-70.759539,946m/data=!3m2!1e3!4b1!4m6!3m5!1s0x9662ddf115c2b09f:0x824d7de96b1cfdf0!8m2!3d-33.5090364!4d-70.7569641!16s%2Fg%2F11qfqvmzd8?hl=es-419',
    schedule: 'Lun a Vie 12:00–20:00 · Sáb 13:00–17:00 · Dom cerrado',
    timezone: 'America/Santiago'
  }
};

// Horario semanal (0 = Domingo ... 6 = Sábado). null = cerrado.
const WEEK_HOURS = {
  0: null,
  1: ['12:00', '20:00'],
  2: ['12:00', '20:00'],
  3: ['12:00', '20:00'],
  4: ['12:00', '20:00'],
  5: ['12:00', '20:00'],
  6: ['13:00', '17:00']
};
