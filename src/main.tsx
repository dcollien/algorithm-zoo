import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import "milligram";
import './index.css'

import qs from 'query-string';

const params = qs.parse(window.location.search);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App {...params} />
  </React.StrictMode>,
)
