import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { TradeWalletProvider } from './context/TradeWalletContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TradeWalletProvider>
        <App />
      </TradeWalletProvider>
    </BrowserRouter>
  </StrictMode>,
)
