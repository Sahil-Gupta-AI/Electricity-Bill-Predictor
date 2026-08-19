const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true
  },
  lname: {
    type: String,
    required: true
  },
  email: {
  type: String,
  unique: true,
  required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  }
}, {
  
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


UserSchema.virtual('initials').get(function() {
  if (!this.name) return '';
  const parts = this.name.split(' ');
  const initials = parts.map(part => part.charAt(0).toUpperCase()).join('');
  return initials.slice(0, 2); 
});

module.exports = mongoose.model("User", UserSchema);