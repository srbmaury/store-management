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
		const { name, email, password, phone, role, confirmPassword } = req.body;

		if (!name || !email || !password || !phone || !role || !confirmPassword) {
			return res.status(400).json({ message: 'Please fill all required fields' });
		}

		if (password !== confirmPassword) {
			return res.status(400).json({ message: 'Password and Confirm Password do not match' });
		}

		if (!/^\+?\d+$/.test(phone)) {
			return res.status(400).json({ message: 'Invalid phone number format' });
		}

		if (!['admin', 'staff'].includes(role)) {
			return res.status(400).json({ message: 'Role must be either admin or staff' });
		}

		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const user = await User.create({
			name,
			email,
			password,
			phone,
			role,
		});

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			token: generateToken(user),
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
			storeId: user.storeId || null,
			token: generateToken(user),
		});
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};
