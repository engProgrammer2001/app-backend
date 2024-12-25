import cron from "node-cron";
import User from "../src/models/UserModel.js";
import Order from "../src/models/OrderModel.js";
import Plans from "../src/models/planModal.js";
import Wallet from "../src/models/WalletModel.js";

cron.schedule("0 0 * * *", async () => {
    try {
        const allUsers = await User.find({ isVerified: true });

        if (allUsers.length < 1) {
            console.log("No verified users found.");
            return;
        }

        for (const user of allUsers) {
            const successfulOrders = await Order.find({ user_id: user.id, status: "successfull" });

            if (successfulOrders.length < 1) {
                continue;
            }

            for (const order of successfulOrders) {
                const planData = await Plans.findOne({ id: order.plan_id });

                if (!planData) {
                    continue;
                }

                const orderDate = new Date(order.updatedAt);
                const daysSincePurchase = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));

                if (daysSincePurchase < planData.validity_period) {
                    const walletData = await Wallet.findOne({ user_id: user.id });
                    walletData.balance += planData.daily_income * order.quantity_purchased;
                    await walletData.save();
                } else {
                    order.status = "expired";
                    await order.save();
                }
            }
        }

        console.log("Daily wallet update and order expiration check completed successfully.");
    } catch (error) {
        console.error("Error", error);
    }
});