const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul class='navigation'>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

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

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ************************
 * Build HTML for vehicle detail view
 ************************** */

Util.buildVehicleDetails = function (vehicle) {
  let view = "";

  if (vehicle.length > 0) {
    view = '<ul class="veh-display">';
    vehicle.forEach((vehicle) => {
      view += '<div class="vehicle-detail">';
      view += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">`;

      view += "</div>"; // close vehicle-detail

      view += '<div class="vehicle-detail-left">';
      view += '<div class="vehicle-pm">';
      view += `<h2><strong>No Haggle-Price<sup>1</sup>:&nbsp; &nbsp; ${new Intl.NumberFormat(
        "en-US"
      ).format(vehicle.inv_price)}</strong></h2>`;
      view += `<p><strong>Mileage</strong></p>`;
      view += '<div class="vehicle-mp">';

      view += `<p><strong>${new Intl.NumberFormat("en-US").format(
        vehicle.inv_miles
      )} miles</strong></p>`;
      view += `<p>ESTIMATE PAYMENTS</p>`;
      view += "</div>"; // close vehicle-mp
      view += "</div>"; // close vehicle-pm

      view += '<div class="vehicle-name">';

      view += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`;
      view += '<div class="vehicle-info">';
      view += `<p><strong>Year:</strong> ${vehicle.inv_year}</p>`;
      view += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;
      view += "</div>"; // close vehicle-info

      // Add a new section for buttons
      view += '<div class="vehicle-buttons">';

      view += '<button class="btn">START MY PURCHASE</button>';
      view += '<button class="btn">CONTACT US NOW</button>';
      view += '<button class="btn">SCHEDULE TEST DRIVE</button>';
      view += '<button class="btn">APPLY FOR FINANCING</button>';
      view += "</div>"; // close vehicle-buttons

      view += "</div>"; // close vehicle-name
    });
  }

  return view;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.checkAuthorization = (req, res, next) => {
  if (
    res.locals.loggedin &&
    (res.locals.accountData.account_type == "Admin" ||
      res.locals.accountData.account_type == "Employee")
  ) {
    next();
  } else {
    req.flash("notice", "Please, log in with an authorized account");
    return res.redirect("/account/login");
  }
};

/****************************
 * Build header Login/Logout
 ***************************/
Util.getTools = (req) => {
  if (req.cookies.jwt) {
    try {
      const cookieData = jwt.verify(
        req.cookies.jwt,
        process.env.ACCESS_TOKEN_SECRET
      );
      let html = `<a title="Click to access account management" href="/account/">Welcome ${cookieData.account_firstname}</a>
                  <a title="Click to log out" href="/account/logout">Log out</a>`;
      return html;
    } catch (error) {
      let html =
        '<a title="Click to log in" href="/account/login">Login</a>';
      return html;
    }
  } else {
    let html =
      '<a title="Click to log in" href="/account/login">Login</a>';
    return html;
  }
};

Util.buildReviewList = function (reviews) {
  let reviewList = "<ul class='review-list'>";
  if (reviews.length > 0) {
    reviews.forEach(review => {
      reviewList += "<li class='review-item'>";
      reviewList += `<p class='review-text'>${review.review_text}</p>`;
      reviewList += `<p class='review-author'>By: ${review.account_firstname} ${review.account_lastname}</p>`;
      reviewList += `<p class='review-date'>${new Date(review.review_date).toLocaleString()}</p>`;
      reviewList += "</li>";
    });
  } else {
    reviewList += "<li class='no-reviews'></li>";
  }
  reviewList += "</ul>";
  return reviewList;
};

Util.buildUserReviewList = function (reviews) {
  let reviewList = "<ul class='user-review-list'>";
  if (reviews.length > 0) {
    reviews.forEach(review => {
      reviewList += "<li class='user-review-item'>";
      reviewList += `<h3>${review.inv_make} ${review.inv_model}</h3>`;
      reviewList += `<p class='review-text'>${review.review_text}</p>`;
      reviewList += `<p class='review-date'>${new Date(review.review_date).toLocaleString()}</p>`;
      reviewList += '<div class="review-actions">';
      reviewList += `<a href='/reviews/edit/${review.review_id}'>Edit</a>`;
      reviewList += `<a href='/reviews/delete/${review.review_id}'>Delete</a>`;
      reviewList += '</div>';
      reviewList += "</li>";
    });
  } else {
    reviewList += "<li class='no-reviews'>You have not written any reviews yet.</li>";
  }
  reviewList += "</ul>";
  return reviewList;
};

module.exports = Util;
