declare global {
  interface Window {
    dsfr: {
      start: () => void;
      stop: () => void;
    };
  }
}
export {};
