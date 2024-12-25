import mongoose from "mongoose"
import SequenceModel from "./SequenceModel.js"


const BankDetailsSchema = mongoose.Schema(
    {
        id: Number,
        user_id: {
            type: mongoose.Schema.Types.Number,
            ref: "User",
            required: true
        },
        account_number: {
            type: String,
            required: true,
        },
        bank_name: {
            type: String,
            required: true,
        },
        ifsc_code: {
            type: String,
            required: true,
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


BankDetailsSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("BankDetails");
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

const BankDetails = mongoose.model("BankDetails", BankDetailsSchema)

export default BankDetails;