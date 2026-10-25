import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useCart } from '../../contexts/CartContext';

export default function PanierPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getSubtotal, getDiscount } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const PROMO_CODES = {
    'BIENVENUE10': 10,
    'SMA2026': 15,
    'FIRST20': 20,
  };

  const TVA_RATE = 0.18;
  const FREE_SHIPPING_THRESHOLD = 50000;

  const subtotal = getSubtotal();
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const subtotalAfterPromo = subtotal - promoDiscount;
  const shippingCost = subtotalAfterPromo >= FREE_SHIPPING_THRESHOLD ? 0 : 2500;
  const tva = subtotalAfterPromo * TVA_RATE;
  const total = subtotalAfterPromo + shippingCost + tva;

  const handleApplyPromo = () => {
    const upperCode = promoCode.toUpperCase();
    if (PROMO_CODES[upperCode as keyof typeof PROMO_CODES]) {
      setAppliedPromo({
        code: upperCode,
        discount: PROMO_CODES[upperCode as keyof typeof PROMO_CODES],
      });
      setPromoCode('');
      setPromoError('');
    } else {
      setPromoError(t('cart.invalidPromo'));
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <i className="ri-shopping-cart-line text-9xl text-gray-200"></i>
            </div>
            <h1 className="text-4xl font-bold text-[#00272B] mb-4">{t('cart.empty')}</h1>
            <p className="text-base text-gray-600 mb-8 max-w-md mx-auto">
              {t('cart.emptyHint')}
            </p>
            <Link
              to="/produits"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors whitespace-nowrap"
            >
              <i className="ri-store-2-line text-xl"></i>
              <span>{t('cart.browseShop')}</span>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-[#F6F3EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#00272B] mb-3 sm:mb-4">{t('cart.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4 sm:space-y-6">
                {items.map(item => {
                  const discount = getDiscount(item.product.id, item.quantity);
                  const unitPrice = item.product.price;
                  const discountedPrice = unitPrice * (1 - discount / 100);
                  const lineTotal = discountedPrice * item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link to={`/produits/${item.product.id}`} className="flex-shrink-0">
                          <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-contain object-center p-2 sm:p-4"
                            />
                          </div>
                        </Link>

                        {/* Product Info + Controls */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/produits/${item.product.id}`}>
                            <p className="text-xs text-[#1AAA3F] font-semibold mb-1">{item.product.brand}</p>
                            <h3 className="text-sm sm:text-lg font-bold text-[#00272B] mb-1 hover:text-[#1AAA3F] transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2 sm:mb-3">{item.product.format}</p>
                          </Link>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                <i className="ri-subtract-line text-base sm:text-lg text-[#00272B]"></i>
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                className="w-12 h-8 sm:w-16 sm:h-10 text-center text-sm font-semibold text-[#00272B] border-x border-gray-300 focus:outline-none"
                                min="1"
                                max={item.product.stock}
                              />
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <i className="ri-add-line text-base sm:text-lg text-[#00272B]"></i>
                              </button>
                            </div>

                            {/* Price on mobile */}
                            <div className="sm:hidden">
                              <p className="text-lg font-bold text-[#00272B]">
                                {lineTotal.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
                              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{t('cart.remove')}</span>
                            </button>
                          </div>

                          {discount > 0 && (
                            <div className="mt-2 inline-block px-3 py-1 bg-[#F6F3EC] text-[#1AAA3F] text-xs font-semibold rounded-lg">
                              -{discount}% de réduction
                            </div>
                          )}
                        </div>

                        {/* Price - desktop */}
                        <div className="hidden sm:block flex-shrink-0 text-right">
                          <p className="text-2xl font-bold text-[#00272B] mb-1">
                            {lineTotal.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                          </p>
                          {discount > 0 && (
                            <p className="text-sm text-gray-400 line-through">
                              {(unitPrice * item.quantity).toLocaleString('fr-FR')} FCFA
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {t('cart.perUnit', { price: discountedPrice.toLocaleString('fr-FR') })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 sm:mt-8">
                <Link
                  to="/produits"
                  className="inline-flex items-center space-x-2 text-[#1AAA3F] hover:text-[#158f35] transition-colors"
                >
                  <i className="ri-arrow-left-line"></i>
                  <span className="text-sm font-medium">{t('cart.continueShopping')}</span>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:sticky lg:top-32">
                <h2 className="text-2xl font-bold text-[#00272B] mb-6">{t('cart.summary')}</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-[#00272B] mb-3 block">{t('cart.promoCode')}</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder={t('cart.promoPlaceholder')}
                      className="flex-1 h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                      className="px-6 h-12 bg-[#00272B] text-white text-sm font-semibold rounded-lg hover:bg-[#003d42] transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {t('cart.apply')}
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {promoError}
                    </p>
                  )}
                  {appliedPromo && (
                    <div className="mt-3 flex items-center justify-between p-3 bg-[#F6F3EC] rounded-lg">
                      <div className="flex items-center space-x-2">
                        <i className="ri-checkbox-circle-fill text-[#1AAA3F]"></i>
                        <span className="text-sm font-semibold text-[#1AAA3F]">
                          {appliedPromo.code} (-{appliedPromo.discount}%)
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-sm text-gray-600 hover:text-red-500 cursor-pointer"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">{t('cart.subtotal')}</span>
                    <span className="font-semibold text-[#00272B]">
                      {subtotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-700">{t('cart.promoDiscount')}</span>
                      <span className="font-semibold text-[#1AAA3F]">
                        -{promoDiscount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">{t('cart.shipping')}</span>
                    <span className="font-semibold text-[#00272B]">
                      {shippingCost === 0 ? (
                        <span className="text-[#1AAA3F]">{t('cart.free')}</span>
                      ) : (
                        `${shippingCost.toLocaleString('fr-FR')} FCFA`
                      )}
                    </span>
                  </div>

                  {subtotalAfterPromo < FREE_SHIPPING_THRESHOLD && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        Plus que{' '}
                        <strong>
                          {(FREE_SHIPPING_THRESHOLD - subtotalAfterPromo).toLocaleString('fr-FR')} FCFA
                        </strong>{' '}
                        pour la livraison gratuite !
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">TVA (18%)</span>
                    <span className="font-semibold text-[#00272B]">
                      {tva.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-8">
                  <span className="text-xl font-bold text-[#00272B]">{t('cart.total')}</span>
                  <span className="text-3xl font-bold text-[#00272B]">
                    {total.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-3 whitespace-nowrap mb-4"
                >
                  <span>{t('cart.checkout')}</span>
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                  <span>{t('cart.securePayment')}</span>
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