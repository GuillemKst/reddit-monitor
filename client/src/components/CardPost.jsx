import { useState } from 'react';
import BadgeRelevance from './BadgeRelevance';
import { updatePostStatus, updatePostNotes } from '../api';

const statusColors = {
  new: 'bg-blue-500/15 text-blue-400',
  seen: 'bg-gray-500/15 text-gray-400',
  responded: 'bg-emerald-500/15 text-emerald-400',
  dismissed: 'bg-red-500/15 text-red-300',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CardPost({ post, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(post.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  async function handleStatusChange(newStatus) {
    try {
      await updatePostStatus(post._id, newStatus);
      onStatusChange?.(post._id, newStatus);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveNotes() {
    setIsSavingNotes(true);
    try {
      await updatePostNotes(post._id, notes);
    } catch (err) {
      console.error(err);
    }
    setIsSavingNotes(false);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
              r/{post.subreddit}
            </span>
            <BadgeRelevance score={post.relevanceScore} />
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[post.status]}`}>
              {post.status}
            </span>
            <span className="text-xs text-gray-500">{timeAgo(post.redditCreatedAt)}</span>
          </div>

          <h3
            className="text-sm font-semibold text-gray-100 leading-snug cursor-pointer hover:text-orange-300 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {post.title}
          </h3>

          {isExpanded && post.selftext && (
            <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-4 bg-gray-800/50 rounded-lg p-3">
              {post.selftext.slice(0, 500)}
              {post.selftext.length > 500 && '...'}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-xs text-gray-500">👍 {post.score}</span>
            <span className="text-xs text-gray-500">💬 {post.numComments}</span>
            {post.matchedKeywords?.map((kw) => (
              <span
                key={kw}
                className="text-[11px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <a
            href={post.url || `https://reddit.com${post.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg transition-colors text-center"
          >
            Open ↗
          </a>
          {post.status === 'new' && (
            <button
              onClick={() => handleStatusChange('seen')}
              className="text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark seen
            </button>
          )}
          {post.status !== 'responded' && (
            <button
              onClick={() => handleStatusChange('responded')}
              className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Responded
            </button>
          )}
          {post.status !== 'dismissed' && (
            <button
              onClick={() => handleStatusChange('dismissed')}
              className="text-xs bg-red-500/10 text-red-300 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this post..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
            rows={2}
          />
          <button
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="mt-1.5 text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSavingNotes ? 'Saving...' : 'Save notes'}
          </button>
        </div>
      )}
    </div>
  );
}
