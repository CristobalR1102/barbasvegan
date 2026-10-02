// ==========================================
// BARBAS VEGAN - SEITÁN ARTESANAL
// Datos editables del sitio
// ==========================================

// Formatos que se muestran y que se pueden elegir en el formulario.
// Para agregar uno nuevo, copia un bloque y cambia id, nombre y descripción.
// PENDIENTE: confirmar con el cliente las descripciones de "Rub" y "Parrillero".
const SEITAN_FORMATS = [
  {
    id: 'laminado',
    name: 'Laminado',
    tagline: 'En láminas',
    description: 'Cortado en láminas delgadas y parejas. Ideal para saltear, para sándwiches o para rellenar.'
  },
  {
    id: 'medallones',
    name: 'Medallones',
    tagline: 'Porcionado',
    description: 'Cortado en medallones parejos, listos para la plancha. Rápidos de preparar y fáciles de porcionar.'
  },
  {
    id: 'rub',
    name: 'Rub',
    tagline: 'Con aliño',
    description: 'Sazonado con nuestra mezcla de especias, listo para dorar en el sartén o al horno.'
  },
  {
    id: 'parrillero',
    name: 'Parrillero',
    tagline: 'Para la parrilla',
    description: 'Pensado para la parrilla: queda dorado por fuera y jugoso por dentro.'
  }
];

// Tamaños de paquete (iguales para todos los formatos). "Horeca" = hoteles, restaurantes y cafeterías.
const SEITAN_SIZES = [
  { id: '05', label: '0,5 kg', kg: 0.5 },
  { id: '1', label: '1 kg', kg: 1 },
  { id: '3', label: '3 kg', kg: 3, note: 'Horeca' }
];

// Ideas de preparación
const SEITAN_IDEAS = ['A la plancha', 'Salteado con verduras', 'Mechado', 'En guiso', 'Apanado', 'En sándwich'];

// Frecuencia de compra (se pregunta solo a locales)
const ORDER_FREQUENCIES = ['Una vez', 'Semanal', 'Quincenal', 'Mensual'];

// Configuración general del negocio
const BUSINESS_CONFIG = {
  name: 'Barbas Vegan',
  whatsappPhone: '56912345678', // PENDIENTE: número real del negocio
  instagram: 'https://instagram.com/barbasvegan',
  facebook: 'https://www.facebook.com/BarbasVegan/',
  tiktok: 'https://www.tiktok.com/@barbasvegan',
  // Apps de delivery del food truck. Si un link queda vacío (''), su botón no se muestra.
  delivery: {
    rappi: 'https://www.rappi.cl/restaurantes/900101955-barbas-vegan',
    ubereats: 'https://www.ubereats.com/cl/store/barbas-vegan/ZpwF9-xzWXG42Y1f252YYg'
  },
  location: {
    name: 'Barbas Vegan',
    city: 'Santiago, Chile',
    mapsUrl: 'https://www.google.com/maps/place/Barbas+Vegan/@-33.5090319,-70.759539,946m/data=!3m2!1e3!4b1!4m6!3m5!1s0x9662ddf115c2b09f:0x824d7de96b1cfdf0!8m2!3d-33.5090364!4d-70.7569641!16s%2Fg%2F11qfqvmzd8?hl=es-419',
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
