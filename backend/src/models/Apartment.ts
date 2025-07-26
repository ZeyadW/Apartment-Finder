import mongoose, { Document, Schema, Types } from "mongoose";

export interface IApartment extends Document {
  unitName: string;
  unitNumber: string;
  project: string;
  address: string;
  city: string;
  price: number;
  listingType: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  description: string;
  amenities: Types.ObjectId[];
  images: string[];
  isAvailable: boolean;
  agent: Types.ObjectId;
  favorites: Types.ObjectId[];
  developer: Types.ObjectId;
  compound: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApartmentSchema: Schema = new Schema(
  {
    unitName: {
      type: String,
      required: [true, 'Unit name is required'],
      trim: true,
      maxlength: [100, 'Unit name cannot exceed 100 characters'],
    },
    unitNumber: {
      type: String,
      required: [true, 'Unit number is required'],
      trim: true,
      maxlength: [20, 'Unit number cannot exceed 20 characters'],
    },
    project: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
      max: [999999999, 'Price cannot exceed 999,999,999'],
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: {
        values: ['rent', 'sale'],
        message: 'Listing type must be either "rent" or "sale"',
      },
      default: 'rent',
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms must be positive'],
      max: [20, 'Bedrooms cannot exceed 20'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms must be positive'],
      max: [20, 'Bathrooms cannot exceed 20'],
    },
    squareFeet: {
      type: Number,
      required: [true, 'Square footage is required'],
      min: [0, 'Square footage must be positive'],
      max: [100000, 'Square footage cannot exceed 100,000'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    amenities: [{
      type: Schema.Types.ObjectId,
      ref: 'Amenity',
      required: false,
    }],
    images: [{
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v) || v.startsWith('/') || v.startsWith('data:image/');
        },
        message: 'Image URL must be a valid URL, path, or base64 data URL'
      }
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent is required'],
    },
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    developer: {
      type: Schema.Types.ObjectId,
      ref: 'Developer',
      required: [true, 'Developer is required'],
    },
    compound: {
      type: Schema.Types.ObjectId,
      ref: 'Compound',
      required: [true, 'Compound is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full address
ApartmentSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}`;
});

// Virtual for price formatted
ApartmentSchema.virtual('priceFormatted').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(this.price as number);
});

// Virtual for apartment title
ApartmentSchema.virtual('title').get(function() {
  return `${this.unitName} - ${this.project}`;
});

// Compound indexes for better query performance
ApartmentSchema.index({ isAvailable: 1, createdAt: -1 });
ApartmentSchema.index({ agent: 1, createdAt: -1 });
ApartmentSchema.index({ compound: 1, isAvailable: 1 });
ApartmentSchema.index({ developer: 1, isAvailable: 1 });
ApartmentSchema.index({ city: 1, isAvailable: 1 });
ApartmentSchema.index({ price: 1, isAvailable: 1 });
ApartmentSchema.index({ listingType: 1, isAvailable: 1 });

// Text index for search functionality
ApartmentSchema.index({
  unitName: "text",
  unitNumber: "text", 
  project: "text",
  city: "text"
}, {
  weights: {
    unitName: 10,
    unitNumber: 8,
    project: 6,
    city: 4
  }
});

// Ensure virtuals are included in JSON output
ApartmentSchema.set('toJSON', { virtuals: true });
ApartmentSchema.set('toObject', { virtuals: true });

export default mongoose.model<IApartment>("Apartment", ApartmentSchema);
