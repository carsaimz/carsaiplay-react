import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatDate, imgUrl } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface Props { contentId: number; }

function CommentItem({ comment, onReply, lang }: any) {
  const [showReplies, setShowReplies] = useState(false);
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const likeMutation = useMutation({
    mutationFn: (type: 'like' | 'dislike') => api.post(`/api/comment/${type}`, { comment_id: comment.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', comment.content_id] }),
    onError: () => toast.error('Erro ao reagir.'),
  });

  return (
    <div className="flex gap-3">
      <img src={imgUrl(comment.avatar, '/avatar.svg')} alt={comment.username}
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{comment.username || comment.profile_name}</span>
          <span className="text-xs text-text-muted">{formatDate(comment.created_at, lang)}</span>
          {comment.approved === 0 && <span className="badge-yellow text-xs">Pendente</span>}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{comment.body}</p>
        <div className="flex items-center gap-3 mt-2">
          {isAuthenticated && (
            <>
              <button onClick={() => likeMutation.mutate('like')} className="flex items-center gap-1 text-xs text-text-muted hover:text-success transition-colors">
                <i className="fa-solid fa-thumbs-up" /> {comment.likes || 0}
              </button>
              <button onClick={() => likeMutation.mutate('dislike')} className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors">
                <i className="fa-solid fa-thumbs-down" /> {comment.dislikes || 0}
              </button>
              <button onClick={() => onReply(comment)} className="text-xs text-text-muted hover:text-info transition-colors">
                <i className="fa-solid fa-reply mr-1" />{lang === 'en' ? 'Reply' : 'Responder'}
              </button>
            </>
          )}
          {comment.replies?.length > 0 && (
            <button onClick={() => setShowReplies(v => !v)} className="text-xs text-primary hover:underline">
              {showReplies ? (lang === 'en' ? 'Hide replies' : 'Ocultar respostas') : `${comment.replies.length} ${lang === 'en' ? 'replies' : 'respostas'}`}
            </button>
          )}
        </div>
        <AnimatePresence>
          {showReplies && comment.replies?.map((reply: any) => (
            <motion.div key={reply.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 ml-4 border-l-2 border-surface-border pl-3">
              <CommentItem comment={reply} onReply={onReply} lang={lang} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Comments({ contentId }: Props) {
  const { lang } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const qc = useQueryClient();
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', contentId, page],
    queryFn: () => api.get('/comments', { params: { content_id: contentId, page } }).then(r => r.data),
  });

  const postMutation = useMutation({
    mutationFn: () => api.post('/comment', { content_id: contentId, body, parent_id: replyTo?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['comments', contentId] }); setBody(''); setReplyTo(null); toast.success(t('Comentário publicado!', 'Comment posted!')); },
    onError: () => toast.error(t('Erro ao publicar comentário.', 'Error posting comment.')),
  });

  return (
    <div className="mt-10">
      <h2 className="section-title mb-6">
        <i className="fa-solid fa-comments text-primary" />
        {t('Comentários', 'Comments')}
        {data?.meta?.total > 0 && <span className="text-text-muted text-sm font-normal">({data.meta.total})</span>}
      </h2>

      {isAuthenticated ? (
        <div className="mb-6">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
              <i className="fa-solid fa-reply text-info" />
              {t('Responder a', 'Replying to')} <strong className="text-white">{replyTo.username}</strong>
              <button onClick={() => setReplyTo(null)} className="text-primary hover:underline ml-1">
                {t('Cancelar', 'Cancel')}
              </button>
            </div>
          )}
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
            placeholder={t('Escreva um comentário...', 'Write a comment...')}
            className="input resize-none" />
          <div className="flex justify-end mt-2">
            <button onClick={() => postMutation.mutate()} disabled={!body.trim() || postMutation.isPending} className="btn-primary text-sm">
              {postMutation.isPending ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-paper-plane" />}
              {t('Publicar', 'Post')}
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-4 mb-6 text-center text-sm text-text-muted">
          <i className="fa-solid fa-lock mr-2" />
          <a href="/login" className="text-primary hover:underline">{t('Inicie sessão', 'Sign in')}</a>
          {' '}{t('para comentar.', 'to comment.')}
        </div>
      )}

      <div className="space-y-5">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />) :
          data?.data?.map((c: any) => (
            <CommentItem key={c.id} comment={c} onReply={setReplyTo} lang={lang} />
          ))
        }
        {!isLoading && !data?.data?.length && (
          <p className="text-center text-text-muted text-sm py-8">
            <i className="fa-regular fa-comment text-3xl mb-2 block" />
            {t('Sem comentários. Seja o primeiro!', 'No comments yet. Be the first!')}
          </p>
        )}
      </div>

      {data?.meta?.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <span className="flex items-center text-sm text-text-muted px-3">{page} / {data.meta.last_page}</span>
          <button disabled={page === data.meta.last_page} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}
