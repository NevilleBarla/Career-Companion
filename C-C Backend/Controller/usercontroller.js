const User = require("../models/User");


// ---------------- UPDATE USER PROFILE ----------------

exports.updateProfile = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      mobile,
      preferredRole,
      skills,
      experience,
      qualification,
      gender,
      age
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        mobile,
        preferredRole,
        skills,
        experience,
        qualification,
        gender,
        age
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });

  }

};



// ---------------- GET USER PROFILE ----------------

exports.getProfile = async (req, res) => {

  try {

    const user = await User
      .findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });

  }

};