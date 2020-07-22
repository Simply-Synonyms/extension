let express = require('express')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
let cors = require('cors')

let synonymRouter = require('./routes/synonym')

let app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors()) // Allow all origins. This is necessary because every web page should be able to access the API for the extension to work.
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', synonymRouter)

module.exports = app
