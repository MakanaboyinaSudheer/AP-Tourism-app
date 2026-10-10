import "dotenv/config";
import mongoose from "mongoose";
import { places } from "../shared/places.js";
import Place from "./models/Place.js";

if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI before seeding the database.");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    for (const place of places) {
      await Place.updateOne(
        { id: place.id },
        { $set: { ...place, verified: false, source: "Project concept references; requires local source review." } },
        { upsert: true, runValidators: true }
      );
    }
    console.log(`Seeded ${places.length} unverified demo places. Verify sources before public use.`);
  } catch (error) {
    console.error("Could not seed places:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
