import Order from "../../src/models/OrderModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/UserModel.js";
import Plans from "../../src/models/planModal.js";
import transporter from "../../config/transporter.js";

class OrderController {
    //all orders
    static GetAllOrders = async (req, resp) => {
        try {
            const user = req.user
            const base_url = `${req.protocol}://${req.get("host")}`;

            const orders = await Order.find().lean()
            if (!orders && orders.length < 1) {
                return handleResponse(404, "No Orders Found", {}, resp)
            }

            for (const key of orders) {
                if (key && key.plan_id) {
                    const planData = await Plans.findOne({ id: key.plan_id })
                    if (planData && planData.featured_image) {
                        key.featured_image = `${base_url}/${planData.featured_image}`
                    }
                    key.plan_id = planData
                }
            }
            return handleResponse(200, "All orders fetched successfully", orders, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    static UpdateStatus = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const { status } = req.body;

            ;


            const orderDetail = await Order.findOne({ id: id })
            const userData = await User.findOne({ id: orderDetail?.user_id })

            if (!orderDetail) {
                return handleResponse(404, "Order not found", {}, resp)
            }

            orderDetail.status = status;
            await orderDetail.save()

            const demo = await transporter.sendMail({
                from: 'testdjango805@gmail.com',
                to: userData.email,
                subject: "Order Successfully",
                html: `Your order is approved and for tomorrow onwards you are going to get your daily income.s`,
            })

            console.log("demo", demo);


            return handleResponse(200, "Order status updated successfully", {}, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }
}

export default OrderController;