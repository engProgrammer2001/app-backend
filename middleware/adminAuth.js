import jwt from "jsonwebtoken";
import User from "../src/models/UserModel.js";
import Role from "../src/models/Rolemodel.js";
import handleResponse from "../config/http-response.js";

const checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(" ")[1];
            // Verify token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Find user by ID

            const user = await User.findOne({ id: userID }).select("-password");

            const role = await Role.findOne({ user_id: user.id });

            if (!role || role.name !== "Admin") {
                return handleResponse(401, "Unauthorized Admin", {}, res);
            }

            req.user = user;
            next();
        } catch (error) {
            console.log("error", error);

            return handleResponse(401, `Unauthorized User : ${error}`, {}, res);
        }
    } else {
        if (!token) {
            return handleResponse(401, "Unauthorized User, No Token", {}, res);
        }
    }
};

export default checkUserAuth;
