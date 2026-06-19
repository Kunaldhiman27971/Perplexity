import userModel from "../models/user.model.js"
import JWT from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js"
import bcrypt from "bcrypt"

// Register a new user 
export async function register(req, res) {
    const { username, email, password } = req.body
    const isUserExist = await userModel.findOne({ $or: [{ email }, { username }] })

    if (isUserExist) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            error: "User already exists"
        })
    }

    const user = await userModel.create({ username, email, password })

    const emailVerificationToekn = JWT.sign({
        email: user.email,

    }, process.env.JWT_SECRET)

    await sendEmail({
        to: email,
        subject: "Welcome to Olo! Please verify your email",
        html: `<h1>Welcome to Olo, ${user.username}!</h1>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToekn}">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br/>The Olo Team</p>`
    })
    res.status(201).json({
        message: "User registered successfully. Please check your email to verify your account.",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}



// Verify user's email using the token sent in the verification email
export async function verifyEmail(req, res) {
    const { token } = req.query
    const decode = JWT.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findOne({ email: decode.email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid token",
            success: false,
            error: "User not found"
        })
    }
    user.verified = true
    await user.save()
    const html = `<h1>Email Verified Successfully!</h1>
   <p>Your email has been verified. You can now log in to your account.</p>
   <a href="http://localhost:3000/login">Go to Login</a>    
    <p>Best regards,<br/>The Olo Team</p>`

    res.status(200).send(html)
}


// Login user and return JWT token

export async function loginUser(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            error: "User not found"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            error: "Email not verified"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            error: "Incorrect password"
        })
    }

    const token = JWT.sign({
        id: user._id,
        username: user.username,
        email: user.email
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}



// Logout user by clearing the JWT cookie
export async function logoutUser(req, res) {
    res.clearCookie("token")
    res.status(200).json({
        message: "Logout successful",
        success: true,
    })
}

// Forgot password - send password reset email to user
export async function forgotPassword(req, res) {
    const { email } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "User with this email does not exist",
            success: false,
            error: "User not found"
        })
    }

    const passwordResetToken = JWT.sign({
        email: user.email,
    }, process.env.JWT_SECRET, {
        expiresIn: "1h"
    })

    await sendEmail({
        to: email,
        subject: "Olo Password Reset Request",
        html: `<h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to reset your password:</p>
        <a href="http://localhost:3000/api/auth/reset-password?token=${passwordResetToken}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br/>The Olo Team</p>`
    })

    res.status(200).json({
        message: "Password reset email sent. Please check your inbox.",
        success: true,
    })
}
export async function getResetPasswordPage(req, res) {
    const { token } = req.query

    if (!token) {
        return res.status(400).send("Reset token is required")
    }

    const html = `
        <h1>Reset Password</h1>
        <form method="POST" action="/api/auth/reset-password">
            <input type="hidden" name="token" value="${token}" />
            <div>
                <label for="password">New Password</label>
                <input id="password" name="password" type="password" minlength="6" required />
            </div>
            <button type="submit">Reset Password</button>
        </form>
    `

    res.status(200).send(html)
}
export async function resetPassword(req, res) {
    const { token, password } = req.body

    let decoded

    try {
        decoded = JWT.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired reset token",
            success: false,
            error: "Token verification failed"
        })
    }

    const user = await userModel.findOne({ email: decoded.email })

    if (!user) {
        return res.status(400).json({
            message: "User not found",
            success: false,
            error: "Invalid token"
        })
    }

    user.password = password
    await user.save()

    res.status(200).json({
        message: "Password reset successful",
        success: true,
    })
}

// Get the currently logged in user's details
export async function getMe(req, res) {
    const user = await userModel.findById(req.user.id)
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            error: "User not found"
        })
    }
    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            timeCreated: user.createdAt,
            updatedAt: user.updatedAt,
            verified: user.verified
        }
    })
}
