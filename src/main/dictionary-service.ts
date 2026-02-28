import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { DictionaryWord } from '../shared/types';

export class DictionaryService {
  private dir: string;

  constructor() {
    this.dir = path.join(app.getPath('userData'), 'dictionary');
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  list(): DictionaryWord[] {
    this.ensureDir();
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.json'));
    const words: DictionaryWord[] = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.dir, file), 'utf-8');
        words.push(JSON.parse(content));
      } catch {
        // skip corrupt files
      }
    }
    words.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return words;
  }

  add(word: string): DictionaryWord {
    this.ensureDir();
    const entry: DictionaryWord = {
      id: randomUUID(),
      word: word.trim(),
      created_at: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(this.dir, `${entry.id}.json`), JSON.stringify(entry, null, 2), 'utf-8');
    return entry;
  }

  delete(id: string): boolean {
    const filePath = path.join(this.dir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  getAllWords(): string[] {
    return this.list().map(w => w.word);
  }
}
