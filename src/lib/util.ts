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
