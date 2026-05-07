module.exports = class BaseError extends Error {
  status;
  errors;
  message;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;

    // Stack trace-ni saqlab qolish (xato aynan qayerda chiqqanini ko'rish uchun)
    Error.captureStackTrace(this, this.constructor);
  }

  // 400 - Noto'g'ri so'rov (Validatsiya xatolari uchun)
  static BadRequest(message, errors = []) {
    return new BaseError(400, message, errors);
  }

  // 401 - Avtorizatsiyadan o'tmagan
  static UnauthorizedError() {
    return new BaseError(401, "Foydalanuvchi tizimga kirmagan!");
  }

  // 403 - Taqiq (Masalan: Kassa ochilmagan holat uchun)
  static Forbidden(message = "Sizga bu amalni bajarish taqiqlangan!") {
    return new BaseError(403, message);
  }

  // 404 - Topilmadi
  static NotFound(message = "Ma'lumot topilmadi!") {
    return new BaseError(404, message);
  }

  // 500 - Serverdagi ichki xatolik
  static Internal(message = "Serverda kutilmagan xatolik yuz berdi!") {
    return new BaseError(500, message);
  }
};