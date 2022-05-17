const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const checkSchema = new Schema({
    ownedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    protocol: {
        type: String,
        enum: ["HTTP", "HTTPS", "TCP"],
        required: true,
    },
    path: {
        type: String,
        default: "/",
    },
    port: {
        type: Number,
        default: "",
    },
    webhook: {
        type: String,
        default: "",
    },
    timeout: {
        type: Number,
        default: 5, // 5 sec
    },
    interval: {
        type: Number,
        default: 10, //  10 mintues
    },
    threshold: {
        type: Number,
        default: 1,
    },
    authentication: {
        type: Object,
        default: null,
    },
    httpHeaders: {
        type: Object,
        default: null,
    },
    assert: {
        type: Object,
        default: null,
    },
    tags: {
        type: [String],
        default: [],
    },
    ignoreSSL: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Check', checkSchema);
