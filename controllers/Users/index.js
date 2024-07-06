import express from "express";
import userModel from "../../models/Users/users.js";
import nodemailer from "nodemailer";
import config from "config";
import twilio from "twilio";
import bcrypt from "bcryptjs";

const router = express.Router();

let SID = config.get("SID");
let AUTH = config.get("AUTH");
let PHONE = config.get("PHONE");
let HOST = config.get("HOST");
let NM_PORT = config.get("NM_PORT");
let USER = config.get("USER");
let PASS = config.get("PASS");

let sendEmail = async (myEmails, subject, text) => {
    try {
        let transporter = nodemailer.createTransport({
            host: HOST,
            port: NM_PORT,
            secure: false,
            auth: {
                user: USER,
                pass: PASS
            }
        });
        let info = transporter.sendMail({
            from: `T-Work Foundation ${USER}`,
            to: myEmails,
            subject: subject,
            text: text
        });
    } catch (error) {
        console.log(error);
    }
};
const subject = "Here is your OTP";

const client = twilio(SID, AUTH);
let sendSMS = async (to, body) => {
    try {
        const message = await client.messages.create({
            body: body,
            to: to,
            from: PHONE
        });
    } catch (error) {
        console.log(error);
    }
};

router.get('/getall', async (req, res) => {
    try {
        let users = await userModel.find({});
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

router.post('/register', async (req, res) => {
    try {
        let { name, email, phone, password } = req.body;
        let hashedPassword = await bcrypt.hash(password, 10);
        const emailAvailable = await userModel.findOne({ email });
        if (emailAvailable) {
            return res.status(400).json({ message: "User with this e-mail already exists!" });
        }
        const phoneAvailable = await userModel.findOne({ phone });
        if (phoneAvailable) {
            return res.status(400).json({ message: "User with this phone number already exists!" });
        }
        const emailotp = Math.floor(Math.random() * 9000 + 1000);
        const phoneotp = Math.floor(Math.random() * 9000 + 1000);
        await userModel.create({ name, email, phone, password: hashedPassword, emailValid: false, phoneValid: false, emailotp, phoneotp });
        const emailText = `Your OTP is ${emailotp}`;
        const phoneText = `Your OTP is ${phoneotp}`;
        sendEmail([email], subject, emailText);
        sendSMS(phone, phoneText);
        res.status(200).json({ message: "New user registered. OTP has been sent to your e-mail address and phone." });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

router.put('/verifyemail/:email', async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.params.email });
        const { otp } = req.body;
        if (!user) {
            return res.status(200).json({ message: "User doesn't exist!" });
        }
        if (otp == user.emailotp) {
            user.emailValid = true;
            await user.save();
            res.status(200).json({ message: "Email successfully verified!" });
        } else {
            res.status(200).json({ message: "Wrong OTP entered!" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.put('/verifyphone/:phone', async (req, res) => {
    try {
        const user = await userModel.findOne({ phone: req.params.phone });
        const { otp } = req.body;
        if (!user) {
            return res.status(200).json({ message: "User doesn't exist!" });
        }
        if (otp == user.phoneotp) {
            user.phoneValid = true;
            await user.save();
            res.status(200).json({ message: "Phone successfully verified!" });
        } else {
            res.status(200).json({ message: "Wrong OTP entered!" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(200).json({ message: "User doesn't exist!" });
        }
        if (user.emailValid == false) {
            return res.status(200).json({ message: "Email has not been verified!" });
        }
        if (user.phoneValid == false) {
            return res.status(200).json({ message: "Phone number has not been verified!" });
        }
        let correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            return res.status(200).json({ message: "Wrong password entered!" });
        }
        else {
            return res.status(200).json({ message: "Successfully logged in!" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.delete('/deleteAll', async (req, res) => {
    try {
        await userModel.deleteMany();
        res.status(200).json({ message: "All users deleted." });
    } catch (err) {
        console.log(err);
    }
});

export default router;