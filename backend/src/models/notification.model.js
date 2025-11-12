import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        // Either targeted to a single user...
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        // ...or broadcast to a role (e.g., 'rider')
        roleTarget: {
            type: String,
            enum: ["admin", "rider", "customer", "frontdesk", "front_desk", null],
            default: null,
        },
        type: {
            type: String,
            enum: [
                "order_status",
                "order_waiting_for_rider",
                "refund",
                "system",
            ],
            default: "system",
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;


