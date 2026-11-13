import {
  BASE_FILTER_HZ,
  computeDroneFilterCutoff,
  computeDroneGain,
} from './soundParams';

interface DroneNodes {
  oscA: OscillatorNode;
  oscB: OscillatorNode;
  oscSub: OscillatorNode;
  filter: BiquadFilterNode;
  masterGain: GainNode;
}

/**
 * Pure Web Audio API ambient resonance synthesizer (muted by default).
 * Produces an ultra-soft warm sub-harmonic drone (gain <= 0.04) and a
 * crystalline release chime without external audio assets.
 */
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private drone: DroneNodes | null = null;
  private enabled = false;
  private cleanupTimer: number | null = null;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async toggle(): Promise<boolean> {
    if (this.enabled) {
      this.mute();
      return false;
    }
    await this.unmute();
    return this.enabled;
  }

  public async unmute(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.cleanupTimer !== null) {
      window.clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.drone) {
      this.startDrone(this.ctx);
    }
    this.enabled = true;
  }

  private startDrone(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(computeDroneGain(0), now + 0.85);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(BASE_FILTER_HZ, now);
    filter.Q.setValueAtTime(0.75, now);

    // Warm sub-harmonic chord: A1 (55Hz), A2 (110Hz), E3 (164.81Hz)
    const oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(55.0, now);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(110.0, now);
    oscA.detune.setValueAtTime(-4, now);

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.setValueAtTime(164.81, now);
    oscB.detune.setValueAtTime(4, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.45, now);
    const aGain = ctx.createGain();
    aGain.gain.setValueAtTime(0.35, now);
    const bGain = ctx.createGain();
    bGain.gain.setValueAtTime(0.18, now);

    oscSub.connect(subGain);
    oscA.connect(aGain);
    oscB.connect(bGain);

    subGain.connect(filter);
    aGain.connect(filter);
    bGain.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    oscSub.start(now);
    oscA.start(now);
    oscB.start(now);

    this.drone = { oscA, oscB, oscSub, filter, masterGain };
  }

  public setExciteLevel(level: number): void {
    if (!this.enabled || !this.ctx || !this.drone) return;
    const now = this.ctx.currentTime;
    this.drone.filter.frequency.setTargetAtTime(
      computeDroneFilterCutoff(level),
      now,
      0.06,
    );
    this.drone.masterGain.gain.setTargetAtTime(
      computeDroneGain(level),
      now,
      0.08,
    );
  }

  public playReleaseChime(): void {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const partials = [
      { freq: 659.25, peak: 0.016, decay: 1.5 }, // E5
      { freq: 987.77, peak: 0.011, decay: 1.7 }, // B5
      { freq: 1318.51, peak: 0.007, decay: 1.9 }, // E6
    ];

    partials.forEach(({ freq, peak, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.05);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  public mute(): void {
    this.enabled = false;
    if (!this.ctx || !this.drone) return;

    const ctx = this.ctx;
    const drone = this.drone;
    this.drone = null;

    const now = ctx.currentTime;
    drone.masterGain.gain.cancelScheduledValues(now);
    drone.masterGain.gain.setValueAtTime(drone.masterGain.gain.value, now);
    drone.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.22);

    this.cleanupTimer = window.setTimeout(() => {
      try {
        drone.oscA.stop();
        drone.oscB.stop();
        drone.oscSub.stop();
        drone.oscA.disconnect();
        drone.oscB.disconnect();
        drone.oscSub.disconnect();
        drone.filter.disconnect();
        drone.masterGain.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
      if (this.ctx && this.ctx.state === 'running') {
        void this.ctx.suspend();
      }
      this.cleanupTimer = null;
    }, 250);
  }

  public dispose(): void {
    this.enabled = false;
    if (this.cleanupTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.drone) {
      try {
        this.drone.oscA.stop();
        this.drone.oscB.stop();
        this.drone.oscSub.stop();
        this.drone.oscA.disconnect();
        this.drone.oscB.disconnect();
        this.drone.oscSub.disconnect();
        this.drone.filter.disconnect();
        this.drone.masterGain.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
      this.drone = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close();
    }
    this.ctx = null;
  }
}

export const soundEngine = new AmbientSoundEngine();
