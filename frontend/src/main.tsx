import './style.css';
import './styles/loading-spinner.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './components/App';
import { store } from './store/store';
import { queryClient } from './services/queryClient';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import 'aos/dist/aos.css';

// Initialize React application
const root = ReactDOM.createRoot(
  document.getElementById('app') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);

// Register service worker for PWA support
registerServiceWorker().catch(console.error);