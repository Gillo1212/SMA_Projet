import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useCart } from '../../contexts/CartContext';
import { ordersService } from '../../services/orders.service';
import { paymentsService } from '../../services/payments.service';

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

interface AccountCreation {
  createAccount: boolean;
  password: string;
  confirmPassword: string;
}

type DeliveryMode = 'pickup' | 'standard' | 'express';
type PaymentMethod = 'wave' | 'orange_money';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, getDiscount, clearCart } = useCart();

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

  const [account, setAccount] = useState<AccountCreation>({
    createAccount: false,
    password: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const TVA_RATE = 0.18;

  const deliveryOptions = {
    pickup: { label: 'Retrait en magasin', price: 0, delay: 'Disponible aujourd\'hui' },
    standard: { label: 'Livraison standard', price: 2500, delay: '2-3 jours ouvrables' },
    express: { label: 'Livraison express', price: 5000, delay: '24h' },
  };

  const subtotal = getSubtotal();
  const shippingCost = deliveryOptions[deliveryMode].price;
  const tva = subtotal * TVA_RATE;
  const total = subtotal + shippingCost + tva;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (account.createAccount) {
      if (account.password.length < 8) {
        setPwdError('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
      if (account.password !== account.confirmPassword) {
        setPwdError('Les mots de passe ne correspondent pas.');
        return;
      }
    }
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
          : "La commande n'a pas pu être enregistrée. Réessayez.",
      );
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    navigate('/panier');
    return null;
  }

  const steps = [
    { number: 1, label: 'Adresse', icon: 'ri-map-pin-line' },
    { number: 2, label: 'Livraison', icon: 'ri-truck-line' },
    { number: 3, label: 'Paiement', icon: 'ri-bank-card-line' },
    { number: 4, label: 'Confirmation', icon: 'ri-checkbox-circle-line' },
  ];

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <Navbar />

      {/* Header */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-[#EEFFF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#00272B] mb-6 sm:mb-8">Finaliser ma commande</h1>

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            {/* Forms */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-6">Adresse de livraison</h2>
                  <form onSubmit={handleAddressSubmit} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Prénom <span className="text-red-500">*</span></label>
                        <input type="text" required value={shippingAddress.firstName} onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="Jean" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Nom <span className="text-red-500">*</span></label>
                        <input type="text" required value={shippingAddress.lastName} onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="Diop" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Email <span className="text-red-500">*</span></label>
                        <input type="email" required value={shippingAddress.email} onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="jean.diop@exemple.com" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Téléphone <span className="text-red-500">*</span></label>
                        <input type="tel" required value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="+221 77 123 45 67" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#00272B] mb-2 block">Adresse complète <span className="text-red-500">*</span></label>
                      <input type="text" required value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="123 Avenue Léopold Sédar Senghor" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Ville <span className="text-red-500">*</span></label>
                        <input type="text" required value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="Dakar" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Code postal</label>
                        <input type="text" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]" placeholder="12000" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#00272B] mb-2 block">Pays <span className="text-red-500">*</span></label>
                        <select required value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] cursor-pointer">
                          <option value="Sénégal">Sénégal</option>
                          <option value="Mali">Mali</option>
                          <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                        </select>
                      </div>
                    </div>

                    {/* Account creation section */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setAccount(prev => ({ ...prev, createAccount: !prev.createAccount }))}
                        className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${
                          account.createAccount ? 'bg-[#EEFFF2]' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                            account.createAccount ? 'bg-[#1AAA3F] border-[#1AAA3F]' : 'border-gray-300'
                          }`}>
                            {account.createAccount && <i className="ri-check-line text-white text-xs"></i>}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#00272B]">Créer un compte SMALIM</p>
                            <p className="text-xs text-[#00272B]/50">Suivez vos commandes, accédez à vos factures et devis</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#1AAA3F] font-medium bg-[#1AAA3F]/10 px-2 py-0.5 rounded-full">Gratuit</span>
                          <i className={`ri-arrow-down-s-line text-[#00272B]/40 transition-transform ${account.createAccount ? 'rotate-180' : ''}`}></i>
                        </div>
                      </button>

                      {account.createAccount && (
                        <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                          {pwdError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <i className="ri-error-warning-line text-red-500 text-sm flex-shrink-0"></i>
                              <p className="text-red-600 text-xs">{pwdError}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-[#00272B] mb-2 block">Mot de passe <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input
                                  type={showPwd ? 'text' : 'password'}
                                  value={account.password}
                                  onChange={e => setAccount(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder="Min. 8 caractères"
                                  className="w-full h-11 px-4 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
                                />
                                <button type="button" onClick={() => setShowPwd(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 cursor-pointer">
                                  <i className={showPwd ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#00272B] mb-2 block">Confirmer <span className="text-red-500">*</span></label>
                              <input
                                type="password"
                                value={account.confirmPassword}
                                onChange={e => setAccount(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Répétez le mot de passe"
                                className={`w-full h-11 px-4 border rounded-lg text-sm focus:outline-none transition-all ${
                                  account.confirmPassword.length > 0
                                    ? account.password === account.confirmPassword ? 'border-[#1AAA3F]' : 'border-red-300'
                                    : 'border-gray-300 focus:border-[#1AAA3F]'
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-[#00272B]/40 flex items-center gap-1.5">
                            <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                            Votre compte sera créé avec l&apos;email saisi ci-dessus.
                          </p>
                        </div>
                      )}
                    </div>

                    <button type="submit" className="w-full h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap">
                      <span>Continuer vers la livraison</span>
                      <i className="ri-arrow-right-line text-xl"></i>
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Delivery Mode */}
              {currentStep === 2 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-[#00272B] mb-6">Mode de livraison</h2>
                  <div className="space-y-4 mb-8">
                    {Object.entries(deliveryOptions).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => setDeliveryMode(key as DeliveryMode)}
                        className={`w-full p-6 border-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                          deliveryMode === key
                            ? 'border-[#1AAA3F] bg-[#EEFFF2]'
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
                            <p className="text-base font-bold text-[#00272B]">{option.label}</p>
                            <p className="text-sm text-gray-600">{option.delay}</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-[#00272B]">
                          {option.price === 0 ? (
                            <span className="text-[#1AAA3F]">Gratuit</span>
                          ) : (
                            `${option.price.toLocaleString('fr-FR')} FCFA`
                          )}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 h-14 border-2 border-gray-300 text-[#00272B] text-base font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleDeliverySubmit}
                      className="flex-1 h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <span>Continuer vers le paiement</span>
                      <i className="ri-arrow-right-line text-xl"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-[#00272B] mb-6">Méthode de paiement</h2>
                  
                  <div className="space-y-4 mb-8">
                    {/* Wave */}
                    <button
                      onClick={() => setPaymentMethod('wave')}
                      className={`w-full p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'wave'
                          ? 'border-[#1AAA3F] bg-[#EEFFF2]'
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
                            <p className="text-sm text-gray-600">Paiement mobile sécurisé</p>
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
                            Vous serez redirigé vers Wave pour finaliser votre paiement de manière sécurisée.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                            <span>Paiement 100% sécurisé via Wave</span>
                          </div>
                        </div>
                      )}
                    </button>

                    {/* Orange Money */}
                    <button
                      onClick={() => setPaymentMethod('orange_money')}
                      className={`w-full p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'orange_money'
                          ? 'border-[#1AAA3F] bg-[#EEFFF2]'
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
                            <p className="text-sm text-gray-600">WebPay sécurisé</p>
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
                            Vous serez redirigé vers Orange Money WebPay pour effectuer le paiement avec votre compte Orange Money.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                            <span>Transaction sécurisée Orange Money</span>
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
                      Retour
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      className="flex-1 h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <span>Vérifier ma commande</span>
                      <i className="ri-arrow-right-line text-xl"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Final Review */}
              {currentStep === 4 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-[#00272B] mb-8">Vérification finale</h2>

                  {/* Shipping Address Review */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#00272B]">Adresse de livraison</h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
                      >
                        Modifier
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
                      <h3 className="text-lg font-bold text-[#00272B]">Mode de livraison</h3>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
                      >
                        Modifier
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      {deliveryOptions[deliveryMode].label} - {deliveryOptions[deliveryMode].delay}
                    </p>
                  </div>

                  {/* Payment Method Review */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#00272B]">Méthode de paiement</h3>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
                      >
                        Modifier
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      {paymentMethod === 'wave' ? 'Wave - Paiement mobile' : 'Orange Money - WebPay'}
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
                      Retour
                    </button>
                    <button
                      onClick={handleFinalizeOrder}
                      disabled={placingOrder}
                      className="flex-1 h-14 bg-[#1AAA3F] text-white text-base font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <i className={placingOrder ? 'ri-loader-4-line animate-spin text-xl' : 'ri-checkbox-circle-line text-xl'}></i>
                      <span>{placingOrder ? 'Redirection vers le paiement…' : 'Confirmer et payer'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:sticky lg:top-32">
                <h2 className="text-2xl font-bold text-[#00272B] mb-6">Récapitulatif</h2>

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
                          <p className="text-xs text-gray-600 mb-2">Quantité: {item.quantity}</p>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Sous-total</span>
                    <span className="font-semibold text-[#00272B]">
                      {subtotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Livraison</span>
                    <span className="font-semibold text-[#00272B]">
                      {shippingCost === 0 ? (
                        <span className="text-[#1AAA3F]">Gratuite</span>
                      ) : (
                        `${shippingCost.toLocaleString('fr-FR')} FCFA`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">TVA (18%)</span>
                    <span className="font-semibold text-[#00272B]">
                      {tva.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold text-[#00272B]">Total</span>
                  <span className="text-3xl font-bold text-[#00272B]">
                    {total.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                  </span>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                  <span>Paiement 100% sécurisé</span>
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