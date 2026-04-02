import { useState, useEffect } from 'react';
import { fetchKeywords, createKeyword, updateKeyword, deleteKeyword, seedKeywords } from '../api';

const categories = ['direct', 'competitor', 'pain_point', 'question'];
const catLabel = { direct: 'Direct', competitor: 'Competitor', pain_point: 'Pain Point', question: 'Question' };

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

  const inputClass = 'bg-white border border-neutral-200 text-neutral-700 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-300';

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white text-[13px] px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Keywords</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{keywords.length} keywords configured</p>
        </div>
        <button
          onClick={handleSeed}
          className="text-[13px] font-medium text-neutral-400 hover:text-neutral-900 px-3 py-1.5 rounded-md hover:bg-neutral-50 transition-colors"
        >
          Seed defaults
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 border border-neutral-100 rounded-xl p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Phrase</label>
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            placeholder="e.g. loom alternative"
            className={`w-full ${inputClass} placeholder:text-neutral-300`}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Category</label>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={inputClass}>
            {categories.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Priority</label>
          <select value={newPriority} onChange={(e) => setNewPriority(Number(e.target.value))} className={inputClass}>
            <option value={1}>P1</option>
            <option value={2}>P2</option>
            <option value={3}>P3</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isAdding || !newPhrase.trim()}
          className="bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-[13px] font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Add
        </button>
      </form>

      <div className="flex gap-1">
        {['', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${
              filterCategory === c
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {c ? catLabel[c] : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : keywords.length === 0 ? (
        <p className="text-center py-12 text-sm text-neutral-400">No keywords yet</p>
      ) : (
        <div className="border border-neutral-100 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="px-4 py-3">Phrase</th>
                <th className="px-4 py-3 w-28">Category</th>
                <th className="px-4 py-3 w-16 text-center">P</th>
                <th className="px-4 py-3 w-20 text-center">Matches</th>
                <th className="px-4 py-3 w-16 text-center">Active</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {keywords.map((kw) => (
                <tr key={kw._id} className={`hover:bg-neutral-50/50 transition-colors ${!kw.isActive ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-2.5 text-[13px] text-neutral-700">{kw.phrase}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-medium text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded">
                      {catLabel[kw.category]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-[12px] text-neutral-400 tabular-nums">P{kw.priority}</td>
                  <td className="px-4 py-2.5 text-center text-[12px] text-neutral-400 tabular-nums">{kw.matchCount}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleToggle(kw)}
                      className={`w-7 h-4 rounded-full transition-colors relative ${kw.isActive ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${kw.isActive ? 'left-3.5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => handleDelete(kw._id)} className="text-[11px] text-neutral-300 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
