import { useState } from 'react';
import BadgeRelevance from './BadgeRelevance';
import { updatePostStatus, updatePostNotes } from '../api';

const statusStyles = {
  new: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  seen: 'bg-white/[0.06] text-white/40 ring-white/10',
  responded: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  dismissed: 'bg-white/[0.04] text-white/20 ring-white/[0.06]',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function ActionButton({ onClick, children, variant = 'default' }) {
  const styles = {
    default: 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70',
    primary: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15',
    danger: 'bg-white/[0.03] text-white/25 hover:bg-red-500/10 hover:text-red-400',
  };

  return (
    <button
      onClick={onClick}
      className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all duration-200 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export default function CardPost({ post, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(post.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleStatus(newStatus) {
    try {
      await updatePostStatus(post._id, newStatus);
      onStatusChange?.(post._id, newStatus);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveNotes() {
    setIsSaving(true);
    try { await updatePostNotes(post._id, notes); } catch (err) { console.error(err); }
    setIsSaving(false);
  }

  const isHighValue = post.relevanceScore >= 60;

  return (
    <div className={`group relative bg-white/[0.02] border rounded-xl transition-all duration-200 hover:bg-white/[0.035] ${
      isHighValue ? 'border-orange-500/20 hover:border-orange-500/30' : 'border-white/[0.06] hover:border-white/[0.1]'
    }`}>
      {isHighValue && (
        <div className="absolute top-0 left-6 w-8 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-semibold text-orange-400/80">r/{post.subreddit}</span>
              <span className="text-[11px] text-white/20">{timeAgo(post.redditCreatedAt)}</span>
              <BadgeRelevance score={post.relevanceScore} />
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ring-1 ring-inset ${statusStyles[post.status]}`}>
                {post.status}
              </span>
            </div>

            <h3
              className="text-[13px] font-medium text-white/90 leading-snug cursor-pointer hover:text-orange-300 transition-colors line-clamp-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {post.title}
            </h3>

            {isExpanded && post.selftext && (
              <p className="mt-3 text-[12px] text-white/40 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 line-clamp-6">
                {post.selftext.slice(0, 600)}
                {post.selftext.length > 600 && '...'}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <span className="text-[11px] text-white/20 tabular-nums">{post.score} pts</span>
              <span className="text-[11px] text-white/20 tabular-nums">{post.numComments} comments</span>
              <div className="flex gap-1 flex-wrap">
                {post.matchedKeywords?.slice(0, 3).map((kw) => (
                  <span key={kw} className="text-[10px] bg-white/[0.04] text-white/30 px-1.5 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
                {post.matchedKeywords?.length > 3 && (
                  <span className="text-[10px] text-white/20">+{post.matchedKeywords.length - 3}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <a
              href={post.url || `https://reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ActionButton variant="primary">Open</ActionButton>
            </a>
            {post.status !== 'responded' && (
              <ActionButton onClick={() => handleStatus('responded')} variant="success">Done</ActionButton>
            )}
            {post.status !== 'dismissed' && (
              <ActionButton onClick={() => handleStatus('dismissed')} variant="danger">Skip</ActionButton>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/60 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none"
              rows={2}
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="mt-1.5 text-[11px] bg-white/[0.05] text-white/40 hover:bg-white/[0.08] px-3 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
