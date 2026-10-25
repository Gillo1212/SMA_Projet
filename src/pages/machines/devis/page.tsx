import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useMachines } from '../../../hooks/useMachines';
import { quotesService } from '../../../services/quotes.service';
import { LoadingState, ErrorState } from '../../../components/feature/AsyncState';

export default function DevisPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const preselectedMachine = searchParams.get('machine');
  const { machines, isLoading, error, refetch } = useMachines();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    entreprise: '',
    email: '',
    telephone: '',
    machines: preselectedMachine ? [preselectedMachine] : [],
    quantite: '1',
    message: '',
    rdv: false,
    rdvDate: '',
    rdvTime: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMachineToggle = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      machines: prev.machines.includes(slug) 
        ? prev.machines.filter(m => m !== slug)
        : [...prev.machines, slug]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.machines.length === 0) return;

    // La description reprend les éléments que le modèle `quotes` ne porte pas
    // en colonnes dédiées (liste des modèles, estimation, demande de RDV).
    // Elle reste en français quelle que soit la langue : c'est l'équipe qui la lit.
    const details = [
      `Machines souhaitées : ${selectedMachineObjects.map(m => m.name).join(', ')}`,
      `Estimation indicative : ${totalEstimated.toLocaleString('fr-FR')} FCFA`,
      formData.rdv ? `Rendez-vous souhaité : ${formData.rdvDate} à ${formData.rdvTime}` : null,
      '',
      formData.message,
    ]
      .filter(l => l !== null)
      .join('\n');

    setSubmitting(true);
    setSubmitError(null);
    try {
      await quotesService.create({
        entreprise: formData.entreprise || undefined,
        contact: formData.nom,
        email: formData.email,
        phone: formData.telephone || undefined,
        machine: selectedMachineObjects.map(m => m.name).join(', '),
        message: details,
        quantite: parseInt(formData.quantite, 10) || 1,
        budget: totalEstimated || undefined,
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t('quoteRequest.submitError'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMachineObjects = machines.filter(m => formData.machines.includes(m.slug));
  const totalEstimated = selectedMachineObjects.reduce((sum, m) => sum + (m.price * parseInt(formData.quantite)), 0);

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-[#F6F3EC]">
        <Navbar />
        <div className="pt-32 pb-20">
          {isLoading
            ? <LoadingState label={t('quoteRequest.loading')} />
            : <ErrorState message={error!} onRetry={refetch} />}
        </div>
        <Footer />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F6F3EC]">
        <Navbar />
        
        <div className="pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-[#1AAA3F] rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-4xl text-white"></i>
              </div>
              
              <h1 className="text-3xl font-bold text-[#00272B] mb-4">
                {t('quoteRequest.successTitle')}
              </h1>
              
              <p className="text-lg text-[#00272B]/70 mb-8">
                {t('quoteRequest.successText', { name: formData.nom })}
              </p>

              {formData.rdv && (
                <div className="p-6 bg-[#F6F3EC] rounded-lg mb-8">
                  <h3 className="text-sm font-semibold text-[#00272B] mb-3">{t('quoteRequest.appointmentScheduled')}</h3>
                  <div className="flex items-center justify-center gap-4 text-sm text-[#00272B]">
                    <div className="flex items-center gap-2">
                      <i className="ri-calendar-line text-[#1AAA3F]"></i>
                      <span>{new Date(formData.rdvDate).toLocaleDateString(i18n.language)}</span>
                    </div>
                    <div className="w-1 h-1 bg-[#00272B]/20 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <i className="ri-time-line text-[#1AAA3F]"></i>
                      <span>{formData.rdvTime}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-[#F6F3EC] rounded-lg mb-8">
                <h3 className="text-sm font-semibold text-[#00272B] mb-4">{t('quoteRequest.summaryTitle')}</h3>
                <div className="space-y-3">
                  {selectedMachineObjects.map(machine => (
                    <div key={machine.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#00272B]">{machine.name} × {formData.quantite}</span>
                      <span className="font-semibold text-[#00272B]">{machine.priceDisplay}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#00272B]">{t('quoteRequest.totalEstimate')}</span>
                    <span className="text-lg font-bold text-[#1AAA3F]">
                      {totalEstimated.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#00272B]/60 mb-8">
                {t('quoteRequest.confirmationSent', { email: formData.email })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/machines"
                  className="px-8 py-4 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t('quoteRequest.moreMachines')}
                </Link>
                <Link
                  to="/"
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-[#00272B] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t('quoteRequest.backHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC]">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="mb-12">
            <Link to="/machines" className="inline-flex items-center gap-2 text-sm text-[#00272B]/60 hover:text-[#1AAA3F] transition-colors mb-6">
              <i className="ri-arrow-left-line"></i>
              {t('machineDetail.backToCatalogue')}
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-[#00272B] mb-4">
              {t('quoteRequest.title')}
            </h1>
            <p className="text-lg text-[#00272B]/70">
              {t('quoteRequest.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} data-readdy-form className="bg-white rounded-2xl p-8 space-y-8">
                {/* Personal Info */}
                <div>
                  <h2 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F6F3EC] rounded-lg flex items-center justify-center">
                      <i className="ri-user-line text-[#1AAA3F]"></i>
                    </div>
                    {t('quoteRequest.yourInfo')}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#00272B] mb-2">
                        {t('quoteRequest.fullName')}
                      </label>
                      <input 
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors"
                        placeholder={t('quoteRequest.namePlaceholder')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#00272B] mb-2">
                        {t('quoteRequest.company')}
                      </label>
                      <input 
                        type="text"
                        name="entreprise"
                        value={formData.entreprise}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors"
                        placeholder={t('quoteRequest.companyPlaceholder')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#00272B] mb-2">
                        {t('quoteRequest.email')}
                      </label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors"
                        placeholder={t('quoteRequest.emailPlaceholder')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#00272B] mb-2">
                        {t('quoteRequest.phone')}
                      </label>
                      <input 
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                        className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors"
                        placeholder={t('quoteRequest.phonePlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Machine Selection */}
                <div>
                  <h2 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F6F3EC] rounded-lg flex items-center justify-center">
                      <i className="ri-vip-crown-line text-[#1AAA3F]"></i>
                    </div>
                    {t('quoteRequest.machinesWanted')}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {machines.map(machine => (
                      <button
                        key={machine.id}
                        type="button"
                        onClick={() => handleMachineToggle(machine.slug)}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                          formData.machines.includes(machine.slug)
                            ? 'border-[#1AAA3F] bg-[#F6F3EC]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={machine.image}
                            alt={machine.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#00272B] truncate">{machine.name}</h4>
                          <p className="text-xs text-[#00272B]/60">{machine.priceDisplay}</p>
                        </div>
                        {formData.machines.includes(machine.slug) && (
                          <i className="ri-checkbox-circle-fill text-2xl text-[#1AAA3F]"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-2">
                    {t('quoteRequest.quantity')}
                  </label>
                  <select 
                    name="quantite"
                    value={formData.quantite}
                    onChange={handleChange}
                    required
                    className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map(num => (
                      <option key={num} value={num}>{t('quoteRequest.units', { count: num })}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-2">
                    {t('quoteRequest.message')}
                  </label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-[#F6F3EC] border border-gray-200 rounded-lg p-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors resize-none"
                    placeholder={t('quoteRequest.messagePlaceholder')}
                  />
                </div>

                {/* RDV */}
                <div>
                  <h2 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F6F3EC] rounded-lg flex items-center justify-center">
                      <i className="ri-calendar-line text-[#1AAA3F]"></i>
                    </div>
                    {t('quoteRequest.appointmentTitle')}
                  </h2>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <input 
                      type="checkbox"
                      name="rdv"
                      checked={formData.rdv}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 accent-[#1AAA3F] cursor-pointer"
                    />
                    <label className="text-sm text-[#00272B]">
                      {t('quoteRequest.appointmentCheckbox')}
                    </label>
                  </div>

                  {formData.rdv && (
                    <div className="grid md:grid-cols-2 gap-6 pl-8">
                      <div>
                        <label className="block text-sm font-semibold text-[#00272B] mb-2">
                          {t('quoteRequest.preferredDate')}
                        </label>
                        <input 
                          type="date"
                          name="rdvDate"
                          value={formData.rdvDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#00272B] mb-2">
                          {t('quoteRequest.preferredTime')}
                        </label>
                        <select 
                          name="rdvTime"
                          value={formData.rdvTime}
                          onChange={handleChange}
                          className="w-full h-12 bg-[#F6F3EC] border border-gray-200 rounded-lg px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors cursor-pointer"
                        >
                          <option value="">{t('quoteRequest.select')}</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                    <i className="ri-error-warning-line text-red-500 mt-0.5"></i>
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={formData.machines.length === 0 || submitting}
                  className="w-full h-14 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <i className={submitting ? 'ri-loader-4-line animate-spin text-lg' : 'ri-send-plane-fill text-lg'}></i>
                  {submitting ? t('quoteRequest.submitting') : t('quoteRequest.submit')}
                </button>
              </form>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-32">
                <h3 className="text-lg font-bold text-[#00272B] mb-6">{t('quoteRequest.summary')}</h3>
                
                {formData.machines.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#F6F3EC] rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-shopping-cart-line text-3xl text-[#1AAA3F]"></i>
                    </div>
                    <p className="text-sm text-[#00272B]/60">
                      {t('quoteRequest.noMachine')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {selectedMachineObjects.map(machine => (
                        <div key={machine.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={machine.image}
                              alt={machine.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#00272B] mb-1 truncate">
                              {machine.name}
                            </h4>
                            <p className="text-xs text-[#00272B]/60">
                              {machine.priceDisplay} × {formData.quantite}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#00272B]/60">{t('quoteRequest.totalEstimate')}</span>
                        <span className="text-2xl font-bold text-[#1AAA3F]">
                          {totalEstimated.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <p className="text-xs text-[#00272B]/40">
                        {t('quoteRequest.estimateNote')}
                      </p>
                    </div>
                  </>
                )}

                <div className="mt-8 p-4 bg-[#F6F3EC] rounded-lg">
                  <h4 className="text-sm font-semibold text-[#00272B] mb-3">{t('quoteRequest.guarantees')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#00272B]">
                      <i className="ri-check-line text-[#1AAA3F]"></i>
                      <span>{t('quoteRequest.guaranteeReply')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#00272B]">
                      <i className="ri-check-line text-[#1AAA3F]"></i>
                      <span>{t('quoteRequest.guaranteeInstall')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#00272B]">
                      <i className="ri-check-line text-[#1AAA3F]"></i>
                      <span>{t('quoteRequest.guaranteeTraining')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#00272B]">
                      <i className="ri-check-line text-[#1AAA3F]"></i>
                      <span>{t('quoteRequest.guaranteeWarranty')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}