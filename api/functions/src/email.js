const mailgun = require('mailgun-js')
const functions = require('firebase-functions')

const mg = mailgun({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain,
  testMode: false
})

exports.send = (email, recipient) => {
  const data = ({
    from: `Simply Synonyms Robot <synonyms@${functions.config().mailgun.domain}>`,
    to: recipient,
    ...email
  })
  mg.messages().send(data)
    .catch((err) => {
      console.error(err)
    })
}

exports.addUserToList = (data, list) => {
  mg.lists(list + `@${functions.config().mailgun.domain}`).members().create(data)
}