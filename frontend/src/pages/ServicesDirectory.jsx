import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Tv, Droplet, Zap, Wind, Sparkles, Hammer, Wrench, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ServicesDirectory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default Home Services categories matching database seeder
  const defaultCategories = [
    {
      _id: 'cat-appliance',
      name: 'Appliance Repair',
      description: 'Refrigerator, washing machine, oven, dishwasher & appliance diagnostics.',
      icon: 'Tv',
      color: 'border-blue-500/30 text-blue-700 bg-blue-500/10',
      subcategories: [
        { name: 'Refrigerator Repair', skillsRequired: ['Appliance Repair', 'Refrigeration'], basePriceEstimate: 120 },
        { name: 'Washing Machine Repair', skillsRequired: ['Appliance Repair', 'Plumbing'], basePriceEstimate: 95 }
      ]
    },
    {
      _id: 'cat-plumbing',
      name: 'Plumbing',
      description: 'Leak repairs, drain unclogging, water heater installation & pipe fitting.',
      icon: 'Droplet',
      color: 'border-cyan-500/30 text-cyan-700 bg-cyan-500/10',
      subcategories: [
        { name: 'Drain Unclogging', skillsRequired: ['Plumbing', 'Drain Cleaning'], basePriceEstimate: 80 },
        { name: 'Pipe Repair & Fitting', skillsRequired: ['Pipe Fitting', 'Plumbing'], basePriceEstimate: 150 }
      ]
    },
    {
      _id: 'cat-electrical',
      name: 'Electrical Work',
      description: 'Circuit breaker fixes, wiring, light fixture installation & outlet repair.',
      icon: 'Zap',
      color: 'border-amber-500/30 text-amber-700 bg-amber-500/10',
      subcategories: [
        { name: 'Lighting & Fixtures', skillsRequired: ['Electrical Wiring', 'Lighting Installation'], basePriceEstimate: 90 },
        { name: 'Breaker Panel Maintenance', skillsRequired: ['Circuit Breaker Repair'], basePriceEstimate: 180 }
      ]
    },
    {
      _id: 'cat-hvac',
      name: 'HVAC & Climate Control',
      description: 'Air conditioning, heating, thermostat calibration & duct servicing.',
      icon: 'Wind',
      color: 'border-emerald-500/30 text-emerald-700 bg-emerald-500/10',
      subcategories: [
        { name: 'AC Servicing & Repair', skillsRequired: ['HVAC Maintenance', 'AC Repair'], basePriceEstimate: 130 }
      ]
    },
    {
      _id: 'cat-cleaning',
      name: 'Cleaning & Maintenance',
      description: 'Deep house cleaning, carpet sanitization & window washing.',
      icon: 'Sparkles',
      color: 'border-purple-500/30 text-purple-700 bg-purple-500/10',
      subcategories: [
        { name: 'Deep Home Cleaning', skillsRequired: ['Deep Cleaning', 'Sanitization'], basePriceEstimate: 110 }
      ]
    },
    {
      _id: 'cat-handyman',
      name: 'Handyman & General Repair',
      description: 'Drywall patching, furniture assembly, TV mounting & door fixes.',
      icon: 'Hammer',
      color: 'border-orange-500/30 text-orange-700 bg-orange-500/10',
      subcategories: [
        { name: 'Furniture Assembly', skillsRequired: ['Furniture Assembly', 'General Repair'], basePriceEstimate: 60 }
      ]
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      } else {
        setCategories(defaultCategories);
      }
    } catch (err) {
      console.error(err);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Tv': return Tv;
      case 'Droplet': return Droplet;
      case 'Zap': return Zap;
      case 'Wind': return Wind;
      case 'Sparkles': return Sparkles;
      case 'Hammer': return Hammer;
      default: return Wrench;
    }
  };

  const displayList = categories.length > 0 ? categories : defaultCategories;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
            Services Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">Home Service Categories & Specializations</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Browse verified service professionals, required skills, and estimated price ranges near you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayList.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
            <div key={cat._id} className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 glass-panel-hover">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${cat.color || 'bg-teal-500/10 text-teal-700 border-teal-500/30'}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
              </div>

              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">Specialized Services & Rates:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {cat.subcategories.map((sub, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{sub.name}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sub.skillsRequired?.map((sk, j) => (
                              <span key={j} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-700 font-bold border border-emerald-500/25">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-[10px] text-slate-500 block font-medium">Base Rate</span>
                          <span className="font-extrabold text-teal-700 text-sm">${sub.basePriceEstimate}/hr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
