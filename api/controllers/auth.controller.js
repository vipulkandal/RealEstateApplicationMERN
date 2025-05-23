import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));

    // Verify password against the hashed value in the database
    const isValidPassword = bcryptjs.compareSync(password, validUser.password);
    if (!isValidPassword) return next(errorHandler(401, "Invalid password"));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    // Exclude password before sending user data
    const { password: pass, ...userDataWithoutPassword } = validUser._doc;

    // Send token as an HTTP-only cookie to protect it from JS access
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(userDataWithoutPassword);
  } catch (error) {
    next(error);
  }
};
