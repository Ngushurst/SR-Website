/**
 * This file contains a number of very simple and general helper functions to help
 * reduce the amount of code duplication across server modules.
 **/


/**
 * Converts a string with comma separated id values into an array of integers.
 * @param {string} csv A comma separated string of integers: '1,2,3'
 * @returns {number[]}
 * */
function CSVtoIntArray(csv) {
  return csv.split(',').map((number) => { return parseInt(number) })
}

/**
 * A simple method to generate an error json object that gets used frequently in
 * server validation functions. Ex: { error: '', code: 400 }
 * Returns null if either parameter is falsy.
 * A few codes are: 400 (invalid params), 401 (unauthorized), 403 (Forbidden), 405 (method not allowed), 500 (internal server error)
 * A complete list of codes can be found here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * @param {string} message The message to return to a user.
 * @param {number} code The code the error should be returned as.
 */
function generateError(message, code) {
  if (!message || !code) { // invalid error if lacking either parameter.
    return null; 
  }
  return { error: message, code: code };
}

module.exports = { CSVtoIntArray, generateError };