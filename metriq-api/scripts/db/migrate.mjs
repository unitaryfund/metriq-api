import path from 'path'
import { spawn } from 'child-process-promise'
import { parseURL } from 'whatwg-url'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '../../config.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const spawnOptions = { cwd: path.join(__dirname, '../..'), stdio: 'inherit' };
(async () => {
  const parts = parseURL(config.pgConnectionString)
  const url = `${parts.scheme}://${parts.username}:${parts.password}@${parts.host}:${parts.port || 5432}/${parts.path[0]}`
  try {
    await spawn('./node_modules/.bin/sequelize', ['db:migrate', `--url=${url}`], spawnOptions)
    console.log('*************************')
    console.log('Migration successful')
  } catch (err) {
    console.log('*************************')
    console.log('Migration failed. Error:', err.message)
  } process.exit(0)
})()
