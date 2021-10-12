// Declare the `browserApi` module (which is aliased to `chrome` in webpack) using @types/chrome namespace typings.
declare module 'browserApi' {
  let c: typeof chrome
  export = c
}

declare module 'firebaseConfig' {
  let t: any
  export = t
}
