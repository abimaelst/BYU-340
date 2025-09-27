const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul class='navigation'>";
  list += `<li><a href="/" title="Home page" ${req.originalUrl === '/' ? 'class="active"' : ''}>Home</a></li>`;
  let classification_id = req.params.classificationId;
  if (!classification_id) {
    const inv_id = req.params.invId;
    if (inv_id) {
      const invData = await invModel.getInventoryByInventoryId(inv_id);
      if (invData.length > 0) {
        classification_id = invData[0].classification_id;
      }
    }
  }
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles" ${
        row.classification_id == classification_id ? 'class="active"' : ""
      }>${row.classification_name}</a>`;
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the detail view HTML
 * ************************************ */
Util.buildDetailGrid = async function (data) {
  let grid;
  const vehicle = data[0];
  if (data.length > 0) {
    grid = '<div id="detail-display">';
    grid +=
      '<img src="' +
      vehicle.inv_image +
      '" alt="Image of ' +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      ' on CSE Motors" />';
    grid += '<div id="detail-data">';
    grid += "<h2>" + vehicle.inv_make + " " + vehicle.inv_model + " Details</h2>";
    grid +=
      '<p><strong>Price:</strong> $' +
      new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
      "</p>";
    grid += '<p><strong>Description:</strong> ' + vehicle.inv_description + "</p>";
    grid +=
      '<p><strong>Mileage:</strong> ' +
      new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
      "</p>";
    grid += "</div>";
    grid += "</div>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the breadcrumbs view HTML
 * ************************************ */
Util.buildBreadcrumbs = function (path) {
  let breadcrumbs = "<ul class='breadcrumbs'>";
  breadcrumbs += '<li><a href="/">Home</a></li>';
  for (let i = 0; i < path.length; i++) {
    breadcrumbs += "<li>&gt;</li>";
    if (i === path.length - 1) {
      breadcrumbs += "<li>" + path[i].name + "</li>";
    } else {
      breadcrumbs += '<li><a href="' + path[i].link + '">' + path[i].name + "</a></li>";
    }
  }
  breadcrumbs += "</ul>";
  return breadcrumbs;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
