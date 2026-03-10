const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ---------------- REGISTER USER ----------------

exports.register = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      mobile,
      preferredRole,
      skills,
      experience,
      qualification,
      gender,
      age
    } = req.body;

    // ---------------- EMPTY FIELD CHECKS ----------------

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ message: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!mobile || mobile.trim() === "") {
      return res.status(400).json({ message: "Mobile number is required" });
    }
    if (!preferredRole || preferredRole.trim() === "") {
      return res.status(400).json({ message: "Preferred role is required" });
    }
    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: "At least one skill is required" });
    }
    if (!experience || experience.trim() === "") {
      return res.status(400).json({ message: "Experience is required" });
    }
    if (!qualification || qualification.trim() === "") {
      return res.status(400).json({ message: "Qualification is required" });
    }
    if (!gender || gender.trim() === "") {
      return res.status(400).json({ message: "Gender is required" });
    }
    if (!age) {
      return res.status(400).json({ message: "Age is required" });
    }

    // ---------------- DUPLICATE EMAIL CHECK ----------------

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "This email is already registered. Please login instead."
      });
    }

    // ---------------- DUPLICATE MOBILE CHECK ----------------

    const existingMobile = await User.findOne({ mobile });

    if (existingMobile) {
      return res.status(400).json({
        message: "This mobile number is already registered with another account."
      });
    }

    // ---------------- CREATE USER ----------------

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      preferredRole,
      skills,
      experience,
      qualification,
      gender,
      age
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (error) {

    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });

  }
};


// ---------------- LOGIN USER ----------------

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};


// ---------------- GET CURRENT USER ----------------

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};


// ---------------- GOOGLE AUTH ----------------

exports.googleAuth = async (req, res) => {
  try {

    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.json({ newUser: true, email, name });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: "Google authentication failed" });
  }
};
