import jwt from 'jsonwebtoken';


const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization').split(" ")[1];

        if (!token) {
            return res.status(403).json({ message: "No token provided. Authorization denied." });
        }


        const verified = jwt.verify(token, process.env.SECRET_KEY);
        if (!verified) {
            return res.status(401).json({ message: "Token verification failed." });
        }

        req.user = verified;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error." });
    }
};
export default authMiddleware;
