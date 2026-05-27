import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js"
import { blacklistModel } from "../models/blacklist.model.js"

export async function registerUser(req, res) {

    const { username, email, password } = req.body

    const isAlreadyExist = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if (isAlreadyExist) {
        return res.status(400).json({
            message: "User with this email or username already exist",
            success: false,
            err: "user already exists"
        })
    }

    // TEMPORARY AUTO VERIFY
    const user = await userModel.create({
        username,
        email,
        password,
        verified: true
    })

    // EMAIL VERIFICATION TEMPORARILY DISABLED

    // const emailVerificationToken = jwt.sign({
    //     email: user.email
    // }, process.env.JWT_SECRET)

    // await sendEmail({
    //     to: email,
    //     subject: "Welcome to perplexity!",
    //     html: `
    //             <p>hii ${username},</p>
    //             <p>Thank you for registering at <strong>Perplexity by Irshad</strong>.</p>
    //             <a href="https://perplexity-ai-l2kb.onrender.com/api/auth/verify-email?token=${emailVerificationToken}">
    //                 Verify Email
    //             </a>
    //     `
    // })

    res.status(201).json({
        message: "user registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findOne({ email: decoded.email })

        if (!user) {
            return res.status(400).json({
                message: "invalid token",
                success: false,
                err: "user not found"
            })
        }

        user.verified = true;
        await user.save();

        const html = `
                <h1>Email verified successfully</h1>
                <p>Your Email is Verified. You can now log in to your account </p>

                <a href="https://perplexity-ai-irshad.vercel.app/login">Go To Login</a>
            `

        return res.send(html);

    } catch (err) {

        return res.status(400).json({
            message: "invalid or expired token",
            success: false,
            err: err.message
        })
    }
}

export async function loginUser(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "user not found"
        })
    }

    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) {
        return res.status(400).json({
            message: "invalid email or password",
            success: false,
            err: "invalid password"
        })
    }

    // EMAIL VERIFICATION CHECK TEMPORARILY DISABLED

    // if(!user.verified){
    //     return res.status(400).json({
    //         message: "please verify your email before logging in",
    //         success : false,
    //         err : "email not verified"
    //     })
    // }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email
    },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("userToken", token)

    res.status(200).json({
        message: "user logged in successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function getMe(req, res) {

    const userId = req.user.id

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(400).json({
            message: "user not found",
            success: false,
            err: "user not found"
        })
    }

    res.status(200).json({
        message: "user fetched successfully",
        success: true,
        user
    })
}

export async function logoutUser(req, res) {

    const token = req.cookies.userToken

    if (!token) {
        return res.status(401).json({
            message: "No token provided",
            success: false
        })
    }

    const isTokenAlreadyBlacklisted = await blacklistModel.findOne({
        token
    })

    if (isTokenAlreadyBlacklisted) {
        return res.status(400).json({
            message: "invalid token"
        })
    }

    res.clearCookie("userToken")

    await blacklistModel.create({ token })

    return res.status(200).json({
        message: "token blacklisted successfully"
    })
}