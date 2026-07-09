export function getRandomBackgroundUrl(width = 1920, height = 1080): string {
  const seed = Math.random().toString(36).slice(2, 10)
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}
