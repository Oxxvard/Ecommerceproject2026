'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi
    setTimeout(() => {
      toast.success('Message envoyé avec succès ! Nous vous répondrons sous 24h.', {
        duration: 4000,
        icon: '✉️',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 via-white to-gold-50 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gold-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <MessageSquare className="w-20 h-20 text-gold-500 mx-auto mb-6 animate-float" />
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700 bg-clip-text text-transparent">
              Contactez-Nous
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informations de Contact */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">
                  Nos Coordonnées
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  N&apos;hésitez pas à nous contacter par téléphone, email ou à venir nous rendre visite dans notre boutique parisienne.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    title: 'Adresse',
                    content: '123 Avenue des Champs-Élysées\n75008 Paris, France',
                    color: 'from-red-500 to-pink-600'
                  },
                  {
                    icon: Phone,
                    title: 'Téléphone',
                    content: '+33 1 23 45 67 89\nLun-Ven: 9h-18h',
                    color: 'from-green-500 to-emerald-600'
                  },
                  {
                    icon: Mail,
                    title: 'Email',
                    content: 'contact@maisonluxe.fr\nsupport@maisonluxe.fr',
                    color: 'from-blue-500 to-cyan-600'
                  },
                  {
                    icon: Clock,
                    title: 'Horaires d\'ouverture',
                    content: 'Lun-Sam: 10h-20h\nDimanche: 11h-19h',
                    color: 'from-gold-500 to-gold-600'
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-gold-50 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carte (placeholder) */}
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-luxury bg-gradient-to-br from-primary-100 to-gold-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gold-600 mx-auto mb-2" />
                    <p className="text-gray-700 font-semibold">Carte interactive</p>
                    <p className="text-sm text-gray-600">Paris, Champs-Élysées</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de Contact */}
            <div className="animate-slide-up">
              <div className="bg-gradient-to-br from-white to-primary-50 p-8 rounded-2xl shadow-luxury">
                <div className="flex items-center mb-6">
                  <Crown className="w-8 h-8 text-gold-500 mr-3" />
                  <h2 className="text-3xl font-serif font-bold text-gray-900">
                    Envoyez-nous un Message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gold-400 transition-colors bg-white"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gold-400 transition-colors bg-white"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gold-400 transition-colors bg-white"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="question">Question sur un produit</option>
                      <option value="order">Suivi de commande</option>
                      <option value="return">Retour / Échange</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gold-400 transition-colors bg-white resize-none"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full luxury-gradient text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-luxury-hover transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    Nous nous engageons à répondre sous 24 heures ouvrées
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-primary-700 to-gold-600 bg-clip-text text-transparent">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Quels sont les délais de livraison ?',
                answer: 'Nous livrons en France métropolitaine sous 2-3 jours ouvrés. Pour l\'international, comptez 5-7 jours ouvrés.'
              },
              {
                question: 'Puis-je retourner un produit ?',
                answer: 'Oui, vous disposez de 30 jours pour retourner tout article non satisfaisant. Les retours sont gratuits.'
              },
              {
                question: 'Les produits sont-ils garantis ?',
                answer: 'Tous nos produits sont garantis 2 ans et bénéficient de notre service après-vente premium.'
              },
              {
                question: 'Acceptez-vous les paiements en plusieurs fois ?',
                answer: 'Oui, nous proposons le paiement en 3x ou 4x sans frais à partir de 100€ d\'achat.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-luxury transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/faq"
              className="inline-block text-primary-700 hover:text-gold-600 font-semibold transition-colors"
            >
              Voir toutes les questions →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
