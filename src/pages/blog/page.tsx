import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { blogArticles, blogCategories } from '../../mocks/blog';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = selectedCategory === 'all' 
    ? blogArticles 
    : blogArticles.filter(article => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-10 sm:pb-16 bg-gradient-to-br from-[#EEFFF2] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-5 py-2 bg-[#FFF4F0] text-[#1AAA3F] text-sm font-semibold rounded-full mb-5 sm:mb-6">
              BLOG SMA
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#00272B] mb-4 sm:mb-6 leading-tight">
              Actualités &amp; Conseils
            </h1>
            <p className="text-base sm:text-xl text-[#4A4A4A] leading-relaxed">
              Découvrez nos dernières actualités, conseils d'experts et témoignages clients
            </p>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-5 sm:py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {blogCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-[#1AAA3F] text-white'
                    : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filteredArticles.map((article) => (
              <Link 
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
                  <div className="relative overflow-hidden h-44 sm:h-56">
                    <img 
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 sm:px-4 py-1 bg-[#1AAA3F] text-white text-xs font-semibold rounded-full">
                        {blogCategories.find(cat => cat.id === article.category)?.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#4A4A4A] mb-3">
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line"></i>
                        {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        {article.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-base sm:text-xl font-bold text-[#00272B] mb-2 sm:mb-3 group-hover:text-[#1AAA3F] transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-xs sm:text-base text-[#4A4A4A] leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="text-sm">
                        <div className="font-semibold text-[#00272B] text-xs sm:text-sm">{article.author}</div>
                        <div className="text-[#4A4A4A] text-xs">{article.authorRole}</div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#EEFFF2] rounded-full flex items-center justify-center group-hover:bg-[#1AAA3F] transition-colors flex-shrink-0">
                        <i className="ri-arrow-right-line text-[#1AAA3F] group-hover:text-white text-base sm:text-lg"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-[#4A4A4A]">Aucun article dans cette catégorie</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}