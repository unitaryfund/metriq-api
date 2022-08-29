import UserService from '../service/userService'

function getLastUpateTime (lastUpdate, refs) {
  for (let i = 0; i < refs.length; ++i) {
    const ref = refs[i]
    if (ref.updatedAt > lastUpdate) {
      lastUpdate = ref.updatedAt
    }
  }

  return lastUpdate
}

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

    let emailBody = 'Your metriq.info subscriptions have updates:'
    let sendEmail = false

    for (let j = 0; j < submissions.length; ++j) {
      let didAddHeader = false
      const subscription = submissions[j]
      const submission = subscription.getSubmission()
      let lastUpdate = submission.updatedAt

      const submissionTasks = submission.getSubmissionTaskRefs()
      lastUpdate = getLastUpateTime(submissionTasks, lastUpdate)

      const submissionMethods = submission.getSubmissionMethodRefs()
      lastUpdate = getLastUpateTime(submissionMethods, lastUpdate)

      const submissionPlatforms = submission.getSubmissionPlatformRefs()
      lastUpdate = getLastUpateTime(submissionPlatforms, lastUpdate)

      const submissionTags = submission.getSubmissionTagRefs()
      lastUpdate = getLastUpateTime(submissionTags, lastUpdate)

      if (lastUpdate > subscription.notifiedAt) {
        if (!didAddHeader) {
          didAddHeader = true`\n\nSubmissions:`
        }

        emailBody += '\nhttps://metriq.info/Submission/' + submission.id + ' - ' + submission.name

        sendEmail = true
      }
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
