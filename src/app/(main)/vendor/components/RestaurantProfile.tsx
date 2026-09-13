"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  ChefHat, Star, ShoppingBag, TrendingUp, MapPin, Clock, Phone, Edit3, Camera, CheckCircle2, ShieldCheck, Sparkles, Utensils, Plus, Share2, Sliders, Volume2, VolumeX, Save, X, Award, Info, MessageSquare,
} from "lucide-react";

interface SoundEngine {
  ctx: AudioContext | null;
  enabled: boolean;
  init(): void;
  playPop(): void;
  playClick(): void;
}
class SoundEngineImpl implements SoundEngine {
  ctx: AudioContext | null;
  enabled: boolean;
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.error(e);
    }
  }
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.error(e);
    }
  }
}

const sounds = new SoundEngineImpl();

const Interactive3DScene = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);
    interface Item {
      mesh: THREE.Mesh;
      rotSpeedX: number;
      rotSpeedY: number;
      floatSpeed: number;
      initialY: number;
    }
    const items: Item[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.TorusGeometry(1, 0.35, 16, 100),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(0.9, 0),
    ];
    const colors = [0xea580c, 0xf59e0b, 0x10b981, 0x3b82f6, 0x8b5cf6, 0xf43f5e];
    for (let i = 0; i < 22; i++) {
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.15,
        transmission: 0.85,
        opacity: 0.8,
        transparent: true,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        wireframe: Math.random() > 0.7,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.x = (Math.random() - 0.5) * 38;
      mesh.position.y = (Math.random() - 0.5) * 24;
      mesh.position.z = (Math.random() - 0.5) * 16 - 4;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      const scale = 0.5 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);
      group.add(mesh);
      items.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.012,
        rotSpeedY: (Math.random() - 0.5) * 0.012,
        floatSpeed: 0.004 + Math.random() * 0.008,
        initialY: mesh.position.y,
      });
    }
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);
    const pointLight = new THREE.PointLight(0xea580c, 3.5, 35);
    pointLight.position.set(-10, -10, 10);
    scene.add(pointLight);
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      mouseY = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      group.rotation.y = targetX * 0.25;
      group.rotation.x = -targetY * 0.25;
      items.forEach((item, idx) => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        item.mesh.position.y = item.initialY + Math.sin(elapsedTime * 1.5 + idx) * 0.5;
      });
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50" />
  );
};

interface Metric3DProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  subtext: string;
  glowColor: string;
  accentGradient: string;
}

