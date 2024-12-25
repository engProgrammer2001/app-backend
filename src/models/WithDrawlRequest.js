import mongoose from "mongoose"
import SequenceModel from "./SequenceModel.js"


const WithdrawlRequestSchema = mongoose.Schema(
    {
        id: Number,
        user_id: {
            type: mongoose.Schema.Types.Number,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        back_account_id: {
            type: mongoose.Schema.Types.Number,
            ref: "BankDetails",
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "rejected", "approved"]
        },
        reason: {
            type: String,
            default: null
        },
        transaction_id: {
            type: String,
            default: null
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


WithdrawlRequestSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("WithdrawlRequest");
    }
    next()
})

async function getNextSequenceValue(modelName) {
    let sequence = await SequenceModel.findOneAndUpdate(
        { modelName: modelName },
        { $inc: { sequenceValue: 1 } },
        { upsert: true, new: true }
    );
    return sequence.sequenceValue;
}

const WithdrawlRequest = mongoose.model("WithdrawlRequest", WithdrawlRequestSchema)

export default WithdrawlRequest;