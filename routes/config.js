const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb+srv://zhakadlet:asd123@cluster0.xm5sg97.mongodb.net/");

connect.then(() => {
    console.log("Connected successfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});

const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    balance:{
        type: Number,
        default: 1000
    },
    btc:{
        type:Number,
        default:0
    }
});

const collection = new mongoose.model("users", LoginSchema);
module.exports = collection;
