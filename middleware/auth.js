const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token provided" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token not valid" });
  }
}
