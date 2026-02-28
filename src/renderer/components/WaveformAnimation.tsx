import React, { useEffect, useRef } from 'react';

interface WaveformAnimationProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const BAR_COUNT = 11;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_MAX_HEIGHT = 20;

const BASE_HEIGHTS = [3, 5, 8, 12, 16, 20, 16, 12, 8, 5, 3];
const SILENCE_HEIGHT = 2;

export const WaveformAnimation: React.FC<WaveformAnimationProps> = ({ analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalWidth = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
    canvas.width = totalWidth;
    canvas.height = BAR_MAX_HEIGHT;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dataArray = new Uint8Array(analyser?.frequencyBinCount || BAR_COUNT);
      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
      }

      const center = Math.floor(BAR_COUNT / 2);

      for (let i = 0; i < BAR_COUNT; i++) {
        let height: number;
        const dist = Math.abs(i - center);

        if (analyser && isActive) {
          const binOffset = 3;
          const dataIndex = binOffset + Math.floor((dist / (center + 1)) * (dataArray.length * 0.5 - binOffset));
          const raw = dataArray[dataIndex] / 255;
          const value = raw < 0.04 ? 0 : raw;
          height = SILENCE_HEIGHT + value * (BASE_HEIGHTS[i] - SILENCE_HEIGHT);
        } else {
          height = SILENCE_HEIGHT;
        }

        const x = i * (BAR_WIDTH + BAR_GAP);
        const y = (BAR_MAX_HEIGHT - height) / 2;

        ctx.fillStyle = '#d97757';
        ctx.beginPath();
        ctx.roundRect(x, y, BAR_WIDTH, height, 1.5);
        ctx.fill();
      }

      if (isActive) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isActive]);

  const totalWidth = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

  return (
    <canvas
      ref={canvasRef}
      width={totalWidth}
      height={BAR_MAX_HEIGHT}
      style={{ width: totalWidth, height: BAR_MAX_HEIGHT }}
    />
  );
};
