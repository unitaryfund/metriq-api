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

    let emailBody = 'Your metriq.info subscriptions have updates:'
    let sendEmail = false

    for (let j = 0; j < submissions.length; ++j) {
      let didAddHeader = false
      const subscription = submissions[j]
      const submission = await subscription.getSubmission()
      let lastUpdate = submission.updatedAt

      const submissionTasks = await submission.getSubmissionTaskRefs()
      lastUpdate = getLastUpateTime(submissionTasks, lastUpdate)

      const submissionMethods = await submission.getSubmissionMethodRefs()
      lastUpdate = getLastUpateTime(submissionMethods, lastUpdate)

      const submissionPlatforms = await submission.getSubmissionPlatformRefs()
      lastUpdate = getLastUpateTime(submissionPlatforms, lastUpdate)

      const submissionTags = await submission.getSubmissionTagRefs()
      lastUpdate = getLastUpateTime(submissionTags, lastUpdate)

      for (let k = 0; k < submissionTasks.length; ++k) {
        const submissionTaskResults = await submissionTasks[k].getResults()
        lastUpdate = getLastUpateTime(submissionTaskResults, lastUpdate)
      }

      for (let k = 0; k < submissionMethods.length; ++k) {
        const submissionMethodResults = await submissionMethods[k].getResults()
        lastUpdate = getLastUpateTime(submissionMethodResults, lastUpdate)
      }

      for (let k = 0; k < submissionPlatforms.length; ++k) {
        const submissionPlatformResults = await submissionPlatforms[k].getResults()
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
      const task = await subscription.getTask()
      let lastUpdate = task.updatedAt

      const taskSubmissionRefs = await task.getSubmissionTaskRefs()
      for (let k = 0; k < taskSubmissionRefs.length; ++k) {
        const taskSubmissionResults = await taskSubmissionRefs[k].getResults()
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
      const method = await subscription.getMethod()
      let lastUpdate = method.updatedAt

      const methodSubmissionRefs = await method.getSubmissionMethodRefs()
      for (let k = 0; k < methodSubmissionRefs.length; ++k) {
        const methodSubmissionResults = await methodSubmissionRefs[k].getResults()
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
      const platform = await subscription.getPlatform()
      let lastUpdate = platform.updatedAt

      const platformSubmissionRefs = await platform.getSubmissionPlatformRefs()
      for (let k = 0; k < platformSubmissionRefs.length; ++k) {
        const platformSubmissionResults = await platformSubmissionRefs[k].getResults()
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

    if (!sendEmail) {
      console.log('No subscription updates for ' + user.email)
    }
  }

  console.log('Done notifying subscribers.')
})()
