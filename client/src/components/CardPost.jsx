import { useState } from 'react';
import BadgeRelevance from './BadgeRelevance';
import { updatePostStatus, updatePostNotes } from '../api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const statusDot = {
  new: 'bg-neutral-900',
  seen: 'bg-neutral-300',
  responded: 'bg-emerald-500',
  dismissed: 'bg-neutral-200',
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

  return (
    <div className="group border-b border-neutral-100 last:border-0 py-4 first:pt-0">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[post.status]}`} />
            <span className="text-[12px] font-medium text-neutral-400">r/{post.subreddit}</span>
            <span className="text-[12px] text-neutral-300">{timeAgo(post.redditCreatedAt)}</span>
          </div>

          <h3
            className="text-[14px] font-medium text-neutral-800 leading-snug cursor-pointer hover:text-neutral-600 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {post.title}
          </h3>

          {isExpanded && post.selftext && (
            <p className="mt-2 text-[13px] text-neutral-500 leading-relaxed border-l-2 border-neutral-100 pl-3">
              {post.selftext.slice(0, 500)}
              {post.selftext.length > 500 && '...'}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-[12px] text-neutral-300 tabular-nums">{post.score} pts</span>
            <span className="text-[12px] text-neutral-300 tabular-nums">{post.numComments} comments</span>
            {post.matchedKeywords?.slice(0, 3).map((kw) => (
              <span key={kw} className="text-[11px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">
                {kw}
              </span>
            ))}
          </div>

          {isExpanded && (
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2 text-[13px] text-neutral-600 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 resize-none"
                rows={2}
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="mt-1.5 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save note'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <BadgeRelevance score={post.relevanceScore} />

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={post.url || `https://reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 px-2 py-1 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Open
            </a>
            {post.status !== 'responded' && (
              <button
                onClick={() => handleStatus('responded')}
                className="text-[11px] font-medium text-neutral-400 hover:text-emerald-600 px-2 py-1 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Done
              </button>
            )}
            {post.status !== 'dismissed' && (
              <button
                onClick={() => handleStatus('dismissed')}
                className="text-[11px] font-medium text-neutral-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-neutral-50 transition-colors"
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
