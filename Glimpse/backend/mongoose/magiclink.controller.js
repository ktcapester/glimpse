const { sendMagicLink, verifyToken } = require("./magiclink.service");
const jwt = require("jsonwebtoken");

// Endpoint to request a magic link
const postMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    await sendMagicLink(email);
    res.json({ message: "Magic link sent successfully.", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Endpoint to verify the token
const getMagicToken = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).json({ error: "Token and email are required." });
    }

    const user = await verifyToken(token, email);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // Generate JWT for authentication
    const authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful.", token: authToken });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
  postMagicLink,
  getMagicToken,
};
