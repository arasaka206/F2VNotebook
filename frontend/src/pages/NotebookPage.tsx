import React from 'react';
import { useTranslation } from 'react-i18next';
import AIHerdNotebook from '../components/notebook/AIHerdNotebook';

interface NotebookPageProps {
  introRef?: React.RefObject<HTMLDivElement | null>;
  addNoteRef?: React.RefObject<HTMLDivElement | null>;
  historyRef?: React.RefObject<HTMLDivElement | null>;
}

const NotebookPage: React.FC<NotebookPageProps> = ({ introRef, addNoteRef, historyRef }) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div ref={introRef} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2">{t('notebook.title')}</h2>
          <p className="text-gray-400 text-sm">{t('notebook.description')}</p>
        </div>

        <AIHerdNotebook addNoteRef={addNoteRef} historyRef={historyRef} />
      </div>
    </div>
  );
};

export default NotebookPage;
