import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchLivestock } from '../services/farm2vets';
import api from '../services/api';
import type { Livestock } from '../types';

const SPECIES_OPTIONS = [
  { value: 'Bò', labelKey: 'livestock.species.cattle' },
  { value: 'Lợn', labelKey: 'livestock.species.swine' },
  { value: 'Gà', labelKey: 'livestock.species.poultry' },
];

const LivestockPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [livestockList, setLivestockList] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSpecies, setNewSpecies] = useState('Bò');
  const [newTag, setNewTag] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchLivestock()
      .then(setLivestockList)
      .catch((err) => console.error('Failed to load livestock:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag) return window.alert(t('livestock.validation.tagRequired'));

    setIsSubmitting(true);
    try {
      await api.post('/livestock/', {
        species: newSpecies,
        tag_number: newTag,
        weight_kg: newWeight ? parseFloat(newWeight) : null
      });
      setNewTag('');
      setNewWeight('');
      loadData();
    } catch (error) {
      window.alert(t('livestock.addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpeciesIcon = (species: string) => {
    if (species === 'Bò') return '🐄';
    if (species === 'Lợn') return '🐖';
    return '🐔';
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US');

  if (loading) return <div className="p-6 text-white animate-pulse">{t('livestock.loading')}</div>;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('app.livestock')}</h1>
          <p className="text-gray-400 text-sm">{t('livestock.subtitle', { count: livestockList.length })}</p>
        </div>
      </div>

      <form onSubmit={handleAddLivestock} className="card flex flex-wrap gap-4 items-end mb-8 bg-primary-900/20 border-primary-500/30">
        <div>
          <label className="block text-xs text-gray-400 mb-1">{t('livestock.speciesLabel')}</label>
          <select
            value={newSpecies}
            onChange={(e) => setNewSpecies(e.target.value)}
            className="bg-farm-border text-white text-sm rounded-lg px-3 py-2 outline-none w-32"
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">{t('livestock.tagLabel')}</label>
          <input
            type="text"
            placeholder={t('livestock.tagPlaceholder')}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-farm-border text-white text-sm rounded-lg px-3 py-2 outline-none w-40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">{t('livestock.weightLabel')}</label>
          <input
            type="number"
            placeholder={t('livestock.optional')}
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="bg-farm-border text-white text-sm rounded-lg px-3 py-2 outline-none w-32"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? t('livestock.adding') : t('livestock.addLivestock')}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {livestockList.map((animal) => (
          <div key={animal.id} className="card hover:border-primary-500/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{getSpeciesIcon(animal.species)}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                animal.health_status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {t(`livestock.health.${animal.health_status}`, { defaultValue: animal.health_status })}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">{animal.tag_id}</h3>
            <p className="text-sm text-gray-400 mb-4">{animal.species}</p>

            <div className="space-y-1.5 border-t border-farm-border pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{t('livestock.weight')}:</span>
                <span className="text-gray-300">{animal.weight_kg ? `${animal.weight_kg} kg` : '-'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{t('livestock.entryDate')}:</span>
                <span className="text-gray-300">{formatDate(animal.created_at)}</span>
              </div>
            </div>
          </div>
        ))}

        {livestockList.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            {t('livestock.empty')}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivestockPage;
