const listeners = new Set<() => boolean>();

const BackHandler = {
  addEventListener: (_event: string, handler: () => boolean) => {
    listeners.add(handler);
    return {
      remove: () => listeners.delete(handler),
    };
  },
  removeEventListener: (_event: string, handler: () => boolean) => {
    listeners.delete(handler);
  },
  exitApp: () => {},
};

export default BackHandler;

