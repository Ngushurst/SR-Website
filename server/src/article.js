const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));
const { dbquery } = require('./db');
const store = require('./file-store');
const fs = require('fs');

/**
 * Handles actions related to Articles and Article Categories.
 **/
class Article {
  /**
   * ==========================
   * ||                      ||
   * ||       Article        ||
   * ||       Handling       ||
   * ||                      ||
   * ==========================
   * Methods for handling changes to Articles.
   * */
  /**
   * Creates a new article 
   */
  async addArticle(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Removes the target article by id.
   */
  async deleteArticle(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Updates the target article by id.
   */
  async editArticle(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets the article information and contents. Returns a
   * a json object containing the contents both.
   */
  async getArticle(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets the history for the article with the specified id.
   * */
  async getArticleHistory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets a list of articles. Can be used with a filter.
   * Returns a list of facets in addition to the rows.
   * */
  async getArticles(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Changes the publishing status of an article.
   * */
  async publishArticle(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }


  /**
  * ==========================
  * ||                      ||
  * ||       Client         ||
  * ||       Article        ||
  * ||       Handling       ||
  * ||                      ||
  * ==========================
  * Methods for getting only published articles.
  * */
  /**
   * Creates a new article
   */
  /**
   * Gets the article information and contents. Returns a
   * a json object containing the contents both.
   * 
   * Does not require a login, and cannot retreive unpublished
   * articles as a result.
   */
  async getPublishedArticle(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Retrieves a list of published articles.
   * 
   * Does not require a login, and cannot retreive unpublished
   * articles as a result.
   */
  async getPublishedArticles(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /** 
   * ==========================
   * ||                      ||
   * ||       Category       ||
   * ||       Handling       ||
   * ||                      ||
   * ==========================
   * Methods for handling changes to Article Categories.
   * */

  async addCategory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  async deleteCategory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  async editCategory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  async getCategories(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  async getCategoryHistory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }
}

/**
 * ==========================
 * ||                      ||
 * ||       Helper         ||
 * ||       Functions      ||
 * ||                      ||
 * ==========================
 * Methods for handling smaller tasks performed in several of the class' methods.
 * */

/**
 * Adds new article tags to the database.
 * Returns an array of integers representing the id numbers for each tag.
 * The returned id will be -1 if the operation fails in any capacity.
 * @param {string[]} args
 */
async function addTags(tags) {
  return [];
}

/**
 * Contains checks to validate the parameters passed into the methods
 * of this file.
 * 
 * Returns an object.
 * @param {any} args
 */
async function validate(args) {
  return {};
}

module.exports = Article;