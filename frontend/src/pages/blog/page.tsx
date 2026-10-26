import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import PageHero from '../../components/feature/PageHero';
import { useBlogPosts } from '../../hooks/useBlog';
import { LoadingState, ErrorState } from '../../components/feature/AsyncState';

export default function BlogPage() {
  const { t } = useTranslation();
  // Le site public ne montre que les articles publiés
  const { posts, isLoading, error, refetch } = useBlogPosts({ status: 'published' });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogCategories = [
    { id: 'all', name: t('blogPage.allCategories') },
    ...Array.from(
      new Map(
        posts.map(a => [a.category, { id: a.category, name: a.categoryName ?? a.category }]),
      ).values(),
    ),
  ];

  const filteredArticles = selectedCategory === 'all'
    ? posts
    : posts.filter(article => article.category === selectedCategory);

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20">
          {isLoading
            ? <LoadingState label={t('common.loading')} />
            : <ErrorState message={error!} onRetry={refetch} />}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <PageHero
        eyebrow={t('blogPage.eyebrow')}
        title={t('blogPage.title')}
        titleAccent={t('blogPage.titleAccent')}
        subtitle={t('blogPage.subtitle')}
      />

      {/* Filtres */}
      <section className="bg-white border-b border-[#00272B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5">
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-[#00272B] border-[#00272B] text-white'
                    : 'border-[#00272B]/15 text-[#00272B]/70 hover:border-[#00272B]/40 hover:text-[#00272B]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#00272B]/10 hover:border-[#00272B]/25 hover:shadow-[0_20px_40px_-24px_rgba(0,39,43,0.35)] transition-all"
              >
                <div className="relative overflow-hidden h-56 bg-[#F6F3EC]">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-article-line text-5xl text-[#00272B]/15"></i>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <p className="eyebrow text-[#0D8C2E] mb-3">
                    {blogCategories.find(cat => cat.id === article.category)?.name}
                  </p>
                  <h3 className="text-xl sm:text-2xl text-[#00272B] mb-3">{article.title}</h3>
                  <p className="text-sm text-[#00272B]/65 leading-relaxed mb-6 line-clamp-2">{article.excerpt}</p>

                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#00272B]/8 text-xs text-[#00272B]/55">
                    <span>
                      {article.date && new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{article.readTime}
                    </span>
                    <span className="w-9 h-9 rounded-full border border-[#00272B]/15 flex items-center justify-center text-[#00272B] group-hover:bg-[#00272B] group-hover:text-white transition-colors">
                      <i className="ri-arrow-right-up-line"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-[#4A4A4A]">{t('blogPage.emptyCategory')}</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}