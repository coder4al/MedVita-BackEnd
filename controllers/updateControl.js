const User = require("../models/User");
const jwt = require("jsonwebtoken");
const VerifyEmail = require("../models/VerifyEmail");
const redisClient = require("../redis");
const { sendActivationMail } = require("./signupControl");
require("dotenv").config();

async function updateUserName(name, email) {
  try {
    const userCheck = await User.findOne({ email: email });
    if (userCheck) {
      const newName = name;
      const newToken = jwt.sign({ email }, process.env.LOGIN_SECRET_TOKEN);

      // update the database
      await User.findOneAndUpdate(
        { email: userCheck.email },
        { $set: { name: newName, token: newToken } }
      );

      // update the redisClient
      const response = {
        id: userCheck._id,
        name: newName,
        email: userCheck.email,
        password: userCheck.password,
        token: newToken,
        status: true,
      };

      await redisClient.set(`key-${email}`, JSON.stringify(response));

      return newToken;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error during updateUserName: ", error);
    return "Server Busy";
  }
}

// Function to insert the user into the VerifyEmail collection
async function insertVerifyEmail(name, email, originalEmail, currentToken) {
  try {
    // Delete expired verification records
    await VerifyEmail.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 3600000) },
    });

    // Check if the user already exists in the VerifyEmail collection
    const verifyEmailExist = await VerifyEmail.findOne({ email: email });
    if (verifyEmailExist) {
      return true;
    }

    // Generate a token for the user
    const token = generateToken(email);

    // Create a new VerifyEmail instance
    const newEmail = new VerifyEmail({
      name: name,
      email: email,
      originalEmail: originalEmail,
      token: token,
      currentToken: currentToken,
    });

    // Save the new VerifyUser instance and send the email
    await newEmail.save();
    sendActivationMail("update", token, email);

    return false;
  } catch (e) {
    console.error("Error during insertVerifyUser: ", e);
    return "Server Busy";
  }
}

// Function to generate a JWT token
function generateToken(email) {
  const token = jwt.sign({ email }, process.env.SIGNUP_SECRET_TOKEN, {
    expiresIn: "1h",
  });
  return token;
}

module.exports = { updateUserName, insertVerifyEmail };
