import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { Order, Chat } from '../types';
import { 
  Package, 
  MessageSquare, 
  ClipboardCheck, 
  Truck, 
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function PharmacistDashboard() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'chats'>('pending');

  useEffect(() => {
    // 1. Pending orders (those needing review)
    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('status', '==', 'pending')),
      (s) => setPendingOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
    );

    // 2. Active chats where pharmacist is a participant
    // Note: We need a unique ID for the pharmacist in a real app. For demo, we assume the user's ID
    const unsubChats = onSnapshot(
      query(collection(db, 'chats'), where('participants', 'array-contains', 'pharmacist-1'), orderBy('updatedAt', 'desc')),
      (s) => setActiveChats(s.docs.map(d => ({ id: d.id, ...d.data() } as Chat)))
    );

    return () => { unsubOrders(); unsubChats(); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacist Hub</h1>
          <p className="text-slate-500">Review prescriptions and fulfill patient orders.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
           <TabBtn active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} icon={<ClipboardCheck className="w-4 h-4" />} label={`Fulfillment (${pendingOrders.length})`} />
           <TabBtn active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} icon={<MessageSquare className="w-4 h-4" />} label="Patient Chats" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'pending' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map(order => (
               <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold">Order #{order.id.slice(0, 8)}</h3>
                     <p className="text-slate-400 text-xs">{format((order.createdAt as any).toDate(), 'PPp')}</p>
                   </div>
                   <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Pending Review</span>
                 </div>

                 <div className="bg-slate-50 rounded-2xl p-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Prescription</h4>
                    {order.prescriptionUrl ? (
                      <a href={order.prescriptionUrl} target="_blank" className="flex items-center gap-2 text-green-600 hover:underline">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">view_prescription.pdf</span>
                      </a>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No prescription attached</p>
                    )}
                 </div>

                 <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Items</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.name} x{item.quantity}</span>
                        <span className="font-medium">${item.price * item.quantity}</span>
                      </div>
                    ))}
                 </div>

                 <div className="flex gap-2 pt-4">
                    <button 
                      onClick={() => updateStatus(order.id, 'confirmed')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl text-sm font-bold hover:bg-green-100"
                    >
                      Reject
                    </button>
                 </div>
               </div>
            ))}
            {pendingOrders.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No orders waiting for fulfillment.
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'chats' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100">
             {activeChats.map(chat => (
               <div key={chat.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">Chat with Patient {chat.participants[0].slice(0, 6)}</p>
                      <p className="text-slate-400 text-sm line-clamp-1">{chat.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-2">{chat.updatedAt ? format((chat.updatedAt as any).toDate(), 'HH:mm') : ''}</p>
                    <button className="bg-slate-900 text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      Reply
                    </button>
                  </div>
               </div>
             ))}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
      active ? 'bg-slate-900 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
    }`}>
      {icon}
      {label}
    </button>
  );
}
