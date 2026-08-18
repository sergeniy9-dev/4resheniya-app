import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
const isShowcase =
  window.location.pathname === '/showcase' ||
  window.location.pathname.startsWith('/showcase/')

function render(Component) {
  root.render(
    <StrictMode>
      <Component />
    </StrictMode>,
  )
}

if (isShowcase) {
  import('./showcase/ShowcaseApp.jsx').then(({ default: ShowcaseApp }) => {
    render(ShowcaseApp)
  })
} else {
  render(App)
}
