const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* **************************************
 * Get all the information of the car requested
 * ************************************ */

async function getVehicleDetails(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
          WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getinventorybyid error " + error);
  }
}

/* ***************************
 * Function to get inventory item by ID
 * ************************** */
async function getInventoryItemById(invId) {
  try {
    const query = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(query, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    throw error;
  }
}

/* Add Classification function*/
async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* check if classification already exists in the database */

async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const clasification = await pool.query(sql, [classification_name])
    return clasification.rowCount
  } catch (error) {
    return error.message
  }

}

/* Add new Vehicle function*/

async function addNewVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color){
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


/* ***************************
 *  delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql =
      "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [
      inv_id
    ])
    if (!data.rows[0]){
      return true
    }
  } catch (error) {
    console.error("model error: " + error)
  }
}

  /* ******************************
  * Add New Review Information
  ***************************** */
// Define an asynchronous function to add review data to the database
async function addReviewData (
  review_id, 
  review_text,
  inv_id,
  account_id
) {
  try {
    // Define the SQL query to insert a new review into the database
    const sql = `INSERT INTO public.review
    (review_id, review_text, inv_id, account_id) 
    VALUES ($1, $2, $3, $4) RETURNING *`;

    // Execute the SQL query using the provided parameters
    const data = await pool.query(sql, [
      review_id,
      review_text,
      inv_id,
      account_id
    ]);

    // Return the inserted rows
    return data.rows;
  } catch (error) {
    // If an error occurs, return the error message
    return error.message;
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleDetails, addClassification, checkExistingClassification, addNewVehicle, updateInventory, deleteInventoryItem, addReviewData};