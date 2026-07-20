import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { createToken } from "../utils/auth.js";
import { createHttpError, sendSuccess } from "../utils/response.js";

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw createHttpError("Email and password are required");
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createHttpError("Invalid email or password", 401);
  }
  return sendSuccess(res, {
    token: createToken(user),
    user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role },
  }, "Login successful");
}

export async function me(req, res) {
  return sendSuccess(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role,
  });
}

export async function logout(req, res) {
  return sendSuccess(res, null, "Logged out. Remove the token on the client.");
}
