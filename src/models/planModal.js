import mongoose from "mongoose"
import SequenceModel from "./SequenceModel.js"


const PlanSchema = mongoose.Schema(
    {
        id: Number,
        name: {
            type: String,
            required: true,
        },
        sold_out_time: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        daily_income: {
            type: Number,
            required: true
        },
        validity_period: {
            type: Number,
            required: true
        },
        total_income: {
            type: Number,
            required: true
        },
        purchase_limit: {
            type: Number,
            required: true
        },
        percent: {
            type: Number,
            required: true
        },
        featured_image: {
            type: String,
            required: true
        },
        gallery_image: {
            type: Array,
            default: null
        },
        about_plan: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            required: true
        },
        created_by: {
            type: mongoose.Schema.Types.Number,
            ref: "User",
            required: true
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


PlanSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Plans");
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

const Plans = mongoose.model("Plans", PlanSchema)

export default Plans;