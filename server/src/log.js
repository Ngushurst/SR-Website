/**
 * As the name suggests, this file is used to maintain a log of requests and errors
 * that occur on the server. Log entries can generally be made using the following syntax:
 *   log.{trace/debug/info/warn/error/fatal}({json objects to record}, 'a note about the request');
 * 
 * ex:
 *   const log = require('./log');
 *   log.error({err: error}, 'server.js');
 *  
 *
 * The method used indicates the serverity of the log. The log file can be read using bunyan the
 * command line to find logs for only one level of logs.
 * */

const bunyan = require('bunyan'); // Node package used for writing logs. What a clever name.
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));

let log;
let log_path;
if (config.log.path) {
  log_path = config.log.path.startsWith('.') ? // If starting with '.', make relative path from the server base directory. Else, assume to be a literal path.
  path.join(process.cwd(), config.log.path) : path.join(config.log.path);
}

/**
 * Creates a bunyan logger and returns it.
 * See the official documentation for more information: https://www.npmjs.com/package/bunyan
 * */
function create_logger() {
  // Log basically opens up/generates the log file and streams to its contents. It won't break unless the file is removed somehow.
  // Only needs to be created once.
  if (!log) {
    let params = {
      name: 'SR', // Listed in all logs (required). Likely used to differentiate logs from different applications in the same file.
      level: config.log.level, // Minimum level recognized for logging. Ex: level of 'info' will ignore 'trace' logs.
      serializers: { // Handling for specific err and req objects. Unrecognized objects will be logged as is.
        err: bunyan.stdSerializers.err,
        req: reqSerializer,
      },
      stream: { // Opens up a stream to a file at the specified path, or creates a new file if it's not there.
        path: log_path,
      }
    };
    log = bunyan.createLogger(params); // Generate the logger
  }
  return log;
}

/**
 * Generates a bunyan serializer for handling 'req' objects.
 * Used by the logger to map 'req' objects to json.
 * 
 * Note: Never throw errors in serializers. Never mutate the the input object. Expect non-conforming objects.
 * @param {object} req An express request object.
 */
function reqSerializer(req) {
  if (!req) {
    return req;
  }
  return { // standard bunyan req serializer, but ignoring the request headers.
    method: req.method,
    url: req.url,
    //headers: req.headers
  }
}

module.exports = create_logger();