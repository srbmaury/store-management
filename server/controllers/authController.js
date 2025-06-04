const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      storeOwnerId: user.storeOwnerId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, storeName, role, address, confirmPassword } = req.body;

    if (!name || !email || !password || !phone || !role || (role === 'admin' && (!storeName || !address)) || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and Confirm Password do not match' });
    }

    // ✅ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // ✅ Create admin user first (storeOwnerId will be self-assigned below)
    const user = new User({
      name,
      email,
      password,
      phone,
      storeName,
      role,
      address,
    });

    // ✅ Self-assign storeOwnerId for admin
    user.storeOwnerId = user._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user), // token includes user._id, storeOwnerId, role
      storeOwnerId: user.storeOwnerId,
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
      storeOwnerId: user.storeOwnerId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.join = async (req, res) => {
  try {
    const { storeOwnerId } = req.body;
    const userId = req.user._id; // Comes from auth middleware

    if (!storeOwnerId) {
      return res.status(400).json({ message: 'Store owner ID is required' });
    }

    // Check if user is already part of the store
    const user = await User.findOne({ _id: userId, storeOwnerId });
    if (user) {
      return res.status(400).json({ message: 'You are already part of this store' });
    }

    // Update user's storeOwnerId
    await User.updateOne({ _id: userId }, { $set: { storeOwnerId } });

    res.json({ message: 'Successfully joined the store' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};