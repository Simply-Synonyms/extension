const mailgun = require('mailgun-js')
const functions = require('firebase-functions')

const mg = mailgun({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain,
  testMode: false
})

exports.send = (template, data, subject, recipient) => {
  const emaildata = ({
    from: `Synonym Robot <synonyms@${functions.config().mailgun.domain}>`,
    to: recipient,
    subject,
    template,
    ...data
  })
  console.log(emaildata)
  mg.messages().send(emaildata)
    .catch((err) => {
      console.error(err)
    })
}

exports.addUserToList = (data, list) => {
  mg.lists(`${list}@${functions.config().mailgun.domain}`).members().create(data)
}

exports.removeUserFromList = (email, list) => {
  mg.lists(`${list}@${functions.config().mailgun.domain}`).members(email).delete()
}

exports.sendToList = (email, list) => {
  exports.send(email, `${list}@${functions.config().mailgun.domain}`)
}