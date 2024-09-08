const User = require('../models/User'); // Adjust the path as necessary
// Adjust the path as necessary
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Login user
exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Find the user in the database
    const foundUser = await User.findOne({ username }).exec();

    // If user is not found or not active, return unauthorized
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Compare provided password with the stored hashed password
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    // Generate JWT access token
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    // Generate JWT refresh token
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    // Save refresh token with secure cookie settings
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by web server 
        secure: true, // https
        sameSite: 'None', // cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match rT
    });

    // Send accessToken to the client
    res.json({ accessToken });
});

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { username, password, roles } = req.body

        // Confirm data
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }
    
        // Check for duplicate username
        const duplicate = await User.findOne({ username }).lean().exec()
    
        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate username' })
        }
    
        // Hash password 
        const hashedPwd = await bcrypt.hash(password, 10) // salt rounds
    
        const userObject = { username, "password": hashedPwd, roles }
    
        // Create and store new user 
        const user = await User.create(userObject)
    
        if (user) { //created 
            res.status(201).json({ message: `New user ${username} created` })
        } else {
            res.status(400).json({ message: 'Invalid user data received' })
        } 
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, password },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};