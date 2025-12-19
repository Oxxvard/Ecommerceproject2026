'use client';

import { Crown, Award, Globe, Heart, Users, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 via-white to-gold-50 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gold-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <Crown className="w-20 h-20 text-gold-500 mx-auto mb-6 animate-float" />
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700 bg-clip-text text-transparent">
              À Propos de MaisonLuxe
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Votre destination privilégiée pour des produits d&apos;exception depuis 2020
            </p>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-luxury">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-gold-500/20"></div>
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                  alt="Notre magasin"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="animate-slide-up">
              <h2 className="text-4xl font-serif font-bold mb-6 text-gray-900">
                Notre Histoire
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Fondée en 2020, <span className="font-semibold text-primary-700">MaisonLuxe</span> est née d&apos;une passion pour l&apos;excellence et le raffinement. Notre mission est simple : rendre le luxe accessible à tous en sélectionnant avec soin les meilleurs produits du monde entier.
                </p>
                <p>
                  Nous croyons que chacun mérite d&apos;accéder à des produits de qualité exceptionnelle. C&apos;est pourquoi nous parcourons le globe pour dénicher des articles uniques qui allient élégance, innovation et savoir-faire artisanal.
                </p>
                <p>
                  Aujourd&apos;hui, nous sommes fiers de servir des milliers de clients satisfaits qui partagent notre vision du luxe moderne : raffiné, authentique et accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-primary-700 to-gold-600 bg-clip-text text-transparent">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ce qui guide notre engagement envers l&apos;excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: 'Excellence',
                description: 'Nous sélectionnons uniquement des produits qui répondent aux standards les plus élevés de qualité.',
                color: 'from-primary-500 to-primary-600'
              },
              {
                icon: Heart,
                title: 'Passion',
                description: 'Chaque produit est choisi avec amour et attention pour garantir votre satisfaction.',
                color: 'from-red-500 to-pink-600'
              },
              {
                icon: Globe,
                title: 'Innovation',
                description: 'Nous recherchons constamment les dernières tendances et innovations du monde entier.',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                icon: Users,
                title: 'Confiance',
                description: 'Votre satisfaction est notre priorité. Nous construisons des relations durables avec nos clients.',
                color: 'from-gold-500 to-gold-600'
              }
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-2 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${value.color} transform group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-20 bg-gradient-to-r from-primary-900 via-primary-800 to-gold-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1920')] bg-cover bg-center opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Clients Satisfaits' },
              { value: '500+', label: 'Produits Premium' },
              { value: '50+', label: 'Pays Desservis' },
              { value: '99%', label: 'Satisfaction Client' }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-4xl md:text-5xl font-serif font-bold text-gold-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gold-100 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-primary-700 to-gold-600 bg-clip-text text-transparent">
              Notre Équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des passionnés dédiés à votre satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie Laurent',
                role: 'Fondatrice & CEO',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                description: 'Passionnée de mode et d\'excellence depuis plus de 15 ans.'
              },
              {
                name: 'Marc Dubois',
                role: 'Directeur des Achats',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                description: 'Expert en sourcing de produits premium à travers le monde.'
              },
              {
                name: 'Julie Chen',
                role: 'Responsable Expérience Client',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                description: 'Dédiée à offrir le meilleur service à nos clients.'
              }
            ].map((member, index) => (
              <div
                key={index}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-80 rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-luxury transition-all">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gold-600 font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-gold-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sparkles className="w-16 h-16 text-gold-500 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-serif font-bold mb-6 text-gray-900">
            Prêt à Découvrir l&apos;Excellence ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez des milliers de clients satisfaits et découvrez notre collection exclusive
          </p>
          <a
            href="/shop"
            className="inline-block luxury-gradient text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-luxury-hover transition-all transform hover:scale-105"
          >
            Découvrir la Boutique
          </a>
        </div>
      </section>
    </div>
  );
}
