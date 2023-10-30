const nodemailer = require('nodemailer'); // Documentation -> https://nodemailer.com/
const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));
const log = require('./log');

let transport; // Node mailer object used to send emails. Reusable.

/**
 * Sends an email.
 * @param {string} recipients Email recipient(s). Expects a comma separated string if there are multiple recipients.
 * @param {string} subject Email subject
 * @param {object} body html body
 * 
 *  Returns an error message, or an empty string if there is none.
 */
function send(recipients, subject, body) {
  let error = '';
  const msg = {
    to: recipients,
    from: config.email.user,
    subject: subject,
    html: body // Could alternatively pass plain text into a 'text' property.
  };
  try {
    let mailer = get_transport();
    if (mailer) {
      mailer.sendMail(msg, function (err, info) {
        if (err) {
          log.error({ err: err }, 'email.send');
          error = 'Failed to send Email.';
        } else {
          //console.log(info);
        }
      });
    } else {
        error = 'Failed to get Email transport.';
    }
  } catch (err) {
      error = 'Exception occured while sending Email.';
  }
  return error;
}

/**
 * Creates the object needed to send an email using the parameters set in config.json.
 * */
function get_transport() {
  if (!transport) {
    let data = {
      host: config.email.host, // The email provider like gmail or outlook. (ex: stmp.gmail.com)
      port: config.email.port, // 465 seems to be the regular value.
      secure: config.email.secure // Boolean.
    };
    if (config.email.proxy) {
      data.proxy = config.email.proxy;
    } else {
      data.auth = config.email.auth;
    }
    try {
      transport = nodemailer.createTransport(data);
    } catch (error) {
      log.error({ err: error }, 'mail.get_transport');
    }
  }
  return transport;
}

module.exports = {
  send: send
}