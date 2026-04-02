import { useState, useEffect } from 'react';
import { fetchKeywords, createKeyword, updateKeyword, deleteKeyword, seedKeywords } from '../api';

const categories = ['direct', 'competitor', 'pain_point', 'question'];
const catMeta = {
  direct: { label: 'Direct', color: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
  competitor: { label: 'Competitor', color: 'bg-red-500/10 text-red-400 ring-red-500/20' },
  pain_point: { label: 'Pain Point', color: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  question: { label: 'Question', color: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
};

export default function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [newCategory, setNewCategory] = useState('direct');
  const [newPriority, setNewPriority] = useState(2);
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toast, setToast] = useState('');

  async function loadKeywords() {
    setIsLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      setKeywords(await fetchKeywords(params));
    } catch (err) { console.error(err); }
    setIsLoading(false);
  }

  useEffect(() => { loadKeywords(); }, [filterCategory]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newPhrase.trim()) return;
    setIsAdding(true);
    try {
      await createKeyword({ phrase: newPhrase.trim(), category: newCategory, priority: newPriority });
      setNewPhrase('');
      showToast('Keyword added');
      loadKeywords();
    } catch (err) { showToast(err.message); }
    setIsAdding(false);
  }

  async function handleToggle(kw) {
    await updateKeyword(kw._id, { isActive: !kw.isActive });
    setKeywords((prev) => prev.map((k) => (k._id === kw._id ? { ...k, isActive: !k.isActive } : k)));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this keyword?')) return;
    await deleteKeyword(id);
    setKeywords((prev) => prev.filter((k) => k._id !== id));
    showToast('Keyword deleted');
  }

  async function handleSeed() {
    setIsSeeding(true);
    try {
      const res = await seedKeywords();
      showToast(res.message);
      loadKeywords();
    } catch (err) { showToast(err.message); }
    setIsSeeding(false);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-xl border border-white/[0.1] text-white/80 text-[13px] px-4 py-2.5 rounded-xl shadow-2xl animate-[fadeIn_0.2s]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Keywords</h1>
          <p className="text-[13px] text-white/30 mt-0.5">{keywords.length} keywords configured</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="text-[13px] bg-white/[0.05] text-white/50 hover:bg-white/[0.08] hover:text-white/70 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSeeding ? 'Seeding...' : 'Seed Defaults'}
        </button>
      </div>

      <form onSubmit={handleAdd} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">Phrase</label>
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="e.g. loom alternative"
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white/80 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500/40 placeholder:text-white/15"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
            >
              {categories.map((c) => <option key={c} value={c}>{catMeta[c].label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value))}
              className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
            >
              <option value={1}>P1 High</option>
              <option value={2}>P2 Medium</option>
              <option value={3}>P3 Low</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isAdding || !newPhrase.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/30 text-white text-[13px] font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <div className="flex gap-1.5">
        {['', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
              filterCategory === c
                ? 'bg-white/[0.1] text-white/80'
                : 'text-white/25 hover:text-white/50 hover:bg-white/[0.04]'
            }`}
          >
            {c ? catMeta[c].label : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 text-[11px] font-medium text-white/25 uppercase tracking-wider border-b border-white/[0.06] px-4 py-2.5">
            <span>Phrase</span>
            <span className="w-24 text-center">Category</span>
            <span className="w-12 text-center">P</span>
            <span className="w-16 text-center">Matches</span>
            <span className="w-14 text-center">Active</span>
            <span className="w-14 text-right">Action</span>
          </div>

          {keywords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[13px] text-white/20">No keywords. Add one or seed defaults.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {keywords.map((kw) => (
                <div
                  key={kw._id}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 items-center px-4 py-2.5 hover:bg-white/[0.02] transition-colors ${!kw.isActive ? 'opacity-40' : ''}`}
                >
                  <span className="text-[13px] text-white/70 truncate pr-4">{kw.phrase}</span>
                  <span className="w-24 flex justify-center">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ring-1 ring-inset ${catMeta[kw.category]?.color}`}>
                      {catMeta[kw.category]?.label}
                    </span>
                  </span>
                  <span className="w-12 text-center text-[11px] text-white/30 tabular-nums">P{kw.priority}</span>
                  <span className="w-16 text-center text-[11px] text-white/30 tabular-nums">{kw.matchCount}</span>
                  <span className="w-14 flex justify-center">
                    <button
                      onClick={() => handleToggle(kw)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${kw.isActive ? 'bg-orange-500' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 ${kw.isActive ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </span>
                  <span className="w-14 text-right">
                    <button onClick={() => handleDelete(kw._id)} className="text-[11px] text-white/15 hover:text-red-400 transition-colors">
                      Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
