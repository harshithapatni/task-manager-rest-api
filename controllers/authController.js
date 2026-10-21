const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../database/database');

/**
 * Helper to validate email format using standard regex.
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * POST /api/auth/register
 * Registers a new user account.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields presence
    if (name === undefined || email === undefined || password === undefined) {
      return res.status(400).json({
        error: 'Please provide name, email, and password.',
      });
    }

    // 2. Validate empty or whitespace-only strings
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Name cannot be empty.',
      });
    }

    if (typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        error: 'Email cannot be empty.',
      });
    }

    if (typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({
        error: 'Password cannot be empty.',
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        error: 'Please provide a valid email address.',
      });
    }

    // 4. Validate password length (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
      });
    }

    // 5. Check whether the email is already registered
    const existingUser = await dbGet('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email is already registered.',
      });
    }

    // 6. Hash password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Insert the new user into the database
    const insertResult = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [trimmedName, normalizedEmail, hashedPassword]
    );

    // 8. Fetch the created user record (excluding password)
    const newUser = await dbGet(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [insertResult.id]
    );

    // 9. Return HTTP 201 Created with user data
    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    return res.status(500).json({
      error: 'An error occurred during registration. Please try again.',
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns a JWT token.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields presence
    if (email === undefined || password === undefined) {
      return res.status(400).json({
        error: 'Please provide both email and password.',
      });
    }

    // 2. Validate empty strings
    if (typeof email !== 'string' || email.trim() === '' || typeof password !== 'string' || password === '') {
      return res.status(400).json({
        error: 'Email and password cannot be empty.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user by email
    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (!user) {
      // Return 401 Unauthorized for security (avoids disclosing whether email exists)
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    // 4. Verify password against the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    // 5. Generate JSON Web Token
    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // 6. Return successful response with the JWT token
    return res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({
      error: 'An error occurred during login. Please try again.',
    });
  }
};

module.exports = {
  register,
  login,
};
