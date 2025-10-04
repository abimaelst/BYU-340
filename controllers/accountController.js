const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Registration view Delivery
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver management view
 * *************************************** */
async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(res.locals.accountData.account_id);
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      user: {
        name: accountData.account_firstname,
        userType: accountData.account_type,
        userId: accountData.account_id,
      }
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver Update Account view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id);
    const accountData = await accountModel.getAccountById(account_id);
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
    return;
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
      return;
    }
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }

      res.locals.accountData = accountData;
      res.locals.loggedin = 1;

      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function accountLogout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
}

/* ****************************************
 *  Process Update Account
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  const regResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (regResult) {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash("notice", `Congratulations, your information has been updated.`);
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      user: {
        name: accountData.account_firstname,
        userType: accountData.account_type,
        userId: accountData.account_id,
      }
    });
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }
}

/* ****************************************
 *  Process Update Password
 * *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the password updating."
    );
    res.status(500).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
    });
    return;
  }

  const regResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  );

  if (regResult) {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash("notice", `Congratulations, your password has been updated.`);
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      user: {
        name: accountData.account_firstname,
        userType: accountData.account_type,
        userId: accountData.account_id,
      }
    });
  } else {
    req.flash("notice", "Sorry, the password update failed.");
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  accountLogout,
  buildAccountManagement,
  updateAccount,
  updatePassword,
};