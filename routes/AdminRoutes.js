import express from "express"
import AdminAuthController from "../controller/admin/AdminAuthController.js"
import checkUserAuth from "../middleware/adminAuth.js"
import { multiplePlanDataUpload, multipleUserDataUpload } from "./multerRoutes.js"
import PlanController from "../controller/admin/PlansController.js"
import OrderController from "../controller/admin/OrderController.js"
import WithdrawalRequestController from "../controller/admin/WithdrawlRequestController.js"

const router = express.Router()


//admin auth
router.post("/register", AdminAuthController.RegisterUser)
router.post("/login", AdminAuthController.LoginAdmin)
router.get("/admin-profile", checkUserAuth, AdminAuthController.GetAdminProfile)
router.put("/update-profile", checkUserAuth, multipleUserDataUpload, AdminAuthController.UpdateAdminprofile)
router.put("/update-profile-pic", checkUserAuth, multipleUserDataUpload, AdminAuthController.UpdateProfilePic)
router.put("/change-password", checkUserAuth, multipleUserDataUpload, AdminAuthController.ChangePassword)


//plans
router.post("/create-plan", multiplePlanDataUpload, checkUserAuth, PlanController.CreatePlan)
router.get("/get-all-plan", checkUserAuth, PlanController.GetAllPlans)
router.get("/get-plan/:id", checkUserAuth, PlanController.GetPlanById)
router.put("/update-plan/:id", multiplePlanDataUpload, checkUserAuth, PlanController.UpdatePlan)
router.delete("/delete-plan/:id", checkUserAuth, PlanController.DeletePlan)

// all-users
router.get("/all-user", checkUserAuth, AdminAuthController.GetAllUsers)

//orders
router.get("/all-order", checkUserAuth, OrderController.GetAllOrders)
router.put("/update-status/:id", checkUserAuth, OrderController.UpdateStatus)

// withdrawl
router.get("/all-request", checkUserAuth, WithdrawalRequestController.GetAllWithdrawalRequests)
router.put("/approve-request", checkUserAuth, WithdrawalRequestController.ApproveRequest)


export default router