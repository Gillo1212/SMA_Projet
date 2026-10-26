import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { authService } from '../../services/auth.service';
import { ApiError } from '../../services/apiClient';

const STEP1_FIELDS = ['email', 'phone', 'first_name', 'last_name'];

/**
 * Traduit une erreur de l'API d'inscription en message affichable.
 * Le backend renvoie 409 si l'email existe, ou 400 avec
 * `errors: [{ field, message }]` si la validation échoue.
 */
function parseRegisterError(err: unknown, t: TFunction): { message: string; fields: string[] } {
  if (!(err instanceof ApiError)) {
    return { message: t('auth.errors.network'), fields: [] };
  }
  if (err.status === 409) return { message: err.message, fields: ['email'] };

  const details = Array.isArray(err.errors)
    ? (err.errors as { field?: string; message?: string }[])
    : [];
  if (details.length > 0) {
    return {
      message: details.map(d => d.message).filter(Boolean).join(' · '),
      fields: details.map(d => d.field ?? ''),
    };
  }
  return { message: err.message, fields: [] };
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  confirm: string;
  acceptTerms: boolean;
}

export default function InscriptionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    firstName: '', lastName: '', email: '', phone: '',
    company: '', password: '', confirm: '', acceptTerms: false,
  });
  const [error, setError] = useState('');

  const update = (key: keyof RegisterForm, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(form.password);
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#1AAA3F]/70', 'bg-[#1AAA3F]'];
  const strengthKeys = ['', 'weak', 'medium', 'good', 'excellent'];

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError(t('auth.errors.mismatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.errors.tooShort'));
      return;
    }
    if (strength < 2) {
      setError(t('auth.errors.tooWeak'));
      return;
    }
    setLoading(true);
    try {
      await authService.clientRegister({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim(),
        company:   form.company.trim(),
        password:  form.password,
      });
      navigate('/confirmation-email', { state: { email: form.email.trim() } });
    } catch (err) {
      const { message, fields } = parseRegisterError(err, t);
      setError(message);
      // Email déjà pris ou champ invalide de l'étape 1 : on y ramène l'utilisateur
      if (fields.some(f => STEP1_FIELDS.includes(f))) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00272B] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border-2 border-white"></div>
        </div>
        <div className="absolute top-1/3 right-0 w-1 h-64 bg-[#1AAA3F]"></div>

        <div className="relative z-10">
          <Link to="/">
            <img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-14 w-auto" />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1AAA3F]/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#1AAA3F] rounded-full animate-pulse"></div>
            <span className="text-[#1AAA3F] text-sm font-medium">{t('register.badge')}</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            {t('register.titleLine1')}<br /><span className="text-[#1AAA3F]">{t('register.titleLine2')}</span>
          </h2>
          <p className="text-white/50 text-sm mb-8">{t('register.subtitle')}</p>
          <div className="space-y-3">
            {[
              { icon: 'ri-shopping-bag-3-line', text: t('register.featureOrders') },
              { icon: 'ri-file-list-3-line', text: t('register.featureQuotes') },
              { icon: 'ri-tools-line', text: t('register.featureMachines') },
              { icon: 'ri-customer-service-2-line', text: t('register.featureSupport') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1AAA3F]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-[#1AAA3F]`}></i>
                </div>
                <span className="text-white/70 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 bg-[#1AAA3F]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-shield-check-line text-[#1AAA3F]"></i>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{t('register.dataTitle')}</p>
            <p className="text-white/40 text-xs">{t('register.dataHint')}</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8">
            <Link to="/"><img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-10 w-auto" /></Link>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-[#1AAA3F] text-white' : 'bg-gray-100 text-gray-400'
                }`}>{s}</div>
                <span className={`text-xs font-medium ${step >= s ? 'text-[#1AAA3F]' : 'text-gray-400'}`}>
                  {s === 1 ? t('register.stepInfo') : t('register.stepSecurity')}
                </span>
                {s < 2 && <div className={`h-px w-8 ${step > s ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#00272B] mb-1">
              {step === 1 ? t('register.step1Title') : t('register.step2Title')}
            </h1>
            <p className="text-[#00272B]/50 text-sm">
              {step === 1 ? t('register.step1Hint') : t('register.step2Hint')}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-5">
              <i className="ri-error-warning-line text-red-500 flex-shrink-0"></i>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('register.firstName')} <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.firstName} onChange={e => update('firstName', e.target.value)}
                    placeholder="Jean" className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('register.lastName')} <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.lastName} onChange={e => update('lastName', e.target.value)}
                    placeholder="Diop" className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('auth.email')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-mail-line text-[#00272B]/35 text-sm"></i>
                  </div>
                  <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="jean.diop@entreprise.sn" className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('register.phone')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-phone-line text-[#00272B]/35 text-sm"></i>
                  </div>
                  <input type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="+221 77 123 45 67" className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('register.company')}</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-building-2-line text-[#00272B]/35 text-sm"></i>
                  </div>
                  <input type="text" value={form.company} onChange={e => update('company', e.target.value)}
                    placeholder={t('register.companyPlaceholder')} className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all" />
                </div>
              </div>

              <button type="submit"
                className="w-full h-11 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap mt-2">
                <span>{t('register.continue')}</span>
                <i className="ri-arrow-right-line"></i>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('auth.password')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-line text-[#00272B]/35 text-sm"></i>
                  </div>
                  <input type={showPwd ? 'text' : 'password'} required value={form.password}
                    onChange={e => update('password', e.target.value)} placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[#00272B]/35 hover:text-[#00272B]/60 cursor-pointer">
                    <i className={showPwd ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-all ${strength >= level ? strengthColors[strength] : 'bg-gray-200'}`}></div>
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-amber-500' : 'text-[#1AAA3F]'}`}>
                      {t(`auth.strength.${strengthKeys[strength]}`)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('auth.confirmPassword')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-2-line text-[#00272B]/35 text-sm"></i>
                  </div>
                  <input type="password" required value={form.confirm}
                    onChange={e => update('confirm', e.target.value)} placeholder="••••••••"
                    className={`w-full h-11 pl-10 pr-4 border rounded-xl text-sm focus:outline-none transition-all ${
                      form.confirm.length > 0
                        ? form.password === form.confirm ? 'border-[#1AAA3F]' : 'border-red-300'
                        : 'border-gray-200 focus:border-[#1AAA3F]'
                    }`} />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input type="checkbox" checked={form.acceptTerms} onChange={e => update('acceptTerms', e.target.checked)}
                  required className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#1AAA3F] cursor-pointer flex-shrink-0" />
                <span className="text-xs text-[#00272B]/60 leading-relaxed">
                  <Trans
                    i18nKey="register.acceptTerms"
                    components={{
                      terms: <a href="#" className="text-[#1AAA3F] hover:underline" />,
                      privacy: <a href="#" className="text-[#1AAA3F] hover:underline" />,
                    }}
                  />
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 h-11 border-2 border-gray-200 text-[#00272B] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap">
                  {t('register.back')}
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-11 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
                  {loading ? (
                    <><i className="ri-loader-4-line animate-spin"></i><span>{t('register.submitting')}</span></>
                  ) : (
                    <><i className="ri-user-add-line"></i><span>{t('register.submit')}</span></>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-[#00272B]/50">
              {t('register.alreadyAccount')}{' '}
              <Link to="/espace-client/connexion" className="text-[#1AAA3F] hover:underline font-medium">{t('auth.signIn')}</Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-[#00272B]/30 hover:text-[#1AAA3F] transition-colors">
              <i className="ri-arrow-left-line"></i> {t('auth.backToSite')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
