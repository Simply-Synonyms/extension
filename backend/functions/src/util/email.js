const mailgun = require('mailgun-js')
const functions = require('firebase-functions')

const mg = mailgun({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain,
  testMode: false
})

exports.send = (template, data, subject, recipient, tags=[ 'standard_email' ], otherFields={}) => {
  /* Sends an email; accepts a single recipient or object of recipients + recipient vars for batch mailing
  * template: the Mailgun template to use
  * data: the data to pass to the template
  * subject: email subject line
  * recipient: string of a single email or object with emails as keys and recipient data as properties
  * tags: optional tags to add to the email for unsubscribe and analytics
  * otherFields: any other fields to add to the email object
  */

  let recipientEmails = recipient
  let recipientVars = {}
  if (typeof recipient === 'object') {
    // Map all emails to a recipient string and stringify recipient vars
    recipientEmails = Object.keys(recipient).join(', ')
    recipientVars = recipient
  }

  recipientVars = JSON.stringify(recipientVars)

  const emaildata = ({
    from: `Synonym Robot <messages@${functions.config().mailgun.domain}>`,
    to: recipientEmails,
    subject,
    template,
    'o:tag': tags,
    'h:X-Mailgun-Variables': JSON.stringify(data),
    'recipient-variables': recipientVars,
    ...otherFields
  })
  // console.log(emaildata)
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

exports.errorAlert = (error, errordetails) => {
  errordetails = errordetails.toString()
  exports.send('error-alert', { error, errordetails }, 'PRODUCTION ERROR - Synonyms', 'error@synonyms.bweb.app', [ 'error-alert'])
}
