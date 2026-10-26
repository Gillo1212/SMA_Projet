import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useCart } from '../../contexts/CartContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useShopConfig } from '../../hooks/useShopConfig';
import { ordersService } from '../../services/orders.service';
import { paymentsService } from '../../services/payments.service';
import { shopService } from '../../services/shop.service';
import { computeTotals, defaultDeliveryMode, DELIVERY_MODES } from '../../utils/orderTotals';
import type { DeliveryMode } from '../../types/models';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

type PaymentMethod = 'wave' | 'orange_money';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getSubtotal, getDiscount, clearCart, promo, setPromo } = useCart();
  const { client, isAuthenticated, isLoading: authLoading } = useClientAuth();
  const { config } = useShopConfig();

  const [currentStep, setCurrentStep] = useState(1);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sénégal',
  });

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [promoNotice, setPromoNotice] = useState<string | null>(null);

  // Seuls les modes activés dans le back-office sont proposés
  const enabledModes = DELIVERY_MODES.filter(m => config.delivery[m].enabled);
  useEffect(() => {
    if (!config.delivery[deliveryMode].enabled) setDeliveryMode(defaultDeliveryMode(config));
  }, [config, deliveryMode]);

  const subtotal = getSubtotal();
  const totals = computeTotals(config, subtotal, promo, deliveryMode);
  const shippingCost = totals.shipping ?? 0;

  // Pré-remplit l'adresse avec le profil, une seule fois
  const prefilled = useRef(false);
  useEffect(() => {
    if (!client || prefilled.current) return;
    prefilled.current = true;
    setShippingAddress(prev => ({
      ...prev,
      firstName: prev.firstName || client.prenom || '',
      lastName: prev.lastName || client.nom || '',
      email: prev.email || client.email || '',
      phone: prev.phone || client.telephone || '',
      address: prev.address || client.adresse || '',
      city: prev.city || client.ville || '',
    }));
  }, [client]);

  // Le code a été validé au panier : on revérifie qu'il s'applique toujours
  // (expiration, quota, minimum de commande) avant de l'envoyer.
  const promoChecked = useRef(false);
  useEffect(() => {
    if (!promo || promoChecked.current || !isAuthenticated) return;
    promoChecked.current = true;
    shopService.validatePromo(promo.code, subtotal).catch(() => {
      setPromo(null);
      setPromoNotice(t('checkout.promoRemoved', { code: promo.code }));
    });
  }, [promo, subtotal, isAuthenticated, setPromo, t]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleDeliverySubmit = () => {
    setCurrentStep(3);
  };

  const handlePaymentSubmit = () => {
    setCurrentStep(4);
  };

  /**
   * Crée la commande côté serveur puis ouvre la session de paiement.
   * Les montants affichés ici sont indicatifs : le backend recalcule le total
   * à partir des prix en base, et c'est ce total-là qui est payé.
   */
  const handleFinalizeOrder = async () => {
    setOrderError(null);
    setPlacingOrder(true);

    try {
      const order = await ordersService.create({
        items: items.map(item => ({
          id: item.product.id,
          type: 'product' as const,
          quantity: item.quantity,
        })),
        paiement: paymentMethod === 'wave' ? 'Wave' : 'Orange Money',
        promoCode: promo?.code,
        adresseLivraison: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        modeLivraison: deliveryMode,
      });

      const session = await paymentsService.initiate(order.id);

      // Le panier est vidé avant la redirection : au retour, la commande
      // existe déjà en base et le panier n'a plus de raison d'être.
      clearCart();
      window.location.href = session.checkoutUrl;
    } catch (err) {
      setOrderError(
        err instanceof Error
          ? err.message
          : t('checkout.review.error'),
      );
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    navigate('/panier');
    return null;
  }

  // La création de commande exige un compte client (POST /orders authentifié)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <i className="ri-loader-4-line text-3xl text-[#1AAA3F] animate-spin"></i>
      </div>
    );
  }
  if (!isAuthenticated) {
    const loginUrl = `/espace-client/connexion?redirect=${encodeURIComponent('/checkout')}`;
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto text-center bg-[#F6F3EC] rounded-2xl p-8 sm:p-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-user-line text-3xl text-[#1AAA3F]"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('checkout.login.title')}</h1>
            <p className="text-sm text-gray-600 mb-8">{t('checkout.login.hint')}</p>
            <div className="flex flex-col gap-3">
              <Link
                to={loginUrl}
                className="w-full h-12 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-login-circle-line"></i>
                {t('checkout.login.signIn')}
              </Link>
              <Link
                to="/inscription"
                className="w-full h-12 border-2 border-[#00272B]/15 text-[#00272B] text-sm font-semibold rounded-xl hover:bg-white transition-colors flex items-center justify-center"
              >
                {t('checkout.login.register')}
              </Link>
              <Link to="/panier" className="text-sm text-[#00272B]/50 hover:text-[#1AAA3F] mt-2">
                {t('checkout.backToCart')}
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const deliveryLabel = (mode: DeliveryMode) => t(`checkout.delivery.${mode}`);
  const deliveryDelay = (mode: DeliveryMode) => t(`checkout.delivery.${mode}Delay`);

  const steps = [
    { number: 1, label: t('checkout.steps.address'), icon: 'ri-map-pin-line' },
    { number: 2, label: t('checkout.steps.delivery'), icon: 'ri-truck-line' },
    { number: 3, label: t('checkout.steps.payment'), icon: 'ri-bank-card-line' },
    { number: 4, label: t('checkout.steps.confirmation'), icon: 'ri-checkbox-circle-line' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-[#F6F3EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#00272B] mb-6 sm:mb-8">{t('checkout.title')}</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-3xl">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all ${
                      currentStep >= step.number
                        ? 'bg-[#1AAA3F] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <i className={step.icon}></i>
                  </div>
                  <p className={`text-xs sm:text-sm font-semibold mt-2 sm:mt-3 ${currentStep >= step.number ? 'text-[#1AAA3F]' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 transition-all ${currentStep > step.number ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            {/* Forms */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-6">{t('checkout.address.title')}</h2>
                  <form onSubmit={handleAddressSubmit} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.firstName')} <span className="text-red-500">*</span></label>
                        <input type="text" required value={shippingAddress.firstName} onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.firstNamePlaceholder')} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.lastName')} <span className="text-red-500">*</span></label>
                        <input type="text" required value={shippingAddress.lastName} onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.lastNamePlaceholder')} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.email')} <span className="text-red-500">*</span></label>
                        <input type="email" required value={shippingAddress.email} onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.emailPlaceholder')} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.phone')} <span className="text-red-500">*</span></label>
                        <input type="tel" required value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.phonePlaceholder')} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.street')} <span className="text-red-500">*</span></label>
                      <input type="text" required value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.streetPlaceholder')} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.city')} <span className="text-red-500">*</span></label>
                        <input type="text" required value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.cityPlaceholder')} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.postalCode')}</label>
                        <input type="text" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder={t('checkout.address.postalCodePlaceholder')} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">{t('checkout.address.country')} <span className="text-red-500">*</span></label>
                        <select required value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] cursor-pointer">
                          <option value="Sénégal">Sénégal</option>
                          <option value="Mali">Mali</option>
                          <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap">
                      <span>{t('checkout.address.continue')}</span>
                      <i className="ri-arrow-right-line text-xl"></i>
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Delivery Mode */}
              {currentStep === 2 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-[#00272B] mb-6">{t('checkout.delivery.title')}</h2>
                  <div className="space-y-4 mb-8">
                    {enabledModes.map(key => {
                      const fee = computeTotals(config, subtotal, promo, key).shipping ?? 0;
                      return (
                      <button
                        key={key}
                        onClick={() => setDeliveryMode(key)}
                        className={`w-full p-6 border-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                          deliveryMode === key
                            ? 'border-[#1AAA3F] bg-[#F6F3EC]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              deliveryMode === key ? 'border-[#1AAA3F]' : 'border-gray-300'
                            }`}
                          >
                            {deliveryMode === key && (
                              <div className="w-3 h-3 bg-[#1AAA3F] rounded-full"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-base font-bold text-[#00272B]">{deliveryLabel(key)}</p>
                            <p className="text-sm text-gray-600">{deliveryDelay(key)}</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-[#00272B]">
                          {fee === 0 ? (
                            <span className="text-[#1AAA3F]">{t('checkout.delivery.free')}</span>
                          ) : (
                            `${fee.toLocaleString('fr-FR')} FCFA`
                          )}
                        </p>
                      </button>
                      );
                    })}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 h-14 border-2 border-gray-300 text-[#00272B] text-base font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('checkout.back')}
                    </button>
                    <button
                      onClick={handleDeliverySubmit}
                      className="flex-1 h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <span>{t('checkout.delivery.continue')}</span>
                      <i className="ri-arrow-right-line text-xl"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-[#00272B] mb-6">{t('checkout.payment.title')}</h2>
                  
                  <div className="space-y-4 mb-8">
                    {/* Wave */}
                    <button
                      onClick={() => setPaymentMethod('wave')}
                      className={`w-full p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'wave'
                          ? 'border-[#1AAA3F] bg-[#F6F3EC]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'wave' ? 'border-[#1AAA3F]' : 'border-gray-300'
                            }`}
                          >
                            {paymentMethod === 'wave' && (
                              <div className="w-3 h-3 bg-[#1AAA3F] rounded-full"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-base font-bold text-[#00272B]">Wave</p>
                            <p className="text-sm text-gray-600">{t('checkout.payment.waveSubtitle')}</p>
                          </div>
                        </div>
                        <div className="w-20 h-14 flex items-center justify-center bg-white rounded-xl border border-gray-100 p-2">
                          <img
                            src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/768bed2b-5283-47bc-b9e6-f4dae5cf304f_Wave.png?v=c76ba778473ee3601f42a6ffe67df37c"
                            alt="Wave"
                            className="h-10 w-auto object-contain"
                          />
                        </div>
                      </div>
                      {paymentMethod === 'wave' && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-3">
                            {t('checkout.payment.waveRedirect')}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                            <span>{t('checkout.payment.waveHint')}</span>
                          </div>
                        </div>
                      )}
                    </button>

                    {/* Orange Money */}
                    <button
                      onClick={() => setPaymentMethod('orange_money')}
                      className={`w-full p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'orange_money'
                          ? 'border-[#1AAA3F] bg-[#F6F3EC]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'orange_money' ? 'border-[#1AAA3F]' : 'border-gray-300'
                            }`}
                          >
                            {paymentMethod === 'orange_money' && (
                              <div className="w-3 h-3 bg-[#1AAA3F] rounded-full"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-base font-bold text-[#00272B]">Orange Money</p>
                            <p className="text-sm text-gray-600">{t('checkout.payment.orangeSubtitle')}</p>
                          </div>
                        </div>
                        <div className="w-20 h-14 flex items-center justify-center bg-white rounded-xl border border-gray-100 p-2">
                          <img
                            src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/7601a307-e87f-40c7-84ba-40ace6edbf5e_Orange-money.png?v=e2d6d95468557e3a937a2d097b94b09e"
                            alt="Orange Money"
                            className="h-10 w-auto object-contain"
                          />
                        </div>
                      </div>
                      {paymentMethod === 'orange_money' && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-3">
                            {t('checkout.payment.orangeRedirect')}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                            <span>{t('checkout.payment.orangeHint')}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 h-14 border-2 border-gray-300 text-[#00272B] text-base font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('checkout.back')}
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      className="flex-1 h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <span>{t('checkout.payment.continue')}</span>
                      <i className="ri-arrow-right-line text-xl"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Final Review */}
              {currentStep === 4 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-[#00272B] mb-8">{t('checkout.review.title')}</h2>

                  {/* Shipping Address Review */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#00272B]">{t('checkout.address.title')}</h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
                      >
                        {t('checkout.edit')}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      {shippingAddress.firstName} {shippingAddress.lastName}<br />
                      {shippingAddress.address}<br />
                      {shippingAddress.city}, {shippingAddress.postalCode}<br />
                      {shippingAddress.country}<br />
                      {shippingAddress.phone}<br />
                      {shippingAddress.email}
                    </p>
                  </div>

                  {/* Delivery Mode Review */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#00272B]">{t('checkout.delivery.title')}</h3>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
                      >
                        {t('checkout.edit')}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      {deliveryLabel(deliveryMode)} - {deliveryDelay(deliveryMode)}
                    </p>
                  </div>

                  {/* Payment Method Review */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#00272B]">{t('checkout.payment.title')}</h3>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
                      >
                        {t('checkout.edit')}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      {paymentMethod === 'wave'
                        ? `Wave - ${t('checkout.payment.waveSubtitle')}`
                        : `Orange Money - ${t('checkout.payment.orangeSubtitle')}`}
                    </p>
                  </div>

                  {orderError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <i className="ri-error-warning-line text-red-500 text-lg mt-0.5"></i>
                      <p className="text-sm text-red-600">{orderError}</p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={placingOrder}
                      className="flex-1 h-14 border-2 border-gray-300 text-[#00272B] text-base font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('checkout.back')}
                    </button>
                    <button
                      onClick={handleFinalizeOrder}
                      disabled={placingOrder}
                      className="flex-1 h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <i className={placingOrder ? 'ri-loader-4-line animate-spin text-xl' : 'ri-checkbox-circle-line text-xl'}></i>
                      <span>{placingOrder ? t('checkout.review.submitting') : t('checkout.review.submit')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:sticky lg:top-32">
                <h2 className="text-2xl font-bold text-[#00272B] mb-6">{t('checkout.summary.title')}</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                  {items.map(item => {
                    const discount = getDiscount(item.product.id, item.quantity);
                    const discountedPrice = item.product.price * (1 - discount / 100);
                    const lineTotal = discountedPrice * item.quantity;

                    return (
                      <div key={item.product.id} className="flex space-x-4">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain object-center p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#00272B] mb-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">{t('checkout.summary.quantity', { count: item.quantity })}</p>
                          <p className="text-sm font-bold text-[#00272B]">
                            {lineTotal.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                  {promoNotice && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">{promoNotice}</p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{t('checkout.summary.subtotal')}</span>
                    <span className="font-semibold text-[#00272B]">
                      {totals.subtotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  {promo && totals.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{t('checkout.summary.discount', { code: promo.code })}</span>
                      <span className="font-semibold text-[#1AAA3F]">
                        -{totals.discount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{t('checkout.summary.shipping')}</span>
                    <span className="font-semibold text-[#00272B]">
                      {shippingCost === 0 ? (
                        <span className="text-[#1AAA3F]">{t('checkout.summary.free')}</span>
                      ) : (
                        `${shippingCost.toLocaleString('fr-FR')} FCFA`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{t('checkout.summary.vat')} ({config.taxRate} %)</span>
                    <span className="font-semibold text-[#00272B]">
                      {totals.tax.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold text-[#00272B]">{t('checkout.summary.total')}</span>
                  <span className="text-3xl font-bold text-[#00272B]">
                    {totals.total.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                  </span>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                  <span>{t('checkout.summary.secure')}</span>
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