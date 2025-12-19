'use client';

import { useState } from 'react';
import Select from 'react-select';

interface CountryPhone {
  code: string;
  label: string;
  flag: string;
  dialCode: string;
  format: string;
}

// Liste des pays européens + Suisse avec indicatifs
const countryPhones: CountryPhone[] = [
  { code: 'FR', label: 'France', flag: '🇫🇷', dialCode: '+33', format: '(0)X XX XX XX XX' },
  { code: 'DE', label: 'Allemagne', flag: '🇩🇪', dialCode: '+49', format: '30 XXXXXXXXX' },
  { code: 'IT', label: 'Italie', flag: '🇮🇹', dialCode: '+39', format: '06 XXXX XXXX' },
  { code: 'ES', label: 'Espagne', flag: '🇪🇸', dialCode: '+34', format: '9XX XXX XXX' },
  { code: 'BE', label: 'Belgique', flag: '🇧🇪', dialCode: '+32', format: '4XX XXX XXX' },
  { code: 'NL', label: 'Pays-Bas', flag: '🇳🇱', dialCode: '+31', format: '6 XXXXXXXX' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹', dialCode: '+351', format: '2XX XXX XXX' },
  { code: 'AT', label: 'Autriche', flag: '🇦🇹', dialCode: '+43', format: '1 XXXXXXXX' },
  { code: 'PL', label: 'Pologne', flag: '🇵🇱', dialCode: '+48', format: '12 XXX XX XX' },
  { code: 'IE', label: 'Irlande', flag: '🇮🇪', dialCode: '+353', format: '1 XXX XXXX' },
  { code: 'SE', label: 'Suède', flag: '🇸🇪', dialCode: '+46', format: '8 XXXXXXX' },
  { code: 'DK', label: 'Danemark', flag: '🇩🇰', dialCode: '+45', format: 'XXXX XXXX' },
  { code: 'FI', label: 'Finlande', flag: '🇫🇮', dialCode: '+358', format: '9 XXXXXXX' },
  { code: 'GR', label: 'Grèce', flag: '🇬🇷', dialCode: '+30', format: '21X XXX XXXX' },
  { code: 'CZ', label: 'République tchèque', flag: '🇨🇿', dialCode: '+420', format: '2XX XXX XXX' },
  { code: 'RO', label: 'Roumanie', flag: '🇷🇴', dialCode: '+40', format: '21 XXXX XXXX' },
  { code: 'HU', label: 'Hongrie', flag: '🇭🇺', dialCode: '+36', format: '1 XXXX XXXX' },
  { code: 'SK', label: 'Slovaquie', flag: '🇸🇰', dialCode: '+421', format: '2 XXXX XXXX' },
  { code: 'BG', label: 'Bulgarie', flag: '🇧🇬', dialCode: '+359', format: '2 XXXX XXXX' },
  { code: 'HR', label: 'Croatie', flag: '🇭🇷', dialCode: '+385', format: '1 XXXX XXXX' },
  { code: 'SI', label: 'Slovénie', flag: '🇸🇮', dialCode: '+386', format: '1 XXX XXXX' },
  { code: 'LT', label: 'Lituanie', flag: '🇱🇹', dialCode: '+370', format: '5 XXX XXXX' },
  { code: 'LV', label: 'Lettonie', flag: '🇱🇻', dialCode: '+371', format: 'XXXX XXXX' },
  { code: 'EE', label: 'Estonie', flag: '🇪🇪', dialCode: '+372', format: 'XXXX XXXX' },
  { code: 'LU', label: 'Luxembourg', flag: '🇱🇺', dialCode: '+352', format: 'XXXX XXXX' },
  { code: 'CY', label: 'Chypre', flag: '🇨🇾', dialCode: '+357', format: 'XX XXXXXX' },
  { code: 'MT', label: 'Malte', flag: '🇲🇹', dialCode: '+356', format: 'XXXX XXXX' },
  { code: 'CH', label: 'Suisse', flag: '🇨🇭', dialCode: '+41', format: '21 XXX XXXX' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (countryCode: string) => void;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode = 'FR',
  onCountryChange,
  required = true,
}: PhoneInputProps) {
  const currentCountry = countryPhones.find((c) => c.code === countryCode) || countryPhones[0];
  
  // Extraire juste les chiffres du téléphone (sans l'indicatif)
  const getPhoneWithoutDialCode = (phone: string): string => {
    return phone.replace(/^[\+\d\s()-]+/, '').trim();
  };

  // Formater le numéro avec l'indicatif
  const formatPhoneWithDialCode = (phone: string, dialCode: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Supprimer l'indicatif s'il commence par celui-ci
    const dialCodeDigits = dialCode.replace(/\D/g, '');
    const phoneDigits = cleanPhone.startsWith(dialCodeDigits)
      ? cleanPhone.slice(dialCodeDigits.length)
      : cleanPhone;
    
    return `${dialCode} ${phoneDigits}`.trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Permettre seulement les chiffres, espaces, tirets et parenthèses
    inputValue = inputValue.replace(/[^\d\s\-()]/g, '');
    
    // Formater avec l'indicatif
    const formatted = formatPhoneWithDialCode(inputValue, currentCountry.dialCode);
    onChange(formatted);
  };

  const handleCountryChange = (option: any) => {
    const newCountry = countryPhones.find((c) => c.code === option.value);
    if (newCountry) {
      // Reformater le téléphone avec le nouvel indicatif
      const phoneDigits = getPhoneWithoutDialCode(value);
      const newPhone = formatPhoneWithDialCode(phoneDigits, newCountry.dialCode);
      onChange(newPhone);
      
      if (onCountryChange) {
        onCountryChange(newCountry.code);
      }
    }
  };

  // Valider que le numéro commence par l'indicatif
  const isValid = value.startsWith(currentCountry.dialCode);
  
  const selectOptions = countryPhones.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.label} ${country.dialCode}`,
  }));

  return (
    <div className="flex gap-3">
      <div className="w-40 flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pays
        </label>
        <Select
          options={selectOptions}
          value={selectOptions.find((o) => o.value === currentCountry.code)}
          onChange={handleCountryChange}
          className="react-select-container"
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: '#d1d5db',
              '&:hover': { borderColor: '#9ca3af' },
              minHeight: '42px',
            }),
          }}
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="tel"
            required={required}
            value={value}
            onChange={handlePhoneChange}
            placeholder={currentCountry.format}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
              value && !isValid
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-primary-500'
            }`}
          />
          {value && !isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm font-semibold">
              ✗
            </div>
          )}
        </div>
        {value && !isValid && (
          <p className="text-xs text-red-500 mt-1">
            Le numéro doit commencer par {currentCountry.dialCode}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Format: {currentCountry.format}
        </p>
      </div>
    </div>
  );
}
