import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/base.css'
import './styles/loader.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/works.css'
import './styles/story.css'
import './styles/contact.css'
import './styles/footer.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
