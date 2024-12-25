import Order from "../../src/models/OrderModel.js";
import handleResponse from "../../config/http-response.js";
import Plans from "../../src/models/planModal.js";
import transporter from "../../config/transporter.js";
import User from "../../src/models/UserModel.js";


class OrderController {
    //create order
    static CreateOrder = async (req, resp) => {
        try {
            const user = req.user;

            const { plan_id, transaction_id, quantity_purchased } = req.body

            if (!plan_id || !transaction_id || !quantity_purchased) {
                return handleResponse(400, "All fields are required", {}, resp)
            }

            const planData = await Plans.findOne({ id: plan_id })

            if (!planData) {
                return handleResponse(404, "NPlan not found", {}, resp)
            }

            const existingOrder = await Order.find({ plan_id: plan_id, user_id: user.id })
            if (existingOrder.length > planData?.purchase_limit) {
                return handleResponse(400, "You have already purchased this plan", {}, resp)
            }

            if (quantity_purchased > planData?.purchase_limit) {
                return handleResponse(400, "You can't purchase more than your plan's limit", {}, resp)
            }


            const orderId = Math.floor(100000 + Math.random() * 900000);

            const order = new Order({
                user_id: user.id,
                plan_id: plan_id,
                transaction_id: transaction_id,
                quantity_purchased: quantity_purchased,
                order_id: orderId,
                status: "pending",
            })

            await order.save()

            await transporter.sendMail({
                from: 'testdjango805@gmail.com',
                to: user.email,
                subject: "Verification OTP",
                html: `Your Order is  placed ,ordered Id:${orderId}`,
            })

            return handleResponse(201, "Order created successfully", order, resp)

        } catch (err) {
            console.log("err", err);

            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get all orders
    static GetUserOrder = async (req, resp) => {
        try {
            const user = req.user;
            const AllOrders = await Order.find({ user_id: user.id }).lean();

            if (!AllOrders || AllOrders.length < 1) {
                return handleResponse(200, "No Order Data Available", {}, resp);
            }

            const base_url = `${req.protocol}://${req.get("host")}`;

            // Use Promise.all to fetch plan and user data in parallel
            await Promise.all(
                AllOrders.map(async (order) => {
                    if (order.plan_id) {
                        const planData = await Plans.findOne({ id: order.plan_id }).lean();
                        if (planData && planData.featured_image) {
                            planData.featured_image = `${base_url}/${planData.featured_image}`;
                        }
                        // Attach plan data to order
                        order.plan_data = planData;
                    }

                    if (order.user_id) {
                        const userData = await User.findOne({ id: order.user_id }, "-password").lean();
                        if (userData && userData.profile_pic) {
                            userData.profile_pic = `${base_url}/${userData.profile_pic}`;
                        }
                        // Attach user data to order
                        order.user_data = userData;
                    }
                })
            );

            return handleResponse(200, "User Order", AllOrders, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };


    static GetSingleOrderDetail = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const base_url = `${req.protocol}://${req.get("host")}`;


            const orderData = await Order.findOne({ id: id, user_id: user.id }).lean();
            if (!orderData) {
                return handleResponse(404, "Order Not Found", {}, resp);
            }

            if (orderData.plan_id) {
                const planData = await Plans.findOne({ id: orderData.plan_id }).lean();
                if (planData) {
                    if (planData.featured_image) {
                        planData.featured_image = `${base_url}/${planData.featured_image}`;
                    }
                    orderData.plan_data = planData;
                } else {
                    return handleResponse(404, "Plan Not Found", {}, resp);
                }
            }

            const userData = await User.findOne({ id: orderData.user_id }, "-password").lean();
            if (userData) {
                if (userData.profile_pic) {
                    userData.profile_pic = `${base_url}/${userData.profile_pic}`;
                }
                orderData.user_data = userData;
            }

            return handleResponse(200, "Order Fetched Successfully", orderData, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };

}

export default OrderController;