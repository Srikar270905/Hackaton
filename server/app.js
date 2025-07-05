const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("citySearch", (city) => {
    console.log("City shared via socket:", city);
    socket.broadcast.emit("cityUpdate", city); // send to other clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/api/wiki/:city", async (req, res) => {
  const city = req.params.city;
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );
    res.json(response.data);
  } catch {
    res.status(500).json({ error: "Wikipedia error" });
  }
});

app.get("/api/coordinates/:city", async (req, res) => {
  const city = req.params.city;
  try {
    const geo = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        city
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const loc = geo.data.results[0]?.geometry?.location;
    if (loc) res.json(loc);
    else res.status(404).json({ error: "No coordinates" });
  } catch {
    res.status(500).json({ error: "Geocoding failed" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const result = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ reply: result.data.choices[0].message.content });
  } catch {
    res.status(500).json({ error: "ChatGPT error" });
  }
});

server.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});
