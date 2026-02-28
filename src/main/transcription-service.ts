import { polishText } from './openai-service';
import { getConfig } from './config-store';
import type { CursorContext } from '../shared/types';

export class TranscriptionService {
  /**
   * Polish-only: send raw text through the local OpenAI polish call.
   * Used by realtime transcription flow.
   */
  async polishOnly(
    rawText: string,
    context?: CursorContext | null,
  ): Promise<{ polishedText: string | null }> {
    const config = getConfig();
    if (!config.openaiApiKey) {
      console.warn('[Transcription] No API key configured, skipping polish');
      return { polishedText: null };
    }

    const result = await polishText(config.openaiApiKey, rawText, context);

    if (result.polishedText) {
      console.log(`[Transcription] Polish result (${result.model}): ${result.polishedText.length} chars`);
    } else if (result.debugReason) {
      console.warn(`[Transcription] Polish fallback reason: ${result.debugReason}`);
    }
    return { polishedText: result.polishedText };
  }
}
