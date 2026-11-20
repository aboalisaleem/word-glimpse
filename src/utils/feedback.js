// Built-in Web Audio API synthesizer + Mobile Haptics (Zero external audio files needed)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.2, delay = 0) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

export function triggerHaptic(pattern, enabled = true) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Ignore on devices/browsers that block vibration
  }
}

export function playEmojiSound(emoji, soundEnabled = true, hapticsEnabled = true) {
  if (soundEnabled) {
    switch (emoji) {
      case '🤔':
        // Curious rising "hmm?" tone
        playTone(320, 0.12, 'sine', 0.14, 0);
        playTone(430, 0.16, 'sine', 0.14, 0.08);
        break;

      case '😂':
        // Playful bubbly pop-pop-pop
        playTone(520, 0.07, 'triangle', 0.16, 0);
        playTone(680, 0.07, 'triangle', 0.16, 0.06);
        playTone(860, 0.09, 'triangle', 0.16, 0.12);
        break;

      case '💡':
        // Bright "idea!" chime
        playTone(880, 0.1, 'sine', 0.18, 0);
        playTone(1318.5, 0.25, 'sine', 0.18, 0.07);
        break;

      case '⏳':
        // Crisp clock tick-tock
        playTone(1000, 0.04, 'square', 0.07, 0);
        playTone(750, 0.05, 'square', 0.07, 0.11);
        break;

      default:
        playTone(600, 0.08, 'sine', 0.15, 0);
        break;
    }
  }

  triggerHaptic(20, hapticsEnabled);
}

export function playSound(type, soundEnabled = true, hapticsEnabled = true) {
  switch (type) {
    case 'buzz':
      if (soundEnabled) {
        playTone(440, 0.12, 'triangle', 0.25, 0);
        playTone(660, 0.18, 'triangle', 0.25, 0.08);
      }
      triggerHaptic([60, 30, 80], hapticsEnabled);
      break;

    case 'correct':
      if (soundEnabled) {
        playTone(587.33, 0.15, 'sine', 0.22, 0);
        playTone(880, 0.3, 'sine', 0.25, 0.12);
      }
      triggerHaptic([40, 40, 100], hapticsEnabled);
      break;

    case 'incorrect':
      if (soundEnabled) {
        playTone(220, 0.2, 'sawtooth', 0.12, 0);
        playTone(175, 0.28, 'sawtooth', 0.12, 0.15);
      }
      triggerHaptic([120], hapticsEnabled);
      break;

    case 'tick':
      if (soundEnabled) {
        playTone(900, 0.05, 'sine', 0.08, 0);
      }
      triggerHaptic(25, hapticsEnabled);
      break;

    case 'win':
      if (soundEnabled) {
        playTone(523.25, 0.15, 'triangle', 0.2, 0);
        playTone(659.25, 0.15, 'triangle', 0.2, 0.12);
        playTone(783.99, 0.15, 'triangle', 0.2, 0.24);
        playTone(1046.5, 0.4, 'triangle', 0.25, 0.36);
      }
      triggerHaptic([50, 50, 50, 50, 150], hapticsEnabled);
      break;

    default:
      break;
  }
}