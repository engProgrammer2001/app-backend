import mongoose from "mongoose";
import SequenceModel from "./SequenceModel.js";
const RoleModel = mongoose.Schema(
    {
        id: Number,
        name: {
            type: String,
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

RoleModel.pre("save", async function (next) {
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


const Role = mongoose.model("Role", RoleModel)
export default Role;