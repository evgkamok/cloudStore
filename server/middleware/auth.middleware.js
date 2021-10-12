const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (token === "null") {
      return res.status(401).json({ message: "Token not found" });
    }

    const decoded = jwt.verify(token, config.get("secretKey"));

    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Error middleware" });
  }
};


