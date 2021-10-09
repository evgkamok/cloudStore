const Router = require("express");
const User = require("../models/User");
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const fileService = require("../services/fileService");
const File = require("../models/File");

const router = new Router();

router.post(
  "/registration",
  [
    check("email", "Incorrect email").isEmail(),
    check(
      "password",
      "Password must be longer than 3 and shorter than 12 symbols"
    ).isLength({ min: 3, max: 12 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: `Registration failed - ${errors.errors[0].msg}` });
      }

      const { email, password } = req.body;

      const candidate = await User.findOne({ email: email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: `User with this email ${email} already exist` });
      }

      const hashPassword = await bcrypt.hash(password, 8);
      const user = new User({ email: email, password: hashPassword });
      await user.save();

      await fileService.createDir(new File({ user: user.id, name: "" }));

      return res.json({ message: "User was created" });
    } catch (error) {
      res.send({ message: "Server error login" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email not found" });
    }

    const isPassValid = bcrypt.compareSync(password, user.password);

    if (!isPassValid) {
      return res.status(400).json({ message: "Invalid password or email" });
    }

    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
      message: "Successfully login",
    });
  } catch (error) {
    res.send({ message: "Server error login" });
  }
});

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
      message: "Successfully auth",
    });
  } catch (error) {
    res.send({ message: "Server error auth" });
  }
});

module.exports = router;
