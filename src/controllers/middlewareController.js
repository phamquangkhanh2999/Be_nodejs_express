const jwt = require('jsonwebtoken');

const middlewareController = {
  verifyToken: (req, res, next) => {
    // const token = req.headers.token;
    const token = req.headers['authorization'];
    if (token) {
      const accessToken = token.split(' ')[1];

      jwt.verify(accessToken, process.env.JWT_KEY_TOKEN, (err, user) => {
        if (err) {
          res.status(401).json('Token is not valid');
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You're not authenticated");
    }
  },
  verifyTokenAndAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.admin) {
        next();
      } else {
        res.status(401).json("You're not allowed to delete other");
      }
    });
  },
};

module.exports = middlewareController;
