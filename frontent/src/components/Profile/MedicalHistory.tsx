import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface MedicalHistoryProps {
  allergies: string[];
  maladiesChroniques: string[];
  onUpdateAllergies: (allergies: string[]) => void;
  onUpdateMaladies: (maladies: string[]) => void;
}

const MedicalHistory = ({
  allergies,
  maladiesChroniques,
  onUpdateAllergies,
  onUpdateMaladies
}: MedicalHistoryProps) => {
  const [newAllergie, setNewAllergie] = useState('');
  const [newMaladie, setNewMaladie] = useState('');

  const handleAddAllergie = () => {
    if (newAllergie.trim()) {
      onUpdateAllergies([...allergies, newAllergie.trim()]);
      setNewAllergie('');
    }
  };

  const handleAddMaladie = () => {
    if (newMaladie.trim()) {
      onUpdateMaladies([...maladiesChroniques, newMaladie.trim()]);
      setNewMaladie('');
    }
  };

  const handleRemoveAllergie = (index: number) => {
    onUpdateAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleRemoveMaladie = (index: number) => {
    onUpdateMaladies(maladiesChroniques.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergies
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergie}
              onChange={(e) => setNewAllergie(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajouter une allergie"
            />
            <button
              onClick={handleAddAllergie}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergie, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                {allergie}
                <button
                  onClick={() => handleRemoveAllergie(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Maladies chroniques */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maladies chroniques
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMaladie}
              onChange={(e) => setNewMaladie(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajouter une maladie chronique"
            />
            <button
              onClick={handleAddMaladie}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {maladiesChroniques.map((maladie, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full"
              >
                {maladie}
                <button
                  onClick={() => handleRemoveMaladie(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;