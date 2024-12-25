import handleResponse from "../../config/http-response.js";
import User from "../../src/models/UserModel.js";
import bcrypt from "bcrypt";
import Role from "../../src/models/Rolemodel.js";
import jwt from "jsonwebtoken";


class AdminAuthController {
    //register admin
    static RegisterUser = async (req, resp) => {
        try {
            const { first_name, last_name, email, password, confirm_password } = req.body;

            if (!first_name || !last_name || !email || !password || !confirm_password) {
                return handleResponse(400, "All fields are required", {}, resp)
            }

            if (password !== confirm_password) {
                return handleResponse(400, "Passwords do not match", {}, resp)
            }

            const userProfile = await User.findOne({ email: email });

            if (userProfile) {
                return handleResponse(400, "user already exist.", {}, resp)
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)


            const user = new User(
                {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: hashedPassword
                }
            )

            await user.save()


            const newRole = new Role({
                name: "Admin",
                user_id: user?.id
            })

            await newRole.save()


            return handleResponse(201, "User registered successfully", user, resp)

        } catch (err) {
            console.log("err", err);

            return handleResponse(500, err.message, {}, resp)
        }
    }

    //login
    static LoginAdmin = async (req, resp) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return handleResponse(400, "All fields are required", {}, resp);
            }

            const user = await User.findOne({ email: email });
            if (!user) {
                return handleResponse(404, "User not found", {}, resp);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return handleResponse(401, "Invalid credentials", {}, resp);
            }

            const role = await Role.findOne({ user_id: user.id });
            if (!role || role.name !== "Admin") {
                return handleResponse(401, "Unauthorized", {}, resp);
            }

            const token = jwt.sign(
                {
                    userID: user.id,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "2d" }
            );

            return handleResponse(200, "Logged in successfully", token, resp);

        } catch (err) {
            console.log("err", err);
            return handleResponse(500, err.message, {}, resp);
        }
    };

    //get admin profile
    static GetAdminProfile = async (req, resp) => {
        try {
            const user = req.user;

            const base_url = `${req.protocol}://${req.get("host")}`;

            const userData = await User.findOne({ id: user?.id }, "-password")
            if (!userData) {
                return handleResponse(404, "User Not Found", {}, resp)
            }

            if (userData && userData?.profile_pic) {
                userData.profile_pic = `${base_url}/${userData.profile_pic}`
            }
            return handleResponse(200, "User Profile", userData, resp)


        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

    //update admin profile
    static UpdateAdminprofile = async (req, resp) => {
        try {
            const user = req.user;
            const userData = req.body;
            const files = req.files

            console.log("req.body", req.body);


            const userProfile = await User.findOne({ id: user?.id })
            if (!userProfile) {
                return handleResponse(404, "User Not Found", {}, resp)
            }

            for (const key in userData) {
                if (Object.hasOwnProperty.call(userData, key)) {
                    if (userData[key] === "null") {
                        userProfile[key] = null;
                    } else {
                        userProfile[key] = userData[key];
                    }
                }
            }


            if (files && files.profile_pic) {
                userProfile.profile_pic = files.profile_pic[0].path;
            }


            await userProfile.save()

            return handleResponse(200, "User Profile Updated", {}, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //update profile pic
    static UpdateProfilePic = async (req, resp) => {
        try {
            const user = req.user;

            const userData = await User.findOne({ id: user.id })
            const files = req.files

            if (!userData) {
                return handleResponse(404, "User Not Found", {}, resp)
            }

            if (files && files.profile_pic) {
                userData.profile_pic = files.profile_pic[0].path;
            }

            await userData.save()
            return handleResponse(200, "profile Pic uploaded successfully", {}, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //change passsword
    static ChangePassword = async (req, resp) => {
        try {
            const user = req.user;
            const { new_password, confirm_password } = req.body;

            if (new_password !== confirm_password) {
                return handleResponse(400, "Passwords do not match", {}, resp)
            }

            const userData = await User.findOne({ id: user.id })

            if (!userData) {
                return handleResponse(404, "User not found", {}, resp)
            }

            const isMatch = await bcrypt.compare(new_password, userData?.password)

            if (!isMatch) {
                return handleResponse(401, "Invalid current password", {}, resp)
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(new_password, salt)
            userData.password = hashedPassword
            await userData.save()

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get all users
    //all-users
    static GetAllUsers = async (req, resp) => {
        try {
            const user = req.user;
            const users = await User.find()
            const base_url = `${req.protocol}://${req.get("host")}`;
            if (!users && users.length < 1) {
                return handleResponse(404, "No users found", {}, resp)
            }

            for (const key of users) {
                if (key && key?.profile_pic) {
                    key.profile_pic = `${base_url}/${key?.profile_pic}`
                }
            }
            return handleResponse(200, "All Users", users, resp)
        } catch (err) {
            console.log("err",err);
            
            return handleResponse(500, err.message, {}, resp)
        }
    }
}

export default AdminAuthController;