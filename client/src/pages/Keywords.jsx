import { useState, useEffect } from 'react';
import { fetchKeywords, createKeyword, updateKeyword, deleteKeyword, seedKeywords } from '../api';

const categories = ['direct', 'competitor', 'pain_point', 'question'];
const catLabel = { direct: 'Direct', competitor: 'Competitor', pain_point: 'Pain Point', question: 'Question' };
const catStyle = {
  direct: 'bg-blue-50 text-blue-600',
  competitor: 'bg-red-50 text-red-600',
  pain_point: 'bg-amber-50 text-amber-600',
  question: 'bg-emerald-50 text-emerald-600',
};

export default function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [newCategory, setNewCategory] = useState('direct');
  const [newPriority, setNewPriority] = useState(2);
  const [isAdding, setIsAdding] = useState(false);
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
    showToast('Deleted');
  }

  async function handleSeed() {
    try {
      const res = await seedKeywords();
      showToast(res.message);
      loadKeywords();
    } catch (err) { showToast(err.message); }
  }

  const inputClass = 'bg-white border border-neutral-200 text-neutral-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-300';

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Keywords</h1>
          <p className="text-base text-neutral-400 mt-1">{keywords.length} keywords configured</p>
        </div>
        <button
          onClick={handleSeed}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 px-5 py-2.5 rounded-xl transition-colors"
        >
          Seed defaults
        </button>
      </div>

      <form onSubmit={handleAdd} className="bg-white border border-neutral-200 rounded-2xl p-6">
        <p className="text-sm font-bold text-neutral-900 mb-4">Add keyword</p>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Phrase</label>
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="e.g. loom alternative"
              className={`w-full ${inputClass} placeholder:text-neutral-300`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Category</label>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Priority</label>
            <select value={newPriority} onChange={(e) => setNewPriority(Number(e.target.value))} className={inputClass}>
              <option value={1}>P1 — High</option>
              <option value={2}>P2 — Medium</option>
              <option value={3}>P3 — Low</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isAdding || !newPhrase.trim()}
            className="bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <div className="flex gap-2">
        {['', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              filterCategory === c
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-400 hover:text-neutral-700 border border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            {c ? catLabel[c] : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-[3px] border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : keywords.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl">
          <p className="text-base text-neutral-400">No keywords yet</p>
          <p className="text-sm text-neutral-300 mt-1">Add one above or seed the defaults</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {keywords.map((kw) => (
              <div
                key={kw._id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors ${!kw.isActive ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-sm font-medium text-neutral-800 truncate">{kw.phrase}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${catStyle[kw.category]}`}>
                    {catLabel[kw.category]}
                  </span>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-sm text-neutral-400 tabular-nums w-8 text-center">P{kw.priority}</span>
                  <span className="text-sm text-neutral-400 tabular-nums w-12 text-center">{kw.matchCount}</span>

                  <button
                    onClick={() => handleToggle(kw)}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${kw.isActive ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${kw.isActive ? 'left-5' : 'left-0.5'}`} />
                  </button>

                  <button onClick={() => handleDelete(kw._id)} className="text-sm text-neutral-300 hover:text-red-500 font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
