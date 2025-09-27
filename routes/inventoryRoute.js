const express = require("express");
const invController = require("../controllers/invController");
const router = new express.Router();

router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;
