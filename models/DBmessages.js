import mongoose from "mongoose";

const messagesSchema=mongoose.Schema({
    roomID:String,
    message:String,
    name:String,
    timestamp:String,
    received: Boolean
})

export default  mongoose.model("messages",messagesSchema);

