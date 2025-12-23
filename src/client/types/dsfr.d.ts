/**
 * Type declarations for DSFR's JavaScript API
 * @see https://www.systeme-de-design.gouv.fr/version-courante/fr/premiers-pas/vous-etes-developpeur/api-javascript
 */

interface DSFRCollapseAPI {
  conceal: () => void;
  disclose: () => void;
}

interface DSFRModalAPI {
  conceal: () => void;
  disclose: () => void;
}

interface DSFRCollapseButtonAPI {
  focus: () => void;
}

interface DSFRModalButtonAPI {
  focus: () => void;
}

interface DSFRNavigationAPI {
  index: number;
  current: object | null;
  hasFocus: boolean;
  length: number;
  members: DSFRCollapseAPI[];
}

interface DSFRTabPanelAPI {
  conceal: () => void;
  disclose: () => void;
  focus: () => void;
}

interface DSFRTabsGroupAPI {
  index: number;
  current: object | null;
  hasFocus: boolean;
  length: number;
  members: DSFRTabPanelAPI[];
}

interface DSFRElementAPI {
  collapse?: DSFRCollapseAPI;
  collapseButton?: DSFRCollapseButtonAPI;
  modal?: DSFRModalAPI;
  modalButton?: DSFRModalButtonAPI;
  navigation?: DSFRNavigationAPI;
  tabPanel?: DSFRTabPanelAPI;
  tabsGroup?: DSFRTabsGroupAPI;
}

declare global {
  interface Window {
    dsfr?: (element: HTMLElement | null) => DSFRElementAPI | undefined;
  }
}

export {};
