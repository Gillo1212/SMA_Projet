import { useState } from 'react';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formBody = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formBody.append(key, value);
      });

      const response = await fetch('https://readdy.ai/api/form/d6sblelsbgrc47fimvfg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString()
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          nom: '',
          email: '',
          telephone: '',
          sujet: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-10 sm:pb-16 bg-gradient-to-br from-[#EEFFF2] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-5 py-2 bg-[#FFF4F0] text-[#1AAA3F] text-sm font-semibold rounded-full mb-5 sm:mb-6">
              CONTACTEZ-NOUS
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#00272B] mb-4 sm:mb-6 leading-tight">
              Parlons de Votre Projet
            </h1>
            <p className="text-base sm:text-xl text-[#4A4A4A] leading-relaxed">
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-[#EEFFF2] rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#1AAA3F] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <i className="ri-phone-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#00272B] mb-2 sm:mb-3">Téléphone</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] mb-1">+221 33 123 45 67</p>
              <p className="text-sm sm:text-base text-[#4A4A4A]">+221 77 123 45 67</p>
              <p className="text-xs sm:text-sm text-[#4A4A4A] mt-2 sm:mt-3">Lun - Ven : 8h - 18h</p>
            </div>
            <div className="bg-[#EEFFF2] rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#25A9F2] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <i className="ri-mail-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#00272B] mb-2 sm:mb-3">Email</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] mb-1">contact@sma-senegal.com</p>
              <p className="text-sm sm:text-base text-[#4A4A4A]">commercial@sma-senegal.com</p>
              <p className="text-xs sm:text-sm text-[#4A4A4A] mt-2 sm:mt-3">Réponse sous 24h</p>
            </div>
            <div className="bg-[#EEFFF2] rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#1AAA3F] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <i className="ri-map-pin-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#00272B] mb-2 sm:mb-3">Adresse</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] mb-1">Zone Industrielle de Dakar</p>
              <p className="text-sm sm:text-base text-[#4A4A4A]">Rue 15, Parcelle 234</p>
              <p className="text-xs sm:text-sm text-[#4A4A4A] mt-2 sm:mt-3">Dakar, Sénégal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire + Carte */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
            {/* Formulaire */}
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#00272B] mb-3 sm:mb-4">Envoyez-nous un Message</h2>
              <p className="text-base sm:text-lg text-[#4A4A4A] mb-6 sm:mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>

              <form id="contact-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold text-[#00272B] mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1AAA3F] focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#00272B] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1AAA3F] focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-semibold text-[#00272B] mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1AAA3F] focus:border-transparent"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>

                <div>
                  <label htmlFor="sujet" className="block text-sm font-semibold text-[#00272B] mb-2">
                    Sujet *
                  </label>
                  <select
                    id="sujet"
                    name="sujet"
                    value={formData.sujet}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1AAA3F] focus:border-transparent cursor-pointer"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="Demande de devis">Demande de devis</option>
                    <option value="Information produit">Information produit</option>
                    <option value="Support technique">Support technique</option>
                    <option value="Partenariat">Partenariat</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[#00272B] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#1AAA3F] focus:border-transparent resize-none"
                    placeholder="Décrivez votre besoin..."
                  />
                  <p className="text-sm text-[#4A4A4A] mt-2">
                    {formData.message.length}/500 caractères
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1AAA3F] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#158f35] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-line text-xl"></i>
                      <span className="font-semibold">Message envoyé avec succès !</span>
                    </div>
                    <p className="text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="ri-error-warning-line text-xl"></i>
                      <span className="font-semibold">Erreur lors de l'envoi</span>
                    </div>
                    <p className="text-sm mt-1">Veuillez réessayer ou nous contacter par téléphone.</p>
                  </div>
                )}
              </form>
            </div>

            {/* Carte + Horaires */}
            <div>
              <div className="bg-[#EEFFF2] rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
                <h3 className="text-2xl font-bold text-[#00272B] mb-6">Horaires d'Ouverture</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-base font-semibold text-[#00272B]">Lundi - Vendredi</span>
                    <span className="text-base text-[#4A4A4A]">8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-base font-semibold text-[#00272B]">Samedi</span>
                    <span className="text-base text-[#4A4A4A]">9h00 - 13h00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-[#00272B]">Dimanche</span>
                    <span className="text-base text-red-600">Fermé</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-bold text-[#00272B] mb-4">Support Technique 24/7</h4>
                  <p className="text-base text-[#4A4A4A] mb-3">
                    Pour toute urgence technique, notre hotline est disponible 7 jours sur 7.
                  </p>
                  <div className="flex items-center gap-2 text-[#1AAA3F] font-semibold">
                    <i className="ri-phone-line text-xl"></i>
                    <span>+221 70 000 00 00</span>
                  </div>
                </div>
              </div>

              {/* Carte Google Maps */}
              <div className="rounded-2xl overflow-hidden h-64 sm:h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.9876543210123!2d-17.4676!3d14.7167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDQzJzAwLjEiTiAxN8KwMjgnMDMuNCJX!5e0!3m2!1sfr!2ssn!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation SMA Dakar"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTABanner
        badge="Réponse rapide"
        title="Besoin d'une Réponse Rapide ?"
        subtitle="Appelez-nous directement ou envoyez-nous un WhatsApp — notre équipe répond en moins de 2h."
        buttons={[
          { label: 'Appeler maintenant', href: 'tel:+221331234567', icon: 'ri-phone-line', variant: 'white' },
          { label: 'WhatsApp', href: 'https://wa.me/221771234567', icon: 'ri-whatsapp-line', variant: 'whatsapp', isExternal: true },
        ]}
      />

      <Footer />
    </div>
  );
}