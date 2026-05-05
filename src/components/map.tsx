'use client'

import {
  GoogleMap,
  OverlayView,
  OverlayViewF,
  useJsApiLoader,
} from '@react-google-maps/api'
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  CalendarOffIcon,
  Cigarette,
  Coffee,
  Heart,
  Infinity,
  Navigation,
  Plug,
  Wifi,
} from 'lucide-react'
import { getDistance } from '@/lib/utils'
import clsx from 'clsx'
import { Cafe } from '@prisma/client'
import { defaultLagitude, defaultLongitude } from '@/constant/location'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useAuth } from '@/context/authContext'
import { useTranslation } from '@/context/languageContext'

const ZOOM_THRESHOLD = 15
const FETCH_RADIUS = 800 // meters
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}
const MAP_OPTIONS: google.maps.MapOptions = {
  streetViewControl: false,
  cameraControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

const UserLocationDot: React.FC<{ position: Cafe['location'] }> = ({
  position,
}) => {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)]">
          <div className="h-3.5 w-3.5 bg-[#4285F4] rounded-full border-[0.5px] border-blue-700" />
        </div>
      </div>
    </OverlayViewF>
  )
}

const CafeLocationDot: React.FC<{
  position: Cafe['location']
  onClick?: () => void
  close?: boolean
  fav?: boolean
  ariaLabel: string
}> = ({ position, close = false, fav = false, onClick, ariaLabel }) => {
  if (!position) return null

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        onClick={onClick}
        className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.()
          }
        }}
        aria-label={ariaLabel}
      >
        <div className="flex space-x-8 p-10">
          <div className="relative">
            <div
              className={clsx(
                close ? 'bg-gray-500' : fav ? 'bg-red-500' : 'bg-yellow-600',
                'w-5 h-5 p-0.5 rounded-full rounded-bl-none -rotate-45 flex items-center justify-center shadow-md'
              )}
            >
              {fav ? (
                <Heart
                  className="rotate-45 text-white"
                  size={16}
                />
              ) : (
                <Coffee
                  className="rotate-45 text-white"
                  size={16}
                />
              )}
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-700 rounded-[100%] blur-[1px]" />
          </div>
        </div>
      </div>
    </OverlayViewF>
  )
}

const useGeolocation = (t: ReturnType<typeof useTranslation>['t']) => {
  const [position, setPosition] = useState<google.maps.LatLngLiteral>({
    lat: defaultLagitude,
    lng: defaultLongitude,
  })
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const handlePosition = useCallback(() => {
    const successHandler = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      })
      setError('')
      setIsLoading(false)
    }

    const errorHandler = (err: GeolocationPositionError) => {
      setError(err.message)
      setIsLoading(false)
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      GEOLOCATION_OPTIONS
    )
  }, [])

  const renewPostion = useCallback(() => {
    setPosition({
      lat: position.lat,
      lng: position.lng,
    })
  }, [position.lat, position.lng])

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t.map.error.geolocationNotSupported)
      setIsLoading(false)
      return
    }

    handlePosition()
  }, [handlePosition, t])

  return { position, error, isLoading, handlePosition, renewPostion }
}

