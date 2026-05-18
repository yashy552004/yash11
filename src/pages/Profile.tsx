import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile, Order, Reminder, Message, Chat } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  History, 
  Bell, 
  MessageSquare, 
  User as UserIcon, 
  MapPin, 
  Phone,
  Settings,
  Package,
  Calendar,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function Profile() {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'reminders' | 'chat' | 'settings'>('orders');

  if (!profile) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-full h-full p-4 text-slate-400" />
            )}
          </div>
          <h2 className="font-bold text-xl">{profile.name}</h2>
          <p className="text-slate-400 text-sm mb-4 capitalize">{profile.role}</p>
          <button onClick={logout} className="text-green-500 text-xs font-bold uppercase tracking-widest hover:underline">Sign Out</button>
        </div>

        <nav className="bg-white p-2 rounded-3xl border border-slate-200">
           <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<History className="w-4 h-4" />} label="Orders" />
           <TabButton active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell className="w-4 h-4" />} label="Reminders" />
           <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare className="w-4 h-4" />} label="Pharmacist" />
           <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>
      </div>

      <div className="md:col-span-3">
        <div className="bg-white rounded-3xl border border-slate-200 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && <OrderHistory userId={profile.id} />}
            {activeTab === 'reminders' && <Reminders userId={profile.id} />}
            {activeTab === 'chat' && <ChatComponent userId={profile.id} />}
            {activeTab === 'settings' && <ProfileSettings profile={profile} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
        active ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6">
      <h3 className="text-xl font-bold">Your Orders</h3>
      {orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-slate-100 rounded-2xl p-4 hover:border-green-200 transition-all flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-slate-400 text-xs">Placed on {order.createdAt ? format((order.createdAt as any).toDate(), 'PPp') : 'Just now'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${order.total}</p>
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-100 rounded-full text-slate-500">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Reminders({ userId }: { userId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reminders'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Refill Reminders</h3>
        <button className="text-green-600 text-sm font-bold">+ Add Reminder</button>
      </div>
      {reminders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Set reminders for your routine medications.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map(r => (
            <div key={r.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold">{r.medicineName}</h4>
                <Bell className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-slate-400 mb-4">Every {r.frequencyDays} days</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <div>
                  <p className="opacity-60 mb-1">Last Refill</p>
                  <p className="text-slate-900">{format(new Date(r.lastRefillDate), 'PP')}</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Next Refill</p>
                  <p className="text-green-600">{format(new Date(r.nextRefillDate), 'PP')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ChatComponent({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get or create chat with pharmacist (mocking single pharmacist for demo)
    const setupChat = async () => {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
      const snap = await getDocs(q);
      let cId: string;
      if (snap.empty) {
        const doc = await addDoc(collection(db, 'chats'), {
          participants: [userId, 'pharmacist-1'],
          updatedAt: serverTimestamp(),
          lastMessage: ''
        });
        cId = doc.id;
      } else {
        cId = snap.docs[0].id;
      }
      setChatId(cId);

      // 2. Listen to messages
      const msgQ = query(collection(db, 'chats', cId, 'messages'), orderBy('timestamp', 'asc'));
      const unsub = onSnapshot(msgQ, (s) => {
        setMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      });
      return unsub;
    };

    const cleanupPromise = setupChat();
    return () => { cleanupPromise.then(unsub => unsub?.()); };
  }, [userId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      chatId,
      senderId: userId,
      text: newMessage,
      timestamp: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: newMessage,
      updatedAt: serverTimestamp()
    });

    setNewMessage('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Chat with Pharmacist</h3>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Agent Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
              msg.senderId === userId 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 rounded-tl-none'
            }`}>
              {msg.text}
              <p className={`text-[9px] mt-1 opacity-60 text-right`}>
                {msg.timestamp ? format((msg.timestamp as any).toDate(), 'HH:mm') : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white rounded-b-3xl">
        <div className="relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your question..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="absolute right-2 top-1.2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function ProfileSettings({ profile }: { profile: UserProfile }) {
  const [formData, setFormData] = useState({
    name: profile.name,
    address: profile.address || '',
    phone: profile.phone || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.id), formData);
      alert("Settings saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <h3 className="text-xl font-bold">Account Settings</h3>
      <form onSubmit={handleSave} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
          <div className="relative">
             <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
             />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Delivery Address</label>
          <div className="relative">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               value={formData.address}
               onChange={(e) => setFormData({...formData, address: e.target.value})}
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
             />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
          <div className="relative">
             <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="tel" 
               value={formData.phone}
               onChange={(e) => setFormData({...formData, phone: e.target.value})}
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
             />
          </div>
        </div>

        <button 
          disabled={saving}
          className="bg-slate-900 text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </form>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
    </div>
  );
}
