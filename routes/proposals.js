const express = require("express");
const router = express.Router();

const { getAllProposals } = require("../models/proposals");

router.get("/", async (req, res) => {
  let data = await getAllProposals();
  res.json(data);

  // Get data from mongodb
  // send back json
});

module.exports = router;