const useCafeShops = (
  map: google.maps.Map | null | undefined,
  currentPosition: google.maps.LatLngLiteral,
  hasGeolocation: boolean,
  errorMessage: string
) => {
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

      setIsLoading(true)
      setError('')
      abortControllerRef.current = new AbortController()

      try {
        const { Place } = (await google.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary
        const { places } = await Place.searchNearby({
          locationRestriction: { center: location, radius: FETCH_RADIUS },
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
        console.log(formatData)

        const response = await fetch('/api/cafe/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatData),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`${errorMessage}: ${response.statusText}`)
        }

        const dbCafes: Cafe[] = await response.json()
        setCafeShops(dbCafes)
        lastFetchPos.current = location
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Error fetching cafe shops:', err)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [errorMessage]
  )

  useEffect(() => {
    if (!map || !hasGeolocation) return

    const timer = setTimeout(() => {
      fetchCafeShops(currentPosition)
    }, 300)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [map, currentPosition, hasGeolocation, fetchCafeShops])

  return { cafeShops, isLoading, error, fetchCafeShops }
}

const Map: React.FC<{
  setShopInfo: (shopInfo: Cafe) => void
}> = ({ setShopInfo }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map',
    version: 'beta',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  })
  const { t } = useTranslation()

  const { user } = useAuth()
  const favList = useMemo(
    () =>
      user?.favorites.reduce(
        (acc, item) => {
          acc[item.cafeId] = true
          return acc
        },
        {} as Record<string, boolean>
      ),
    [user]
  )

  const [map, setMap] = useState<google.maps.Map | null>()
  const {
    position: userPosition,
    error: geoError,
    isLoading: isGeoLoading,
    renewPostion,
  } = useGeolocation(t)

  const {
    cafeShops,
    error: cafesError,
    fetchCafeShops,
  } = useCafeShops(
    map,
    userPosition,
    !isGeoLoading,
    t.map.error.fetchCafesFailed
  )

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }, [])

  const initialFilters = {
    hasWifi: false,
    hasSmokingArea: false,
    hasPowerOutlets: false,
    timeLimit: false,
    isBookingRequired: false,
    minConsumption: false,
  }
  const [filters, setFilters] = useState(initialFilters)
  const toggleFilter = (key: keyof typeof initialFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const clickMapDot = useCallback(
    async (shop: Cafe) => {
      try {
        const response = await fetch(`/api/cafe/${shop.id}`)
        if (response.ok) {
          const data = await response.json()
          setShopInfo(data)
        } else {
          console.error(t.map.error.fetchShopInfoFailed, response.statusText)
        }
      } catch (error) {
        console.error(t.map.error.fetchShopInfoFailed, error)
      }
    },
    [setShopInfo, t]
  )

  const cafeMarkers = useMemo(() => {
    const isNoFilterActive = Object.values(filters).every(
      value => value === false
    )
    return cafeShops
      .filter(shop => {
        if (isNoFilterActive) return true
        if (filters.hasWifi && shop.hasWifi) return true
        if (
          filters.hasSmokingArea &&
          shop.smokingAreaType &&
          shop.smokingAreaType !== 'NONE'
        )
          return true
        if (
          filters.hasPowerOutlets &&
          shop.outletCoverage &&
          shop.outletCoverage !== 'NONE'
        )
          return true
        if (filters.timeLimit && shop.timeLimit) return true
        if (filters.isBookingRequired && shop.isBookingRequired) return true
        if (filters.minConsumption && shop.minConsumption) return true
        return false
      })
      .map(shop => {
        const isClosed = shop.businessStatus !== 'OPERATIONAL'
        const ariaLabel = `${t.map.aria.cafeLocation}${isClosed ? t.map.aria.closed : ''}`
        return (
          <CafeLocationDot
            key={shop.id}
            onClick={() => clickMapDot(shop)}
            position={shop.location!}
            close={isClosed}
            fav={favList && favList[shop.id]}
            ariaLabel={ariaLabel}
          />
        )
      })
  }, [cafeShops, clickMapDot, favList, filters, t])

  const filterList: {
    key: keyof typeof initialFilters
    icon: ReactNode
    label: string
  }[] = [
    {
      key: 'hasSmokingArea',
      icon: <Cigarette />,
      label: t.map.filter.smokingArea,
    },
    { key: 'hasWifi', icon: <Wifi />, label: t.map.filter.wifi },
    {
      key: 'hasPowerOutlets',
      icon: <Plug />,
      label: t.map.filter.powerOutlets,
    },
    { key: 'timeLimit', icon: <Infinity />, label: t.map.filter.timeLimit },
    {
      key: 'isBookingRequired',
      icon: <CalendarOffIcon />,
      label: t.map.filter.noBookingRequired,
    },
    {
      key: 'minConsumption',
      icon: <Coffee />,
      label: t.map.filter.minConsumption,
    },
  ]

  const [hasGetCafes, setHasGetCafes] = useState(false)
  const [isOutOfView, setIsOutOfView] = useState(false)
  const checkPositionInView = useCallback(() => {
    if (!map || !userPosition) return
    setHasGetCafes(false)
    const currentZoom = map.getZoom() || 0
    const bounds = map.getBounds()
    if (!bounds) return

    if (currentZoom < ZOOM_THRESHOLD) {
      setIsOutOfView(false)
    } else if (bounds) {
      const inView = bounds.contains(userPosition)
      setIsOutOfView(!inView)
    }
  }, [map, userPosition])

  const getCurrentCenterCafes = useCallback(async () => {
    if (!map) return

    const center = map.getCenter()

    if (!!center?.lat && !!center?.lng) {
      await fetchCafeShops({ lat: center.lat(), lng: center.lng() })
      setHasGetCafes(true)
    }
  }, [map, fetchCafeShops])

  if (!isLoaded) return <Loading />

  return (
    <main className="relative w-full h-full">
      <nav className="absolute left-0 top-0 z-10">
        <ScrollArea className="w-screen whitespace-nowrap">
          <div className="flex gap-1 p-4">
            {filterList.map(d => (
              <Button
                key={d.key}
                variant="outline"
                className={clsx(
                  'rounded-full',
                  filters[d.key] && 'bg-gray-300'
                )}
                onClick={() => toggleFilter(d.key)}
              >
                {d.icon}
                <span>{d.label}</span>
              </Button>
            ))}
          </div>
          <ScrollBar
            orientation="horizontal"
            className="hidden"
          />
        </ScrollArea>

        {isOutOfView && !isGeoLoading && !hasGetCafes && (
          <div className="w-screen flex justify-center">
            <Button
              variant="outline"
              onClick={() => getCurrentCenterCafes()}
            >
              {t.map.button.searchThisArea}
            </Button>
          </div>
        )}
      </nav>

      <section className="absolute bottom-0 right-0 z-10 p-2">
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full"
          onClick={() => renewPostion()}
          aria-label={t.map.button.relocate}
        >
          <Navigation />
        </Button>
      </section>

      <GoogleMap
        onLoad={handleMapLoad}
        center={userPosition}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        zoom={15}
        options={MAP_OPTIONS}
        onDragEnd={checkPositionInView}
        onZoomChanged={checkPositionInView}
      >
        {!isGeoLoading && <UserLocationDot position={userPosition} />}
        {cafeMarkers}
      </GoogleMap>

      {(geoError || cafesError) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 max-w-md text-center">
          {geoError || cafesError}
        </div>
      )}
    </main>
  )
}

export default Map
