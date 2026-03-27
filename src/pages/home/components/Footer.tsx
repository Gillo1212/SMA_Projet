import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0A0A] mx-4 sm:mx-10 rounded-t-[32px] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {/* Colonne 1 - CTA Newsletter */}
          <div className="sm:col-span-2 lg:col-span-3">
            <img
              src="https://static.readdy.ai/image/1aadd1df13f4328f806374f408610489/60a62dc5b844546eccd3f93680ad2ab4.png"
              alt="SMALIM Corporate"
              className="h-14 sm:h-20 w-auto mb-5"
            />
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-10">
              Restez Informé
            </h3>
          </div>

          {/* Colonne 2 - Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-semibold text-white mb-4 sm:mb-6">Navigation</h4>
            <div className="space-y-3 sm:space-y-4">
              <Link to="/" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">Accueil</Link>
              <Link to="/machines" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">Machines</Link>
              <Link to="/produits" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">Produits</Link>
              <Link to="/a-propos" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">À Propos</Link>
              <Link to="/blog" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">Blog</Link>
              <Link to="/contact" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Colonne 3 - Réseaux Sociaux */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-semibold text-white mb-4 sm:mb-6">Suivez-nous</h4>
            <div className="space-y-3 sm:space-y-4">
              <a href="#" className="flex items-center text-sm text-[#A0A0A0] hover:text-white transition-colors">
                <i className="ri-instagram-line text-xl mr-3"></i>Instagram
              </a>
              <a href="#" className="flex items-center text-sm text-[#A0A0A0] hover:text-white transition-colors">
                <i className="ri-linkedin-box-line text-xl mr-3"></i>LinkedIn
              </a>
              <a href="#" className="flex items-center text-sm text-[#A0A0A0] hover:text-white transition-colors">
                <i className="ri-facebook-circle-line text-xl mr-3"></i>Facebook
              </a>
            </div>
          </div>

          {/* Colonne 4 - Formulaire */}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-white mb-2">Recevez nos dernières actualités</p>
            <p className="text-sm text-[#A0A0A0] mb-5">et offres exclusives par email</p>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="w-full h-14 bg-[#1A1A1A] border border-[#333333] rounded-xl px-5 pr-16 text-white placeholder-[#666666] text-sm focus:outline-none focus:border-[#1AAA3F] transition-colors"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <i className="ri-arrow-right-line text-[#1AAA3F] text-xl"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Watermark - hidden on small screens */}
        <div className="absolute bottom-8 left-6 sm:left-16 text-[60px] sm:text-[140px] font-black text-[#1A1A1A] leading-none pointer-events-none select-none hidden sm:block">
          SMALIM
        </div>

        {/* Copyright */}
        <div className="relative z-10 text-center pt-6 border-t border-[#1A1A1A]">
          <p className="text-xs text-[#666666]">
            © 2024 SMALIM Corporate. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}