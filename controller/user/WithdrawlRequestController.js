import WithdrawlRequest from "../../src/models/WithDrawlRequest.js";
import handleResponse from "../../config/http-response.js";
import Wallet from "../../src/models/WalletModel.js"
import BankDetails from "../../src/models/BankDetails.js";


class WithdrawlRequestController {
    //create request
    static Createrequest = async (req, resp) => {
        try {
            const user = req.user;
            const { amount, back_account_id } = req.body;

            if (!amount || !back_account_id) {
                return handleResponse(400, "All fields are required", {}, resp)
            }

            const Walletinfo = await Wallet.findOne({ user_id: user.id })

            if (!Walletinfo) {
                return handleResponse(404, "No wallet found", {}, resp)
            }


            if (amount > Walletinfo.balance) {
                return handleResponse(400, "Insufficient balance", {}, resp)
            }

            const withdrawRequest = new WithdrawlRequest({
                user_id: user.id,
                amount,
                back_account_id,
                status: "pending"
            })

            await withdrawRequest.save();

            return handleResponse(201, "Withdrawal request created successfully", withdrawRequest, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get all request
    static GetAllRequest = async (req, resp) => {
        try {
            const { status } = req.query;
            const user = req.user;

            const query = { user_id: user.id };
            if (status) {
                query.status = status;
            }

            const withdrawRequests = await WithdrawlRequest.find(query);

            if (withdrawRequests.length < 1) {
                return handleResponse(200, "No withdrawal request found", {}, resp);
            }

            // Fetch bank details for each withdrawal request and attach them
            for (const request of withdrawRequests) {
                const bankDetailsData = await BankDetails.findOne({ id: request.back_account_id });
                if (bankDetailsData) {
                    request.back_account_id = bankDetailsData;
                }
            }

            return handleResponse(200, "All withdrawal request data", withdrawRequests, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };


}

export default WithdrawlRequestController;