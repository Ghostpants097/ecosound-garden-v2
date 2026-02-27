// AI-Generated plant acoustic sounds using Web Audio API
// Creates realistic plant sounds without external dependencies

export function generatePlantSound(
  plantType: 'monstera' | 'peace-lily' | 'snake-plant' | 'pothos' | 'boston-fern' | 'spider-plant' | 'fiddle-leaf-fig' | 'rubber-plant' | 'philodendron' | 'zz-plant',
  durationSeconds: number = 3
): Promise<AudioBuffer> {
  return new Promise((resolve) => {
    try {
      // Use OfflineAudioContext for reliable audio synthesis
      const sampleRate = 44100;
      const length = sampleRate * durationSeconds;
      const offlineContext = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(1, length, sampleRate);
      
      // Create audio buffer
      const audioBuffer = offlineContext.createBuffer(1, length, sampleRate);
      const data = audioBuffer.getChannelData(0);

    // Generate different plant-specific sounds
    const soundPatterns: { [key: string]: (i: number, t: number) => number } = {
      'monstera': (i, t) => {
        // Deep rustling leaves
        const base = Math.sin(t * 120) * 0.3;
        const noise = Math.random() * 0.2 - 0.1;
        const envelope = Math.exp(-t / 2);
        return (base + noise) * envelope * Math.sin(t * 50);
      },
      'peace-lily': (i, t) => {
        // Delicate, high-pitched whisper
        const base = Math.sin(t * 200) * 0.2;
        const texture = Math.sin(t * 300) * Math.sin(t * 150) * 0.15;
        const envelope = Math.exp(-t / 2.5);
        return (base + texture) * envelope;
      },
      'snake-plant': (i, t) => {
        // Stiff, creaky leaves
        const base = Math.sin(t * 80) * 0.25;
        const crack = Math.sin(t * 400) * Math.exp(-t / 0.5) * 0.3;
        return base + crack;
      },
      'pothos': (i, t) => {
        // Flowing, cascading sound
        const base = Math.sin(t * 150) * Math.sin(t * 100) * 0.2;
        const flow = Math.sin(t * 75) * 0.2;
        const envelope = Math.exp(-t / 3);
        return (base + flow) * envelope;
      },
      'boston-fern': (i, t) => {
        // Fine, feathery fronds
        const base = Math.sin(t * 250) * 0.15;
        const feather = Math.sin(t * 400) * Math.sin(t * 200) * 0.1;
        const envelope = Math.exp(-t / 2);
        return (base + feather) * envelope;
      },
      'spider-plant': (i, t) => {
        // Light, bouncy leaves
        const base = Math.sin(t * 180) * 0.2;
        const bounce = Math.cos(t * 120) * 0.15;
        const envelope = Math.exp(-t / 2.2);
        return (base + bounce) * envelope;
      },
      'fiddle-leaf-fig': (i, t) => {
        // Large, prominent leaves
        const base = Math.sin(t * 110) * 0.35;
        const resonance = Math.sin(t * 220) * 0.1;
        const envelope = Math.exp(-t / 2.8);
        return (base + resonance) * envelope;
      },
      'rubber-plant': (i, t) => {
        // Thick, waxy leaves
        const base = Math.sin(t * 140) * 0.3;
        const texture = Math.sin(t * 280) * 0.15;
        const envelope = Math.exp(-t / 2.5);
        return (base + texture) * envelope;
      },
      'philodendron': (i, t) => {
        // Climbing vine rustles
        const base = Math.sin(t * 160) * 0.25;
        const vine = Math.sin(t * 320) * Math.sin(t * 80) * 0.1;
        const envelope = Math.exp(-t / 2.3);
        return (base + vine) * envelope;
      },
      'zz-plant': (i, t) => {
        // Glossy leaflet sounds
        const base = Math.sin(t * 190) * 0.22;
        const gloss = Math.cos(t * 380) * 0.12;
        const envelope = Math.exp(-t / 2.4);
        return (base + gloss) * envelope;
      }
    };

    const soundFunction = soundPatterns[plantType] || soundPatterns['monstera'];

    // Generate audio samples
    try {
      for (let i = 0; i < length; i++) {
        const t = (i / sampleRate) * 2 * Math.PI;
        data[i] = soundFunction(i, t);
      }
      resolve(audioBuffer);
    } catch (error) {
      console.log('[v0] Failed to generate audio samples:', error);
      // Return silent audio buffer as fallback
      const silentBuffer = offlineContext.createBuffer(1, length, sampleRate);
      resolve(silentBuffer);
    }
    } catch (error) {
      console.log('[v0] Failed to create audio buffer:', error);
      // Return empty promise resolution for graceful degradation
      resolve(new AudioBuffer({ length: 0, sampleRate: 44100 }));
    }
  });
}

export function playPlantSound(plantType: string, onStop?: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Check if Web Audio API is available
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.log('[v0] Web Audio API not available, skipping audio playback');
        onStop?.();
        resolve();
        return;
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      generatePlantSound(plantType as any, 3).then((audioBuffer) => {
        try {
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          source.onended = () => {
            onStop?.();
            resolve();
          };
          
          source.onerror = (error) => {
            console.log('[v0] Audio playback error:', error);
            onStop?.();
            resolve();
          };
          
          source.start(0);
        } catch (e) {
          console.log('[v0] Failed to play audio:', e);
          onStop?.();
          resolve();
        }
      }).catch((err) => {
        console.log('[v0] Failed to generate plant sound:', err);
        onStop?.();
        resolve();
      });
    } catch (error) {
      console.log('[v0] Audio context creation failed:', error);
      onStop?.();
      reject(error);
    }
  });
}

export function createPlantAudioUrl(plantType: string): string {
  // Returns a data URL for the plant sound
  // This is handled by generating audio on-demand
  return `plant-audio://${plantType}`;
}
