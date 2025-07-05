const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:city", async (req, res) => {
  const city = req.params.city;
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Wikipedia API error" });
  }
});

module.exports = router;
