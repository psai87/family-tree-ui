import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SideBar from "./SideBar.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SideBar />
  </StrictMode>,
)
