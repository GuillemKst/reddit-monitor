import { useState } from 'react';
import BadgeRelevance from './BadgeRelevance';
import { updatePostStatus, updatePostNotes } from '../api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const statusLabel = {
  new: { text: 'New', bg: 'bg-blue-50 text-blue-600' },
  seen: { text: 'Seen', bg: 'bg-neutral-100 text-neutral-500' },
  responded: { text: 'Done', bg: 'bg-emerald-50 text-emerald-600' },
  dismissed: { text: 'Skipped', bg: 'bg-neutral-100 text-neutral-400' },
};

export default function CardPost({ post, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(post.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleStatus(newStatus) {
    try {
      await updatePostStatus(post._id, newStatus);
      onStatusChange?.(post._id, newStatus);
    } catch (err) { console.error(err); }
  }

  async function handleSaveNotes() {
    setIsSaving(true);
    try { await updatePostNotes(post._id, notes); } catch (err) { console.error(err); }
    setIsSaving(false);
  }

  const status = statusLabel[post.status] || statusLabel.new;

  return (
    <div className="group bg-white border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 transition-all">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-neutral-500">r/{post.subreddit}</span>
            <span className="text-sm text-neutral-300">{timeAgo(post.redditCreatedAt)}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${status.bg}`}>
              {status.text}
            </span>
          </div>

          <h3
            className="text-base font-semibold text-neutral-900 leading-relaxed cursor-pointer hover:text-neutral-600 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {post.title}
          </h3>

          {isExpanded && post.selftext && (
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed bg-neutral-50 rounded-xl p-4">
              {post.selftext.slice(0, 500)}
              {post.selftext.length > 500 && '...'}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-neutral-400 tabular-nums">{post.score} upvotes</span>
            <span className="text-sm text-neutral-400 tabular-nums">{post.numComments} comments</span>
            <div className="flex gap-2 flex-wrap">
              {post.matchedKeywords?.slice(0, 4).map((kw) => (
                <span key={kw} className="text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg font-medium">
                  {kw}
                </span>
              ))}
              {post.matchedKeywords?.length > 4 && (
                <span className="text-xs text-neutral-400">+{post.matchedKeywords.length - 4}</span>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
                rows={2}
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="mt-2 text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save note'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <BadgeRelevance score={post.relevanceScore} />

          <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={post.url || `https://reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-4 py-1.5 rounded-lg transition-colors text-center"
            >
              Open
            </a>
            {post.status !== 'responded' && (
              <button
                onClick={() => handleStatus('responded')}
                className="text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-1.5 rounded-lg transition-colors"
              >
                Done
              </button>
            )}
            {post.status !== 'dismissed' && (
              <button
                onClick={() => handleStatus('dismissed')}
                className="text-sm font-medium text-neutral-400 hover:text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
