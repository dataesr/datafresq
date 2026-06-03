import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

declare global {
  interface Window {
    _paq: any[]
  }
}

export function useMatomo() {
  const { pathname, search } = useLocation()
  const initialized = useRef(false)

  useEffect(() => {
    if (!import.meta.env.MATOMO_URL || !import.meta.env.MATOMO_SITE_ID) return

    if (!initialized.current) {
      initialized.current = true;
      window._paq = window._paq || []
      window._paq.push(["setTrackerUrl", `${import.meta.env.MATOMO_URL}matomo.php`])
      window._paq.push(["setSiteId", import.meta.env.MATOMO_SITE_ID])
      window._paq.push(["enableLinkTracking"])
      const g = document.createElement("script")
      g.async = true
      g.src = `${import.meta.env.MATOMO_URL}matomo.js`
      document.head.appendChild(g)
    }

    const url = pathname + search
    window._paq.push(["setCustomUrl", url])
    window._paq.push(["setDocumentTitle", document.title])
    window._paq.push(["trackPageView"])
  }, [pathname, search])
}
