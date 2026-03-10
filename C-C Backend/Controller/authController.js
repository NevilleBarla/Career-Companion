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

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    res.json({
      message: "User registered successfully"
    });

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
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,  //Login funtion
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    res.status(500).json({
      message: "Login failed",
      error: error.message
    });

  }

};



// ---------------- GET CURRENT USER ----------------

exports.getCurrentUser = async (req, res) => {

  try {

    const user = await User
      .findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    });

  }

};

// ---------------- GOOGLE AUTHENTICATION ----------------

exports.googleAuth = async (req, res) => {

  try {

    const { email, name } = req.body;

    let user = await User.findOne({ email });

    if (!user) {

      return res.json({
        newUser: true,
        email,
        name
      });

    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, //Google auth funtion
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (error) {

    res.status(500).json({
      message: "Google authentication failed"
    });

  }

};