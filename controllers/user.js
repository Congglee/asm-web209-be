import User from "../models/user.js";
import bcrypt from "bcrypt";
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
} from "../schemas/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middlewares/jwt.js";

export const register = async (req, res) => {
  try {
    const body = req.body;
    const { error } = registerSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((errItem) => errItem.message);
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }
    const { name, email, password } = req.body;
    const checkMail = await User.findOne({ email });
    if (checkMail) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng! Vui lòng nhập email khác",
      });
    } else {
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new User({
        name,
        email,
        password: hashPassword,
      });
      const user = await newUser.save();
      return res.status(200).json({
        success: true,
        user,
        message: "Đăng ký tài khoản thành công!",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Đăng ký tài tài khoản thất bại! ${error.message}`,
    });
  }
};

export const login = async (req, res) => {
  try {
    const body = req.body;
    const { error } = loginSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((errItem) => errItem.message);
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).send({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }
    const { password: hashPassword } = user;
    const validPassword = bcrypt.compareSync(password, hashPassword);
    if (!validPassword) {
      return res.status(403).send({
        success: false,
        message: "Mật khẩu không hợp lệ",
      });
    }

    if (user && validPassword) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      user.password = undefined;
      user.isAdmin = undefined;
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        userData: user,
        accessToken,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Đăng nhập tài khoản thất bại! ${error.message}`,
    });
  }
};

export const logOut = async (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Đăng xuất thành công!" });
};
