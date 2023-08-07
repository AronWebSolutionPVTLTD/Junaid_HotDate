const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema({
    image: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: true },
    maleAge: { type: String, required: true },
    femaleAge: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate :{ type: String, required: true},
    interested: { type: String, enum: ['male', 'female'] },
    created_by:{type: mongoose.Schema.Types.ObjectId,ref: "User"}
});

const travel = mongoose.model("travel", travelSchema);

module.exports = travel;