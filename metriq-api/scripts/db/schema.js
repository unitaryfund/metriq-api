import { exec } from 'child-process-promise'
import { parseURL } from 'whatwg-url'
import config from '../../config.js'
(async () => {
  const parts = parseURL(config.pgConnectionString)
  console.log('Schema import running')
  exec(`sudo -u postgres psql -U postgres -d ${parts.path[0]} -c "CREATE SCHEMA ${parts.path[0]}"`)
    .then(() =>
      exec(`sudo -u postgres psql -U postgres -d ${parts.path[0]} -c "ALTER SCHEMA ${parts.path[0]} OWNER TO ${parts.username};"`)
    )
    .then(() =>
      exec(`sudo -u postgres psql -U postgres -d ${parts.path[0]} < ./migrations/schema/schema.sql`)
    )
    .then(() => {
      console.log('*************************')
      console.log('Schema import successful')
      process.exit(0)
    })
    .catch((err) => {
      console.log('*************************')
      console.log('Schema import failed. Error:', err.message)
      process.exit(1)
    })
})()
