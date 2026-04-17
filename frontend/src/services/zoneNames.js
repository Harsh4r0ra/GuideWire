const ADMIN_ZONE_NAMES = {
  Mumbai: ['Andheri West', 'Bandra East', 'Kurla', 'Thane West', 'Borivali East'],
  Delhi: ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Saket', 'Rohini'],
  Bangalore: ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City'],
  Hyderabad: ['HITEC City', 'Gachibowli', 'Banjara Hills', 'Secunderabad', 'Uppal'],
  Chennai: ['Tambaram', 'T. Nagar', 'Velachery', 'Anna Nagar', 'Porur'],
}

function getCityRank(cityCounters, city) {
  const key = String(city ?? '').trim()
  const current = cityCounters.get(key) ?? 0
  cityCounters.set(key, current + 1)
  return current
}

export function getAdminZoneDisplayName(zone, cityCounters = new Map(), explicitRank = null) {
  const city = String(zone?.city ?? '').trim()
  const rank = Number.isInteger(explicitRank) ? explicitRank : getCityRank(cityCounters, city)
  const cityNames = ADMIN_ZONE_NAMES[city]
  const areaName = Array.isArray(cityNames) ? cityNames[rank] : null

  if (areaName) {
    return `${areaName} (${city})`
  }

  return String(zone?.name ?? zone?.zone_name ?? `${city} Zone ${rank + 1}`).trim()
}
