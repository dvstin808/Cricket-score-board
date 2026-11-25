const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

let cache = null;
let lastFetch = 0;

app.get("/api/matches", async (req, res) => {
  try {
    const key = process.env.CRICKET_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "API key not configured"
      });
    }

    if (cache && Date.now() - lastFetch < 300000) {
      return res.json(cache);
    }

    const url = new URL(
      "https://api.cricapi.com/v1/currentMatches"
    );

    url.searchParams.set("apikey", key);
    url.searchParams.set("offset", "0");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error("API error");
    }

    cache = data;
    lastFetch = Date.now();

    res.json(data);

  } catch (error) {
    res.status(502).json({
      error: "Live score fetch failed"
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log("Cricket scoreboard running");
});
