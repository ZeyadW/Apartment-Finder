import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  ADMIN = "admin",
  AGENT = "agent",
  USER = "user",
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
      minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      minlength: [2, 'Last name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: 'Invalid role specified'
      },
      default: UserRole.USER,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please provide a valid phone number'
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    permissions: [{
      type: String,
      trim: true,
      enum: {
        values: ['read', 'write', 'delete', 'admin'],
        message: 'Invalid permission specified'
      }
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
UserSchema.virtual('displayName').get(function() {
  return this.fullName || this.email;
});

// Virtual for is admin
UserSchema.virtual('isAdmin').get(function() {
  return this.role === UserRole.ADMIN;
});

// Virtual for is agent
UserSchema.virtual('isAgent').get(function() {
  return this.role === UserRole.AGENT;
});

// Compound indexes for better query performance
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ isActive: 1, createdAt: -1 });

// Text index for search functionality
UserSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text"
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 5
  }
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>("User", UserSchema); 
 