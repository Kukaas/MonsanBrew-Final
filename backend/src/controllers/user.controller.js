import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendWelcomeWithPasswordEmail,
  sendDeactivationEmail,
  sendActivationEmail,
} from "../services/email.service.js";

// Get current user's address (backward compatibility - returns default address)
export const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      userId: req.user._id,
      isDefault: true
    });

    if (!address) {
      return res.status(404).json({ message: "No address found" });
    }

    res.status(200).json({ address });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({ message: "Failed to fetch address" });
  }
};

// Update current user's address (backward compatibility - updates default address)
export const updateAddress = async (req, res) => {
  try {
    const {
      contactNumber,
      lotNo,
      purok,
      street,
      landmark,
      barangay,
      municipality,
      province,
      latitude,
      longitude,
    } = req.body;

    // Find default address
    let address = await Address.findOne({
      userId: req.user._id,
      isDefault: true
    });

    // If no default address exists, create one
    if (!address) {
      address = new Address({
        userId: req.user._id,
        contactNumber,
        lotNo,
        purok,
        street,
        landmark,
        barangay,
        municipality,
        province,
        latitude,
        longitude,
        isDefault: true,
        label: 'Home'
      });
      await address.save();
    } else {
      // Update existing default address
      address.contactNumber = contactNumber;
      address.lotNo = lotNo;
      address.purok = purok;
      address.street = street;
      address.landmark = landmark;
      address.barangay = barangay;
      address.municipality = municipality;
      address.province = province;
      address.latitude = latitude;
      address.longitude = longitude;
      await address.save();
    }

    res.status(200).json({ address });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: "Failed to update address" });
  }
};

// Update current user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, contactNumber, photo } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (photo) updateData.photo = photo;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select(
      "-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Get all users (admin only) - only show basic info for security
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("name email role isVerified isActive createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user by ID (admin only) - for editing
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId).select(
      "-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role = "customer",
      contactNumber,
      lotNo,
      purok,
      street,
      landmark,
      barangay,
      municipality,
      province,
      photo,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Generate a random password (10 chars, alphanumeric)
    const generatedPassword = crypto
      .randomBytes(8)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      lotNo,
      purok,
      street,
      landmark,
      barangay,
      municipality,
      province,
      photo,
      isVerified: true, // Admin-created users are automatically verified
      isActive: true, // Admin-created users are automatically active
      hasChangedPassword: false, // New users need to change their password
    });

    await user.save();

    // Send welcome email with password
    await sendWelcomeWithPasswordEmail(email, generatedPassword);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create user" });
  }
};

// Update user (admin only) - restricted to riders and admins only
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      role,
      contactNumber,
      lotNo,
      purok,
      street,
      landmark,
      barangay,
      municipality,
      province,
      photo,
      isVerified,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow editing riders and admins
    if (existingUser.role !== "rider" && existingUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Can only edit riders and admins" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        role,
        contactNumber,
        lotNo,
        purok,
        street,
        landmark,
        barangay,
        municipality,
        province,
        photo,
        isVerified,
      },
      { new: true, runValidators: true }
    ).select(
      "-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires"
    );

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update user" });
  }
};

// Activate user (admin only)
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already active
    if (user.isActive) {
      return res.status(400).json({ message: "User is already active" });
    }

    // Activate user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isActive: true,
        deactivationReason: null,
        deactivatedAt: null,
      },
      { new: true }
    ).select(
      "-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires"
    );

    // Send activation email
    await sendActivationEmail(user.email, user.name);

    res.status(200).json({
      message: "User activated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Activate user error:", error);
    res.status(500).json({ message: "Failed to activate user" });
  }
};

// Deactivate user (admin only)
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: "Deactivation reason is required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already inactive
    if (!user.isActive) {
      return res.status(400).json({ message: "User is already inactive" });
    }

    // Prevent deactivation of admin users
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot deactivate admin users" });
    }

    // Deactivate user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        deactivationReason: reason.trim(),
        deactivatedAt: new Date(),
      },
      { new: true }
    ).select(
      "-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires"
    );

    // Send deactivation email
    await sendDeactivationEmail(user.email, user.name, reason.trim());

    res.status(200).json({
      message: "User deactivated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ message: "Failed to deactivate user" });
  }
};

// Manually verify user (admin only)
export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Verify user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select(
      "-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires"
    );

    res.status(200).json({
      message: "User verified successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({ message: "Failed to verify user" });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of admin users
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
