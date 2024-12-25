import handleResponse from "../../config/http-response.js";
import User from "../../src/models/UserModel.js";
import Role from "../../src/models/Rolemodel.js";
import Wallet from "../../src/models/WalletModel.js";
import transporter from "../../config/transporter.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";



class UserAuthController {
    //Register User
    static RegisterUser = async (req, resp) => {
        try {
            const { first_name, last_name, email, password, confirm_password } = req.body;

            if (!first_name || !last_name || !email || !password || !confirm_password) {
                return handleResponse(400, "All fields are required", {}, resp);
            }

            if (password !== confirm_password) {
                return handleResponse(400, "Passwords do not match", {}, resp);
            }

            if (password.length < 8) {
                return handleResponse(400, "Password must be at least 8 characters long", {}, resp);
            }

            const userProfile = await User.findOne({ email });
            if (userProfile) {
                return handleResponse(400, "User already exists.", {}, resp);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const genotp = Math.floor(100000 + Math.random() * 900000);

            const user = new User({
                first_name,
                last_name,
                email,
                password: hashedPassword,
                otp: genotp
            });

            await user.save();

            try {
                await transporter.sendMail({
                    from: 'testdjango805@gmail.com',
                    to: user.email,
                    subject: "Verification OTP",
                    html: `<p>Here is your account verification OTP: <strong>${genotp}</strong></p>`,
                });
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                return handleResponse(500, "Failed to send verification email", {}, resp);
            }

            const newRole = new Role({
                name: "User",
                user_id: user.id,
            });
            await newRole.save();

            const newWallet = new Wallet({
                user_id: user.id,
                balance: 0,
            });
            await newWallet.save();

            return handleResponse(201, "User registered successfully", user, resp);

        } catch (err) {
            console.error("Error:", err);
            return handleResponse(500, "An error occurred during registration", {}, resp);
        }
    }
    //verify User
    static VerifyUser = async (req, resp) => {
        try {
            const { email, otp, type } = req.body;

            // Validate fields
            if (!email || !otp) {
                return handleResponse(400, "All fields are required", {}, resp);
            }

            // Find user by email
            const userData = await User.findOne({ email });
            if (!userData) {
                return handleResponse(404, "User not found", {}, resp);
            }

            // Check OTP
            if (userData.otp !== parseInt(otp, 10)) {
                return handleResponse(400, "Invalid OTP", {}, resp);
            }

            // Verify user
            if (type === "account") {
                userData.isVerified = true;
                await userData.save();

                return handleResponse(200, "User verified successfully", {}, resp);
            } else {
                return handleResponse(200, "You can Change Your Password Now", {}, resp);
            }

        } catch (err) {
            console.error("Verification Error:", err);
            return handleResponse(500, "An error occurred during verification", {}, resp);
        }
    }

    //resend OTP
    static ResendOTP = async (req, resp) => {
        try {
            const { email } = req.body;

            // Validate email
            if (!email) {
                return handleResponse(400, "Email is required", {}, resp);
            }

            // Find user by email
            const userData = await User.findOne({ email });
            if (!userData) {
                return handleResponse(404, "User not found", {}, resp);
            }

            // Generate a new 6-digit OTP
            const newOtp = Math.floor(100000 + Math.random() * 900000);
            userData.otp = newOtp;

            // Save the new OTP to the user record
            await userData.save();

            // Send the new OTP via email
            try {
                await transporter.sendMail({
                    from: 'testdjango805@gmail.com',
                    to: userData.email,
                    subject: "Your New Verification OTP",
                    html: `<p>Your new OTP for account verification is: <strong>${newOtp}</strong></p>`,
                });

                return handleResponse(200, "OTP has been resent successfully", {}, resp);

            } catch (emailError) {
                console.error("Error sending email:", emailError);
                return handleResponse(500, "Failed to send OTP email", {}, resp);
            }

        } catch (err) {
            console.error("Resend OTP Error:", err);
            return handleResponse(500, "An error occurred while resending OTP", {}, resp);
        }
    }

    //get otp
    static LoginUser = async (req, resp) => {
        try {
            const { email, password } = req.body;

            // Validate fields
            if (!email || !password) {
                return handleResponse(400, "Both fields are required", {}, resp);
            }

            // Find user by email
            const userData = await User.findOne({ email });
            if (!userData) {
                return handleResponse(404, "User not found", {}, resp);
            }

            // Check if user is verified
            if (!userData.isVerified) {
                return handleResponse(400, "User is not verified", {}, resp);
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, userData.password);
            if (!isMatch) {
                return handleResponse(400, "Invalid credentials", {}, resp);
            }

            // Generate JWT token
            if (!process.env.JWT_SECRET_KEY) {
                console.error("JWT Secret is missing in environment variables");
                return handleResponse(500, "Server error", {}, resp);
            }
            // console.log("process.env.JWT_SECRET_KEY", process.env.JWT_SECRET_KEY);

            const token = jwt.sign(
                {
                    userID: userData.id,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "2d" }
            );

            return handleResponse(200, "User logged in successfully", token, resp);

        } catch (err) {
            console.error("Login Error:", err);
            return handleResponse(500, "An error occurred during login", {}, resp);
        }
    }

    //change-forgot password
    static ChangeForGotPassword = async (req, resp) => {
        try {
            const { email, password, confirmPassword } = req.body;
            if (!email || !password || !confirmPassword) {
                return handleResponse(400, "All fields are required", {}, resp)
            }

            const userData = await User.findOne({ email: email })

            if (!userData) {
                return handleResponse(404, "User not found", {}, resp)
            }

            if (password !== confirmPassword) {
                return handleResponse(400, "Passwords do not match", {}, resp)
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            userData.password = hashedPassword
            await userData.save()
            return handleResponse(200, "Password changed successfully", {}, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    // reset password
    static ResetPassword = async (req, resp) => {
        try {
            const user = req.user;
            const { oldPassword, newPassword, ConfirmPassword } = req.body;

            console.log("req.body", req.body);


            if (!oldPassword || !newPassword || !ConfirmPassword) {
                return handleResponse(400, "All fields are required", {}, resp)
            }

            const userData = await User.findOne({ email: user.email })
            if (!userData) {
                return handleResponse(404, "User not found", {}, resp)
            }
            const isMatch = await bcrypt.compare(oldPassword, userData.password)
            if (!isMatch) {
                return handleResponse(400, "Old password is incorrect", {}, resp)
            }

            if (newPassword !== ConfirmPassword) {
                return handleResponse(400, "Passwords do not match", {}, resp)
            }
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt)
            userData.password = hashedPassword
            await userData.save()
            return handleResponse(200, "Password changed successfully", {}, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //update profile
    static UpdateUserprofile = async (req, resp) => {
        try {
            const user = req.user;
            const userData = req.body;
            const files = req.files

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

    //update user profile pic
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

    //get user profile
    static GetUserProfile = async (req, resp) => {
        try {
            const user = req.user;
            const base_url = `${req.protocol}://${req.get("host")}`;
            const userData = await User.findOne({ id: user.id }, "-password")

            if (!userData) {
                return handleResponse(404, "User Not Found", {}, resp)
            }

            if (userData && userData?.profile_pic) {
                userData.profile_pic = `${base_url}/${userData.profile_pic}`
            }
            return handleResponse(200, "User Profile", userData, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }
}


export default UserAuthController;