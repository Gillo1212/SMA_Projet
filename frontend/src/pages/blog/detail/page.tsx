import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useBlogPost, useBlogPosts } from '../../../hooks/useBlog';
import { LoadingState } from '../../../components/feature/AsyncState';

export default function BlogDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { post: article, isLoading } = useBlogPost({ slug });
  // Alimente le bloc « articles récents » en bas de page
  const { posts: blogArticles } = useBlogPosts({ status: 'published' });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20">
          <LoadingState label={t('common.loading')} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-4xl font-bold text-[#00272B] mb-4">{t('blogDetail.notFound')}</h1>
          <Link to="/blog" className="text-[#1AAA3F] hover:underline">
            {t('blogDetail.backToBlog')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const recentArticles = blogArticles
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Article */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-[#F6F3EC] to-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-[#1AAA3F] hover:underline mb-6 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            {t('blogDetail.backToBlog')}
          </Link>
          
          <div className="mb-6">
            <span className="px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-full">
              {article.categoryName ?? article.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#00272B] mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-base text-[#4A4A4A]">
            <div className="flex items-center gap-2">
              <i className="ri-user-line"></i>
              <span className="font-semibold">{article.author}</span>
              <span>• {article.authorRole}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-calendar-line"></i>
              {new Date(article.date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-time-line"></i>
              {article.readTime}
            </div>
          </div>
        </div>
      </section>

      {/* Image principale */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={article.image}
              alt={article.title}
              className="w-full h-[500px] object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Contenu + Sidebar */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  color: '#4A4A4A'
                }}
              />
              
              {/* Partage */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-[#00272B] mb-4">{t('blogDetail.share')}</h3>
                <div className="flex gap-3">
                  <button className="w-12 h-12 bg-[#1AAA3F] text-white rounded-full flex items-center justify-center hover:bg-[#158f35] transition-colors cursor-pointer">
                    <i className="ri-facebook-fill text-xl"></i>
                  </button>
                  <button className="w-12 h-12 bg-[#25A9F2] text-white rounded-full flex items-center justify-center hover:bg-[#1e8bc9] transition-colors cursor-pointer">
                    <i className="ri-twitter-fill text-xl"></i>
                  </button>
                  <button className="w-12 h-12 bg-[#00272B] text-white rounded-full flex items-center justify-center hover:bg-[#001a1d] transition-colors cursor-pointer">
                    <i className="ri-linkedin-fill text-xl"></i>
                  </button>
                  <button className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#1fb855] transition-colors cursor-pointer">
                    <i className="ri-whatsapp-fill text-xl"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-2xl font-bold text-[#00272B] mb-6">{t('blogDetail.recent')}</h3>
                
                <div className="space-y-6">
                  {recentArticles.map((recentArticle) => (
                    <Link 
                      key={recentArticle.id}
                      to={`/blog/${recentArticle.slug}`}
                      className="block group cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={recentArticle.image}
                            alt={recentArticle.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-[#00272B] mb-2 group-hover:text-[#1AAA3F] transition-colors line-clamp-2">
                            {recentArticle.title}
                          </h4>
                          <div className="text-sm text-[#4A4A4A]">
                            {new Date(recentArticle.date).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-10 bg-gradient-to-br from-[#1AAA3F] to-[#158f35] rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">{t('blogDetail.ctaTitle')}</h3>
                  <p className="text-base mb-6 opacity-90">
                    {t('blogDetail.ctaText')}
                  </p>
                  <Link 
                    to="/contact"
                    className="inline-block w-full bg-white text-[#1AAA3F] px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {t('blogDetail.ctaButton')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}