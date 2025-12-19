'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    confirmEmail: '',
    firstName: '',
    lastName: '',
    title: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });

  // Sécurité mot de passe
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    digit: false,
    upper: false,
    lower: false,
    special: false,
    notEmail: false,
  });

  function checkPasswordSecurity(password: string, email: string) {
    const emailLocal = email ? email.split('@')[0].toLowerCase() : '';
    const pwdLower = password.toLowerCase();
    const checks = {
      length: password.length >= 8,
      digit: /[0-9]/.test(password),
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      special: /[!\?#\$&{}*+,\-\.:;<=>?@\[\]^_|~()]/.test(password),
      notEmail: emailLocal ? !pwdLower.includes(emailLocal) : true,
    };
    setPasswordChecks(checks);
    setPasswordScore(Object.values(checks).filter(Boolean).length);
    return checks;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email !== formData.confirmEmail) {
      toast.error('Les adresses email ne correspondent pas');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Validation stricte mot de passe côté client (utilise résultat synchrone)
    const checks = checkPasswordSecurity(formData.password, formData.email);
    const allValid = Object.values(checks).every(Boolean);
    if (!allValid) {
      toast.error("Votre mot de passe ne respecte pas tous les critères de sécurité.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Compte créé avec succès');
        // Essayer de connecter automatiquement l'utilisateur après création
        try {
          const signRes = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });
          if (signRes && (signRes as any).ok) {
            router.push('/');
          } else {
            // si échec pour une raison quelconque, rediriger vers la page de connexion
            router.push('/auth/signin');
          }
        } catch (_err) {
          router.push('/auth/signin');
        }
      } else {
        // Affichage d'un message d'erreur propre
        let errorMsg = '';
        if (typeof data.error === 'string') {
          errorMsg = data.error;
        } else if (data.error?.message) {
          errorMsg = data.error.message;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.error?.details) {
          // Si details est un objet ou un tableau, on affiche les messages concaténés
          if (Array.isArray(data.error.details)) {
            errorMsg = data.error.details.map((d: any) => d.message || d).join(' | ');
          } else if (typeof data.error.details === 'object') {
            errorMsg = Object.values(data.error.details).join(' | ');
          } else {
            errorMsg = String(data.error.details);
          }
        } else {
          errorMsg = "Erreur lors de l'inscription";
        }
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-light text-center mb-2 text-slate-900">Créez votre compte</h1>
        
        <button
          type="button"
          onClick={googleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-full border-2 border-slate-300 px-6 py-4 text-slate-900 font-medium hover:bg-slate-50 transition-colors disabled:opacity-60 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="#4285f4" d="M533.5 278.4c0-18.5-1.6-36.3-4.7-53.6H272v101.5h147.1c-6.4 34.6-26 63.9-55.3 83.6v69.5h89.3c52.2-48.1 82.4-118.8 82.4-201z"/>
            <path fill="#34a853" d="M272 544.3c74.7 0 137.5-24.7 183.3-67.1l-89.3-69.5c-24.9 16.7-56.7 26.6-94 26.6-72 0-133-48.6-154.8-114.3H27.2v71.6C71.8 486.8 165.5 544.3 272 544.3z"/>
            <path fill="#fbbc04" d="M117.2 330.0c-10.9-32.9-10.9-68 0-100.9V157.5H27.2c-39.7 79.6-39.7 173.5 0 253.1l90-80.6z"/>
            <path fill="#ea4335" d="M272 108.1c39.6 0 75.3 13.6 103.4 40.4l77.5-77.5C404.4 24.7 341.6 0 272 0 165.5 0 71.8 57.5 27.2 142.1l90 71.6C139 156.7 200 108.1 272 108.1z"/>
          </svg>
          Se connecter avec Google
        </button>

        <p className="text-center text-sm text-slate-600 mb-6">
          Créez votre compte pour une expérience d&apos;achat personnalisée.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                Adresse email<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, email: val });
                  checkPasswordSecurity(formData.password, val);
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-2">
                Titre<span className="text-red-500">*</span>
              </label>
              <select
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600 appearance-none bg-white"
              >
                <option value="">Sélectionnez votre civilité</option>
                <option value="M.">M.</option>
                <option value="Mme.">Mme.</option>
                <option value="Mx.">Mx.</option>
                <option value="noanswer">je préfère ne pas répondre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-slate-900 mb-2">
                Confirmation email<span className="text-red-500">*</span>
              </label>
              <input
                id="confirmEmail"
                type="email"
                required
                value={formData.confirmEmail}
                onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-900 mb-2">
                Prénom<span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                Mot de passe<span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, password: val });
                  checkPasswordSecurity(val, formData.email);
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
                Confirmation du mot de passe<span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-slate-900 mb-2">
              Date de naissance<span className="text-red-500">*</span>
            </label>
            <input
              id="birthDate"
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 border border-slate-300 rounded focus:outline-none"
            />
            <label htmlFor="terms" className="text-xs text-slate-700 leading-relaxed">
              Je consens à recevoir des communications sur nos produits, services et événements par email, plateformes en ligne ou réseaux sociaux, conformément à notre politique de confidentialité.
            </label>
            <span className="text-xs text-slate-400 ml-2">(facultatif)</span>
          </div>

          {/* Jauge sécurité mot de passe */}
          <div className="mb-4">
            <label className="block text-xs text-slate-700 mb-1">Votre mot de passe doit être différent de votre email et contenir :</label>
            <ul className="text-xs space-y-1">
              <li className={passwordChecks.length ? 'text-green-600' : 'text-red-500'}>Au moins 8 caractères</li>
              <li className={passwordChecks.digit ? 'text-green-600' : 'text-red-500'}>Au moins 1 chiffre</li>
              <li className={passwordChecks.upper ? 'text-green-600' : 'text-red-500'}>Au moins 1 lettre Majuscule</li>
              <li className={passwordChecks.lower ? 'text-green-600' : 'text-red-500'}>Au moins 1 lettre minuscule</li>
              <li className={passwordChecks.special ? 'text-green-600' : 'text-red-500'}>Au moins un caractère spécial: ! ? # $ & {'{}'} * + , - . : ; &lt; = &gt; ? @ [ ] ^ _ | ~()</li>
              <li className={passwordChecks.notEmail ? 'text-green-600' : 'text-red-500'}>Différent de votre email</li>
            </ul>
            <div className="w-full h-2 bg-slate-200 rounded mt-2">
              <div className={`h-2 rounded transition-all duration-300 ${passwordScore === 6 ? 'bg-green-500 w-full' : passwordScore >= 4 ? 'bg-yellow-400 w-2/3' : 'bg-red-500 w-1/3'}`}></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continuer'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Vous allez recevoir un code d&apos;activation par email afin<br />
          de valider la création de votre compte.
        </p>

        <p className="text-center text-sm text-slate-700 mt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/signin" className="font-semibold text-slate-900 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

