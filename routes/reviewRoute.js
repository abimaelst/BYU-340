const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// Route to add a new review
router.post("/add",
  regValidate.reviewRules(),
  regValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview));

// Route to show the form for editing a review
router.get("/edit/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildEditReview));

// Route to update a review
router.post("/update",
  regValidate.reviewRules(),
  regValidate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview));

// Route to show the confirmation page for deleting a review
router.get("/delete/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildDeleteReview));

// Route to delete a review
router.post("/delete", utilities.handleErrors(reviewController.deleteReview));

// Route to get user reviews
router.get("/my-reviews", utilities.checkLogin, utilities.handleErrors(reviewController.buildUserReviews));

module.exports = router;
