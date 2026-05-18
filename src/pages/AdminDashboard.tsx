import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  doc, 
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { Order, Medicine, UserProfile } from '../types';
import { INITIAL_MEDS } from '../constants';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Search,
  Check,
  X,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeUsers: 0,
    lowStock: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'users'>('overview');

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    // Real-time listeners
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50)), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
      setStats(prev => ({
        ...prev,
        totalOrders: data.length,
        totalSales: data.reduce((acc, o) => acc + o.total, 0)
      }));
    });

    const unsubMeds = onSnapshot(collection(db, 'medicines'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() } as Medicine));
      setMedicines(data);
      setStats(prev => ({
        ...prev,
        lowStock: data.filter(m => m.stock < 10).length
      }));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
      setUsers(data);
      setStats(prev => ({
        ...prev,
        activeUsers: data.length
      }));
    });

    return () => {
      unsubOrders();
      unsubMeds();
      unsubUsers();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500">Monitor pharmacy performance and manage resources.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
           <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
           <NavBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="Orders" />
           <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} label="Inventory" />
           <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && <OverviewTab stats={stats} orders={orders} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} />}
        {activeTab === 'inventory' && <InventoryTab medicines={medicines} />}
        {activeTab === 'users' && <UsersTab users={users} />}
      </AnimatePresence>
    </div>
  );
}

function NavBtn({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
      active ? 'bg-slate-900 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
    }`}>
      {label}
    </button>
  );
}

// --- OVERVIEW TAB ---
function OverviewTab({ stats, orders }: any) {
  const chartData = orders.slice(0, 10).reverse().map((o: any) => ({
    date: o.createdAt ? format(o.createdAt.toDate(), 'HH:mm') : 'Now',
    total: o.total
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${stats.totalSales.toFixed(2)}`} icon={<TrendingUp />} trend="+12.5%" positive />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingBag />} trend="+5.2%" positive />
        <StatCard title="Total Users" value={stats.activeUsers} icon={<Users />} trend="+8.1%" positive />
        <StatCard title="Low Stock Items" value={stats.lowStock} icon={<AlertTriangle />} trend="-2" positive={false} warning={stats.lowStock > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200">
           <h3 className="font-bold text-lg mb-6">Sales Activity</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
           <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
           <div className="space-y-6 text-sm">
             {orders.slice(0, 5).map((o: any) => (
               <div key={o.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0">
                 <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                   <ArrowUpRight className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="font-medium">Order #{o.id.slice(0, 6)} confirmed</p>
                   <p className="text-slate-400 text-xs">{o.createdAt ? format(o.createdAt.toDate(), 'PPp') : 'Just now'}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, positive, warning }: any) {
  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-200 ${warning ? 'border-amber-200 bg-amber-50/20' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">{icon}</div>
        <div className={`flex items-center gap-1 text-xs font-bold ${positive ? 'text-green-500' : 'text-green-500'}`}>
          {trend}
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        </div>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
    </div>
  );
}

// --- ORDERS TAB ---
function OrdersTab({ orders }: { orders: Order[] }) {
  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status, updatedAt: Timestamp.now() });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Order ID</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Total</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map(o => (
            <tr key={o.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
              <td className="p-4 text-sm font-medium">{o.userId.slice(0, 8)}...</td>
              <td className="p-4 font-bold">${o.total}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  o.status === 'delivered' ? 'bg-green-100 text-green-600' :
                  o.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {o.status}
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                <button 
                  onClick={() => updateStatus(o.id, 'confirmed')}
                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateStatus(o.id, 'out-for-delivery')}
                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <Package className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => updateStatus(o.id, 'cancelled')}
                   className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

// --- INVENTORY TAB ---
function InventoryTab({ medicines }: { medicines: Medicine[] }) {
  const [seeding, setSeeding] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Medicine>>({
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    requiresPrescription: false,
    imageUrl: '',
    dosage: '',
    expiryDate: ''
  });

  const seedData = async () => {
    if (!confirm("Are you sure you want to seed the inventory with default medicines?")) return;
    setSeeding(true);
    try {
      for (const med of INITIAL_MEDS) {
        await addDoc(collection(db, 'medicines'), med);
      }
      alert("Inventory seeded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to seed inventory. Check permissions.");
    } finally {
      setSeeding(false);
    }
  };

  const updateStock = async (id: string, delta: number) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    await updateDoc(doc(db, 'medicines', id), { stock: Math.max(0, med.stock + delta) });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'medicines'), newProduct);
      setIsAddingProduct(false);
      setNewProduct({
        name: '', category: '', description: '', price: 0, stock: 0, requiresPrescription: false, imageUrl: '', dosage: '', expiryDate: ''
      });
      alert('Product added successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to add product.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative">
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button onClick={() => setIsAddingProduct(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Name</label>
                  <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Category</label>
                  <input required type="text" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Price ($)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Initial Stock</label>
                  <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Image URL</label>
                  <input required type="url" value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Description</label>
                  <textarea required value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 min-h-[100px]" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Dosage Instructions</label>
                  <input type="text" value={newProduct.dosage || ''} onChange={(e) => setNewProduct({...newProduct, dosage: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Expiry Date</label>
                  <input type="date" value={newProduct.expiryDate || ''} onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="rx" checked={newProduct.requiresPrescription} onChange={(e) => setNewProduct({...newProduct, requiresPrescription: e.target.checked})} className="w-5 h-5 text-green-600 rounded bg-slate-50 border-none focus:ring-green-500" />
                  <label htmlFor="rx" className="text-sm font-medium">Requires Prescription</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="px-6 py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-lg shadow-green-100">Add Product</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button 
          onClick={seedData}
          disabled={seeding}
          className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : 'Seed Default Data'}
        </button>
        <button onClick={() => setIsAddingProduct(true)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Medicine</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Price</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Stock</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medicines.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={m.imageUrl} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-sm">{m.name}</p>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{m.category}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-bold text-sm">${m.price}</td>
                <td className={`p-4 font-bold text-sm ${m.stock < 10 ? 'text-green-500' : 'text-slate-900'}`}>{m.stock}</td>
                <td className="p-4 text-xs">
                  {m.stock < 10 ? (
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                       <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-green-500 font-bold">Available</span>
                  )}
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                   <div className="flex items-center justify-end gap-2">
                     <button onClick={() => updateStock(m.id, -10)} className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 text-xs">-10</button>
                     <button onClick={() => updateStock(m.id, 10)} className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs">+10</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// --- USERS TAB ---
function UsersTab({ users }: { users: UserProfile[] }) {
  const updateRole = async (id: string, role: string) => {
    await updateDoc(doc(db, 'users', id), { role });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Email</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">Role</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-medium text-sm">{u.name}</td>
              <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{u.email}</td>
              <td className="p-4">
                <select 
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  className="bg-slate-50 border-none rounded-lg text-xs font-bold uppercase tracking-widest p-1 focus:ring-2 focus:ring-green-500"
                >
                  <option value="patient">Patient</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                <button className="text-slate-400 hover:text-slate-900 transition-colors"><Eye className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
