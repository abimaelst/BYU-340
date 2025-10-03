// Import necessary modules
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const pool = require("../database/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory by vehicle id view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    const data = await invModel.getVehicleDetails(inv_id)
    const grid = await utilities.buildVehicleDetails(data)
    let nav = await utilities.getNav()
    const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
    res.render("./inventory/details", {
      title: className,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process add classification
 * *************************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { classification_name } = req.body
    const addClassificationResult = await invModel.addClassification(classification_name)

    if (addClassificationResult) {
      req.flash("notice", `The new car classification ${classification_name} was successfully added.`)
      res.status(201).render("./inventory/add-classification", {
        title: "Add New Vehicle Classification",
        nav,
        errors: null
      })
    } else {
      req.flash("notice", "Provide a correct classification name.")
      res.status(501).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process add new vehicle
 * *************************************** */
invCont.manageInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    const vehicleResult = await invModel.addNewVehicle(
      classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    )
    const classificationSelect = await utilities.buildClassificationList()

    if (vehicleResult) {
      req.flash("notice", "The new vehicle was successfully added.")
      res.status(201).render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classificationSelect
      })
    } else {
      req.flash("notice", "Sorry, the vehicle could not be added. Please try again.")
      res.status(501).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classificationSelect
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
      return res.json(invData)
    } else {
      next(new Error("No data returned"))
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId)
    let nav = await utilities.getNav()
    const data = await invModel.getVehicleDetails(inv_id)
    const itemData = data[0]
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
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
    } = req.body
    const updateResult = await invModel.updateInventory(
      inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
    )

    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId)
    let nav = await utilities.getNav()
    const data = await invModel.getVehicleDetails(inv_id)
    const itemData = data[0]
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.body.inv_id)
    const deleteResult = await invModel.deleteInventoryItem(inv_id)
    if (deleteResult) {
      req.flash("notice", "The item was successfully deleted.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      res.redirect("/inv/")
    }
  } catch (error) {
    next(error)
  }
}

// Define an asynchronous function to handle the review process
invCont.review = async function (req, res, next) {
  // Fetch the navigation data
  let nav = await utilities.getNav();

  // Destructure the request body to get the review details
  const { 
    review_id,
    review_text, 
    inv_id, 
    account_id
  } = req.body;

  // Add the review data to the inventory model
  const addResult = await invModel.addReviewData(
    review_id,
    review_text,
    inv_id,
    account_id
  );

  // Fetch the inventory data for the given item ID
  const invData = await invModel.getItemById(inv_id);

  // Build the item detail view
  const detailView = await utilities.buildItemGrid(invData[0]);

  // Add the new review to the detail view
  const addNewReview = await utilities.addNewReview(detailView, res);

  // Extract the year, make, and model of the item
  const itemYear = invData[0].inv_year;
  const itemMake = invData[0].inv_make;
  const itemModel = invData[0].inv_model;

  // Combine year, make, and model to form the item name
  const name = itemYear + itemMake + itemModel;

  // If the review was successfully added, flash a success message and render the detail view
  if (addResult) {
    req.flash(
      "notice",
      "New Review Added"
    );
    res.status(201).render("inventory/detail", {
      title: name,
      nav,
      detailView,
      inv_id,
      addNewReview,
      errors: null
    });
  } else {
    // If the review addition failed, flash an error message and render the edit inventory view
    req.flash("notice", "Sorry, the insert failed.");
    return res.status(501).render("inventory/edit-inventory");
  }
};

module.exports = invCont