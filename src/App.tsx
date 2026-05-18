import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { CartProvider, useCart } from './hooks/useCart';
import Store from './pages/Store';
import CartPage from './pages/Cart';
import ProfilePage from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  MessageSquare,
  Clock,
  History,
  HeartPulse,
  Package,
  Home as HomeIcon,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AppWrapper() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}

function App() {
  const { user, profile, loading, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar 
          user={user} 
          profile={profile} 
          login={login} 
          logout={logout} 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/store" element={<Store />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile/*" element={<ProfilePage />} />
              <Route path="/tracking/:orderId" element={<OrderTracking />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/pharmacist/*" element={<PharmacistDashboard />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

function Navbar({ user, profile, login, logout, isMenuOpen, setIsMenuOpen }: any) {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const isActive = (path: string) => location.pathname === path;
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/store?q=${encodeURIComponent(searchValue)}`);
      setSearchValue('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Medicalwala</span>
            </Link>

            <div className="hidden md:flex gap-6">
              <NavLink to="/" active={isActive('/')}>Home</NavLink>
              <NavLink to="/store" active={isActive('/store')}>Pharmacy</NavLink>
              {profile?.role === 'admin' && <NavLink to="/admin" active={location.pathname.startsWith('/admin')}>Admin</NavLink>}
              {profile?.role === 'pharmacist' && <NavLink to="/pharmacist" active={location.pathname.startsWith('/pharmacist')}>Pharmacist</NavLink>}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search medicine..." 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-green-500 transition-all w-64"
              />
            </form>

            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-green-600 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-full h-full p-1.5 text-slate-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{profile?.name}</span>
                </Link>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-green-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 font-medium">Home</Link>
              <Link to="/store" onClick={() => setIsMenuOpen(false)} className="block py-2 font-medium">Pharmacy</Link>
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block py-2 font-medium">Cart</Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block py-2 font-medium border-t pt-4">My Profile</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block py-2 font-medium text-green-500">Sign Out</button>
                </>
              ) : (
                <button onClick={() => { login(); setIsMenuOpen(false); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium">Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ to, children, active }: any) {
  return (
    <Link 
      to={to} 
      className={cn(
        "text-sm font-medium transition-all relative py-1",
        active ? "text-green-600" : "text-slate-500 hover:text-green-600"
      )}
    >
      {children}
      {active && (
        <motion.div 
          layoutId="nav-underline" 
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-600 rounded-full"
        />
      )}
    </Link>
  );
}

function HomeView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <section className="bg-green-600 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 italic font-serif">
            Your Health, Delivered with Care & Quality.
          </h1>
          <p className="text-green-50 text-lg mb-8">
            Order prescription medicines online, schedule home delivery, and manage your health reminders all in one place.
          </p>
          <div className="flex gap-4">
            <Link to="/store" className="bg-white text-green-600 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-green-50 transition-all">
              Shop Now
            </Link>
            <Link to="/store" className="bg-green-500 border border-green-400 text-white px-8 py-3 rounded-full font-bold hover:bg-green-400 transition-all">
              Upload Prescription
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 hidden lg:block">
           <Package className="w-full h-full p-20" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <FeatureCard icon={<Clock className="w-8 h-8" />} title="Quick Delivery" desc="Within 2 hours in selected areas." />
         <FeatureCard icon={<MessageSquare className="w-8 h-8" />} title="Expert Advice" desc="Chat with certified pharmacists. " />
         <FeatureCard icon={<Bell className="w-8 h-8" />} title="Refill Reminders" desc="Never miss a dose with smart alerts." />
         <FeatureCard icon={<History className="w-8 h-8" />} title="Order History" desc="Easily re-order your routine meds." />
      </section>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:shadow-green-100 transition-all group">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  );
}

function CartView() { return <div>Cart coming soon...</div> }
function ProfileView({ profile }: any) { return <div>Profile: {profile?.name} coming soon...</div> }
function TrackingView() { return <div>Tracking coming soon...</div> }
function AdminView({ profile }: any) { 
  if (profile?.role !== 'admin') return <div className="text-green-500">Access Denied</div>;
  return <div>Admin Panel coming soon...</div> 
}
function PharmacistView({ profile }: any) { 
  if (profile?.role !== 'pharmacist') return <div className="text-green-500">Access Denied</div>;
  return <div>Pharmacist Dashboard coming soon...</div> 
}

function Footer() {
  const { loginAsAdmin } = useAuth();
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:flex justify-between items-center text-slate-500 text-sm">
        <div className="mb-4 md:mb-0">
          <p>© 2026 Medicalwala Online Pharmacy. All rights reserved.</p>
        </div>
        <div className="flex gap-8 items-center">
          <a href="#" className="hover:text-green-600">Privacy Policy</a>
          <a href="#" className="hover:text-green-600">Terms of Service</a>
          <a href="#" className="hover:text-green-600">Contact Us</a>
          <button onClick={loginAsAdmin} className="text-slate-400 font-bold hover:text-green-600 ml-4 border-l border-slate-300 pl-4">Admin Login</button>
        </div>
      </div>
    </footer>
  );
}
