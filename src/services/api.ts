// frontend/src/services/api.ts
import { CONFIG } from '../../target_config';

const API_BASE_URL = CONFIG.apiBaseUrl;
console.log('🌐 Current API Base URL:', API_BASE_URL);
console.log('📍 Environment:', CONFIG.isGitHubPages ? 'GitHub Pages' : 'Local');

// ←←← ВАША КАРТИНКА - RAW ССЫЛКА ↓↓↓
const YOUR_IMAGE_URL = 'https://raw.githubusercontent.com/MaryEariel/isotope-calc6/main/default-isotope.jpg';

const mockIsotopes = [
  {
    id: 1,
    name: 'Уран-235',
    description: 'Делящийся изотоп урана, используемый в ядерных реакторах и оружии.',
    half_life: 703800000.0,
    atomic_mass: 235.0439299,
    decay_type: 'α',
    application: 'Ядерное топливо, атомное оружие',
    image_url: YOUR_IMAGE_URL,
    is_active: true,
  },
  {
    id: 2,
    name: 'Углерод-14',
    description: 'Радиоактивный изотоп углерода с периодом полураспада около 5730 лет.',
    half_life: 5730.0,
    atomic_mass: 14.003241,
    decay_type: 'β-',
    application: 'Археологическое датирование',
    image_url: YOUR_IMAGE_URL,
    is_active: true,
  },
  {
    id: 3,
    name: 'Кобальт-60',
    description: 'Искусственный радиоактивный изотоп кобальта.',
    half_life: 5.27,
    atomic_mass: 59.933822,
    decay_type: 'β-',
    application: 'Медицинская стерилизация, лучевая терапия',
    image_url: YOUR_IMAGE_URL,
    is_active: true,
  },
  {
    id: 4,
    name: 'Йод-131',
    description: 'Радиоактивный изотоп йода, важный в ядерной медицине.',
    half_life: 8.02,
    atomic_mass: 130.9061246,
    decay_type: 'β-',
    application: 'Диагностика и лечение заболеваний щитовидной железы',
    image_url: YOUR_IMAGE_URL,
    is_active: true,
  },
  {
    id: 5,
    name: 'Торий-232',
    description: 'Природный радиоактивный изотоп тория с очень длительным периодом полураспада.',
    half_life: 14050000000.0,
    atomic_mass: 232.038055,
    decay_type: 'α',
    application: 'Ядерное топливо, радиационная терапия',
    image_url: YOUR_IMAGE_URL,
    is_active: true,
  }
];

const getAbsoluteUrl = (url: string): string => {
  if (url.startsWith('//')) {
    return window.location.protocol === 'https:' 
      ? `https:${url}` 
      : `http:${url}`;
  }
  return url;
};

