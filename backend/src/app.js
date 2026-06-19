import express from "express";
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"


const app= express();

// middlewares
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// health check route
app.get("/",(req,res)=>{
    res.json({message:"Server is healthy"})
})

// auth routes
app.use("/api/auth",authRouter)
export default app;
