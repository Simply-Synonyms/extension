/** Returns a promise that resolves in a certain number of milliseconds */
export const waitMs = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}
