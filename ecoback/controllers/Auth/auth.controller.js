const BaseError = require("../../errors/base.error");
const {AuthService} = require("../../services/index.service");


class AuthController {
  async register(req, res, next) {
    try {

      const data = await AuthService.register(req, req.body);
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
  /**
 * Login Controller - Foydalanuvchi kirishini boshqarish
 */
async login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login(req, username, password);

    // Agar service qatlami xatolik qaytarsa (status: false)
    if (!result.status) {
      return res.status(400).json({
        success: false,
        message: result.msg
      });
    }

    // Muvaffaqiyatli bo'lsa Cookie o'rnatish
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Refresh tokenni olib tashlab, qolganini yuboramiz
    const { refreshToken, ...finalData } = result;

    return res.status(200).json({
      success: true,
      message: result.msg,
      data: finalData
    });

  } catch (error) {
    next(error);
  }
}
  async update(req, res, next) {
    try {
      const data = await AuthService.update(req, req.body);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
  async activation(req, res, next) {
    try {
      const userId = req.params.id;
      await AuthService.activation(req, userId);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await AuthService.logout(req, refreshToken);
      res.clearCookie("refreshToken");
      return res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const data = await AuthService.refresh(req, refreshToken);
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const data = await AuthService.getUsers(req);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
