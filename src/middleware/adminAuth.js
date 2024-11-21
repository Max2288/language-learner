import User from '../models/User.js';

const authenticateAdmin = async (email, password) => {
    const user = await User.findOne({ username: email });
    if (user && await user.isValidPassword(password)) {
        if (user.role === 'admin') {
            return user;
        }
    }
    return null;
};

export default authenticateAdmin;