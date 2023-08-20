import mongoose from "mongoose";

const roomsSchema=mongoose.Schema({
    message:String,
    name:String
})

export default  mongoose.model("rooms",roomsSchema);
