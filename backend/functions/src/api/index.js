const express = require('express')
const corsLib = require('cors')
const validateIdToken = require('../util/auth')

const getThesaurusData = require('./get-thesaurus-data')

const api = express()
const cors = corsLib({
  origin: true,
  allowedHeaders: ['Authorization']
})

api.use(cors)
api.use(validateIdToken)

api.get('/get-thesaurus-data', getThesaurusData)

module.exports = api
