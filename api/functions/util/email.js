const mailgun = require('mailgun-js')
const functions = require('firebase-functions')

const mg = mailgun({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain,
  testMode: false
})

exports.send = (template, data, subject, recipient, tags=[ 'standard_email' ]) => {
  /* Sends an email */
  const emaildata = ({
    from: `Synonym Robot <messages@${functions.config().mailgun.domain}>`,
    to: recipient,
    subject,
    template,
    'o:tag': tags,
    ...data
  })
  console.log(emaildata)
  mg.messages().send(emaildata)
    .catch((err) => {
      console.error(err)
    })
}

exports.batchSend = (template, data, subject, recipients, tags) => {
  /* Accepts an object of recipients and sends an email */

  // Map all emails to a recipient string
  const recipientEmails = Object.keys(recipients).join(', ')

  // Send email using standard function with recipient string and recipient data (mailgun will process it to send as a batch)
  exports.send(template, {
    'recipient-variables': JSON.stringify(recipients),
    ...data
  }, subject, recipientEmails, tags)
}

exports.addUserToList = (data, list) => {
  mg.lists(`${list}@${functions.config().mailgun.domain}`).members().create(data)
}

exports.removeUserFromList = (email, list) => {
  mg.lists(`${list}@${functions.config().mailgun.domain}`).members(email).delete()
}
