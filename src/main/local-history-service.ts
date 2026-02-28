import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { TranscriptionStatsResult } from '../shared/types';

export interface LocalHistoryRecord {
  id: string;
  original_text: string;
  optimized_text: string | null;
  app_context: string | null;
  duration_seconds: number | null;
  word_count: number;
  created_at: string;
}

export class LocalHistoryService {
  private historyDir: string;

  constructor(customDir?: string) {
    this.historyDir = customDir || path.join(app.getPath('userData'), 'history');
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }

  setHistoryDir(dir: string): void {
    this.historyDir = dir;
    this.ensureDir();
  }

  getHistoryDir(): string {
    return this.historyDir;
  }

  /** Count words in text (handles CJK and Latin) */
  static countWords(text: string): number {
    if (!text) return 0;
    // CJK characters count as 1 word each
    const cjk = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g);
    const cjkCount = cjk ? cjk.length : 0;
    // Remove CJK chars, then count remaining words by whitespace
    const remaining = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ').trim();
    const latinCount = remaining ? remaining.split(/\s+/).filter(Boolean).length : 0;
    return cjkCount + latinCount;
  }

  save(record: Omit<LocalHistoryRecord, 'word_count'>): LocalHistoryRecord {
    this.ensureDir();
    const text = record.optimized_text || record.original_text;
    const wordCount = LocalHistoryService.countWords(text);
    const fullRecord: LocalHistoryRecord = { ...record, word_count: wordCount };
    const filePath = path.join(this.historyDir, `${record.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullRecord, null, 2), 'utf-8');
    return fullRecord;
  }

  list(page: number, pageSize: number): { data: LocalHistoryRecord[]; total: number } {
    this.ensureDir();
    const files = fs.readdirSync(this.historyDir)
      .filter(f => f.endsWith('.json'))
      .sort().reverse();

    const allRecords: LocalHistoryRecord[] = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.historyDir, file), 'utf-8');
        const record = JSON.parse(content);
        allRecords.push(record);
      } catch {
        // skip unreadable files
      }
    }

    allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const from = page * pageSize;
    const sliced = allRecords.slice(from, from + pageSize);
    return { data: sliced, total: allRecords.length };
  }

  delete(id: string): boolean {
    const filePath = path.join(this.historyDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  getById(id: string): LocalHistoryRecord | null {
    const filePath = path.join(this.historyDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /** Compute aggregate stats from all local history files */
  computeStats(): TranscriptionStatsResult {
    this.ensureDir();
    const files = fs.readdirSync(this.historyDir).filter(f => f.endsWith('.json'));

    let totalWords = 0;
    let totalCount = 0;
    let totalDurationSeconds = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.historyDir, file), 'utf-8');
        const record: LocalHistoryRecord = JSON.parse(content);
        totalWords += record.word_count || 0;
        totalCount += 1;
        totalDurationSeconds += record.duration_seconds || 0;
      } catch {
        // skip unreadable files
      }
    }

    return { totalWords, totalCount, totalDurationSeconds };
  }
}
