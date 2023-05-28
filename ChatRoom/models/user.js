import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // For encrypting the password

// Creating schema for the user document
const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// match encrypted form of passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// for checking if password is changed then save the encrypted form of new password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  // Store hashed password in db
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// creating the model using above schema
const User = mongoose.model("User", UserSchema);
export default User;
