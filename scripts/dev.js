const { spawn } = require('node:child_process')

function startScript(script) {
  if (process.platform === 'win32') {
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `npm run ${script}`], { stdio: 'inherit' })
  }
  return spawn('npm', ['run', script], { stdio: 'inherit' })
}

const children = [startScript('dev:frontend'), startScript('dev:backend')]

let stopping = false

function stopChildren(exitCode = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
  process.exitCode = exitCode
}

for (const child of children) {
  child.on('error', (error) => {
    console.error('Could not start a development server:', error.message)
    stopChildren(1)
  })
  child.on('exit', (code) => {
    if (!stopping) stopChildren(code || 0)
  })
}

process.on('SIGINT', () => stopChildren(0))
process.on('SIGTERM', () => stopChildren(0))
