import UserService from '../service/userService'

(async () => {
  console.log('Checking for user subscription notifications...')

  const userService = new UserService()
  const allUsers = await userService.getAll()
  for (let i = 0; i < allUsers.length; ++i) {
    const user = allUsers[i]
    console.log('Checking for subscriptions for ' + user.email + '...')

    const submissions = await user.getSubmissionSubscriptions()
    const tasks = await user.getTaskSubscriptions()
    const methods = await user.getMethodSubscriptions()
    const platforms = await user.getPlatformSubscriptions()
    const tags = await user.getTagSubscriptions()

    const emailBody = 'Your metriq.info subscriptions have updates:'
    let sendEmail = false

    if (submissions.length) {
      sendEmail = true
    }

    if (tasks.length) {
      sendEmail = true
    }

    if (methods.length) {
      sendEmail = true
    }

    if (platforms.length) {
      sendEmail = true
    }

    if (tags.length) {
      sendEmail = true
    }

    if (!sendEmail) {
      console.log('No subscription updates for ' + user.email)
    }
  }

  console.log('Done notifying subscribers.')
})()
