import jwt from 'jsonwebtoken'

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            _id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' })
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            _id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );
};

export { generateAccessToken, generateRefreshToken };