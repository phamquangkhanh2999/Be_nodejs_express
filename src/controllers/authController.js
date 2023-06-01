const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = [];
const authController = {
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      const user = await newUser.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json('Lỗi server');
    }
  },
  generateAccessToken: (user, key, date) => {
    return jwt.sign(
      {
        id: user['_id'],
        admin: user.admin,
      },
      key,
      {
        expiresIn: date,
      }
    );
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        res.status(404).json('Wrong username');
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(404).json('Wrong password');
      }
      if (user && password) {
        const accessToken = authController.generateAccessToken(
          user,
          process.env.JWT_KEY_TOKEN,
          '24h'
        );
        const refreshToken = authController.generateAccessToken(
          user,
          process.env.JWT_KEY_REFRESH_TOKEN,
          '365d'
        );
        refreshTokens.push(refreshToken);
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          path: '/',
          sameSite: 'strict',
        });
        const { password, ...dataUser } = user['_doc'];
        res.status(200).json({
          ...dataUser,
          accessToken,
        });
      }
    } catch (error) {
      res.status(500).json('Lỗi server');
    }
  },
  requestRefreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return res.status(401).json("You're not authenticated");
      if (!refreshTokens.includes(refreshToken))
        return res.status(401).json('Refresh token  is not valid');
      jwt.verify(
        refreshToken,
        process.env.JWT_KEY_REFRESH_TOKEN,
        (err, user) => {
          if (err) {
            console.log(err);
          }
          refreshTokens = refreshTokens.filter(
            (token) => token !== refreshToken
          );
          const newRefreshToken = authController.generateAccessToken(
            user,
            process.env.JWT_KEY_REFRESH_TOKEN,
            '365d'
          );
          refreshTokens.push(newRefreshToken);
          const newAccessToken = authController.generateAccessToken(
            user,
            process.env.JWT_KEY_TOKEN,
            '24h'
          );
          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: '/',
            sameSite: 'strict',
          });
          res.status(200).json({
            accessToken: newAccessToken,
          });
        }
      );
    } catch (error) {
      res.status(500).json('Lỗi server');
    }
  },
  logoutUser: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    res.clearCookie('refreshToken');
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json('Logger out successfully');
  },
};

module.exports = authController;
