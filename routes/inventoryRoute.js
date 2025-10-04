const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");

// Main management route
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildManagement)
);
router.get(
  "/management",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildManagement)
);

// Routes for classification and inventory details
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

// Routes to build classification and inventory views
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildAddClassification)
);
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildAddInventory)
);

// Fetch inventory JSON
router.get(
  "/getInventory/:classification_id",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.getInventoryJSON)
);

// Routes for editing and deleting inventory
router.get(
  "/edit/:invId",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.editInventoryView)
);
router.get(
  "/delete/:invId",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.deleteView)
);

// Process classification data
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAuthorization,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.manageClassification)
);

// Process inventory data
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAuthorization,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.manageInventory)
);

// Update inventory route
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAuthorization,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete inventory route
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.deleteItem)
);

//Route to process the new review
router.post("/postedReview/", utilities.handleErrors(invController.review));

module.exports = router;