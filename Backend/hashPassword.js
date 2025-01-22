const bcrypt = require("bcrypt");

const saltRounds = 8;

const hashPassword = async(password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const verifyPassword = async (password,hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

module.exports = { hashPassword, verifyPassword };
