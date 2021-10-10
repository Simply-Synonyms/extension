const archiver = require('archiver')
const fs = require('fs')
const path = require('path')

const destPath = path.resolve('dist.zip')

if (!fs.existsSync(path.resolve('build'))) throw 'Build not found'
if (fs.existsSync(destPath)) {
  console.log('Deleting old dist zip')
  fs.unlinkSync(destPath)
}

const output = fs.createWriteStream(destPath)
const archive = archiver('zip', {
  zlib: { level: 9 },
})
archive.pipe(output)

archive.directory('build/', false)
archive.finalize()

console.log(`Build zipped to ${destPath}`)
