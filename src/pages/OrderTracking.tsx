import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Package, 
  ArrowLeft,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (s) => {
      setOrder({ id: s.id, ...s.data() } as Order);
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  if (loading) return <div>Tracking delivery...</div>;
  if (!order) return <div>Order not found.</div>;

  const steps = [
    { label: 'Order Placed', status: 'pending', active: true, done: true, icon: <Package /> },
    { label: 'Pharmacist Confirmed', status: 'confirmed', active: order.status !== 'pending' && order.status !== 'cancelled', done: order.status !== 'pending' && order.status !== 'cancelled', icon: <CheckCircle2 /> },
    { label: 'Out for Delivery', status: 'out-for-delivery', active: ['out-for-delivery', 'delivered'].includes(order.status), done: ['out-for-delivery', 'delivered'].includes(order.status), icon: <Truck /> },
    { label: 'Delivered', status: 'delivered', active: order.status === 'delivered', done: order.status === 'delivered', icon: <MapPin /> }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/profile" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
          <p className="text-slate-500">Real-time status for order #{order.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex-1 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 z-10 relative transition-all ${
                    step.done ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 
                    step.active ? 'bg-green-100 text-green-600 border-2 border-green-600 border-dashed animate-pulse' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold uppercase tracking-widest ${step.active ? 'text-green-600' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    {step.done && order.updatedAt && (
                      <p className="text-[10px] text-slate-400">{format((order.updatedAt as any).toDate(), 'HH:mm')}</p>
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`hidden md:block absolute top-6 left-12 right-0 h-0.5 z-0 ${steps[idx+1].done ? 'bg-green-600' : 'bg-slate-100'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="h-[400px] bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center group">
               {/* Mock Map Background */}
               <div className="absolute inset-0 opacity-20 grayscale">
                 <div className="w-full h-full border-[20px] border-white grid grid-cols-10 grid-rows-10 opacity-50">
                   {Array.from({length: 100}).map((_, i) => <div key={i} className="border border-white"></div>)}
                 </div>
               </div>
               
               <AnimatePresence>
                 {order.status === 'out-for-delivery' && (
                   <motion.div 
                     initial={{ x: -100, y: 0 }}
                     animate={{ x: [0, 50, -20, 100, 0], y: [0, -30, 20, -10, 0] }}
                     transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                     className="relative z-10 flex flex-col items-center"
                   >
                     <div className="bg-green-600 text-white p-3 rounded-2xl shadow-xl shadow-green-200 mb-2">
                       <Truck className="w-8 h-8" />
                     </div>
                     <div className="bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                       <span className="text-[10px] font-bold uppercase tracking-widest">Courier is nearby</span>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {order.status === 'delivered' && (
                 <div className="flex flex-col items-center gap-2">
                   <div className="bg-green-600 text-white p-4 rounded-full shadow-xl">
                     <CheckCircle2 className="w-12 h-12" />
                   </div>
                   <p className="font-bold">Delivered to your door</p>
                 </div>
               )}

               <div className="absolute bottom-6 right-6 flex gap-2">
                 <button className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all">
                   <Navigation className="w-5 h-5 text-slate-600" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="font-bold mb-4">Delivery Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</p>
                  <p className="text-sm font-medium">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scheduled Time</p>
                  <p className="text-sm font-medium">{format(new Date(order.scheduledDeliveryDate), 'PPp')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-900 text-white p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-green-800 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold">Need help?</h3>
            <p className="text-green-100 text-sm">Our 24/7 pharmacist support is here to answer any questions about your delivery.</p>
            <Link to="/profile" className="block w-full bg-green-500 hover:bg-green-400 text-center py-3 rounded-xl font-bold transition-all">
              Chat Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
