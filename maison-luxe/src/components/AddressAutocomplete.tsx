'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface AddressOption {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    province?: string;
    region?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAddress?: (address: AddressOption) => void;
  placeholder?: string;
  className?: string;
  country?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelectAddress,
  placeholder = 'Entrez votre adresse...',
  className = '',
  country = '',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue] = useDebounce(value, 500);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Chercher des adresses via Nominatim (OpenStreetMap)
  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Construire l'URL avec le pays si fourni
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
      });

      if (country) {
        params.append('countrycodes', country.toLowerCase());
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'MaisonLuxe-Ecommerce/1.0',
          },
        }
      );

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 3) {
      searchAddresses(debouncedValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (e.target.value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    }
  };

  // Gestion des touches clavier (flèches + Entrée)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectSuggestion(suggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: AddressOption) => {
    // Extraire une adresse plus propre
    const houseNumber = suggestion.address.house_number || '';
    const road = suggestion.address.road || '';
    const displayText = `${houseNumber} ${road}`.trim() || suggestion.display_name.split(',')[0];
    
    onChange(displayText);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (onSelectAddress) {
      onSelectAddress(suggestion);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          // Laisser un petit délai pour permettre le clic sur une suggestion
          setTimeout(() => {
            setShowSuggestions(false);
          }, 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-2 border-b last:border-b-0 text-sm transition-colors ${
                selectedIndex === index
                  ? 'bg-primary-100 text-primary-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-900">
                {suggestion.address.road || suggestion.address.house_number
                  ? `${suggestion.address.house_number || ''} ${
                      suggestion.address.road || ''
                    }`.trim()
                  : suggestion.display_name.split(',')[0]}
              </div>
              <div className="text-xs text-gray-500">
                {[
                  suggestion.address.postcode,
                  suggestion.address.city ||
                    suggestion.address.town ||
                    suggestion.address.village,
                  suggestion.address.state ||
                    suggestion.address.province ||
                    suggestion.address.region,
                  suggestion.address.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </button>
          ))}
          {!isLoading && suggestions.length === 0 && value.length >= 3 && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Aucune adresse trouvée
            </div>
          )}
        </div>
      )}
    </div>
  );
}
