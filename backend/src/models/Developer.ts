import mongoose, { Document, Schema } from "mongoose";

export interface IDeveloper extends Document {
  name: string;
  description?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDeveloper>("Developer", DeveloperSchema); 