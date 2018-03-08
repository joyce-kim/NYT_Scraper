var router = require("express").Router();

// renders home page
router.get("/", function(req, res) {
  res.render("home");
});

// renders saved.handledbars layout
router.get("/saved", function(req, res) {
  res.render("saved");
});

module.exports = router;
