import express from 'express'
import corsLib from 'cors'
import validateIdToken from '../util/auth'

import getThesaurusData from './get-thesaurus-data'
import getDictionaryData from './get-dictionary-data'
import updateUserStats from './update-user-stats'
import getAuthToken from './get-auth-token'

const api = express()
const cors = corsLib({
  origin: '*',
  allowedHeaders: ['Authorization'],
  maxAge: 7200
})

api.use(cors)

api.get('/get-thesaurus-data', getThesaurusData)
api.get('/get-dictionary-data', getDictionaryData)
api.get('/update-user-stats', validateIdToken(true), updateUserStats)
api.get('/get-auth-token', validateIdToken(true), getAuthToken)

module.exports = api
