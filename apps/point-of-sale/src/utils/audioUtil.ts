function getSoundBasePath(): string {
  if (location.hostname === 'localhost') return '/sounds/';
  if (window.location.pathname.includes('/pos-develop/')) return '/pos-develop/sounds/';
  return '/pos/sounds/';
}

export function playSound(soundName: string, volume: number = 1.0): void {
  const soundUrl = `${getSoundBasePath()}${soundName}`;
  const audio = new Audio(soundUrl);
  audio.volume = volume;
  void audio.play().catch(() => {
    // Silently ignore audio playback errors (e.g., user interaction required)
  });
}
