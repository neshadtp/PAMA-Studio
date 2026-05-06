export {};

declare global {
  interface Window {
    Chatbot: {
      init: (config: any) => void;
    };
  }
}