/**
 * Калькулятор сметы для 3D-конструктора
 * Рассчитывает стоимость материалов и работ на основе проекта
 */

import { getMaterialById, getMaterialsByCategory, calculateTotalCost } from '../data/materialsDB';

/**
 * Класс калькулятора сметы
 */
export class EstimateCalculator {
  constructor() {
    this.items = [];
    this.works = [];
  }

  /**
   * Добавить материал в смету
   * @param {string} materialId - ID материала из базы
   * @param {number} quantity - Количество
   * @param {string} unit - Единица измерения (опционально)
   */
  addMaterial(materialId, quantity, unit = null) {
    const material = getMaterialById(materialId);
    if (!material) {
      console.warn(`Material ${materialId} not found`);
      return false;
    }

    this.items.push({
      id: materialId,
      name: material.name,
      category: material.category,
      unit: unit || material.unit,
      price: material.price,
      quantity: quantity,
      supplier: material.supplier,
      total: material.price * quantity
    });

    return true;
  }

  /**
   * Добавить работу в смету
   * @param {string} name - Название работы
   * @param {number} quantity - Объем работ
   * @param {string} unit - Единица измерения
   * @param {number} rate - Расценка за единицу
   */
  addWork(name, quantity, unit, rate) {
    this.works.push({
      name,
      quantity,
      unit,
      rate,
      total: quantity * rate
    });
  }

  /**
   * Удалить материал из сметы
   * @param {number} index - Индекс в массиве items
   */
  removeMaterial(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Удалить работу из сметы
   * @param {number} index - Индекс в массиве works
   */
  removeWork(index) {
    if (index >= 0 && index < this.works.length) {
      this.works.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Очистить всю смету
   */
  clear() {
    this.items = [];
    this.works = [];
  }

  /**
   * Получить итоговую стоимость материалов
   */
  getMaterialsTotal() {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * Получить итоговую стоимость работ
   */
  getWorksTotal() {
    return this.works.reduce((sum, work) => sum + work.total, 0);
  }

  /**
   * Получить общую сумму сметы
   */
  getTotal() {
    return this.getMaterialsTotal() + this.getWorksTotal();
  }

  /**
   * Получить разбивку по поставщикам
   */
  getBreakdownBySupplier() {
    const breakdown = {};
    
    this.items.forEach(item => {
      if (!breakdown[item.supplier]) {
        breakdown[item.supplier] = {
          supplier: item.supplier,
          items: [],
          total: 0
        };
      }
      breakdown[item.supplier].items.push(item);
      breakdown[item.supplier].total += item.total;
    });

    return Object.values(breakdown);
  }

  /**
   * Получить разбивку по категориям
   */
  getBreakdownByCategory() {
    const breakdown = {};
    
    this.items.forEach(item => {
      if (!breakdown[item.category]) {
        breakdown[item.category] = {
          category: item.category,
          items: [],
          total: 0
        };
      }
      breakdown[item.category].items.push(item);
      breakdown[item.category].total += item.total;
    });

    return Object.values(breakdown);
  }

  /**
   * Экспортировать смету в JSON
   */
  exportToJSON() {
    return JSON.stringify({
      materials: this.items,
      works: this.works,
      totals: {
        materials: this.getMaterialsTotal(),
        works: this.getWorksTotal(),
        grandTotal: this.getTotal()
      },
      bySupplier: this.getBreakdownBySupplier(),
      byCategory: this.getBreakdownByCategory(),
      createdAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Получить полную смету
   */
  getFullEstimate() {
    return {
      materials: [...this.items],
      works: [...this.works],
      totals: {
        materials: this.getMaterialsTotal(),
        works: this.getWorksTotal(),
        grandTotal: this.getTotal()
      },
      bySupplier: this.getBreakdownBySupplier(),
      byCategory: this.getBreakdownByCategory()
    };
  }
}

/**
 * Рассчитать площадь стен с вычетом окон и дверей
 * @param {number} perimeter - Периметр помещения (м)
 * @param {number} height - Высота потолка (м)
 * @param {Array} openings - Массив проемов [{width, height}]
 */
export function calculateWallArea(perimeter, height, openings = []) {
  const grossArea = perimeter * height;
  const openingsArea = openings.reduce((sum, opening) => {
    return sum + (opening.width * opening.height);
  }, 0);
  
  return Math.max(0, grossArea - openingsArea);
}

/**
 * Рассчитать площадь пола/потолка
 * @param {number} length - Длина помещения (м)
 * @param {number} width - Ширина помещения (м)
 */
export function calculateFloorArea(length, width) {
  return length * width;
}

/**
 * Рассчитать количество рулонов обоев
 * @param {number} wallArea - Площадь стен (м²)
 * @param {number} rollWidth - Ширина рулона (м)
 * @param {number} rollLength - Длина рулона (м)
 * @param {number} patternRepeat - Раппорт узора (м, опционально)
 */
export function calculateWallpaperRolls(wallArea, rollWidth, rollLength, patternRepeat = 0) {
  const effectiveLength = rollLength - patternRepeat;
  const rollArea = rollWidth * effectiveLength;
  return Math.ceil(wallArea / rollArea);
}

/**
 * Рассчитать количество плитки с запасом
 * @param {number} area - Площадь укладки (м²)
 * @param {number} wastePercent - Процент запаса на подрезку (обычно 5-10%)
 */
export function calculateTileQuantity(area, wastePercent = 10) {
  const wasteMultiplier = 1 + (wastePercent / 100);
  return Math.ceil(area * wasteMultiplier);
}

/**
 * Рассчитать количество точек электрики
 * @param {number} area - Площадь помещения (м²)
 * @param {string} roomType - Тип помещения
 */
export function calculateElectricalPoints(area, roomType) {
  const norms = {
    living: { sockets: 1, switches: 1 }, // на каждые м²
    kitchen: { sockets: 2, switches: 1 },
    bedroom: { sockets: 1, switches: 1 },
    bathroom: { sockets: 0.5, switches: 1 },
    hallway: { sockets: 0.5, switches: 1 }
  };

  const norm = norms[roomType] || norms.living;
  
  return {
    sockets: Math.ceil(area * norm.sockets),
    switches: Math.ceil(area * norm.switches)
  };
}

/**
 * Сравнить цены между Лемана ПРО и Петрович
 * @param {Array} items - Список материалов для сравнения
 */
export function compareSuppliers(items) {
  const comparison = {
    lemana: { total: 0, items: [] },
    petrovich: { total: 0, items: [] },
    difference: 0,
    cheaper: null
  };

  items.forEach(item => {
    const material = getMaterialById(item.id);
    if (!material) return;

    const lemanaItem = { ...material, quantity: item.quantity };
    const petrovichItem = { ...material, quantity: item.quantity };

    // Если материал от Лемана ПРО
    if (material.supplier === 'Лемана ПРО') {
      lemanaItem.total = material.price * item.quantity;
      comparison.lemana.total += lemanaItem.total;
      comparison.lemana.items.push(lemanaItem);
    } 
    // Если материал от Петрович
    else if (material.supplier === 'Петрович') {
      petrovichItem.total = material.price * item.quantity;
      comparison.petrovich.total += petrovichItem.total;
      comparison.petrovich.items.push(petrovichItem);
    }
  });

  comparison.difference = Math.abs(comparison.lemana.total - comparison.petrovich.total);
  comparison.cheaper = comparison.lemana.total < comparison.petrovich.total ? 'Лемана ПРО' : 'Петрович';

  return comparison;
}

/**
 * Создать новую смету
 */
export function createEstimate() {
  return new EstimateCalculator();
}

export default EstimateCalculator;
