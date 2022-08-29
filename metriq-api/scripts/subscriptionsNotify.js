import UserService from '../service/userService'

function getLastUpateTime (refs, lastUpdate) {
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

      for (let k = 0; k < submissionTasks.length; ++k) {
        const submissionTaskResults = submissionTasks[k].getResults()
        lastUpdate = getLastUpateTime(submissionTaskResults, lastUpdate)
      }

      for (let k = 0; k < submissionMethods.length; ++k) {
        const submissionMethodResults = submissionMethods[k].getResults()
        lastUpdate = getLastUpateTime(submissionMethodResults, lastUpdate)
      }

      for (let k = 0; k < submissionPlatforms.length; ++k) {
        const submissionPlatformResults = submissionPlatforms[k].getResults()
        lastUpdate = getLastUpateTime(submissionPlatformResults, lastUpdate)
      }

      if (lastUpdate > subscription.notifiedAt) {
        if (!didAddHeader) {
          didAddHeader = true`\n\nSubmissions:`
        }

        emailBody += '\nhttps://metriq.info/Submission/' + submission.id + ' - ' + submission.name

        sendEmail = true
      }
    }

    for (let j = 0; j < tasks.length; ++j) {
      let didAddHeader = false
      const subscription = tasks[j]
      const task = subscription.getTask()
      let lastUpdate = task.updatedAt

      const taskSubmissionRefs = task.getSubmissionTaskRefs()
      for (let k = 0; k < taskSubmissionRefs.length; ++k) {
        const taskSubmissionResults = taskSubmissionRefs[k].getResults()
        lastUpdate = getLastUpateTime(taskSubmissionResults, lastUpdate)
      }

      if (lastUpdate > subscription.notifiedAt) {
        if (!didAddHeader) {
          didAddHeader = true`\n\nTasks:`
        }

        emailBody += '\nhttps://metriq.info/Task/' + task.id + ' - ' + task.name

        sendEmail = true
      }
    }

    for (let j = 0; j < methods.length; ++j) {
      let didAddHeader = false
      const subscription = methods[j]
      const method = subscription.getMethod()
      let lastUpdate = method.updatedAt

      const methodSubmissionRefs = method.getSubmissionMethodRefs()
      for (let k = 0; k < methodSubmissionRefs.length; ++k) {
        const methodSubmissionResults = methodSubmissionRefs[k].getResults()
        lastUpdate = getLastUpateTime(methodSubmissionResults, lastUpdate)
      }

      if (lastUpdate > subscription.notifiedAt) {
        if (!didAddHeader) {
          didAddHeader = true`\n\nMethods:`
        }

        emailBody += '\nhttps://metriq.info/Method/' + method.id + ' - ' + method.name

        sendEmail = true
      }
    }

    for (let j = 0; j < platforms.length; ++j) {
      let didAddHeader = false
      const subscription = platforms[j]
      const platform = subscription.getPlatform()
      let lastUpdate = platform.updatedAt

      const platformSubmissionRefs = platform.getSubmissionPlatformRefs()
      for (let k = 0; k < platformSubmissionRefs.length; ++k) {
        const platformSubmissionResults = platformSubmissionRefs[k].getResults()
        lastUpdate = getLastUpateTime(platformSubmissionResults, lastUpdate)
      }

      if (lastUpdate > subscription.notifiedAt) {
        if (!didAddHeader) {
          didAddHeader = true`\n\nPlatforms:`
        }

        emailBody += '\nhttps://metriq.info/Platform/' + platform.id + ' - ' + platform.name

        sendEmail = true
      }
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
