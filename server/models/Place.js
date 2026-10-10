import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  area: { type: String, required: true },
  interests: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  icon: { type: String, default: "" },
  scene: { type: String, default: "" },
  caption: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  photoCredit: { type: String, default: "" },
  photoSource: { type: String, default: "" },
  photoLicense: { type: String, default: "" },
  duration: { type: Number, required: true },
  travel: { type: Number, required: true },
  note: { type: String, required: true },
  guide: { type: String, required: true },
  story: { type: String, required: true },
  verified: { type: Boolean, default: false },
  source: { type: String, default: "" },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("Place", placeSchema);
