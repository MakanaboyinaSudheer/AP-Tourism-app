import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import mongoose from "mongoose";
import { places as seedPlaces } from "../shared/places.js";
import Place from "./models/Place.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const clientOrigin = process.env.CLIENT_ORIGIN;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const productionClient = path.resolve(currentDir, "../client/dist");

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use((request, response, next) => {
  if (clientOrigin && request.headers.origin === clientOrigin) {
    response.setHeader("Access-Control-Allow-Origin", clientOrigin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "demo-fallback"
  });
});

app.get("/api/places", async (_request, response, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const places = await Place.find({}).select("-_id -__v").lean();
      if (places.length) return response.json({ places, source: "mongodb" });
    }
    response.json({ places: seedPlaces, source: "demo-seed" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/places/:id", async (request, response, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const place = await Place.findOne({ id: request.params.id }).select("-_id -__v").lean();
      if (place) return response.json({ place, source: "mongodb" });
    }
    const place = seedPlaces.find(item => item.id === request.params.id);
    if (!place) return response.status(404).json({ error: "Place not found." });
    response.json({ place, source: "demo-seed" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/safety-contacts", (_request, response) => {
  response.json({
    verified: false,
    contacts: [],
    message: "Official NTR District contact details have not been verified/configured."
  });
});

app.use("/assets", express.static(path.resolve(currentDir, "../client/public/assets"), {
  maxAge: "1d",
  immutable: true
}));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(productionClient));
  app.get("*path", (_request, response) => response.sendFile(path.join(productionClient, "index.html")));
}

app.use((error, _request, response, _next) => {
  console.error("API request failed:", error);
  response.status(500).json({ error: "The request could not be completed." });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB.");
    } catch (error) {
      console.error("MongoDB connection failed; continuing with the explicitly labelled demo seed.", error.message);
    }
  } else {
    console.warn("MONGODB_URI is not set; API uses the demo seed catalogue.");
  }
  app.listen(port, () => console.log(`NTR AI Yatra API listening on http://localhost:${port}`));
}

start();
