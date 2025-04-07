// Типы для кеша
type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

type CacheOptions = {
  ttl?: number; // Time to live в миллисекундах
  tags?: string[]; // Теги для групповой инвалидации кеша
};

// Основной класс кеш-сервиса
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private keysByTag: Map<string, Set<string>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 минут по умолчанию

  private constructor() {}

  // Получение инстанса сервиса (паттерн Singleton)
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Установка дефолтного TTL
  public setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  // Получение данных из кеша
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Проверка на истечение срока действия
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Сохранение данных в кеш
  public set<T>(key: string, data: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTTL;
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    // Сохраняем данные
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });

    // Если есть теги, привязываем ключ к ним
    if (options?.tags && options.tags.length > 0) {
      options.tags.forEach((tag) => {
        if (!this.keysByTag.has(tag)) {
          this.keysByTag.set(tag, new Set());
        }
        this.keysByTag.get(tag)?.add(key);
      });
    }
  }

  // Удаление данных из кеша
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Инвалидация кеша по тегу
  public invalidateByTag(tag: string): void {
    const keys = this.keysByTag.get(tag);
    if (keys) {
      keys.forEach((key) => {
        this.delete(key);
      });
      this.keysByTag.delete(tag);
    }
  }

  // Очистка всего кеша
  public clear(): void {
    this.cache.clear();
    this.keysByTag.clear();
  }

  // Очистка истекших элементов кеша
  public cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.delete(key);
      }
    }
  }

  // Получение размера кеша
  public size(): number {
    return this.cache.size;
  }
}

// Создаем сервис-хелпер для работы с кешем
export const cacheService = CacheService.getInstance();

// Декоратор для кеширования результатов функций
export function withCache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyGenerator: (...args: Args) => string,
  options?: CacheOptions
) {
  return async (...args: Args): Promise<T> => {
    const key = keyGenerator(...args);
    const cachedData = cacheService.get<T>(key);

    if (cachedData !== null) {
      console.log(`[Cache] Hit for key: ${key}`);
      return cachedData;
    }

    console.log(`[Cache] Miss for key: ${key}`);
    const result = await fn(...args);
    cacheService.set(key, result, options);
    return result;
  };
}
