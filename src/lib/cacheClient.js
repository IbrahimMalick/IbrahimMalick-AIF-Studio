import { base44 } from '@/api/base44Client';

class CacheClient {
  async set(key, value, ttlSeconds = 3600, tags = []) {
    try {
      const response = await base44.functions.invoke('cacheManager', {
        action: 'set',
        cache_key: key,
        value,
        entity_type: key.split(':')[0] || 'generic',
        ttl_seconds: ttlSeconds,
        tags
      });
      return response.data.success;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const response = await base44.functions.invoke('cacheManager', {
        action: 'get',
        cache_key: key
      });
      return response.data.cached_value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async invalidate(keyOrTags) {
    try {
      const payload = Array.isArray(keyOrTags)
        ? { action: 'invalidate', tags: keyOrTags }
        : { action: 'invalidate', cache_key: keyOrTags };

      const response = await base44.functions.invoke('cacheManager', payload);
      return response.data.success;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return false;
    }
  }

  async cleanup() {
    try {
      const response = await base44.functions.invoke('cacheManager', {
        action: 'cleanup'
      });
      return response.data.cleaned_entries;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  // Utility: Generate cache key
  static generateKey(entity, filters = {}) {
    const filterStr = JSON.stringify(filters);
    const hash = btoa(filterStr).substring(0, 16);
    return `${entity}:${hash}`;
  }
}

export const cacheClient = new CacheClient();