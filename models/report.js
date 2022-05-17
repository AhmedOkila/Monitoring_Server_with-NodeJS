const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reportSchema = new Schema({
    checkId: {
        type: Schema.Types.ObjectId,
        ref: "Check",
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    availability: {
        type: Number,
        required: true,
        default: 0,
    },
    outages: {
        type: Number,
        default: 0,
    },
    downtime: {
        type: Number,
        default: 0,
    },
    uptime: {
        type: Number,
        default: 0,
    },
    responseTime: {
        type: String,
        default: 0,
    },
    history: {
        type: [String],
        default: [],
    },
});

module.exports = mongoose.model('Report', reportSchema);
