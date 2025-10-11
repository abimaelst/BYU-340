const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

const reviewController = {};

/* ***************************
 *  Add a new review
 * ************************** */
reviewController.addReview = async function (req, res, next) {
  const { review_text, inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;

  const reviewResult = await reviewModel.addReview(
    review_text,
    inv_id,
    account_id
  );

  if (reviewResult) {
    req.flash("notice", "Your review has been posted.");
    res.redirect(`/inv/detail/${inv_id}`);
  } else {
    req.flash("notice", "Sorry, there was an error posting your review.");
    res.redirect(`/inv/detail/${inv_id}`);
  }
}

/* ***************************
 *  Build the list of reviews for a vehicle
 * ************************** */
reviewController.buildReviewList = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const reviews = await reviewModel.getReviewsByInventoryId(inv_id);
  let reviewList = utilities.buildReviewList(reviews);
  res.locals.reviewList = reviewList;
  next();
}

/* ***************************
 *  Build the view for a user to see all of their reviews
 * ************************** */
reviewController.buildUserReviews = async function (req, res, next) {
  const account_id = res.locals.accountData.account_id;
  const reviews = await reviewModel.getReviewsByAccountId(account_id);
  let nav = await utilities.getNav();
  const reviewList = utilities.buildUserReviewList(reviews);
  res.render("account/user-reviews", {
    title: "My Reviews",
    nav,
    errors: null,
    reviewList,
  });
}

/* ***************************
 *  Build the view for editing a review
 * ************************** */
reviewController.buildEditReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id);
  let nav = await utilities.getNav();
  const review = await reviewModel.getReviewById(review_id);
  res.render("inventory/edit-review", {
    title: "Edit Review",
    nav,
    errors: null,
    review_id: review.review_id,
    review_text: review.review_text,
  });
}

/* ***************************
 *  Update a review
 * ************************** */
reviewController.updateReview = async function (req, res, next) {
  const { review_id, review_text } = req.body;
  const updateResult = await reviewModel.updateReview(review_id, review_text);

  if (updateResult) {
    req.flash("notice", "The review has been updated.");
    res.redirect("/reviews/my-reviews");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.redirect(`/reviews/edit/${review_id}`);
  }
}

/* ***************************
 *  Build the confirmation view for deleting a review
 * ************************** */
reviewController.buildDeleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id);
  let nav = await utilities.getNav();
  const review = await reviewModel.getReviewById(review_id);
  res.render("inventory/delete-review", {
    title: "Delete Review",
    nav,
    errors: null,
    review_id: review.review_id,
    review_text: review.review_text,
  });
}

/* ***************************
 *  Delete a review
 * ************************** */
reviewController.deleteReview = async function (req, res, next) {
  const { review_id } = req.body;
  const deleteResult = await reviewModel.deleteReview(review_id);

  if (deleteResult) {
    req.flash("notice", "The review has been deleted.");
    res.redirect("/reviews/my-reviews");
  } else {
    req.flash("notice", "Sorry, the deletion failed.");
    res.redirect(`/reviews/delete/${review_id}`);
  }
}

module.exports = reviewController;
