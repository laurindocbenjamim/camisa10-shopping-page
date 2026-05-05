import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Checkout from './pages/Checkout.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/:step" element={<Checkout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)