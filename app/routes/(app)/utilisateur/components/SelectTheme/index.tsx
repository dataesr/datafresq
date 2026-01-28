export default function SelectTheme() {
  return (
    <div className="settings-card">
      <div className="settings-card__main settings-card__main--vertical">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Sélectionner votre thème</p>
          <p className="fr-text--sm fr-mb-0">
            Choisissez votre thème préféré pour une expérience plus agréable.
          </p>
        </div>
        <div className="settings-card__content">
          <div className="fr-display" id="fr-display">
            <fieldset
              id="display-fieldset"
              style={{ width: '100%' }}
              className="fr-fieldset fr-segmented"
            >
              <div style={{ width: '100%' }} className="fr-segmented__elements">
                <div style={{ flex: '0 0 33.3333%' }} className="fr-segmented__element">
                  <input
                    value="light"
                    type="radio"
                    id="fr-radios-theme-light"
                    name="fr-radios-theme"
                  />
                  <label className="fr-label fx-flex" htmlFor="fr-radios-theme-light">
                    <span style={{ flexGrow: 1 }}>Clair</span>
                    <svg
                      aria-hidden="true"
                      className="fr-artwork"
                      viewBox="0 0 80 80"
                      width="48px"
                      height="48px"
                    >
                      <use
                        className="fr-artwork-decorative"
                        href="/public/dsfr/dist/artwork/light.svg#artwork-decorative"
                      />
                      <use
                        className="fr-artwork-minor"
                        href="/public/dsfr/dist/artwork/light.svg#artwork-minor"
                      />
                      <use
                        className="fr-artwork-major"
                        href="/public/dsfr/dist/artwork/light.svg#artwork-major"
                      />
                    </svg>
                  </label>
                </div>
                <div style={{ flex: '0 0 33.3333%' }} className="fr-segmented__element">
                  <input
                    value="dark"
                    type="radio"
                    id="fr-radios-theme-dark"
                    name="fr-radios-theme"
                  />
                  <label className="fr-label fx-flex" htmlFor="fr-radios-theme-dark">
                    <span style={{ flexGrow: 1 }}>Sombre</span>
                    <svg
                      aria-hidden="true"
                      className="fr-artwork"
                      viewBox="0 0 80 80"
                      width="48px"
                      height="48px"
                    >
                      <use
                        className="fr-artwork-decorative"
                        href="/public/dsfr/dist/artwork/dark.svg#artwork-decorative"
                      />
                      <use
                        className="fr-artwork-minor"
                        href="/public/dsfr/dist/artwork/dark.svg#artwork-minor"
                      />
                      <use
                        className="fr-artwork-major"
                        href="/public/dsfr/dist/artwork/dark.svg#artwork-major"
                      />
                    </svg>
                  </label>
                </div>
                <div style={{ flex: '0 0 33.3333%' }} className="fr-segmented__element">
                  <input
                    value="system"
                    type="radio"
                    id="fr-radios-theme-system"
                    name="fr-radios-theme"
                  />
                  <label className="fr-label fx-flex" htmlFor="fr-radios-theme-system">
                    <span style={{ flexGrow: 1 }}>Système</span>
                    <svg
                      aria-hidden="true"
                      className="fr-artwork"
                      viewBox="0 0 80 80"
                      width="48px"
                      height="48px"
                    >
                      <use
                        className="fr-artwork-decorative"
                        href="/public/dsfr/dist/artwork/system.svg#artwork-decorative"
                      />
                      <use
                        className="fr-artwork-minor"
                        href="/public/dsfr/dist/artwork/system.svg#artwork-minor"
                      />
                      <use
                        className="fr-artwork-major"
                        href="/public/dsfr/dist/artwork/system.svg#artwork-major"
                      />
                    </svg>
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
