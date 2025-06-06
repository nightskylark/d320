import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StartPage from './StartPage';
import GeneratorsPage from './GeneratorsPage';
import { AuthProvider } from './contexts/AuthContext';
import { TagProvider } from './contexts/TagContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const pathname = window.location.pathname;
let page: React.ReactElement;
if (pathname.startsWith('/eotv-enemies')) {
  page = (
    <TagProvider>
      <App />
    </TagProvider>
  );
} else if (pathname.startsWith('/eotv-generators')) {
  page = <GeneratorsPage />;
} else {
  page = <StartPage />;
}

root.render(
  <React.StrictMode>
    <AuthProvider>{page}</AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
