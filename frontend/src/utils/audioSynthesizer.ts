// Web Audio API Synthesizer for zero-latency, zero-asset workout rest timer sounds
import { audioCues } from './audioCues';

export type SoundPack = 'BOXING_BELL' | 'CYBER_BEEP' | 'ZEN_CHIME' | 'WHISTLE';

export function playTimerSound(
  pack: SoundPack = 'BOXING_BELL',
  volumePercent: number = 80
): void {
  try {
    const ctx = audioCues.getContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const gainVal = Math.max(0, Math.min(1, volumePercent / 100));
    masterGain.gain.setValueAtTime(gainVal, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (pack === 'BOXING_BELL') {
      // Metallic Boxing Bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (pack === 'CYBER_BEEP') {
      // 3 short digital beeps
      [0, 0.15, 0.3].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx === 2 ? 1200 : 880, ctx.currentTime + delay);

        gain.gain.setValueAtTime(gainVal * 0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.09);
      });
    } else if (pack === 'ZEN_CHIME') {
      // Soft Harmonic Chime
      const freqs = [528, 792, 1056];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gainVal * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      });
    } else if (pack === 'WHISTLE') {
      // Coach Whistle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(2800, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(2400, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(gainVal * 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.error('Failed to play synthesized timer sound', e);
  }
}
