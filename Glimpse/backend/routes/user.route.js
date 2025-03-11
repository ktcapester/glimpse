const express = require("express");
const authenticateJWT = require("../middleware/authJWT.middle");
const { getUser } = require("../controllers/user.controller");

const router = express.Router();

// Authenticate the JWT on every route used by this router
router.use(authenticateJWT);

router.get("/", getUser);

module.exports = router;
