import { mongoose } from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const entrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["work", "learning", "interesting-thing"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  // Automatically add `createdAt` and `updatedAt` timestamps:
  // https://mongoosejs.com/docs/timestamps.html
  { timestamps: true },
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    image: String,
    mail: {
      type: String,
      required: true, // Ensure user emails are required
      unique: true // Ensure user emails are unique
    },
    name: String,
    title: String,
    educations: [String],
    password: {
      type: String,
      required: true, // Ensure user passwords are required
      select: false // Automatically exclude from query results
    }
  },
  { timestamps: true }
);

// pre save password hook
userSchema.pre("save", async function (next) {
  const user = this; // this refers to the user document

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next(); // continue
  }

  const salt = await bcrypt.genSalt(10); // generate a salt
  user.password = await bcrypt.hash(user.password, salt); // hash the password
  next(); // continue
});

// For each model you want to create, please define the model's name, the
// associated schema (defined above), and the name of the associated collection
// in the database (which will be created automatically).
export const models = [
  {
    name: "Entry",
    schema: entrySchema,
    collection: "entries",
  },
  {
    name: "User",
    schema: userSchema,
    collection: "users"
  }
];