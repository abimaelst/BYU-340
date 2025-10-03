// Needed Resources 
const express = require("express"); // Brings express into scope.
const router = express.Router(); // Using express we create a new router object.
const accountController = require("../controllers/accountController"); // Brings the accountController into scope.
const Util = require('../utilities/');
const regValidate = require('../utilities/account-validation');

/* ***************************
 *  Build Account
 * ************************** */

// Deliver Login View
router.get("/login", Util.handleErrors(accountController.buildLogin));

// Deliver Register View
router.get("/register", Util.handleErrors(accountController.buildRegister));

// Route to check Login and build Default Account View
router.get("/", Util.checkLogin, Util.handleErrors(accountController.buildManagement));

// Route to logout
router.get('/logout', Util.handleErrors(accountController.accountLogout));

// Deliver Account Management View
router.get("/update", Util.checkLogin, Util.handleErrors(accountController.buildAccountManagement));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  Util.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/",
  regValidate.LoginRules(),
  regValidate.checkLoginData,
  Util.handleErrors(accountController.accountLogin)
);

// Process the update account data
router.post(
  "/updateAccount",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  Util.handleErrors(accountController.updateAccount)
);

// Process the update password data
router.post(
  "/updatePassword",
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  Util.handleErrors(accountController.updatePassword)
);

module.exports = router; // exports the router object to be used elsewhere in the project.