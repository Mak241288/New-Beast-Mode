/**
 * BeastMode Web Audio API Sound Synthesizer & Tactical Haptics Engine
 * Zero-dependency, lightweight, high-fidelity procedural athletic sound effects
 * with synchronized mobile haptic feedback and background-audio-friendly envelopes.
 */

export type HapticPreset = 'tick' | 'setDone' | 'restEnd' | 'fanfare' | 'tap';

class AudioCueEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isHapticsEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedSound = localStorage.getItem('beast_sound_muted');
      this.isMuted = storedSound === 'true';

      const storedHaptics = localStorage.getItem('beast_haptics_disabled');
      this.isHapticsEnabled = storedHaptics !== 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('beast_sound_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleHaptics(): boolean {
    this.isHapticsEnabled = !this.isHapticsEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('beast_haptics_disabled', String(!this.isHapticsEnabled));
    }
    return this.isHapticsEnabled;
  }

  public getHapticsEnabled(): boolean {
    return this.isHapticsEnabled;
  }

  public getContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  /**
   * Tactical Haptic Vibration Dispatcher (Safe on all mobile and desktop browsers)
   */
  public triggerHaptic(pattern: number | number[] | HapticPreset = 'tap'): void {
    if (!this.isHapticsEnabled || typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      if (typeof pattern === 'string') {
        switch (pattern) {
          case 'tick':
            navigator.vibrate(35);
            break;
          case 'tap':
            navigator.vibrate(20);
            break;
          case 'setDone':
            navigator.vibrate([40, 30, 80]);
            break;
          case 'restEnd':
            navigator.vibrate([150, 75, 150, 75, 250]);
            break;
          case 'fanfare':
            navigator.vibrate([80, 40, 80, 40, 150, 60, 300]);
            break;
        }
      } else {
        navigator.vibrate(pattern);
      }
    } catch {
      // Non-fatal on unsupported or restricted environments
    }
  }

  /**
   * Universal beep using the shared Singleton AudioContext with smooth gain ramp
   */
  public playBeep(freq: number = 880, duration: number = 0.15, gainVal: number = 0.12) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Non-fatal
    }
  }

  /**
   * Short crisp countdown tick (3.. 2.. 1..) with synced haptic pulse
   */
  public playCountdownTick(pitch: number = 880) {
    this.triggerHaptic('tick');
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Non-fatal
    }
  }

  /**
   * Rest Period Ended Chime (Ascending dual harmonic chime) with haptic alert
   */
  public playRestFinishedChime() {
    this.triggerHaptic('restEnd');
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [587.33, 880.00, 1174.66]; // D5 -> A5 -> D6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch {
      // Non-fatal
    }
  }

  /**
   * Victory / PR / Workout Completed Fanfare
   */
  public playVictoryFanfare() {
    this.triggerHaptic('fanfare');
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major triumph

      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {
      // Non-fatal
    }
  }
}

export const audioCues = new AudioCueEngine();
