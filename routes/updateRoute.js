const express = require("express");
const router = express.Router();
const { checkUser } = require("../controllers/loginControl");
const {
  insertVerifyEmail,
  updateUserName,
} = require("../controllers/updateControl");

router.post("/username", async (req, res) => {
  try {
    const { name, email } = await req.body;

    const userUpdatedToken = await updateUserName(name, email);

    if (!userUpdatedToken || userUpdatedToken === "Server Busy") {
      res.status(500).send("Server Busy");
    } else if (userUpdatedToken) {
      res.status(200).json({ token: userUpdatedToken });
    }
  } catch (error) {
    console.error("Error during post /username: ", error);
    res.status(500).send("Server Busy");
  }
});

router.post("/mail", async (req, res) => {
  try {
    const { name, email, originalEmail, currentToken } = await req.body;
    const userExist = await checkUser(email);

    if (!userExist) {
      const updateEmailExist = await insertVerifyEmail(
        name,
        email,
        originalEmail,
        currentToken
      );
      if (!updateEmailExist) {
        res.status(200).send("updateEmailAdded");
      } else if (updateEmailExist === "Server Busy") {
        res.status(500).send("Server Busy");
      } else if (updateEmailExist) {
        res.status(200).send("updateEmailExist");
      }
    } else if (userExist === "Server Busy") {
      res.status(500).send("Server Busy");
    } else if (userExist) {
      res.status(200).send("userExist");
    }
  } catch (error) {
    console.error("Error during post /mail: ", error);
    res.status(500).send("Server Busy");
  }
});

module.exports = router;
