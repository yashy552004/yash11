import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { Medicine } from '../types';
import { INITIAL_MEDS } from '../constants';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, Search, Filter, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Store() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || '';

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const q = queryParams.get('q');
    if (q) setSearchTerm(q);
  }, [location.search]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const q = query(collection(db, 'medicines'));
      const querySnapshot = await getDocs(q);
      
      const meds = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medicine[];
      
      setMedicines(meds);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(medicines.map(m => m.category)))];

  const filteredMeds = medicines.filter(m => {
    const matchesCategory = category === 'All' || m.category === category;
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Our Pharmacy</h1>
          <p className="text-slate-500">Quality medicines delivered to your doorstep.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
             {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setCategory(cat)}
                 className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                   category === cat ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMeds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMeds.map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">No results found</h3>
          <p className="text-slate-500">We couldn't find any medicines matching "{searchTerm}"</p>
          <button 
            onClick={() => { setSearchTerm(''); setCategory('All'); }}
            className="text-green-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

const MedicineCard = ({ medicine }: any) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(medicine);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-green-50 transition-all"
    >
      <div className="h-48 relative overflow-hidden group">
        <img 
          src={medicine.imageUrl} 
          alt={medicine.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {medicine.requiresPrescription && (
          <div className="absolute top-3 left-3 bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Prescription Required
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 border border-slate-100">
          {medicine.category}
        </div>
      </div>
      <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
        <h3 className="font-bold text-lg mb-1 leading-tight">{medicine.name}</h3>
        <p className="text-slate-400 text-xs line-clamp-2 mb-4">{medicine.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Price</span>
            <p className="text-xl font-bold text-green-600">${medicine.price.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={medicine.stock <= 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              added ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-green-600 hover:text-white'
            }`}
          >
            {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
