const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav(req, res, next);
  const className = data[0]?.classification_name;
  const breadcrumbs = utilities.buildBreadcrumbs([{
    name: className,
    link: "/inv/type/" + classification_id
  }]);
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    breadcrumbs,
  });
};

/* ***************************
 *  Build inventory by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryByInventoryId(inv_id);
  const grid = await utilities.buildDetailGrid(data);
  let nav = await utilities.getNav(req, res, next);
  const vehicle = data[0];
  const breadcrumbs = utilities.buildBreadcrumbs([{
    name: vehicle.classification_name,
    link: "/inv/type/" + vehicle.classification_id
  }, {
    name: vehicle.inv_make + " " + vehicle.inv_model,
    link: "/inv/detail/" + inv_id
  }]);
  res.render("./inventory/detail", {
    title: vehicle.inv_make + " " + vehicle.inv_model,
    nav,
    grid,
    breadcrumbs,
  });
};

module.exports = invCont;
