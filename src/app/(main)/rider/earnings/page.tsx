"use client";

import {
  Bike,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  CalendarDays,
  Package,
} from "lucide-react";
import { motion } from "motion/react";
import RiderShell from "@/components/rider/RiderShell";

export default function RiderEarningsPage() {

  return (
    <RiderShell activePath="/rider/earnings">
      {/* Mobile Heading */}
      <div className="px-5 pt-5 lg:hidden">
        <h2 className="text-2xl font-bold">Rider Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Track your earnings here.</p>
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
            <p className="mb-2 text-4xl font-bold tracking-tight text-green-500">
              Rider Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Earnings
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Track your earnings, payouts and delivery income in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">
              You&apos;re available
            </span>
          </div>
        </motion.section>

        {/* EARNING STATS */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {earningStats.map((stat, i) => (
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
              <EarningStat
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                description={stat.description}
              />
            </motion.div>
          ))}
        </motion.section>

        {/* OVERVIEW + PAYOUT */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]"
        >
          {/* Earnings Overview */}
          <motion.div
            whileHover={{ y: -2, boxShadow: "0 8px 30px -12px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Earnings Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your earnings performance this week
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <CalendarDays className="h-4 w-4" />
                This Week
              </motion.button>
            </div>

            {/* Simple Chart */}
            <div className="mt-8 flex h-52 items-end justify-between gap-3 border-b border-slate-100 px-2">
              {bars.map((bar) => (
                <Bar key={bar.label} height={bar.height} label={bar.label} value={bar.value} />
              ))}
            </div>
          </motion.div>

          {/* Payout Summary */}
          <motion.div
            whileHover={{ y: -2, boxShadow: "0 8px 30px -12px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Payout Summary</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest payout</p>
              </div>
              <Wallet className="h-5 w-5 text-green-500" />
            </div>

            {/* Available Balance */}
            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-slate-500">Available Balance</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">$284.75</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600 transition hover:text-green-700"
              >
                View payout details
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Last payout</span>
                <span className="text-sm font-semibold text-slate-800">$412.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Payout date</span>
                <span className="text-sm font-semibold text-slate-800">Aug 20, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                  Paid
                </span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* RECENT EARNINGS */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Earnings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest completed deliveries and payouts.
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-sm font-semibold text-green-500 transition hover:text-green-600"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="divide-y divide-slate-100">
            {earningRows.map((row) => (
              <motion.div
                key={row.order}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <EarningRow
                  restaurant={row.restaurant}
                  order={row.order}
                  time={row.time}
                  amount={row.amount}
                  distance={row.distance}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </RiderShell>
  );
}

const bars = [
  { height: "35%", label: "Mon", value: "$82" },
  { height: "55%", label: "Tue", value: "$125" },
  { height: "45%", label: "Wed", value: "$98" },
  { height: "70%", label: "Thu", value: "$154" },
  { height: "60%", label: "Fri", value: "$132" },
  { height: "85%", label: "Sat", value: "$178" },
  { height: "65%", label: "Sun", value: "$142" },
];

const earningStats = [
  { icon: <DollarSign className="h-5 w-5" />, title: "Today's Earnings", value: "$142.50", description: "+12.5% from yesterday" },
  { icon: <Wallet className="h-5 w-5" />, title: "This Week", value: "$684.75", description: "32 completed deliveries" },
  { icon: <TrendingUp className="h-5 w-5" />, title: "This Month", value: "$2,840.50", description: "+8.4% from last month" },
  { icon: <Bike className="h-5 w-5" />, title: "Per Delivery", value: "$11.88", description: "Average payout" },
];

const earningRows = [
  { restaurant: "Burger Joint", order: "ORD-9921", time: "Today, 10:42 AM", amount: "$12.50", distance: "5.1 km" },
  { restaurant: "Taco House", order: "ORD-9920", time: "Today, 9:58 AM", amount: "$9.50", distance: "3.9 km" },
  { restaurant: "Fresh Bowl", order: "ORD-9919", time: "Today, 9:22 AM", amount: "$9.00", distance: "4.1 km" },
  { restaurant: "Luigi's Pizza", order: "ORD-9917", time: "Yesterday, 8:45 PM", amount: "$14.25", distance: "6.2 km" },
];

/* EARNING STAT */
function EarningStat({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500">
        {icon}
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

/* BAR */
function Bar({
  height,
  label,
  value,
}: {
  height: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-end gap-2">
      <span className="text-[10px] text-slate-400">{value}</span>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[42px] rounded-t-lg bg-green-400 transition hover:bg-green-500"
        style={{ height }}
      />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

/* EARNING ROW */
function EarningRow({
  restaurant,
  order,
  time,
  amount,
  distance,
}: {
  restaurant: string;
  order: string;
  time: string;
  amount: string;
  distance: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
          <Package className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{restaurant}</h3>
          <p className="mt-1 text-xs text-slate-400">
            Order #{order} • {time}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-8 sm:justify-end">
        <div className="text-right">
          <p className="text-xs text-slate-400">Distance</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{distance}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Earnings</p>
          <p className="mt-1 text-lg font-bold text-green-600">+{amount}</p>
        </div>
      </div>
    </div>
  );
}
