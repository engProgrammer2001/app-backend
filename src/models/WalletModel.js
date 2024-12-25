import mongoose from "mongoose";
import SequenceModel from "./SequenceModel.js";
const WalletModel = mongoose.Schema(
    {
        id: Number,
        balance: {
            type: Number,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.Number,
            ref: "User",
            required: true
        }

    },
    {
        timestamps: {},
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)

WalletModel.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Role");
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


const Wallet = mongoose.model("Wallet", WalletModel)
export default Wallet;