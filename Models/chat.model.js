import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    rollno: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: String,
        required: false,
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
