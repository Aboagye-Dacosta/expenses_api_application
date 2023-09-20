const jwt = require("jsonwebtoken");

const SECRETE_KEY = process.env.SECRETE_KEY;

function verifyToken(req, res, next) {
  const token = req.headers["x-auth"] || req.query?.token || req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token not provided", status: 1 });
  }

  jwt.verify(token, SECRETE_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token", status: 1 });
    }

    req.user = decoded.sub;
    next();
  });
}

function generateToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: "1d",
  };

  const token = jwt.sign(payload, SECRETE_KEY, options);

  return token;
}

module.exports = {
  verifyToken,
  generateToken,
};
