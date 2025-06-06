// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decoded._id).select('-password');
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Not authorized, token failed' });
	}
};

exports.adminOnly = (req, res, next) => {
	if (req.user?.role !== 'admin') {
		return res.status(403).json({ message: 'Access restricted to Admins only' });
	}
	next();
};

exports.staffOnly = (req, res, next) => {
	if (req.user?.role !== 'staff') {
		return res.status(403).json({ message: 'Access restricted to Staff only' });
	}
	next();
};
