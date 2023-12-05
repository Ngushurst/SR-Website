const { dbquery } = require('./db');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));

/**
 * Contains a handful of methods to access and manipulate files in the file store.
 **/
class FileStore {
  /**
   * Uploads a new file to the file store.
   * @param {any} handle
   */
  async add(handle) {
    return;
  }

  /**
   * Removes a file from the file store.
   * */
  async delete(handle) {
    return;
  }

  /**
   * Returns true if the file handle exists in the file store.
   * Returns false otherwise.
   * */
  async existsFile(handle) {
    return false;
  }

  /**
   * Gets the contents of a file in the store as a string.
   * */
  async getFileAsString(handle) {
    return '';
  }

  /**
   * Moves a file in the file store to a different file handle. Similar to cut and paste.
   * */
  async move(handle) {
    return;
  }
}


async function validate(args) {
  return {};
}

module.exports = FileStore;