// Session-only token storage (clears on tab close)
const SITE_KEY = '__sg_site'
const ADMIN_KEY = '__sg_admin'

export const getSiteToken = () => sessionStorage.getItem(SITE_KEY)
export const setSiteToken = (t) => sessionStorage.setItem(SITE_KEY, t)
export const clearSiteToken = () => sessionStorage.removeItem(SITE_KEY)

export const getAdminToken = () => sessionStorage.getItem(ADMIN_KEY)
export const setAdminToken = (t) => sessionStorage.setItem(ADMIN_KEY, t)
export const clearAdminToken = () => sessionStorage.removeItem(ADMIN_KEY)
