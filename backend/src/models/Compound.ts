import mongoose, { Document, Schema } from "mongoose";

export interface ICompound extends Document {
  name: string;
  location?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompoundSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICompound>("Compound", CompoundSchema); 