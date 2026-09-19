'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import OnlinePaymentModal from '@/components/client/checkout/OnlinePaymentModal';

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  note: string;
  paymentMethod: 'cod' | 'online';
}

const inputClasses =
  'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const [formData, setFormData] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Chattogram',
    area: '',
    note: '',
    paymentMethod: 'cod',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + ((item.totalUnitPrice ?? item.price) * item.quantity),
    0
  );
  const deliveryFee = cart.length > 0 ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalUnitPrice: item.totalUnitPrice,
            imageUrl: item.imageUrl,
            addons: item.selectedAddons,
          })),
          deliveryAddress: formData.address,
          deliveryPhone: formData.phone,
          paymentMethod: formData.paymentMethod,
          notes: formData.note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.order?.orderId || '');
        clearCart();
        setIsSuccess(true);
      }
    } catch {
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || cart.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#FAF7EE] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-[#124734]/10 mb-4" />
          <h1 className="text-2xl font-bold text-[#0F172A]">Your cart is empty</h1>
          <p className="text-gray-500 mt-2">Add some items before checking out.</p>
          <Link href="/" className="inline-flex mt-6 items-center gap-2 bg-[#124734] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#0e3320] transition-all shadow-lg">
            Explore Menu
          </Link>
        </div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7EE] px-4 py-12 text-slate-900">
        <section className="w-full max-w-lg rounded-[24px] border border-[#ECE7D9] bg-white p-7 text-center shadow-[0_18px_60px_rgba(18,71,52,0.1)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34} strokeWidth={2.5} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Order confirmed</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Your order is on its way</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">Thanks for ordering{formData.fullName ? `, ${formData.fullName}` : ''}. We have received your order and are getting it ready.</p>
          <div className="mt-7 divide-y divide-[#ECE7D9] rounded-[24px] border border-[#ECE7D9] bg-[#FAF7EE] text-left text-sm">
            <div className="flex items-center justify-between px-4 py-3.5"><span className="text-slate-500">Order number</span><strong className="text-[#124734]">{orderId || 'FG-ORDER'}</strong></div>
            <div className="flex items-center justify-between px-4 py-3.5"><span className="text-slate-500">Payment</span><strong>{formData.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'}</strong></div>
            <div className="flex items-center justify-between px-4 py-3.5"><span className="text-slate-500">Estimated delivery</span><strong>2-3 business days</strong></div>
          </div>
          <Link href="/" className="mt-7 inline-flex w-full items-center justify-center rounded-[22px] bg-[#124734] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0e3320] focus:outline-none focus:ring-4 focus:ring-emerald-500/20">Continue shopping</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7EE] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#124734] focus:outline-none focus:ring-4 focus:ring-emerald-500/20"><ArrowLeft size={16} /> Back to cart</Link>
            <div className="mt-5 flex items-center gap-2"><ShoppingBag className="text-[#124734]" size={23} /><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Checkout</h1></div>
            <p className="mt-1 text-sm text-slate-500">Almost there. Confirm your details and we&apos;ll handle the rest.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:flex"><LockKeyhole size={14} /> Secure checkout</div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-[#ECE7D9] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3 border-b border-[#ECE7D9] pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#124734]"><MapPin size={19} /></div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 1</p><h2 className="mt-1 text-lg font-bold text-slate-950">Delivery address</h2><p className="mt-1 text-sm text-slate-500">Where should we bring your order?</p></div></div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Full name <span className="text-rose-500">*</span><span className="relative block"><User className="pointer-events-none absolute left-3 top-5 text-slate-400" size={16} /><input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} placeholder="e.g. Md. Naimur Rahman" className={`${inputClasses} pl-10`} /></span></label>
                <label className="text-sm font-semibold text-slate-700">Email address <span className="text-rose-500">*</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-5 text-slate-400" size={16} /><input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="naimur@example.com" className={`${inputClasses} pl-10`} /></span></label>
                <label className="text-sm font-semibold text-slate-700">Phone number <span className="text-rose-500">*</span><span className="relative block"><Phone className="pointer-events-none absolute left-3 top-5 text-slate-400" size={16} /><input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="+880 1XXXXXXXXX" className={`${inputClasses} pl-10`} /></span></label>
                <label className="text-sm font-semibold text-slate-700">City <span className="text-rose-500">*</span><select name="city" value={formData.city} onChange={handleInputChange} className={`${inputClasses} cursor-pointer`}><option>Chattogram</option><option>Dhaka</option><option>Sylhet</option><option>Rajshahi</option><option>Khulna</option></select></label>
                <label className="text-sm font-semibold text-slate-700">Area / Thana <span className="text-rose-500">*</span><input type="text" name="area" required value={formData.area} onChange={handleInputChange} placeholder="e.g. GEC, Nasirabad" className={inputClasses} /></label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Street address / house details <span className="text-rose-500">*</span><textarea name="address" required rows={2} value={formData.address} onChange={handleInputChange} placeholder="House #, Road #, Block/Sector..." className={`${inputClasses} resize-none`} /></label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Delivery instructions <span className="font-normal text-slate-400">(optional)</span><input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Gate code, landmark, or anything your rider should know" className={inputClasses} /></label>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#ECE7D9] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3 border-b border-[#ECE7D9] pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#124734]"><Truck size={19} /></div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 2</p><h2 className="mt-1 text-lg font-bold text-slate-950">Delivery information</h2><p className="mt-1 text-sm text-slate-500">Simple, reliable delivery to your door.</p></div></div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><div className="rounded-xl bg-[#FAF7EE] p-3.5"><p className="text-xs text-slate-500">Estimated arrival</p><p className="mt-1 font-bold text-slate-900">2-3 business days</p></div><div className="rounded-xl bg-[#FAF7EE] p-3.5"><p className="text-xs text-slate-500">Delivery type</p><p className="mt-1 font-bold text-slate-900">Doorstep delivery</p></div><div className="rounded-xl bg-[#FAF7EE] p-3.5"><p className="text-xs text-slate-500">Contact</p><p className="mt-1 font-bold text-slate-900">Rider will call</p></div></div>
            </section>

            <section className="rounded-[24px] border border-[#ECE7D9] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3 border-b border-[#ECE7D9] pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#124734]"><CreditCard size={19} /></div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 3</p><h2 className="mt-1 text-lg font-bold text-slate-950">Payment method</h2><p className="mt-1 text-sm text-slate-500">Choose how you&apos;d like to pay.</p></div></div>
              <div className="mt-5 space-y-3">
                <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-[22px] border p-4 transition ${formData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/10' : 'border-[#ECE7D9] hover:border-emerald-200'}`}><span className="flex items-center gap-3"><input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cod' }))} className="h-4 w-4 accent-emerald-700" /><span><strong className="block text-sm text-slate-900">Cash on delivery</strong><span className="mt-1 block text-xs text-slate-500">Pay with cash when your order arrives.</span></span></span><Truck className="shrink-0 text-emerald-700" size={20} /></label>
                <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-[22px] border p-4 transition ${formData.paymentMethod === 'online' ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/10' : 'border-[#ECE7D9] hover:border-emerald-200'}`}><span className="flex items-center gap-3"><input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} onChange={() => { setFormData((prev) => ({ ...prev, paymentMethod: 'online' })); setIsPaymentModalOpen(true); }} className="h-4 w-4 accent-emerald-700" /><span><strong className="block text-sm text-slate-900">Online payment</strong><span className="mt-1 block text-xs text-slate-500">Pay securely online with a supported method.</span></span></span><CreditCard className="shrink-0 text-emerald-700" size={20} /></label>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6"><section className="rounded-[24px] border border-[#ECE7D9] bg-white p-5 shadow-[0_14px_40px_rgba(18,71,52,0.08)] sm:p-6">
            <div className="flex items-center justify-between border-b border-[#ECE7D9] pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Your order</p><h2 className="mt-1 text-xl font-bold text-slate-950">Order summary</h2></div><span className="rounded-full bg-[#FAF7EE] px-2.5 py-1 text-xs font-semibold text-slate-500">{cart.length} items</span></div>
            <div className="divide-y divide-[#ECE7D9] py-2">{cart.map((item) => <div key={item.cartItemId} className="flex items-start justify-between gap-4 py-4 text-sm"><div><p className="font-semibold text-slate-900">{item.name}</p><p className="mt-1 text-xs text-slate-500">{item.quantity} × ৳{((item.totalUnitPrice ?? item.price) * item.quantity).toFixed(2)} · {item.restaurantName}</p></div><span className="shrink-0 font-bold text-slate-900">৳{((item.totalUnitPrice ?? item.price) * item.quantity).toFixed(2)}</span></div>)}</div>
            <div className="space-y-3 border-t border-[#ECE7D9] pt-5 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><strong className="text-slate-900">৳{subtotal.toFixed(2)}</strong></div><div className="flex justify-between text-slate-500"><span>Delivery fee</span><strong className="text-slate-900">৳{deliveryFee.toFixed(2)}</strong></div><div className="mt-4 flex items-end justify-between border-t border-[#ECE7D9] pt-5"><span className="font-bold text-slate-900">Total to pay</span><strong className="text-2xl font-bold text-[#124734]">৳{total.toFixed(2)}</strong></div></div>
            <button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#124734] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#0e3320] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Processing order...</> : <>Place order · ৳{total.toFixed(2)} <Check size={17} /></>}</button>
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={15} /><span>Your payment information is protected. You can review everything before placing the order.</span></div>
          </section></aside>
        </form>
        <OnlinePaymentModal isOpen={isPaymentModalOpen} amount={total} onClose={() => setIsPaymentModalOpen(false)} />
      </div>
    </main>
  );
}
