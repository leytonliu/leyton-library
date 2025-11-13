export function createCmsStateProvider() {
  const state = {
    provideData: {},
  };

  const defineProvideData = (provideName, initialState) => {
    state.provideData = {
      ...state.provideData,
      [provideName]: initialState,
    };
  };

  const getStateHandler = (provideName) => {
    return {
      getValue: () => {
        return state.provideData[provideName];
      },
      setValue: (newValue) => {
        state.provideData = {
          ...state.provideData,
          [provideName]: newValue,
        };
      },
    };
  };

  return {
    state,
    defineProvideData,
    getStateHandler,
  };
}
