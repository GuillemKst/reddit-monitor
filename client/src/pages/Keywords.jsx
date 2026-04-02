import { useState, useEffect } from 'react';
import { fetchKeywords, createKeyword, updateKeyword, deleteKeyword, seedKeywords } from '../api';

const categories = ['direct', 'competitor', 'pain_point', 'question'];
const categoryLabels = {
  direct: { label: 'Direct', color: 'bg-blue-500/15 text-blue-400' },
  competitor: { label: 'Competitor', color: 'bg-red-500/15 text-red-400' },
  pain_point: { label: 'Pain Point', color: 'bg-amber-500/15 text-amber-400' },
  question: { label: 'Question', color: 'bg-emerald-500/15 text-emerald-400' },
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
  const [seedMessage, setSeedMessage] = useState('');

  async function loadKeywords() {
    setIsLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      const data = await fetchKeywords(params);
      setKeywords(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadKeywords();
  }, [filterCategory]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newPhrase.trim()) return;
    setIsAdding(true);
    try {
      await createKeyword({
        phrase: newPhrase.trim(),
        category: newCategory,
        priority: newPriority,
      });
      setNewPhrase('');
      loadKeywords();
    } catch (err) {
      alert(err.message);
    }
    setIsAdding(false);
  }

  async function handleToggle(kw) {
    try {
      await updateKeyword(kw._id, { isActive: !kw.isActive });
      setKeywords((prev) =>
        prev.map((k) => (k._id === kw._id ? { ...k, isActive: !k.isActive } : k))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this keyword?')) return;
    try {
      await deleteKeyword(id);
      setKeywords((prev) => prev.filter((k) => k._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSeed() {
    setIsSeeding(true);
    setSeedMessage('');
    try {
      const res = await seedKeywords();
      setSeedMessage(res.message);
      loadKeywords();
    } catch (err) {
      setSeedMessage(err.message);
    }
    setIsSeeding(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Keywords</h1>
          <p className="text-sm text-gray-500 mt-1">
            {keywords.length} keywords configured
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {isSeeding ? 'Seeding...' : '🌱 Seed Defaults'}
        </button>
      </div>

      {seedMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl">
          {seedMessage}
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Phrase</label>
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="e.g. loom alternative"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500/50 placeholder:text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            >
              <option value={1}>High (1)</option>
              <option value={2}>Medium (2)</option>
              <option value={3}>Low (3)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isAdding || !newPhrase.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {isAdding ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </form>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            !filterCategory
              ? 'bg-orange-500/15 text-orange-400'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filterCategory === c
                ? 'bg-orange-500/15 text-orange-400'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {categoryLabels[c].label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Phrase</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Category</th>
                <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Priority</th>
                <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Matches</th>
                <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Active</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr
                  key={kw._id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-200">{kw.phrase}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${categoryLabels[kw.category]?.color}`}
                    >
                      {categoryLabels[kw.category]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">
                    P{kw.priority}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">
                    {kw.matchCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(kw)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        kw.isActive ? 'bg-orange-500' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          kw.isActive ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(kw._id)}
                      className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {keywords.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">No keywords yet. Add one above or seed the defaults.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
