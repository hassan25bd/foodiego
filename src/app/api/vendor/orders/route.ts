import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/session";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Restaurant } from "@/models/Restaurant";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  const decoded = await verifySessionCookie(sessionCookie);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ uid: decoded.uid }).lean();
  if (!user || user.role !== "restaurant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await Restaurant.findOne({ userId: user._id }).lean();
  if (!restaurant) {
    return NextResponse.json([]);
  }

  const orders = await Order.find({ merchantId: restaurant._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const formattedOrders = orders.map((o) => {
    const items = (o.items || []).map((item) => ({
      id: (item as { _id?: { toString(): string } })._id?.toString() || "",
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image || "",
      addons: item.addons || [],
    }));

    return {
      id: o.orderId,
      status: o.status,
      timeAgo: formatTimeAgo(o.createdAt),
      customer: {
        name: o.customer?.name || "Unknown",
        phone: o.customer?.phone || "",
        address: o.customer?.address || "",
        orderCount: 0,
        avatar: "",
        email: o.customer?.email || "",
      },
      items,
      paymentMethod: o.paymentMethod || "cash",
      paymentStatus: o.paymentStatus || "pending",
      subtotal: o.subtotal || 0,
      deliveryFee: o.deliveryFee || 0,
      total: o.total || 0,
      createdAt: o.createdAt.toISOString(),
      notes: "",
    };
  });

  return NextResponse.json(formattedOrders);
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  const decoded = await verifySessionCookie(sessionCookie);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ uid: decoded.uid }).lean();
  if (!user || user.role !== "restaurant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await Restaurant.findOne({ userId: user._id }).lean();
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const body = await req.json();
  const { orderId, action } = body;

  if (!orderId || !action) {
    return NextResponse.json({ error: "Missing orderId or action" }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    accept: "preparing",
    reject: "rejected",
    ready: "ready",
    pickup: "picked_up",
    deliver: "delivered",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const order = await Order.findOneAndUpdate(
    { orderId, merchantId: restaurant._id },
    { status: newStatus },
    { new: true }
  ).lean();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    orderId,
    action,
    newStatus,
    message: `Order ${action} processed successfully`,
  });
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
