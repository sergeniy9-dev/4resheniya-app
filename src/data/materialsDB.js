/**
 * База данных материалов для 3D-конструктора
 * Содержит информацию о материалах, ценах и поставщиках
 */

export const materialsDB = {
  // Стеновые материалы
  walls: [
    {
      id: 'wall-drywall-standard',
      name: 'Гипсокартон стандартный',
      category: 'walls',
      unit: 'лист',
      price: 450,
      supplier: 'Лемана ПРО',
      specs: { thickness: '12.5 мм', size: '2500x1200 мм' },
      inStock: true
    },
    {
      id: 'wall-drywall-moisture',
      name: 'Гипсокартон влагостойкий',
      category: 'walls',
      unit: 'лист',
      price: 580,
      supplier: 'Петрович',
      specs: { thickness: '12.5 мм', size: '2500x1200 мм' },
      inStock: true
    },
    {
      id: 'wall-brick-red',
      name: 'Кирпич красный полнотелый',
      category: 'walls',
      unit: 'шт',
      price: 25,
      supplier: 'Лемана ПРО',
      specs: { size: '250x120x65 мм' },
      inStock: true
    },
    {
      id: 'wall-gasblock',
      name: 'Газоблок D500',
      category: 'walls',
      unit: 'м³',
      price: 4200,
      supplier: 'Петрович',
      specs: { size: '600x300x200 мм' },
      inStock: true
    }
  ],

  // Напольные покрытия
  floors: [
    {
      id: 'floor-laminate-oak',
      name: 'Ламинат дуб натуральный',
      category: 'floors',
      unit: 'м²',
      price: 890,
      supplier: 'Лемана ПРО',
      specs: { thickness: '8 мм', class: '33' },
      inStock: true
    },
    {
      id: 'floor-laminate-walnut',
      name: 'Ламинат орех темный',
      category: 'floors',
      unit: 'м²',
      price: 950,
      supplier: 'Петрович',
      specs: { thickness: '8 мм', class: '33' },
      inStock: true
    },
    {
      id: 'floor-parquet-engineered',
      name: 'Паркетная доска инженерная',
      category: 'floors',
      unit: 'м²',
      price: 3200,
      supplier: 'Лемана ПРО',
      specs: { thickness: '14 мм', layers: '3 слоя' },
      inStock: true
    },
    {
      id: 'floor-tile-ceramic',
      name: 'Плитка керамическая',
      category: 'floors',
      unit: 'м²',
      price: 1250,
      supplier: 'Петрович',
      specs: { size: '300x300 мм', type: 'керамогранит' },
      inStock: true
    },
    {
      id: 'floor-linoleum-comfort',
      name: 'Линолеум бытовой',
      category: 'floors',
      unit: 'м²',
      price: 450,
      supplier: 'Лемана ПРО',
      specs: { thickness: '3 мм', class: '23' },
      inStock: true
    }
  ],

  // Потолочные материалы
  ceilings: [
    {
      id: 'ceiling-drywall',
      name: 'Гипсокартон потолочный',
      category: 'ceilings',
      unit: 'лист',
      price: 380,
      supplier: 'Петрович',
      specs: { thickness: '9.5 мм', size: '2500x1200 мм' },
      inStock: true
    },
    {
      id: 'ceiling-stretch-matte',
      name: 'Натяжной потолок матовый',
      category: 'ceilings',
      unit: 'м²',
      price: 650,
      supplier: 'Лемана ПРО',
      specs: { material: 'ПВХ', finish: 'матовый' },
      inStock: true
    },
    {
      id: 'ceiling-stretch-glossy',
      name: 'Натяжной потолок глянцевый',
      category: 'ceilings',
      unit: 'м²',
      price: 720,
      supplier: 'Петрович',
      specs: { material: 'ПВХ', finish: 'глянцевый' },
      inStock: true
    },
    {
      id: 'ceiling-armstrong',
      name: 'Потолок Армстронг',
      category: 'ceilings',
      unit: 'м²',
      price: 480,
      supplier: 'Лемана ПРО',
      specs: { tile: '600x600 мм', type: 'минеральное волокно' },
      inStock: true
    }
  ],

  // Инженерные материалы
  engineering: [
    {
      id: 'eng-cable-vvg',
      name: 'Кабель ВВГнг 3x2.5',
      category: 'engineering',
      unit: 'м',
      price: 85,
      supplier: 'Петрович',
      specs: { cores: '3', section: '2.5 мм²' },
      inStock: true
    },
    {
      id: 'eng-cable-vvg-light',
      name: 'Кабель ВВГнг 3x1.5',
      category: 'engineering',
      unit: 'м',
      price: 55,
      supplier: 'Лемана ПРО',
      specs: { cores: '3', section: '1.5 мм²' },
      inStock: true
    },
    {
      id: 'eng-pipe-ppr-20',
      name: 'Труба полипропиленовая 20мм',
      category: 'engineering',
      unit: 'м',
      price: 45,
      supplier: 'Петрович',
      specs: { diameter: '20 мм', pressure: 'PN20' },
      inStock: true
    },
    {
      id: 'eng-pipe-ppr-25',
      name: 'Труба полипропиленовая 25мм',
      category: 'engineering',
      unit: 'м',
      price: 65,
      supplier: 'Лемана ПРО',
      specs: { diameter: '25 мм', pressure: 'PN20' },
      inStock: true
    },
    {
      id: 'eng-socket-schneider',
      name: 'Розетка Schneider Electric',
      category: 'engineering',
      unit: 'шт',
      price: 320,
      supplier: 'Петрович',
      specs: { type: 'с заземлением', color: 'белый' },
      inStock: true
    },
    {
      id: 'eng-switch-schneider',
      name: 'Выключатель Schneider Electric',
      category: 'engineering',
      unit: 'шт',
      price: 280,
      supplier: 'Лемана ПРО',
      specs: { type: 'одноклавишный', color: 'белый' },
      inStock: true
    }
  ],

  // Изоляционные материалы
  insulation: [
    {
      id: 'iso-minvat-rockwool',
      name: 'Минвата Rockwool',
      category: 'insulation',
      unit: 'упаковка',
      price: 1250,
      supplier: 'Петрович',
      specs: { thickness: '50 мм', area: '6 м²' },
      inStock: true
    },
    {
      id: 'iso-foam-polystyrene',
      name: 'Пенополистирол ЭППС',
      category: 'insulation',
      unit: 'лист',
      price: 185,
      supplier: 'Лемана ПРО',
      specs: { thickness: '30 мм', size: '1200x600 мм' },
      inStock: true
    },
    {
      id: 'iso-penofol',
      name: 'Пенофол фольгированный',
      category: 'insulation',
      unit: 'рулон',
      price: 890,
      supplier: 'Петрович',
      specs: { thickness: '5 мм', size: '10 м x 1.2 м' },
      inStock: true
    }
  ]
};

