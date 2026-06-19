import JWT from "jsonwebtoken"

export function requireAuth(req, res, next) {
    const tokenFromCookie = req.cookies?.token
    const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null

    const token = tokenFromCookie || tokenFromHeader

    if (!token) {
        return res.status(401).json({
            message: "Authentication required",
            success: false,
            error: "No token provided"
        })
    }

    try {
        req.user = JWT.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
            error: "Token verification failed"
        })
    }
}