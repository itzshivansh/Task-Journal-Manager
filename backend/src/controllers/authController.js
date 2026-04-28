import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(200),
  displayName: z.string().max(80).optional().default("")
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export async function register(req, res, next) {
  try {
    const { email, username, password, displayName } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ email, username, displayName, passwordHash });
    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName }
    });
  } catch (err) {
    if (err?.code === 11000) {
      return next(new HttpError(409, "Email or username already in use"));
    }
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new HttpError(401, "Invalid email or password"));

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return next(new HttpError(401, "Invalid email or password"));

    const token = signToken(user._id);
    return res.json({
      token,
      user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName }
    });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("_id email username displayName");
    if (!user) return next(new HttpError(404, "User not found"));
    return res.json({ user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName } });
  } catch (err) {
    return next(err);
  }
}

