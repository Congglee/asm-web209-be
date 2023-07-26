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

const register = async (req, res) => {
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

const login = async (req, res) => {
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

const logOut = async (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Đăng xuất thành công!" });
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -isAdmin");

    return res.status(200).json({
      success: user ? true : false,
      userData: user ? user : "Không tìm thấy tài khoản",
    });
  } catch (error) {
    return res.status(400).status({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const user = await User.find().select("-password -isAdmin");

    return res.status(200).json({
      success: user ? true : false,
      users: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server: " + error.message, success: false });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: deleteUser ? true : false,
      deletedUser: deleteUser
        ? `Xóa tài khoản với email ${deleteUser.email} thành công`
        : "Xóa tài khoản thất bại",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { error } = updateUserSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((errItem) => errItem.message);
      return res.status(400).json({
        success: false,
        message: errors,
      });
    }

    const { id } = req.params;

    const { email } = req.body;
    const checkEmail = await User.findOne({
      _id: { $ne: id },
      email,
    });
    if (checkEmail)
      return res.status(401).json({
        success: false,
        message: "Email đã tồn tại, vui lòng nhập lại email khác!",
      });

    const updateUser = await User.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      req.body,
      { new: true }
    ).select("-password -isAdmin");

    // const avatarFile = req.file;

    // if (avatarFile) {
    //   updateUser.avatar = avatarFile.path;
    // }

    // await updateUser.save();

    return res.status(200).json({
      success: updateUser ? true : false,
      updatedUser: updateUser
        ? updateUser
        : "Cập nhật thông tin tài khoản thất bại",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id, quantity } = req.body;
    if (!id || !quantity)
      throw new Error("Vui lòng điền vào id và số lượng sản phẩm");

    const user = await User.findById(_id).select("cart");
    const alreadyProduct = user.cart.find(
      (item) => item.product.toString() === id
    );
    if (alreadyProduct) {
      const response = await User.updateOne(
        {
          cart: { $elemMatch: alreadyProduct },
        },
        { $set: { "cart.$.quantity": quantity } },
        { new: true }
      );
      return res.status(200).json({
        success: response ? true : false,
        updatedUserCart: response
          ? response
          : "Không thể thêm sản phẩm vào giỏ hàng",
      });
    } else {
      const response = await User.findByIdAndUpdate(
        _id,
        {
          $push: { cart: { product: id, quantity } },
        },
        { new: true }
      );
      return res.status(200).json({
        success: response ? true : false,
        updatedUserCart: response
          ? response
          : "Không thể thêm sản phẩm vào giỏ hàng",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  register,
  login,
  logOut,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  updateCart,
};
