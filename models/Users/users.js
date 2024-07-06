import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is a necessary field."]
    },
    email: {
        type: String,
        required: [true, "E-Mail is a necessary field."]
    },
    phone: {
        type: String,
        required: [true, "Phone number is a necessary field."]
    },
    password: {
        type: String,
        required: [true, "Password is a necessary field."]
    },
    emailValid: {
        type: Boolean,
    },
    phoneValid: {
        type: Boolean,
    },
    emailotp: {
        type: Number,
    },
    phoneotp: {
        type: Number,
    }
});

const userModel = mongoose.model("OTPgenerator", userSchema);
export default userModel;