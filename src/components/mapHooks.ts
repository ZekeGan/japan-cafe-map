'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getDistance } from '@/lib/utils'
import { Cafe } from '@prisma/client'
import { defaultLagitude, defaultLongitude } from '@/constant/location'
import { useAuth } from '@/context/authContext'
import { useTranslation } from '@/context/languageContext'
import { toast } from 'sonner'

const FETCH_RADIUS = 800 // meters
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}
export function getRadiusByZoom(zoom: number) {
  if (zoom >= 17) return 500
  return 1500
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<google.maps.LatLngLiteral>({
    lat: defaultLagitude,
    lng: defaultLongitude,
  })
  const [error, setError] = useState<string>('')
  const [allowedGeo, setAllowedGeo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const renewPostion = useCallback(() => {
    const successHandler = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      })
      setError('')
      setAllowedGeo(true)
      setIsLoading(false)
    }

    const errorHandler = (err: GeolocationPositionError) => {
      toast.info(err.message, { position: 'top-right' })
      setAllowedGeo(false)
      setIsLoading(false)
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      GEOLOCATION_OPTIONS
    )
  }, [])

  return {
    position,
    error,
    isLoading,
    renewPostion,
    allowedGeo,
  }
}

export const useCafeShops = (map: google.maps.Map | null) => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [cafeShops, setCafeShops] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const lastFetchPos = useRef<google.maps.LatLngLiteral | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchCafeShops = useCallback(
    async (location: google.maps.LatLngLiteral) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      if (
        lastFetchPos.current &&
        getDistance(lastFetchPos.current, location) < FETCH_RADIUS
      ) {
        return
      }

      if (!map) return

      setIsLoading(true)
      setError('')
      abortControllerRef.current = new AbortController()

      try {
        const { Place } = (await google.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary
        const { places } = await Place.searchNearby({
          locationRestriction: {
            center: location,
            radius: getRadiusByZoom(map.getZoom() || 15),
          },
          includedTypes: ['cafe'],
          fields: [
            'id',
            'location',
            'displayName',
            'businessStatus',
            'formattedAddress',
            'googleMapsURI',
            'shortFormattedAddress',
          ],
        })
        lastFetchPos.current = location
        const formatData = places.map(d => ({
          id: d.id,
          googleMapsURI: d.googleMapsURI,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shortFormattedAddress: (d as any).shortFormattedAddress,
          displayName: d.displayName,
          businessStatus: d.businessStatus,
          formattedAddress: d.formattedAddress,
          location: {
            lat: d.location?.lat(),
            lng: d.location?.lng(),
          },
        }))

        const res = await fetch('/api/cafe/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatData),
          signal: abortControllerRef.current.signal,
        })

        if (!res.ok) {
          throw new Error()
        }

        const dbCafes: Cafe[] = await res.json()
        const uniqueItems = [...cafeShops, ...dbCafes].filter(
          (i, idx, self) => idx === self.findIndex(x => x.id === i.id)
        )

        setCafeShops(uniqueItems)
        lastFetchPos.current = location
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Error fetching cafe shops:', err)
        setError(t.map.error.fetchCafesFailed)
      } finally {
        setIsLoading(false)
      }
    },
    [cafeShops, map, t.map.error.fetchCafesFailed]
  )

  const updateFavCafe = useCallback(() => {
    if (!user) return
    const favCafes = user.favorites.map(i => i.cafe)
    const uniqueItems = [...cafeShops, ...favCafes].filter(
      (i, idx, self) => idx === self.findIndex(x => x.id === i.id)
    )
    setCafeShops(uniqueItems)
  }, [cafeShops, user])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFavCafe()
    }, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return { cafeShops, isLoading, error, fetchCafeShops }
}
