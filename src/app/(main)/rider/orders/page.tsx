"use client";

import {
  ArrowUpRight,
  Bike,
  CheckCircle2,
  Clock3,
  DollarSign,
  Filter,
  Package,
  Search,
  Timer,
  User,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import RiderShell from "@/components/rider/RiderShell";

type OrderStatus = "Available" | "Accepted" | "In Progress" | "Completed";

type Order = {
  id: string;
  restaurant: string;
  customer: string;
  pickup: string;
  delivery: string;
  distance: string;
  time: string;
  payout: string;
  status: OrderStatus;
};

const orders: Order[] = [
  {
    id: "ORD-9924",
    restaurant: "Burger Joint",
    customer: "Sarah M.",
    pickup: "Downtown Burger Joint",
    delivery: "123 Main Street",
    distance: "3.2 km",
    time: "18 min",
    payout: "$8.50",
    status: "Available",
  },
  {
    id: "ORD-9923",
    restaurant: "Luigi's Pizza",
    customer: "Michael R.",
    pickup: "Luigi's Pizza",
    delivery: "45 Oak Avenue",
    distance: "4.8 km",
    time: "24 min",
    payout: "$10.25",
    status: "Available",
  },
  {
    id: "ORD-9922",
    restaurant: "Tokyo Noodles",
    customer: "Emma K.",
    pickup: "Tokyo Noodles",
    delivery: "78 Park Road",
    distance: "2.7 km",
    time: "15 min",
    payout: "$7.75",
    status: "Accepted",
  },
  {
    id: "ORD-9921",
    restaurant: "Burger Joint",
    customer: "Sarah M.",
    pickup: "Burger Joint",
    delivery: "89 Lake Street",
    distance: "5.1 km",
    time: "28 min",
    payout: "$12.50",
    status: "In Progress",
  },
  {
    id: "ORD-9920",
    restaurant: "Taco House",
    customer: "David L.",
    pickup: "Taco House",
    delivery: "21 Hill Road",
    distance: "3.9 km",
    time: "20 min",
    payout: "$9.50",
    status: "Completed",
  },
  {
    id: "ORD-9919",
    restaurant: "Fresh Bowl",
    customer: "Olivia S.",
    pickup: "Fresh Bowl",
    delivery: "55 Green Avenue",
    distance: "4.1 km",
    time: "22 min",
    payout: "$9.00",
    status: "Completed",
  },
];

const tabs: Array<"All" | OrderStatus> = [
  "All",
  "Available",
  "Accepted",
  "In Progress",
  "Completed",
];

export default function RiderOrdersPage() {
  const [activeTab, setActiveTab] = useState<"All" | OrderStatus>("All");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "All" || order.status === activeTab;
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      order.id.toLowerCase().includes(searchText) ||
      order.restaurant.toLowerCase().includes(searchText) ||
      order.customer.toLowerCase().includes(searchText);
    return matchesTab && matchesSearch;
  });

  return (
    <RiderShell activePath="/rider/orders">
      {/* Mobile Heading */}
      <div className="px-5 pt-5 lg:hidden">
        <h2 className="text-2xl font-bold">Rider Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your delivery orders from here.
        </p>
      </div>

      <div className="space-y-7 p-5 md:p-8 lg:p-10">
        {/* PAGE HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="mb-2 text-4xl font-bold text-green-500">
              Rider Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Orders
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Find available delivery requests and manage your active orders in
              one place.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">
              You&apos;re available
            </span>
          </div>
        </motion.section>

        {/* STATS */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {orderStats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.12 + i * 0.04,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <OrderStat
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                highlight={stat.highlight}
              />
            </motion.div>
          ))}
        </motion.section>

        {/* ORDERS PANEL */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Panel Header */}
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Delivery Orders
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose an order based on distance, time and earnings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-green-300 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* Filter */}
                <motion.button
                  type="button"
                  onClick={() => setShowFilter(!showFilter)}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showFilter ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* FILTER DROPDOWN */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Filter by status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab);
                          setShowFilter(false);
                        }}
                        className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                          activeTab === tab
                            ? "bg-green-500 text-white"
                            : "bg-white text-slate-600 hover:bg-green-50 hover:text-green-600"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TABS */}
            <div className="mt-6 flex gap-6 overflow-x-auto border-b border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap pb-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? "text-green-500"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="orderTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-500"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ORDER LIST */}
          {filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">No orders found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or status filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveTab("All");
                }}
                className="mt-4 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </RiderShell>
  );
}

const orderStats = [
  { icon: <Package className="h-5 w-5" />, title: "Total Orders", value: "24", description: "Today's orders", highlight: false },
  { icon: <Bike className="h-5 w-5" />, title: "Available", value: "6", description: "Waiting for riders", highlight: true },
  { icon: <Clock3 className="h-5 w-5" />, title: "In Progress", value: "2", description: "Active deliveries", highlight: false },
  { icon: <DollarSign className="h-5 w-5" />, title: "Today's Earnings", value: "$142.50", description: "+12.5% from yesterday", highlight: false },
];

/* ORDER STAT */
function OrderStat({
  icon,
  title,
  value,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        highlight
          ? "border-green-200 ring-1 ring-green-100"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500">
          {icon}
        </div>
        {highlight && (
          <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-600">
            6 available
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

/* ORDER ROW */
function OrderRow({ order }: { order: Order }) {
  const isAvailable = order.status === "Available";
  const isAccepted = order.status === "Accepted";
  const isProgress = order.status === "In Progress";
  const isCompleted = order.status === "Completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-5 transition hover:bg-slate-50 md:p-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* RESTAURANT */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
            <Package className="h-5 w-5 text-green-500" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">{order.restaurant}</h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Order #{order.id.replace("ORD-", "")}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {order.customer}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {order.distance}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                {order.time}
              </span>
            </div>
          </div>
        </div>

        {/* DELIVERY ROUTE */}
        <div className="hidden min-w-[230px] lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Delivery Route
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <p className="truncate text-xs text-slate-600">{order.pickup}</p>
            </div>
            <div className="ml-[3px] h-3 border-l border-dashed border-slate-300" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400" />
              <p className="truncate text-xs text-slate-600">{order.delivery}</p>
            </div>
          </div>
        </div>

        {/* PAYOUT */}
        <div className="flex items-center justify-between gap-5 xl:block xl:min-w-[100px]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Payout
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{order.payout}</p>
          </div>
          <div className="xl:mt-2">
            <p className="text-xs text-slate-400">{order.distance}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 xl:min-w-[150px] xl:justify-end">
          {isAvailable && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Accept Order
              <ArrowUpRight className="h-4 w-4" />
            </motion.button>
          )}
          {isAccepted && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-100"
            >
              Start Delivery
              <ArrowUpRight className="h-4 w-4" />
            </motion.button>
          )}
          {isProgress && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              View Delivery
              <ArrowUpRight className="h-4 w-4" />
            </motion.button>
          )}
          {isCompleted && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Available: "bg-green-50 text-green-700 border-green-200",
    Accepted: "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-green-50 text-green-700 border-green-200",
    Completed: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const icons: Record<OrderStatus, React.ReactNode> = {
    Available: <Bike className="h-3 w-3" />,
    Accepted: <CheckCircle2 className="h-3 w-3" />,
    "In Progress": <Clock3 className="h-3 w-3" />,
    Completed: <CheckCircle2 className="h-3 w-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}