// Вспомогательные функции для работы с базой данных

/**
 * Получить материал по ID
 */
export function getMaterialById(id) {
  for (const category in materialsDB) {
    const material = materialsDB[category].find(m => m.id === id);
    if (material) return material;
  }
  return null;
}

/**
 * Получить все материалы категории
 */
export function getMaterialsByCategory(category) {
  return materialsDB[category] || [];
}

/**
 * Поиск материалов по названию
 */
export function searchMaterials(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  for (const category in materialsDB) {
    const matches = materialsDB[category].filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.supplier.toLowerCase().includes(lowerQuery)
    );
    results.push(...matches);
  }
  
  return results;
}

/**
 * Сравнить цены между поставщиками для категории
 */
export function comparePrices(category) {
  const materials = getMaterialsByCategory(category);
  const comparison = {};
  
  materials.forEach(material => {
    if (!comparison[material.supplier]) {
      comparison[material.supplier] = [];
    }
    comparison[material.supplier].push(material);
  });
  
  return comparison;
}

/**
 * Рассчитать стоимость для списка материалов
 */
export function calculateTotalCost(items) {
  let total = 0;
  const breakdown = [];
  
  items.forEach(item => {
    const material = getMaterialById(item.id);
    if (material) {
      const cost = material.price * item.quantity;
      total += cost;
      breakdown.push({
        ...material,
        quantity: item.quantity,
        totalCost: cost
      });
    }
  });
  
  return { total, breakdown };
}

export default materialsDB;
