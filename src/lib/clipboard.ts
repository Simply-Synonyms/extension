// // https://github.com/extend-chrome/clipboard/blob/master/src/index.ts
// // Can't use modern clipboard API in background
// export const clipboardWriteText = (text: string): Promise<string> =>
//   new Promise((resolve, reject) => {
//     // Create hidden input with text
//     const el = document.createElement('textarea')
//     el.value = text
//     document.body.append(el)

//     // Select the text and copy to clipboard
//     el.select()
//     const success = document.execCommand('copy')
//     el.remove()

//     if (!success) reject(new Error('Unable to write to clipboard'))

//     resolve(text)
// })

// export const clipboardPaste = (text: string): Promise<string> =>
// new Promise((resolve, reject) => {
//   // Create hidden input with text
//   const el = document.createElement('textarea')
//   el.value = text
//   document.body.append(el)

//   // Select the text and copy to clipboard
//   el.select()
//   const success = document.execCommand('copy')
//   el.remove()

//   if (!success) reject(new Error('Unable to write to clipboard'))

//   resolve(text)
// })
