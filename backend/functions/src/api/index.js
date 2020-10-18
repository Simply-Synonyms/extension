const express = require('express')
const corsLib = require('cors')
const validateIdToken = require('../util/auth')

const getThesaurusData = require('./get-thesaurus-data')
const updateUserStats = require('./update-user-stats')

const api = express()
const cors = corsLib({
  origin: true,
  allowedHeaders: ['Authorization']
})

api.use(cors)

api.get('/get-thesaurus-data', getThesaurusData)
api.get('/update-user-stats', validateIdToken, updateUserStats)

module.exports = api
