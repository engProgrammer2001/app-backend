import mongoose from "mongoose";

const SequenceSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
  sequenceValue: { type: Number, default: 1 }
});

const SequenceModel = mongoose.model('Sequence', SequenceSchema);

export default SequenceModel