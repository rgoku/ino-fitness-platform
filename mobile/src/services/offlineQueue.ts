/**
 * Offline queue service for handling API calls when offline
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from './apiService';

interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  timestamp: number;
  retries: number;
}

class OfflineQueueService {
  private queue: QueuedRequest[] = [];
  private isOnline: boolean = true;
  private maxRetries: number = 3;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize offline queue service
   */
  async initialize(): Promise<void> {
    // Load existing queue
    await this.loadQueue();

    // Monitor network status
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      
      if (this.isOnline) {
        this.syncQueue();
      }
    });

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncQueue();
      }
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Add request to queue
   */
  async queueRequest(
    method: QueuedRequest['method'],
    url: string,
    data?: any
  ): Promise<QueuedRequest> {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      url,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(request);
    await this.saveQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processRequest(request);
    }

    return request;
  }

  /**
   * Process a queued request
   */
  private async processRequest(request: QueuedRequest): Promise<void> {
    try {
      let response;

      switch (request.method) {
        case 'GET':
          response = await apiService.get(request.url);
          break;
        case 'POST':
          response = await apiService.post(request.url, request.data);
          break;
        case 'PUT':
          response = await apiService.put(request.url, request.data);
          break;
        case 'PATCH':
          response = await apiService.patch(request.url, request.data);
          break;
        case 'DELETE':
          response = await apiService.delete(request.url);
          break;
      }

      // Success - remove from queue
      await this.removeRequest(request.id);
    } catch (error: any) {
      // Handle error
      request.retries++;

      if (request.retries >= this.maxRetries) {
        // Max retries reached - remove from queue
        console.warn(`[OfflineQueue] Max retries reached for ${request.id}`);
        await this.removeRequest(request.id);
      } else {
        // Update queue with retry count
        await this.saveQueue();
      }
    }
  }

  /**
   * Sync all queued requests
   */
  async syncQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) return;

    const requests = [...this.queue]; // Copy array

    for (const request of requests) {
      await this.processRequest(request);
    }
  }

  /**
   * Remove request from queue
   */
  private async removeRequest(id: string): Promise<void> {
    this.queue = this.queue.filter(req => req.id !== id);
    await this.saveQueue();
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { count: number; isOnline: boolean } {
    return {
      count: this.queue.length,
      isOnline: this.isOnline,
    };
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem('offline_queue');
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const offlineQueue = new OfflineQueueService();

