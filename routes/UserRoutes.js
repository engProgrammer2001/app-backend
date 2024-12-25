import express from 'express';
import UserAuthController from '../controller/user/UserAuthController.js';
import checkoutAuth from '../middleware/userAuth.js';
import { multipleUserDataUpload } from './multerRoutes.js';
import PlanController from '../controller/user/PlanController.js';
import BankDetailConreoller from '../controller/user/BankAccountsController.js';
import OrderController from '../controller/user/OrderController.js';
import WithdrawlRequestController from '../controller/user/WithdrawlRequestController.js';


const router = express.Router()


//authentication related routes
router.post("/register", UserAuthController.RegisterUser)
router.post("/verify-user", UserAuthController.VerifyUser)
router.post("/resend-otp", UserAuthController.ResendOTP)
router.post("/login", UserAuthController.LoginUser)
router.put("/change-forgot-password", UserAuthController.ChangeForGotPassword)
router.put("/reset-password", checkoutAuth, UserAuthController.ResetPassword)
router.put("/update-profile", checkoutAuth, multipleUserDataUpload, UserAuthController.UpdateUserprofile)
router.put("/update-profile-pic", checkoutAuth, multipleUserDataUpload, UserAuthController.UpdateProfilePic)
router.get("/get-user", checkoutAuth, UserAuthController.GetUserProfile)

//plans
router.get("/all-plans", PlanController.GetAllPlans)
router.get("/get-plan/:id", PlanController.GetSinglePlan)

//bank details
router.post("/add-bank-account", checkoutAuth, BankDetailConreoller.AddBankDetail)
router.put("/edit-bank-detail", checkoutAuth, BankDetailConreoller.EditBankDetail)
router.delete("/delete-bank-detail/:id", checkoutAuth, BankDetailConreoller.DeleteBankDetai)
router.get("/get-bank-accounts", checkoutAuth, BankDetailConreoller.GetAllBankDetails)

// wallet
router.get("/get-wallet-details", checkoutAuth, BankDetailConreoller.GetWalletDetails)

//order
router.post("/create-order", checkoutAuth, OrderController.CreateOrder)
router.get("/get-order", checkoutAuth, OrderController.GetUserOrder)
router.get("/get-order-detail/:id", checkoutAuth, OrderController.GetSingleOrderDetail)

//withdrawl request
router.post("/create-request", checkoutAuth, WithdrawlRequestController.Createrequest)
router.get("/get-all-request", checkoutAuth, WithdrawlRequestController.GetAllRequest)



export default router