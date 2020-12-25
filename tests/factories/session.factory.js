const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip')
const cookieKey = require('../../config/keys').cookieKey
const keygrip = new Keygrip([cookieKey])

module.exports = (user) => {
  const passportSession = { passport: { user: user._id.toString() } }

  const session = Buffer.from(JSON.stringify(passportSession)).toString(
    'base64'
  )
  const session_sig = keygrip.sign(`session=${session}`)

  return { session, session_sig }
}
