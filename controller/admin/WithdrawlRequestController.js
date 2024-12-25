import WithdrawlRequest from "../../src/models/WithDrawlRequest.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/UserModel.js";
import Wallet from "../../src/models/WalletModel.js";
import BankDetails from "../../src/models/BankDetails.js";

class WithdrawalRequestController {
    //get all withdrawal requests
    static GetAllWithdrawalRequests = async (req, resp) => {
        try {
            const user = req.user;
            const withdrawalRequests = await WithdrawlRequest.find().lean();
            const base_url = `${req.protocol}://${req.get("host")}`;

            if (!withdrawalRequests && withdrawalRequests.length < 1) {
                return handleResponse(200, "No withdrawl request found", {}, resp)
            }

            for (const key of withdrawalRequests) {
                if (key && key.back_account_id) {
                    console.log("key.back_account_id", key.back_account_id);

                    const BankDetailData = await BankDetails.findOne({ id: key.back_account_id })
                    key.back_account_id = BankDetailData
                }
                if (key && key?.user_id) {
                    const userData = await User.findOne({ id: key.user_id })
                    if (userData && userData.profile_pic) {
                        userData.profile_pic = `${base_url}/${userData.profile_pic}`
                    }
                    key.user_data = userData;
                }
            }

            return handleResponse(200, "Withdrawal Requests", withdrawalRequests, resp)


        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

    //approve request
    static ApproveRequest = async (req, resp) => {
        try {
            const user = req.user;
            const { id, status, reason, transaction_id } = req.body;
            const withdrawalRequest = await WithdrawlRequest.findOne({ id: id });

            if (!withdrawalRequest) {
                return handleResponse(404, "Withdrawal Request Not Found")
            }

            if (status === "rejected" && !reason) {
                return handleResponse(400, "Reason for rejection is rejection required")
            } else if (status === "approved" && !transaction_id) {
                return handleResponse(400, "transaction id is required")
            } else {
                withdrawalRequest.status = status;
                withdrawalRequest.reason = reason || null;
                withdrawalRequest.transaction_id = transaction_id || null;
            }

            await withdrawalRequest.save();

            const walletData = await Wallet.findOne({ user_id: withdrawalRequest.user_id })
            console.log("walletData",walletData);
            
            if (!walletData) {
                return handleResponse(404, "User's wallet not found")
            }

            walletData.balance -= withdrawalRequest.amount
            await walletData.save();

            return handleResponse(200, "OK", {}, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }
}

export default WithdrawalRequestController;