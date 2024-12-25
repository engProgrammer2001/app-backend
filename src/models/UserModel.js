import mongoose from "mongoose";
import SequenceModel from "./SequenceModel.js";

const UserSchema = mongoose.Schema(
    {
        id: Number,
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        phone_number: {
            type: String,
            default: null
        },
        user_code: {
            type: String,
            default: null
        },
        email: {
            type: String,
            required: true
        },
        profile_pic: {
            type: String,
            default: null
        },
        dob: {
            type: String,
            default: null
        },
        otp: {
            type: Number,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: {},
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)



UserSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("User");
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

const User = mongoose.model("User", UserSchema)

export default User;