const checkApiAvailability = async (): Promise<boolean> => {
  if (CONFIG.isGitHubPages) {
    try {
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotopes/`);
      console.log('🔗 Checking:', absoluteUrl);
      
      const response = await fetch(absoluteUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      return response.ok;
    } catch (error) {
      console.log('⚠️ API недоступен для GitHub Pages');
      return false;
    }
  }
  return true;
};

const processImageUrl = (image_url: string | null | undefined): string => {
  if (!image_url || image_url.trim() === '' || CONFIG.isGitHubPages) {
    return YOUR_IMAGE_URL;
  }
  
  if (image_url.startsWith('//')) {
    return getAbsoluteUrl(image_url);
  }
  
  if (image_url.startsWith('http')) {
    return image_url;
  }
  
  if (image_url.startsWith('/')) {
    return getAbsoluteUrl(`${CONFIG.apiBaseUrl}${image_url}`);
  }
  
  return image_url;
};

// Весь остальной код isotopeService и cartService БЕЗ ИЗМЕНЕНИЙ
// (оставьте как было в вашем файле)

export const isotopeService = {
  async getIsotopes(filters: IsotopeFilters = {}): Promise<Isotope[]> {
    console.log('=== isotopeService.getIsotopes() ===');
    
    const apiAvailable = await checkApiAvailability();
    
    if (!apiAvailable && CONFIG.isGitHubPages) {
      console.log('📦 Используем mock данные (GitHub Pages mode)');
      let result = [...mockIsotopes];
      if (filters.name) {
        const query = filters.name.toLowerCase();
        result = result.filter(iso => 
          iso.name.toLowerCase().includes(query) ||
          iso.application.toLowerCase().includes(query)
        );
      }
      return result;
    }
    
    try {
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotopes/?search=${filters.name || ''}`);
      console.log('🔄 Запрашиваем данные с API:', absoluteUrl);
      
      const response = await fetch(absoluteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API ответ получен');
      
      const apiIsotopes = data.results || data || [];
      
      if (Array.isArray(apiIsotopes) && apiIsotopes.length > 0) {
        return apiIsotopes.map((item: any) => ({
          id: item.id || 0,
          name: item.name || 'Неизвестный',
          description: item.description || '',
          half_life: item.half_life || 0,
          atomic_mass: item.atomic_mass || 0,
          decay_type: item.decay_type || 'Неизвестно',
          application: item.application || '',
          image_url: processImageUrl(item.image_url),
          is_active: item.is_active !== false
        }));
      }
      
      console.log('📦 API вернул пустой массив, используем mock');
      return mockIsotopes;
      
    } catch (error: any) {
      console.warn('⚠️ API недоступен, используем MOCK:', error.message);
      
      let result = [...mockIsotopes];
      if (filters.name) {
        const query = filters.name.toLowerCase();
        result = result.filter(iso => 
          iso.name.toLowerCase().includes(query) ||
          iso.application.toLowerCase().includes(query)
        );
      }
      return result;
    }
  },

  async getIsotope(id: number): Promise<Isotope> {
    console.log(`=== isotopeService.getIsotope(${id}) ===`);
    
    const apiAvailable = await checkApiAvailability();
    
    if (!apiAvailable && CONFIG.isGitHubPages) {
      console.log('📦 Используем mock данные (GitHub Pages mode)');
      const mock = mockIsotopes.find(iso => iso.id === id) || mockIsotopes[0];
      return { ...mock, id };
    }
    
    try {
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotopes/${id}/`);
      console.log(`🔄 Запрашиваем изотоп ${id} с API`);
      
      const response = await fetch(absoluteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const item = await response.json();
      console.log('✅ Данные изотопа получены');
      
      return {
        id: item.id || id,
        name: item.name || `Изотоп ${id}`,
        description: item.description || '',
        half_life: item.half_life || 0,
        atomic_mass: item.atomic_mass || 0,
        decay_type: item.decay_type || 'Неизвестно',
        application: item.application || '',
        image_url: processImageUrl(item.image_url),
        is_active: item.is_active !== false
      };
      
    } catch (error: any) {
      console.warn('⚠️ API недоступен, используем MOCK:', error.message);
      const mock = mockIsotopes.find(iso => iso.id === id) || mockIsotopes[0];
      return { ...mock, id };
    }
  },

  getMockIsotopes(): Isotope[] {
    return mockIsotopes;
  },

  async checkConnection(): Promise<{ connected: boolean; message: string; url: string }> {
    try {
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotopes/`);
      const response = await fetch(absoluteUrl, {
        method: 'HEAD',
        mode: 'cors'
      });
      
      return {
        connected: response.ok,
        message: response.ok ? '✅ Подключено к бэкенду' : '❌ Бэкенд не отвечает',
        url: absoluteUrl
      };
    } catch (error: any) {
      return {
        connected: false,
        message: `❌ Ошибка подключения: ${error.message}`,
        url: getAbsoluteUrl(`${API_BASE_URL}/api/isotopes/`)
      };
    }
  }
};

