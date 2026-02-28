/**
 * AudioWorkletProcessor that converts Float32 audio samples to PCM16.
 * Runs in the audio thread for zero-latency processing.
 *
 * Input: Float32 samples at 48kHz (browser default)
 * Output: Int16 PCM at 24kHz, posted every ~100ms
 */

// AudioWorklet global types (not available in standard TS lib)
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, processorCtor: new () => AudioWorkletProcessor): void;

class PcmWorkletProcessor extends AudioWorkletProcessor {
  private buffer: Int16Array;
  private writeIndex = 0;
  // 24000 samples/sec * 0.1s = 2400 samples per chunk
  private static readonly CHUNK_SIZE = 2400;

  constructor() {
    super();
    this.buffer = new Int16Array(PcmWorkletProcessor.CHUNK_SIZE);
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0]; // mono channel
    if (!input) return true;

    // Downsample 48k→24k by taking every other sample, convert to Int16
    for (let i = 0; i < input.length; i += 2) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      this.buffer[this.writeIndex++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

      if (this.writeIndex >= PcmWorkletProcessor.CHUNK_SIZE) {
        // Post a copy of the buffer
        this.port.postMessage(this.buffer.buffer.slice(0));
        this.writeIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-worklet-processor', PcmWorkletProcessor);
