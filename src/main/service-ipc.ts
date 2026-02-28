import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import { HistoryService } from './history-service';
import { DictionaryService } from './dictionary-service';
import * as fs from 'fs';

const historyService = new HistoryService();
const dictionaryService = new DictionaryService();

/** Remove any existing handler before registering — safe for hot-reload. */
function safeHandle(channel: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, handler);
}

export function registerServiceIPC(getMainWindow: () => BrowserWindow | null): void {
  // --- History ---
  safeHandle(IPC_CHANNELS.HISTORY_LIST, async (_event, req: { page: number; pageSize: number }) => {
    return historyService.list(req.page, req.pageSize);
  });

  safeHandle(IPC_CHANNELS.HISTORY_DELETE, async (_event, req: { id: string }) => {
    return historyService.delete(req.id);
  });

  safeHandle(IPC_CHANNELS.HISTORY_GET_DIR, async () => {
    return historyService.getHistoryDir();
  });

  safeHandle(IPC_CHANNELS.HISTORY_SET_DIR, async (_event, req: { dir: string }) => {
    try {
      if (!fs.existsSync(req.dir)) {
        fs.mkdirSync(req.dir, { recursive: true });
      }
      historyService.setHistoryDir(req.dir);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to set directory' };
    }
  });

  // --- Stats ---
  safeHandle(IPC_CHANNELS.STATS_GET, async () => {
    return historyService.getStats();
  });

  // --- Dictionary ---
  safeHandle(IPC_CHANNELS.DICTIONARY_LIST, async () => {
    return dictionaryService.list();
  });

  safeHandle(IPC_CHANNELS.DICTIONARY_ADD, async (_event, req: { word: string }) => {
    return dictionaryService.add(req.word);
  });

  safeHandle(IPC_CHANNELS.DICTIONARY_DELETE, async (_event, req: { id: string }) => {
    return { success: dictionaryService.delete(req.id) };
  });
}

export { historyService, dictionaryService };
