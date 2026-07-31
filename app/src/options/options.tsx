import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store, { persistor } from '@/app/store.ts';
import { PersistGate } from 'redux-persist/integration/react';
import OptionsApp from '@/options/OptionsApp';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <OptionsApp />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
