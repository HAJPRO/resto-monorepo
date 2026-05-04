import api from "../../helpers/api";

const AuthService = {
    /**
     * Tizimga kirish
     * @param {Object} data - {username, password, server}
     */
    Login(data) {
        const url = "auth/login";
        return api.post(url, data);
    },

    // Kelajakda boshqa metodlar:
    // Logout() { ... },
    // RefreshToken() { ... }
};

export default AuthService;