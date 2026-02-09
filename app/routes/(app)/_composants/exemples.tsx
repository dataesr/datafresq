import { useState } from 'react';
import { DropdownExamples, SelectExamples, ToastExamples } from '@/components/ui/examples';

type ExampleTab = 'dropdown' | 'select' | 'toast';

export default function ComposantsExemples() {
  const [activeTab, setActiveTab] = useState<ExampleTab>('select');

  return (
    <div className="fr-container fx-container-content">
      <div
        className="fx-fullwidth-bg fr-py-3w"
        style={{ backgroundColor: 'var(--background-alt-blue-france)' }}
      >
        <h1 className="fr-h2 fr-mb-2w">Exemples de composants</h1>
        <p className="fr-text--lg fr-text-mention--grey fr-mb-4w">
          Cette page présente les exemples d'utilisation des composants Dropdown, Select et Toast.
        </p>
      </div>

      {/*<div className="fr-py-4w">
        <div className="fr-tabs">
          <ul className="fr-tabs__list" aria-label="Exemples de composants">
            <li role="presentation">
              <button
                type="button"
                id="tab-select"
                className="fr-tabs__tab"
                tabIndex={activeTab === 'select' ? 0 : -1}
                role="tab"
                aria-selected={activeTab === 'select'}
                aria-controls="panel-select"
                onClick={() => setActiveTab('select')}
              >
                Select
              </button>
            </li>
            <li role="presentation">
              <button
                type="button"
                id="tab-dropdown"
                className="fr-tabs__tab"
                tabIndex={activeTab === 'dropdown' ? 0 : -1}
                role="tab"
                aria-selected={activeTab === 'dropdown'}
                aria-controls="panel-dropdown"
                onClick={() => setActiveTab('dropdown')}
              >
                Dropdown
              </button>
            </li>
            <li role="presentation">
              <button
                type="button"
                id="tab-toast"
                className="fr-tabs__tab"
                tabIndex={activeTab === 'toast' ? 0 : -1}
                role="tab"
                aria-selected={activeTab === 'toast'}
                aria-controls="panel-toast"
                onClick={() => setActiveTab('toast')}
              >
                Toast
              </button>
            </li>
          </ul>

          <div
            id="panel-select"
            className="fr-tabs__panel"
            role="tabpanel"
            aria-labelledby="tab-select"
            hidden={activeTab !== 'select'}
          >
            {activeTab === 'select' && <SelectExamples />}
          </div>

          <div
            id="panel-dropdown"
            className="fr-tabs__panel"
            role="tabpanel"
            aria-labelledby="tab-dropdown"
            hidden={activeTab !== 'dropdown'}
          >
            {activeTab === 'dropdown' && <DropdownExamples />}
          </div>

          <div
            id="panel-toast"
            className="fr-tabs__panel"
            role="tabpanel"
            aria-labelledby="tab-toast"
            hidden={activeTab !== 'toast'}
          >
            {activeTab === 'toast' && <ToastExamples />}
          </div>
        </div>
      </div>*/}
    </div>
  );
}