export const cartService = {
  async getCartCount(): Promise<number> {
    if (CONFIG.isGitHubPages) {
      console.log('⚠️ GitHub Pages: cartService отключен');
      return mockIsotopes.length;
    }
    
    try {
      console.log('=== cartService.getCartCount() ===');
      
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-orders/my_orders/`);
      const response = await fetch(absoluteUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Ответ API для счетчика:', data);
      
      const orders = Array.isArray(data) ? data : [];
      const draftOrder = orders.find((order: any) => order.status === 'DRAFT');
      const count = draftOrder?.isotope_items?.length || 0;
      
      console.log('📦 Количество в корзине:', count);
      return count;
      
    } catch (error: any) {
      console.warn('⚠️ Ошибка получения счетчика:', error.message);
      return 0;
    }
  },

  async addToCart(isotopeId: number): Promise<void> {
    if (CONFIG.isGitHubPages) {
      console.log('⚠️ GitHub Pages: addToCart отключен');
      alert('На GitHub Pages функция "Добавить в расчет" работает в демо-режиме. Для реального использования запустите приложение локально.');
      return;
    }
    
    try {
      console.log('=== cartService.addToCart() ===', isotopeId);
      
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-orders/my_orders/`);
      const ordersResponse = await fetch(absoluteUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!ordersResponse.ok) {
        throw new Error(`API error: ${ordersResponse.status}`);
      }
      
      const ordersData = await ordersResponse.json();
      console.log('📋 Получены заявки:', ordersData);
      
      const orders = Array.isArray(ordersData) ? ordersData : [];
      
      let draftOrder = orders.find((order: any) => order.status === 'DRAFT');
      let orderId: number;
      
      if (draftOrder && draftOrder.id) {
        orderId = draftOrder.id;
        console.log('📝 Найден черновик заявки:', orderId);
      } else {
        const createUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-orders/`);
        console.log('➕ Создаю новую заявку...');
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            status: 'DRAFT',
            time_elapsed: 0
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error(`Create error: ${createResponse.status}`);
        }
        
        const createData = await createResponse.json();
        orderId = createData.id;
        console.log('✅ Создана новая заявка:', orderId);
      }
      
      const addUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-order-items/`);
      console.log('🎯 Добавляю изотоп в заявку...', { orderId, isotopeId });
      
      const itemData = {
        isotope_order: orderId,
        isotope: isotopeId,
        initial_amount: 1.0,
      };
      
      const addResponse = await fetch(addUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!addResponse.ok) {
        throw new Error(`Add item error: ${addResponse.status}`);
      }
      
      const addData = await addResponse.json();
      console.log('✅ Изотоп успешно добавлен!', addData);
      
    } catch (error: any) {
      console.error('❌ Ошибка добавления:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(`Ошибка добавления изотопа: ${errorMessage}`);
    }
  },

  async getCartData(): Promise<any> {
    if (CONFIG.isGitHubPages) {
      console.log('⚠️ GitHub Pages: cartData отключен');
      return { demo: true, items: mockIsotopes.slice(0, 2) };
    }
    
    try {
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-orders/my_orders/`);
      const response = await fetch(absoluteUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('⚠️ Ошибка получения данных заявки:', error);
      return [];
    }
  },

  async getDraftOrder(): Promise<any> {
    if (CONFIG.isGitHubPages) {
      console.log('⚠️ GitHub Pages: getDraftOrder отключен');
      return { id: 999, status: 'DRAFT', demo: true };
    }
    
    try {
      console.log('=== cartService.getDraftOrder() ===');
      
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-orders/my_orders/`);
      const response = await fetch(absoluteUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📋 Ответ API:', data);
      
      const orders = Array.isArray(data) ? data : [];
      const draft = orders.find((order: any) => order.status === 'DRAFT');
      
      console.log('📝 Найден черновик:', draft);
      return draft || null;
      
    } catch (error: any) {
      console.warn('⚠️ Ошибка получения черновика:', error.message);
      return null;
    }
  },

  async clearCart(orderId: number): Promise<void> {
    if (CONFIG.isGitHubPages) {
      console.log('⚠️ GitHub Pages: clearCart отключен');
      return;
    }
    
    try {
      const absoluteUrl = getAbsoluteUrl(`${API_BASE_URL}/api/isotope-orders/${orderId}/`);
      const response = await fetch(absoluteUrl, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      console.log('🗑️ Корзина очищена');
    } catch (error) {
      console.error('❌ Ошибка очистки корзины:', error);
    }
  },

  isCartAvailable(): boolean {
    return !CONFIG.isGitHubPages;
  }
};

export const DEFAULT_ISOTOPE_IMAGE = YOUR_IMAGE_URL;

export interface Isotope {
  id: number;
  name: string;
  description: string;
  half_life: number;
  atomic_mass: number;
  decay_type: string;
  application: string;
  image_url: string | null;
  is_active: boolean;
}

export interface IsotopeFilters {
  name?: string;
}