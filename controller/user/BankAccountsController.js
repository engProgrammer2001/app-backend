import BankDetails from "../../src/models/BankDetails.js";
import handleResponse from "../../config/http-response.js"
import User from "../../src/models/UserModel.js"
import Wallet from "../../src/models/WalletModel.js";


class BankDetailConreoller {
    //add bank detail 
    static AddBankDetail = async (req, resp) => {
        try {
            const user = req.user;

            const { account_number, bank_name, ifsc_code } = req.body;

            if (!account_number || !bank_name || !ifsc_code) {
                return handleResponse(400, "Missing required fields", {}, resp)
            }

            const bankDetail = new BankDetails({
                user_id: user.id,
                account_number,
                bank_name,
                ifsc_code
            })
            await bankDetail.save()

            return handleResponse(201, "Bank detail added successfully", bankDetail, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //edit bank detail
    static EditBankDetail = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const { account_number, bank_name, ifsc_code } = req.body;

            if (!account_number || !bank_name || !ifsc_code) {
                return handleResponse(400, "Missing required fields", {}, resp);
            }

            const bankDetail = await BankDetails.findOneAndUpdate(
                { id: id, user_id: user.id },
                { account_number, bank_name, ifsc_code },
                { new: true }
            );

            if (!bankDetail) {
                return handleResponse(404, "Bank detail not found", {}, resp);
            }

            return handleResponse(200, "Bank detail updated successfully", bankDetail, resp);

        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };

    //remove daved bank data
    static DeleteBankDetai = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const bankData = await BankDetails.findOne({ id: id })
            if (!bankData) {
                return handleResponse(404, "Bank detail not found", {}, resp);
            }

            bankData.deleted_at = new Date()
            await bankData.save()
            return handleResponse(200, "Bank detail deleted successfully", {}, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

    //get all bank details
    static GetAllBankDetails = async (req, resp) => {
        try {
            const user = req.user;
            const bankData = await BankDetails.find({ user_id: user.id })
            if (bankData.length < 1) {
                return handleResponse(200, "No bank detail available", {}, resp);
            }

            return handleResponse(200, "All bank details", bankData, resp);

        } catch (error) {
            return handleResponse(500, error.message, {}, resp);
        }
    }

    //get wallter detaild
    static GetWalletDetails = async (req, resp) => {
        try {
            const user = req.user;
            const wallterData = await Wallet.findOne({ user_id: user.id })
            const base_url = `${req.protocol}://${req.get("host")}`;
            if (!wallterData) {
                return handleResponse(404, "Wallter not found", {}, resp);
            }

            if (user && user?.profile_pic) {
                const isComplete = user?.profile_pic?.startsWith("http")

                if (!isComplete) {
                    user.profile_pic = `${base_url}/${user?.profile_pic}`
                }
            }
            const newData = {
                user: user,
                wallet: wallterData
            }
            return handleResponse(200, "Wallter details", newData, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }
}


export default BankDetailConreoller;