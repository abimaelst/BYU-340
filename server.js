/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/index")
// const errorRoute = require("./routes/errorRoute")
// const errorHandler = require("./routes/errorRoute")
const session = require("express-session")
const pool = require('./database/')
const accountRoute =("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//middleware to get user information
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Login Activity
app.use(cookieParser())

// login process activity
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"));
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", require("./routes/inventoryRoute"));
// Account routes
app.use("/account", require("./routes/accountRoute"))

// Intentional Error route
app.use('/error', utilities.handleErrors(accountRoute))
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: '<h1>Site is Broken!</h1><p>Sorry, we appear to have lost that page.(404)</p>'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  // let tools = await utilities.getTools(req);
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  console.error(err.stack); // Print debugging trace for stack
  let message = '';
  if(err.status == 404) {
    message = err.message
    res.status(404).render("errors/error"), {
      title: '404 - Not Found',
      message,
      nav
  }
  }else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})