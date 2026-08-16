import { useState, useEffect } from 'react';
import type { BlogPost } from '../../../../types/models';

type Article = BlogPost;

interface Props {
  mode: 'add' | 'edit';
  article?: Article | null;
  onClose: () => void;
  onSave: (article: Article) => void;
}

const categories = [
  { id: 'actualites', label: 'Actualités' },
  { id: 'conseils', label: 'Conseils' },
  { id: 'innovations', label: 'Innovations' },
  { id: 'temoignages', label: 'Témoignages' },
];

const defaultForm = {
  title: '',
  excerpt: '',
  category: 'actualites',
  author: '',
  authorRole: '',
  readTime: '5 min',
  date: new Date().toISOString().split('T')[0],
  image: '',
  content: '',
};

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export default function ArticleModal({ mode, article, onClose, onSave }: Props) {
  const [form, setForm] = useState({ ...defaultForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && article) {
      setForm({
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        author: article.author,
        authorRole: article.authorRole,
        readTime: article.readTime,
        date: article.date,
        image: article.image,
        content: article.content,
      });
    } else {
      setForm({ ...defaultForm, date: new Date().toISOString().split('T')[0] });
    }
  }, [mode, article]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Titre requis';
    if (!form.excerpt.trim()) e.excerpt = 'Résumé requis';
    if (!form.author.trim()) e.author = 'Auteur requis';
    if (!form.content.trim()) e.content = 'Contenu requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    // On repart de l'article existant pour préserver les champs hors formulaire
    // (categoryId, status, published…).
    const saved = {
      ...(article ?? {}),
      id: article?.id ?? '',
      slug: article?.slug ?? slugify(form.title),
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      author: form.author,
      authorRole: form.authorRole,
      readTime: form.readTime,
      date: form.date,
      image: form.image || 'https://readdy.ai/api/search-image?query=modern%20professional%20business%20article%20cover%20image%20clean%20minimal&width=800&height=500&seq=article-new-001&orientation=landscape',
      content: form.content,
    } as Article;

    onSave(saved);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
              <i className="ri-article-line text-[#1AAA3F] text-base"></i>
            </div>
            <h2 className="text-base font-bold text-[#00272B]">
              {mode === 'add' ? 'Nouvel article' : 'Modifier l\'article'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40 hover:text-[#00272B]">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Titre de l'article..."
              className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Catégorie</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] bg-white cursor-pointer"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            {/* Temps de lecture */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Temps de lecture</label>
              <input
                type="text"
                value={form.readTime}
                onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                placeholder="ex: 5 min"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Auteur */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Auteur <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Prénom Nom"
                className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none ${errors.author ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
              />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
            </div>

            {/* Rôle auteur */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Rôle / Titre</label>
              <input
                type="text"
                value={form.authorRole}
                onChange={e => setForm(f => ({ ...f, authorRole: e.target.value }))}
                placeholder="ex: Directeur Général"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">URL de l&apos;image</label>
            <div className="flex gap-3">
              {form.image && (
                <div className="w-16 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="text"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
                className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
          </div>

          {/* Résumé */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Résumé (extrait) <span className="text-red-500">*</span></label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              placeholder="Court résumé affiché dans la liste des articles..."
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none ${errors.excerpt ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
            />
            {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt}</p>}
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Contenu <span className="text-red-500">*</span></label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={8}
              placeholder="Contenu HTML ou texte de l'article. Vous pouvez utiliser des balises HTML (<p>, <h2>, <strong>, etc.)"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none font-mono ${errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
            <p className="text-xs text-[#00272B]/30 mt-1">HTML accepté : &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;...</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#00272B]/60 hover:text-[#00272B] cursor-pointer whitespace-nowrap">Annuler</button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-save-line"></i>
            {mode === 'add' ? 'Publier' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
