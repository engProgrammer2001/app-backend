import mongoose from "mongoose"
import SequenceModel from "./SequenceModel.js"


const OrderSchema = mongoose.Schema(
    {
        id: Number,
        plan_id: {
            type: mongoose.Schema.Types.Number,
            ref: "Plan",
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.Number,
            ref: "User",
            required: true
        },
        order_id: {
            type: Number,
            required: true
        },
        transaction_id: {
            type: String,
            required: true
        },
        quantity_purchased: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'successfull', "rejected", "expired"]
        },
        deleted_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: {},
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


OrderSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Order");
    }
})

async function getNextSequenceValue(modelName) {
    let sequence = await SequenceModel.findOneAndUpdate(
        { modelName: modelName },
        { $inc: { sequenceValue: 1 } },
        { upsert: true, new: true }
    );
    return sequence.sequenceValue;
}

const Order = mongoose.model("Order", OrderSchema)

export default Order;