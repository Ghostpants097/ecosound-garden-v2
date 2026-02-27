/**
 * Model Loader - Download and cache pre-trained models
 * Supports loading models from various sources
 * TensorFlow.js is loaded from CDN at runtime
 */

// Declare TensorFlow type
declare global {
  var tf: any;
}

interface ModelInfo {
  name: string;
  url: string;
  version: string;
  size: number;
  type: 'health' | 'acoustic';
}

// Available pre-trained models
export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    name: 'plant-health-model',
    url: 'file:///models/plant-health-model/model.json',
    version: '1.0.0',
    size: 2.5,
    type: 'health'
  },
  {
    name: 'acoustic-stress-model',
    url: 'file:///models/acoustic-stress-model/model.json',
    version: '1.0.0',
    size: 8.2,
    type: 'acoustic'
  }
];

interface CachedModel {
  model: any; // tf.LayersModel
  timestamp: number;
  size: number;
}

class ModelLoader {
  private cache: Map<string, CachedModel> = new Map();
  private cacheSize: number = 0;
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB max
  private loadingPromises: Map<string, Promise<tf.LayersModel>> = new Map();

  /**
   * Load model with intelligent caching
   */
  async loadModel(modelName: string): Promise<tf.LayersModel | null> {
    try {
      // Check cache first
      if (this.cache.has(modelName)) {
        const cached = this.cache.get(modelName)!;
        console.log(`[v0] Using cached model: ${modelName}`);
        return cached.model;
      }

      // Check if already loading
      if (this.loadingPromises.has(modelName)) {
        console.log(`[v0] Waiting for model load: ${modelName}`);
        return await this.loadingPromises.get(modelName)!;
      }

      // Start loading
      const loadPromise = this._loadModelInternal(modelName);
      this.loadingPromises.set(modelName, loadPromise);

      const model = await loadPromise;
      this.loadingPromises.delete(modelName);

      return model;
    } catch (error) {
      this.loadingPromises.delete(modelName);
      console.error(`[v0] Error loading model ${modelName}:`, error);
      return null;
    }
  }

  /**
   * Internal model loading logic
   */
  private async _loadModelInternal(modelName: string): Promise<tf.LayersModel> {
    const modelInfo = AVAILABLE_MODELS.find(m => m.name === modelName);

    if (!modelInfo) {
      throw new Error(`Model not found: ${modelName}`);
    }

    console.log(`[v0] Loading model: ${modelName} (${modelInfo.size}MB)`);

    // Load model
    const model = await tf.loadLayersModel(modelInfo.url);

    // Estimate size in memory
    const estimatedSize = modelInfo.size * 1024 * 1024;

    // Check cache size
    if (this.cacheSize + estimatedSize > this.maxCacheSize) {
      console.log('[v0] Cache limit reached, clearing old models');
      this._evictOldestModel();
    }

    // Cache the model
    this.cache.set(modelName, {
      model,
      timestamp: Date.now(),
      size: estimatedSize
    });

    this.cacheSize += estimatedSize;

    console.log(
      `[v0] Model loaded successfully. Cache size: ${(this.cacheSize / 1024 / 1024).toFixed(1)}MB`
    );

    return model;
  }

  /**
   * Evict oldest model from cache
   */
  private _evictOldestModel(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const cached = this.cache.get(oldestKey)!;
      cached.model.dispose();
      this.cache.delete(oldestKey);
      this.cacheSize -= cached.size;
      console.log(`[v0] Evicted model: ${oldestKey}`);
    }
  }

  /**
   * Preload multiple models
   */
  async preloadModels(modelNames: string[]): Promise<void> {
    const promises = modelNames.map(name => this.loadModel(name));
    await Promise.all(promises);
  }

  /**
   * Get cached model info
   */
  getCacheInfo(): {
    cached: string[];
    size: number;
    maxSize: number;
  } {
    return {
      cached: Array.from(this.cache.keys()),
      size: this.cacheSize,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Clear specific model from cache
   */
  clearModel(modelName: string): void {
    const cached = this.cache.get(modelName);
    if (cached) {
      cached.model.dispose();
      this.cache.delete(modelName);
      this.cacheSize -= cached.size;
      console.log(`[v0] Cleared model: ${modelName}`);
    }
  }

  /**
   * Clear all cached models
   */
  clearAll(): void {
    for (const cached of this.cache.values()) {
      cached.model.dispose();
    }
    this.cache.clear();
    this.cacheSize = 0;
    console.log('[v0] All models cleared');
  }

  /**
   * Download model from remote URL
   */
  async downloadModel(
    modelName: string,
    remoteUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    try {
      console.log(`[v0] Downloading model from: ${remoteUrl}`);

      const response = await fetch(remoteUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const total = parseInt(response.headers.get('content-length') || '0', 10);
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response has no body');

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress && total) {
          onProgress((loaded / total) * 100);
        }
      }

      // Store in IndexedDB or localStorage
      const blob = new Blob(chunks);
      await this._storeModel(modelName, blob);

      console.log(`[v0] Model downloaded: ${modelName}`);
      return true;
    } catch (error) {
      console.error(`[v0] Error downloading model:`, error);
      return false;
    }
  }

  /**
   * Store model in IndexedDB for offline access
   */
  private async _storeModel(modelName: string, blob: Blob): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('[v0] IndexedDB not available');
      return;
    }

    const db = indexedDB.open('ecosound-models', 1);
    db.onerror = () => console.error('[v0] IndexedDB open failed');
    db.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      const store = database
        .transaction('models', 'readwrite')
        .objectStore('models');
      store.put({ name: modelName, blob, timestamp: Date.now() });
    };
  }

  /**
   * Retrieve model from IndexedDB
   */
  async retrieveModel(modelName: string): Promise<Blob | null> {
    if (!('indexedDB' in window)) return null;

    return new Promise((resolve) => {
      const db = indexedDB.open('ecosound-models', 1);
      db.onsuccess = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        const store = database.transaction('models', 'readonly').objectStore('models');
        const request = store.get(modelName);

        request.onsuccess = () => {
          resolve(request.result?.blob || null);
        };
        request.onerror = () => resolve(null);
      };
      db.onerror = () => resolve(null);
    });
  }

  /**
   * Get list of available models with status
   */
  getModelsList(): Array<{
    name: string;
    type: string;
    cached: boolean;
    size: number;
  }> {
    return AVAILABLE_MODELS.map(model => ({
      name: model.name,
      type: model.type,
      cached: this.cache.has(model.name),
      size: model.size
    }));
  }
}

// Singleton instance
export const modelLoader = new ModelLoader();

/**
 * Initialize IndexedDB for model storage
 */
export function initializeModelStorage(): Promise<void> {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) {
      console.warn('[v0] IndexedDB not available');
      resolve();
      return;
    }

    const db = indexedDB.open('ecosound-models', 1);

    db.onerror = () => {
      console.error('[v0] IndexedDB initialization failed');
      resolve();
    };

    db.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('models')) {
        database.createObjectStore('models', { keyPath: 'name' });
        console.log('[v0] IndexedDB store created');
      }
    };

    db.onsuccess = () => {
      console.log('[v0] IndexedDB initialized');
      resolve();
    };
  });
}
