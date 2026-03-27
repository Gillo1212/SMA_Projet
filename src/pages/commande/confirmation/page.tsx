import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useCart } from '../../../contexts/CartContext';
import { generateOrderPDF } from '../../../utils/generatePDF';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [downloading, setDownloading] = useState(false);

  const orderData = location.state;

  useEffect(() => {
    if (!orderData) {
      navigate('/');
      return;
    }
    clearCart();
  }, [orderData, navigate, clearCart]);

  if (!orderData) return null;

  const { orderNumber, items, shippingAddress, deliveryMode, paymentMethod, subtotal, shippingCost, tva, total } = orderData;

  const deliveryLabels: Record<string, string> = {
    pickup: 'Retrait en magasin',
    standard: 'Livraison standard',
    express: 'Livraison express',
  };

  const paymentLabels: Record<string, string> = {
    wave: 'Wave',
    orange_money: 'Orange Money',
  };

  async function handleDownloadInvoice() {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 200));
    generateOrderPDF({ orderNumber, items, shippingAddress, deliveryMode, paymentMethod, subtotal, shippingCost, tva, total });
    setDownloading(false);
  }

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <Navbar />

      {/* Success Header */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#EEFFF2] to-[#E6F7FF]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-24 h-24 bg-[#1AAA3F] rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="ri-checkbox-circle-line text-6xl text-white"></i>
          </div>
          <h1 className="text-5xl font-bold text-[#00272B] mb-4">Commande confirmée !</h1>
          <p className="text-xl text-gray-700 mb-6">
            Merci pour votre achat. Votre commande a été enregistrée avec succès.
          </p>
          <div className="inline-flex items-center space-x-3 px-8 py-4 bg-white rounded-2xl shadow-sm">
            <i className="ri-file-list-3-line text-2xl text-[#1AAA3F]"></i>
            <div className="text-left">
              <p className="text-sm text-gray-600">Numéro de commande</p>
              <p className="text-2xl font-bold text-[#00272B]">{orderNumber}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Details */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[#00272B] mb-6 flex items-center space-x-3">
                <i className="ri-map-pin-line text-[#1AAA3F]"></i>
                <span>Informations de livraison</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Destinataire</p>
                  <p className="text-base font-semibold text-[#00272B]">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adresse</p>
                  <p className="text-base text-[#00272B]">
                    {shippingAddress.address}<br />
                    {shippingAddress.city}, {shippingAddress.postalCode}<br />
                    {shippingAddress.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <p className="text-base text-[#00272B]">
                    {shippingAddress.phone}<br />
                    {shippingAddress.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mode de livraison</p>
                  <p className="text-base font-semibold text-[#00272B]">
                    {deliveryLabels[deliveryMode]}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[#00272B] mb-6 flex items-center space-x-3">
                <i className="ri-bank-card-line text-[#1AAA3F]"></i>
                <span>Paiement</span>
              </h2>
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Méthode de paiement</p>
                  <p className="text-base font-semibold text-[#00272B]">
                    {paymentLabels[paymentMethod]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#EEFFF2] rounded-lg">
                    <i className="ri-checkbox-circle-fill text-[#1AAA3F]"></i>
                    <span className="text-sm font-semibold text-[#1AAA3F]">Paiement confirmé</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="w-full h-12 border-2 border-[#1AAA3F] text-[#1AAA3F] text-sm font-semibold rounded-xl hover:bg-[#EEFFF2] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap disabled:opacity-60"
              >
                {downloading ? (
                  <i className="ri-loader-4-line text-lg animate-spin"></i>
                ) : (
                  <i className="ri-file-pdf-line text-lg"></i>
                )}
                <span>{downloading ? 'Génération...' : 'Télécharger la facture PDF'}</span>
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-[#00272B] mb-6">Articles commandés</h2>
            <div className="space-y-6">
              {items.map((item: any) => (
                <div
                  key={item.product.id}
                  className="flex items-center space-x-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain object-center p-3"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#1AAA3F] font-semibold mb-1">{item.product.brand}</p>
                    <h3 className="text-base font-bold text-[#00272B] mb-1">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantité: {item.quantity} × {item.product.price.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-[#00272B]">
                      {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-2xl p-8 max-w-lg ml-auto mb-12">
            <h2 className="text-2xl font-bold text-[#00272B] mb-6">Récapitulatif</h2>
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Sous-total</span>
                <span className="font-semibold text-[#00272B]">
                  {subtotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Livraison</span>
                <span className="font-semibold text-[#00272B]">
                  {shippingCost === 0 ? (
                    <span className="text-[#1AAA3F]">Gratuite</span>
                  ) : (
                    `${shippingCost.toLocaleString('fr-FR')} FCFA`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">TVA (18%)</span>
                <span className="font-semibold text-[#00272B]">
                  {tva.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-xl font-bold text-[#00272B]">Total</span>
              <span className="text-3xl font-bold text-[#00272B]">
                {total.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-[#00272B] to-[#003d42] rounded-2xl p-8 text-white text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Que se passe-t-il ensuite ?</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-mail-send-line text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Confirmation par email</h3>
                <p className="text-sm text-gray-300">
                  Vous recevrez un email de confirmation avec tous les détails de votre commande.
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-box-3-line text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Préparation</h3>
                <p className="text-sm text-gray-300">
                  Notre équipe prépare votre commande avec soin dans nos entrepôts.
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-truck-line text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-2">Livraison</h3>
                <p className="text-sm text-gray-300">
                  Vous recevrez un email de suivi dès l'expédition de votre commande.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/produits"
              className="w-full sm:w-auto px-8 py-4 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-store-2-line text-xl"></i>
              <span>Retour à la boutique</span>
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-[#00272B] text-base font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-customer-service-2-line text-xl"></i>
              <span>Nous contacter</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}