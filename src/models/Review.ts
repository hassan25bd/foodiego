import mongoose, { Schema, models, model } from "mongoose";

export interface ReviewDocument {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  merchantId: mongoose.Types.ObjectId;
  customerName: string;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    orderId: { type: String, required: true, index: true },
    merchantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "positive",
    },
  },
  { timestamps: true }
);

export const Review =
  (models.Review as mongoose.Model<ReviewDocument>) || model<ReviewDocument>("Review", ReviewSchema, "reviews");

export default Review;
