import { Tray, Menu, nativeImage, app } from 'electron';
import type { NativeImage } from 'electron';
import path from 'node:path';

export class TrayManager {
  private tray: Tray | null = null;
  private onQuit: () => void;
  private onOpenMainWindow: () => void;

  constructor(onQuit: () => void, onOpenMainWindow: () => void) {
    this.onQuit = onQuit;
    this.onOpenMainWindow = onOpenMainWindow;
  }

  create(): void {
    this.tray = new Tray(this.createTrayIcon());
    this.tray.setToolTip('VoicePaste - Voice to Text');
    this.updateMenu('idle');
  }

  updateMenu(status: string): void {
    if (!this.tray) return;

    const statusText = status === 'recording' ? 'Recording...'
      : status === 'transcribing' ? 'Transcribing...'
      : 'Ready';

    const contextMenu = Menu.buildFromTemplate([
      { label: `VoicePaste - ${statusText}`, enabled: false },
      { type: 'separator' },
      { label: 'Press ` to start/stop recording', enabled: false },
      { type: 'separator' },
      { label: 'Open VoicePaste', click: () => this.onOpenMainWindow() },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => this.onQuit(),
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private createTrayIcon(): NativeImage {
    // nativeImage.createFromDataURL does NOT support SVG — use PNG files
    const assetsDir = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(app.getAppPath(), 'assets');
    const img = nativeImage.createFromPath(path.join(assetsDir, 'trayTemplate.png'));
    img.setTemplateImage(true);
    return img;
  }

  destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }
}
