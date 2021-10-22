/** Returns a promise that resolves in a certain number of milliseconds */
export const waitMs = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

/** Select a random element from an array */
export const selectRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// https://stackoverflow.com/a/12646864
/** Shuffle an array */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
