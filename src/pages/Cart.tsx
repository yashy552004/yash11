import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CreditCard, 
  Calendar,
  AlertCircle,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user, profile, login } = useAuth();
  const [scheduledDate, setScheduledDate] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const needsPrescription = items.some(item => item.requiresPrescription);

  const handleCheckout = async () => {
    if (!user) {
      login();
      return;
    }

    if (needsPrescription && !prescriptionFile) {
      alert("Please upload a prescription for restricted medicines.");
      return;
    }

    setCheckingOut(true);
    try {
      // 1. Upload prescription if needed (Mocking for now, just using a placeholder URL)
      const prescriptionUrl = needsPrescription ? "https://example.com/prescription.pdf" : "";

      // 2. Create the order
      const orderData = {
        userId: user.uid,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        })),
        status: 'pending',
        total: total,
        prescriptionUrl,
        deliveryAddress: profile?.address || "Default Address",
        scheduledDeliveryDate: scheduledDate || new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderSuccess(docRef.id);
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="text-slate-500">Your order #{orderSuccess} has been received and is being processed by our pharmacist.</p>
        <div className="flex justify-center gap-4 pt-4">
          <button onClick={() => navigate('/store')} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100">
            Keep Shopping
          </button>
          <button onClick={() => navigate(`/tracking/${orderSuccess}`)} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold">
            Track Order
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-slate-500">Looks like you haven't added any medicines yet.</p>
        <button onClick={() => navigate('/store')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold mt-4 shadow-lg shadow-green-200">
          Go to Pharmacy
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        {items.map((item) => (
          <div key={item.id} className="flex gap-6 bg-white p-4 rounded-2xl border border-slate-200 group">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-slate-400 text-sm">{item.category}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-green-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded transition-colors shadow-sm"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded transition-colors shadow-sm"><Plus className="w-4 h-4" /></button>
                </div>
                <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}

        {needsPrescription && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4">
            <div className="flex gap-3 text-amber-800">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold">Prescription Required</h3>
                <p className="text-sm opacity-90">Some items in your cart require a valid prescription. Please upload a clear photo or PDF below.</p>
              </div>
            </div>
            <div className="relative">
              <input 
                type="file" 
                id="prescription" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor="prescription"
                className="flex flex-col items-center justify-center border-2 border-dashed border-amber-300 rounded-xl p-8 cursor-pointer hover:bg-white transition-all bg-amber-50/50"
              >
                {prescriptionFile ? (
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    {prescriptionFile.name}
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-sm font-medium text-amber-700">Click to upload prescription</span>
                    <span className="text-xs text-amber-500 mt-1">Supports JPG, PNG, PDF (Max 5MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 sticky top-24">
          <h2 className="text-xl font-bold">Order Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between text-slate-500 italic">
              <span>Tax (Est.)</span>
              <span>$2.50</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl text-green-600">${(total + 7.5).toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Schedule Delivery</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="datetime-local" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-slate-900 text-slate-900 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {checkingOut ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400">By placing an order, you agree to our terms and conditions. Secure payment powered by Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
