import React, { useState } from 'react';
import API from '../services/api';
import { Sparkles, Cpu, CheckCircle2, AlertTriangle, Clock, DollarSign, Tag, ArrowRight } from 'lucide-react';

export default function AIClassifierWidget({ onClassificationComplete, defaultText = '' }) {
  const [description, setDescription] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const samplePrompts = [
    "Samsung French door refrigerator leaking water onto hardwood floor and blowing warm air",
    "Kitchen wall outlet sparking when plugging in microwave and tripped main circuit breaker",
    "Master bathroom toilet overflowing and main sewer drain completely backed up",
    "AC unit blowing hot air and making loud squeaking noise from outside condenser"
  ];

  const handleClassify = async (textToRun) => {
    const query = textToRun || description;
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/requests/ai-classify', { description: query });
      setResult(res.data);
      if (onClassificationComplete) {
        onClassificationComplete(res.data, query);
      }
    } catch (err) {
      console.error('AI classification failed:', err);
      setError(err.response?.data?.message || 'AI classification is unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-3.5 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-700 shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Natural Language Service Matcher
            </h3>
            <p className="text-[11px] text-slate-500">Describe your issue in plain words — AI automatically detects category, urgency & specialist skills</p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full badge-ai font-bold flex items-center gap-1 shrink-0">
          <Cpu className="w-3 h-3" /> NLP Active
        </span>
      </div>

      {/* Input box */}
      <div className="mb-3">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., My refrigerator is leaking water and not cooling down food..."
          className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
        />
      </div>

      {/* Quick sample buttons */}
      <div className="mb-4">
        <div className="text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">Try quick sample prompts:</div>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDescription(prompt);
                handleClassify(prompt);
              }}
              className="text-[10px] px-3 py-1 rounded-xl bg-slate-50 hover:bg-teal-500/20 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-500/40 transition-all text-left truncate max-w-xs font-medium"
            >
              "{prompt.slice(0, 42)}..."
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleClassify(description)}
        disabled={loading || !description.trim()}
        className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-lg shadow-teal-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Description with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>Classify & Extract Service Parameters</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Result Panel */}
      {result && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 flex-wrap gap-2">
            <span className="text-emerald-700 font-bold">AI Classification Output:</span>
            <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> {(result.confidenceScore * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1 font-semibold">
                <Tag className="w-3 h-3 text-teal-700" /> Service Category
              </div>
              <div className="font-extrabold text-slate-900 text-xs">{result.categoryName}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1 font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-700" /> Urgency
              </div>
              <div className={`font-extrabold text-xs ${result.urgency === 'High' || result.urgency === 'Emergency' ? 'text-rose-600' : 'text-amber-700'}`}>
                {result.urgency}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1 font-semibold">
                <Clock className="w-3 h-3 text-blue-700" /> Est. Duration
              </div>
              <div className="font-extrabold text-slate-900 text-xs">{result.estimatedDurationHours} Hours</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1 font-semibold">
                <DollarSign className="w-3 h-3 text-emerald-700" /> Est. Price Range
              </div>
              <div className="font-extrabold text-emerald-700 text-xs">${result.estimatedCostRange?.min} - ${result.estimatedCostRange?.max}</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-bold mb-1">Required Skills Extracted:</div>
            <div className="flex flex-wrap gap-1">
              {result.skillsRequired?.map((skill, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-50 text-emerald-700 text-[10px] font-bold border border-emerald-500/25">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