const Metric3DCard = ({ title, value, icon: Icon, subtext, glowColor, accentGradient }: Metric3DProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };
  const handleMouseEnter = () => {
    setIsHovered(true);
    sounds.playPop();
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => sounds.playClick()}
      style={{ perspective: "1000px" }}
      className="cursor-pointer group"
    >
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${isHovered ? "20px" : "0px"})`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
        }}
        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu"
      >
        <div className={`absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl opacity-30 group-hover:opacity-75 transition-opacity duration-500 ${glowColor}`} />
        <div className="flex items-center gap-4 relative z-10">
          <div className={`p-4 rounded-2xl ${accentGradient} text-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mt-0.5">{title}</p>
            {subtext && (
              <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{subtext}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RestaurantProfile() {
  const [profile, setProfile] = useState({
    name: "Abid Merchant",
    restaurantName: "Truffle House Kitchen",
    tagline: "Artisanal Fine Dining & Gourmet Fast Casual",
    accountType: "Verified Merchant",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
    phone: "+1 (555) 382-9102",
    email: "abid@foodiego.com",
    address: "742 Evergreen Terrace, Downtown Culinary District",
    hours: "10:00 AM - 11:00 PM (Mon-Sun)",
    isActive: true,
  });
  const [activeTab, setActiveTab] = useState("menu");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...profile });
  const [dishes] = useState([
    { id: 1, name: "Truffle Wagyu Burger", category: "Burgers", price: "৳450", rating: "4.9", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80", badge: "Bestseller" },
    { id: 2, name: "Artisan Wood-Fired Pizza", category: "Signature", price: "৳550", rating: "4.8", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80", badge: "Chef Choice" },
    { id: 3, name: "Smoked Salmon Carpaccio", category: "Signature", price: "৳480", rating: "4.7", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80", badge: "Fresh" },
    { id: 4, name: "Matcha Souffle Pancake", category: "Desserts", price: "৳320", rating: "5.0", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80", badge: "Popular" },
  ]);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    sounds.playPop();
  };
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setProfile({ ...formData });
    setIsEditModalOpen(false);
    showToast("Profile details updated successfully!");
  };
  const filteredDishes = selectedCategory === "All" ? dishes : dishes.filter((d) => d.category === selectedCategory);
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 relative font-sans transition-colors duration-300 overflow-x-hidden">
      <Interactive3DScene />
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-bounce text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between p-4 lg:p-6 rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/60 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">FoodieGo</h1>
              <p className="text-xs font-medium text-slate-500">Merchant Interactive Profile</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleSound} className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all" title="Toggle Audio FX">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setIsEditModalOpen(true); sounds.playPop(); }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          </div>
        </header>
        <section className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl">
          <div className="relative h-48 sm:h-64 w-full overflow-hidden">
            <img src={profile.cover} alt="Cover" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
            <button
              onClick={() => { setIsEditModalOpen(true); sounds.playPop(); }}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md text-white text-xs font-bold hover:bg-slate-950/80 transition-all flex items-center gap-1.5 border border-white/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </button>
          </div>
          <div className="relative px-6 pb-6 pt-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-800">
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" title="Store Status: OPEN" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{profile.restaurantName}</h2>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {profile.accountType}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  {profile.tagline} • Manager: <strong className="text-slate-800">{profile.name}</strong>
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {profile.address}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" /> {profile.hours}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button onClick={() => showToast("Public menu share link copied!")} className="p-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all" title="Share Profile">
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Manage Store</span>
              </button>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Metric3DCard title="Total Orders" value="1,284" icon={ShoppingBag} subtext="+14% this month" glowColor="bg-blue-500" accentGradient="bg-gradient-to-tr from-blue-500 to-indigo-600" />
          <Metric3DCard title="Avg. Rating" value="4.8" icon={Star} subtext="Based on 490 reviews" glowColor="bg-amber-500" accentGradient="bg-gradient-to-tr from-amber-500 to-orange-600" />
          <Metric3DCard title="Active Menu Items" value="24" icon={Utensils} subtext="4 Specials Featured" glowColor="bg-emerald-500" accentGradient="bg-gradient-to-tr from-emerald-500 to-teal-600" />
          <Metric3DCard title="Monthly Growth" value="+18%" icon={TrendingUp} subtext="Top 5% in District" glowColor="bg-rose-500" accentGradient="bg-gradient-to-tr from-rose-500 to-red-600" />
        </section>
        <section className="rounded-3xl p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
            {[
              { id: "menu", label: "Menu Showcase", icon: Utensils },
              { id: "info", label: "Store Information", icon: Info },
              { id: "reviews", label: "Customer Reviews", icon: MessageSquare },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); sounds.playPop(); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/30" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {["All", "Signature", "Burgers", "Desserts"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); sounds.playPop(); }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => showToast("Add dish modal ready!")}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Dish</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDishes.map((dish) => (
                  <div key={dish.id} className="group relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 hover:shadow-xl transition-all duration-300">
                    <div className="h-44 overflow-hidden relative">
                      <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30">{dish.badge}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{dish.category}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /><span>{dish.rating}</span></div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 truncate">{dish.name}</h4>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-base font-black text-slate-900">{dish.price}</span>
                        <button onClick={() => showToast(`Edited ${dish.name}`)} className="p-2 rounded-xl bg-slate-200 hover:bg-amber-500 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/50">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Phone className="w-4 h-4 text-amber-500" /> Contact Details</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <p><strong>Phone:</strong> {profile.phone}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Support Hotline:</strong> +1 (800) 902-FOOD</p>
                </div>
              </div>
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/50">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> Kitchen Compliance & Hygiene</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Grade A Food Safety Certified</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Organic Sourced Ingredients</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{r}★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-amber-400" initial={{ width: 0 }} animate={{ width: `${[82, 10, 4, 2, 2][r - 1]}%` }} transition={{ duration: 0.8, delay: 0.2 * r }} />
                    </div>
                    <span className="w-6 text-right text-slate-400">{[82, 10, 4, 2, 2][r - 1]}%</span>
                  </div>
                ))}
              </div>
              {[
                { name: "Sarah M.", text: "The Truffle Wagyu Burger was out of this world! Fast delivery.", rating: 5, time: "2 hours ago" },
                { name: "David C.", text: "Exceptional wood-fired flavor. Great presentation.", rating: 5, time: "1 day ago" },
              ].map((rev, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{rev.name}</span>
                      <div className="flex text-amber-400">{[...Array(rev.rating)].map((_, r) => <Star key={r} className="w-3 h-3 fill-current" />)}</div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">{rev.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{rev.time}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><Edit3 className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Edit Restaurant Profile</h3>
                  <p className="text-xs text-slate-500">Update public merchant information</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Manager Name</label>
                <input type="text" value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border-none text-xs font-semibold focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Restaurant Title</label>
                <input type="text" value={formData.restaurantName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, restaurantName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border-none text-xs font-semibold focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tagline</label>
                <input type="text" value={formData.tagline} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tagline: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border-none text-xs font-semibold focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border-none text-xs font-semibold focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
