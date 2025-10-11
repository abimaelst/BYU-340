const pool = require("../database/");

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = "INSERT INTO reviews (review_text, review_date, inv_id, account_id) VALUES ($1, NOW(), $2, $3) RETURNING *"
    const data = await pool.query(sql, [review_text, inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error " + error)
    return error
  }
}

/* ***************************
 *  Get all reviews for a specific inventory item
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_id, r.review_text, r.review_date, a.account_firstname, a.account_lastname 
       FROM reviews AS r 
       INNER JOIN account AS a ON r.account_id = a.account_id 
       WHERE r.inv_id = $1 
       ORDER BY r.review_date DESC`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getReviewsByInventoryId error " + error);
    return error;
  }
}

/* ***************************
 *  Get all reviews by a specific user
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_id, r.review_text, r.review_date, i.inv_make, i.inv_model 
       FROM reviews AS r 
       INNER JOIN inventory AS i ON r.inv_id = i.inv_id 
       WHERE r.account_id = $1 
       ORDER BY r.review_date DESC`,
      [account_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getReviewsByAccountId error " + error);
    return error;
  }
}

/* ***************************
 *  Get a single review by its ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM reviews WHERE review_id = $1",
      [review_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getReviewById error " + error);
    return error;
  }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = "UPDATE reviews SET review_text = $1, review_date = NOW() WHERE review_id = $2 RETURNING *"
    const data = await pool.query(sql, [review_text, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateReview error " + error)
    return error
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = 'DELETE FROM reviews WHERE review_id = $1'
    const data = await pool.query(sql, [review_id])
    return data
  } catch (error) {
    console.error("deleteReview error " + error)
    return error
  }
}

/* ***************************
 *  Check for existing review from a user for a specific inventory item
 * ************************** */
async function checkExistingReview(inv_id, account_id) {
  try {
    const sql = "SELECT * FROM reviews WHERE inv_id = $1 AND account_id = $2"
    const data = await pool.query(sql, [inv_id, account_id])
    return data.rows.length > 0
  } catch (error) {
    console.error("checkExistingReview error " + error)
    return error
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  getReviewById,
  updateReview,
  deleteReview,
  checkExistingReview,
};