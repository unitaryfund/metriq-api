import nodemailer from 'nodemailer'
import SubmissionSqlService from '../service/submissionSqlService.js'
import UserService from '../service/userService.js'
import config from '../config.js'

(async () => {
  console.log('Notifying users of daily new submissions...')

  if (!config.supportEmail.service) {
    console.log('Skipping email - account info not set.')
    return
  }

  const submissionSqlService = new SubmissionSqlService()
  const submissions = (await submissionSqlService.getFromPastDay()).body

  if (!submissions.length) {
    console.log('No new submissions today! (Done.)')
    return
  }

  let emailBody = 'There are new submissions to Metriq, in the past 24 hours: \n'
  for (let i = 0; i < submissions.length; ++i) {
    emailBody += '\nhttps://metriq.info/Submission/' + submissions[i].id + ' - ' + submissions[i].name
  }
  emailBody += '\n\nThank you being a part of the Metriq.info quantum benchmark community! To unsubscribe from updates, log into your Metriq.info account and cancel at https://metriq.info/Profile.'
  console.log('Email content: ' + emailBody)

  const userService = new UserService()
  const users = await userService.getSubscribedToNewSubmissions()

  if (!users.length) {
    console.log('No subscribed users! (Done.)')
    return
  }

  for (let i = 0; i < users.length; ++i) {
    const user = users[i]
    console.log('Emailing ' + user.email + '...')

    const transporter = nodemailer.createTransport({
      service: config.supportEmail.service,
      auth: {
        user: config.supportEmail.account,
        pass: config.supportEmail.password
      }
    })

    const mailOptions = {
      from: config.supportEmail.address,
      to: user.email,
      subject: 'Metriq daily submissions',
      text: emailBody
    }

    const emailResult = await transporter.sendMail(mailOptions)
    if (!emailResult.accepted || (emailResult.accepted[0] !== user.email)) {
      console.log('Could not send email.')
      continue
    }

    console.log('Sent email.')
  }
})()
