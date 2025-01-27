const Token = require("./models/Token");

// Token verification and user authentication
app.get("/login", async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).send("Invalid request.");
  }

  try {
    // Find the token in the database
    const record = await Token.findOne({ email, token, used: false });

    if (!record) {
      return res.status(400).send("Invalid or expired token.");
    }

    // Check if the token has expired
    if (record.expiresAt < Date.now()) {
      return res.status(400).send("Token has expired.");
    }

    // Mark the token as used
    record.used = true;
    await record.save();

    // Log in the user (pseudo-code: create a session or JWT)
    // Example: const user = await User.findOne({ email });
    res.send("Login successful! Welcome to the app.");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred.");
  }
});
