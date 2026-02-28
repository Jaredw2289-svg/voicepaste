import { randomUUID } from 'crypto';
import { LocalHistoryService } from './local-history-service';
import type { HistoryListResult, HistoryDeleteResult, TranscriptionStatsResult } from '../shared/types';

const localHistory = new LocalHistoryService();

export class HistoryService {
  getHistoryDir(): string {
    return localHistory.getHistoryDir();
  }

  setHistoryDir(dir: string): void {
    localHistory.setHistoryDir(dir);
  }

  async save(record: {
    original_text: string;
    optimized_text: string | null;
    app_context: string | null;
    duration_seconds: number | null;
  }): Promise<void> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    localHistory.save({
      id,
      original_text: record.original_text,
      optimized_text: record.optimized_text,
      app_context: record.app_context,
      duration_seconds: record.duration_seconds,
      created_at: createdAt,
    });
  }

  async list(page: number, pageSize: number): Promise<HistoryListResult> {
    const result = localHistory.list(page, pageSize);
    return {
      data: result.data.map(r => ({
        id: r.id,
        original_text: r.original_text,
        optimized_text: r.optimized_text,
        app_context: r.app_context,
        language: null,
        duration_seconds: r.duration_seconds,
        created_at: r.created_at,
      })),
      total: result.total,
    };
  }

  async delete(id: string): Promise<HistoryDeleteResult> {
    localHistory.delete(id);
    return { success: true };
  }

  async getStats(): Promise<TranscriptionStatsResult> {
    return localHistory.computeStats();
  }
}
