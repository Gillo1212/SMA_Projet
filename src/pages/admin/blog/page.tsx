import { useState } from 'react';
import { blogArticles as initialArticles, blogCategories } from '../../../mocks/blog';
import ArticleModal from './components/ArticleModal';
import DeleteModal from './components/DeleteModal';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  authorRole: string;
  readTime: string;
  date: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const categoryColors: Record<string, string> = {
  innovations: 'bg-indigo-50 text-indigo-700',
  conseils: 'bg-sky-50 text-sky-700',
  temoignages: 'bg-amber-50 text-amber-700',
  actualites: 'bg-emerald-50 text-emerald-700',
};

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>(initialArticles as Article[]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || a.category === filterCat;
    return matchSearch && matchCat;
  });

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleSave(article: Article) {
    if (modalMode === 'add') {
      setArticles(prev => [article, ...prev]);
      showToast(`Article "${article.title.substring(0, 40)}..." publié`);
    } else {
      setArticles(prev => prev.map(a => a.id === article.id ? article : a));
      showToast('Article mis à jour avec succès');
    }
    setModalMode(null);
    setSelectedArticle(null);
  }

  function handleDeleteConfirm() {
    if (!articleToDelete) return;
    setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
    showToast(`Article supprimé`);
    setShowDeleteModal(false);
    setArticleToDelete(null);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total articles', value: articles.length, icon: 'ri-article-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: 'Innovations', value: articles.filter(a => a.category === 'innovations').length, icon: 'ri-lightbulb-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Conseils', value: articles.filter(a => a.category === 'conseils').length, icon: 'ri-bookmark-line', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Actualités', value: articles.filter(a => a.category === 'actualites').length, icon: 'ri-newspaper-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-[#00272B]">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#00272B]/30 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher article..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-56 h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <div className="flex gap-2">
              {blogCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                    filterCat === cat.id ? 'bg-[#1AAA3F] text-white' : 'text-[#00272B]/50 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setSelectedArticle(null); setModalMode('add'); }}
            className="px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Nouvel article
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
              <i className="ri-article-line text-[#00272B]/30 text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#00272B]/40">Aucun article trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(article => (
              <div key={article.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-5">
                  <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[article.category] ?? 'bg-gray-100 text-gray-600'}`}>
                            {blogCategories.find(c => c.id === article.category)?.name ?? article.category}
                          </span>
                          <span className="text-xs text-[#00272B]/35">{article.readTime}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#00272B] mb-1 line-clamp-1">{article.title}</p>
                        <p className="text-xs text-[#00272B]/50 line-clamp-2">{article.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setSelectedArticle(article); setModalMode('edit'); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40 hover:text-[#00272B]"
                          title="Modifier"
                        >
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => { setArticleToDelete(article); setShowDeleteModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer text-[#00272B]/40 hover:text-red-500"
                          title="Supprimer"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-[#00272B]/35">{article.author} · {article.authorRole}</p>
                      <span className="text-[#00272B]/20">·</span>
                      <p className="text-xs text-[#00272B]/35">{article.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalMode && (
        <ArticleModal
          mode={modalMode}
          article={selectedArticle}
          onClose={() => { setModalMode(null); setSelectedArticle(null); }}
          onSave={handleSave}
        />
      )}

      {showDeleteModal && articleToDelete && (
        <DeleteModal
          itemName={articleToDelete.title.length > 50 ? articleToDelete.title.substring(0, 50) + '...' : articleToDelete.title}
          onClose={() => { setShowDeleteModal(false); setArticleToDelete(null); }}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl ${toast.type === 'success' ? 'bg-[#00272B]' : 'bg-red-900'}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-[#1AAA3F]/20' : 'bg-red-500/20'}`}>
            <i className={`text-sm ${toast.type === 'success' ? 'ri-checkbox-circle-line text-[#1AAA3F]' : 'ri-error-warning-line text-red-300'}`}></i>
          </div>
          <p className="text-sm font-medium text-white">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-1 text-white/40 hover:text-white cursor-pointer w-5 h-5 flex items-center justify-center">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
}
