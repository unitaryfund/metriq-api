import nodemailer from 'nodemailer'
import UserService from '../service/userService'
import config from '../config'

(async () => {
  console.log('Approving all new submissions...')

  const userService = new UserService()
  const allUsers = await userService.getAll()
  for (let i = 0; i < allUsers.length; ++i) {
    const user = allUsers[i]
    console.log('Checking for submissions from ' + user.email + '...')

    let emailBody = 'Metriq administrators have reviewed and approved one or more submissions from you: \n\n'
    let sendEmail = false
    const submissions = await user.getSubmissions()
    for (let j = 0; j < submissions.length; ++j) {
      if (!submissions[j].approvedAt && !submissions[j].deletedAt && !!submissions[j].publishedAt) {
        sendEmail = true
        emailBody += '\nhttps://metriq.info/Submission/' + submissions[j].id + ' - ' + submissions[j].name
        submissions[j].approvedAt = new Date()
        await submissions[j].save()
      }
    }

    if (!sendEmail) {
      console.log('No subscription updates for ' + user.email)
      continue
    }

    emailBody += '\n\nThank you for your submission!'
    console.log(user.email + ': ' + emailBody)

    if (!config.supportEmail.service) {
      console.log('Skipping email - account info not set.')
      continue
    }

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
      subject: 'Your Metriq submission has been approved!',
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
