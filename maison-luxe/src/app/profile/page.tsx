'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Shield, Loader2, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Erreur lors du chargement du profil');
      const data = await res.json();
      setUserData(data);
      setFormData(prev => ({ ...prev, name: data.name || '' }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Entrez votre mot de passe actuel');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      toast.success('Profil mis à jour avec succès');
      setUserData(data);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // Mettre à jour la session si le nom a changé
      if (formData.name !== session?.user?.name) {
        await update({ name: formData.name });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">
              {userData.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {userData.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="font-semibold text-gray-900">
                  {new Date(userData.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {userData.role === 'admin' && (
              <div className="flex items-center gap-3 p-4 bg-gray-900 text-white rounded-lg">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-300">Rôle</p>
                  <p className="font-semibold">Administrateur</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de modification */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le profil</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom complet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Votre nom"
                required
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Changer le mot de passe
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe
              </p>

              <div className="space-y-4">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Votre mot de passe actuel"
                  />
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Nouveau mot de passe (min. 6 caractères)"
                    minLength={6}
                  />
                </div>

                {/* Confirmer le mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Confirmer le nouveau mot de passe"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
