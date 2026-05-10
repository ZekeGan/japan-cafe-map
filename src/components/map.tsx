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
import { toast } from 'sonner'
import Footer from './footer'

const ZOOM_THRESHOLD = 15
const FETCH_RADIUS = 800 // meters
const GOOGLE_MAP_LIBRARIES: 'places'[] = ['places']
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
  gestureHandling: 'greedy',
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

function getRadiusByZoom(zoom: number) {
  if (zoom >= 17) return 500
  return 1500
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
}> = ({ position, close = false, fav = false, onClick }) => {
  if (!position) return null

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <button
        onClick={onClick}
        className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer "
      >
        <div
          className={clsx(
            'bg-white rounded-full rounded-bl-none -rotate-45 flex items-center justify-center shadow-sm'
          )}
        >
          <span
            className={clsx(
              close ? 'bg-gray-500' : fav ? 'bg-rose-500' : 'bg-amber-900',
              'w-6 h-6 rounded-full flex items-center justify-center m-0.5'
            )}
          >
            {fav ? (
              <Heart
                className="rotate-45 text-white fill-white"
                size={16}
              />
            ) : (
              <Coffee
                className="rotate-45 text-white ml-px mt-px "
                size={16}
              />
            )}
          </span>
        </div>
      </button>
    </OverlayViewF>
  )
}

const useGeolocation = () => {
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

const useCafeShops = (map: google.maps.Map | null) => {
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
      console.log(map.getZoom())

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

const Map: React.FC<{
  setShopId: (shopId: string | null) => void
}> = ({ setShopId }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map',
    version: 'beta',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAP_LIBRARIES,
  })
  const { t } = useTranslation()
  const { user } = useAuth()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const { cafeShops, error: cafesError, fetchCafeShops } = useCafeShops(map)
  const {
    position: userPosition,
    error: geoError,
    isLoading: isGeoLoading,
    renewPostion,
    allowedGeo,
  } = useGeolocation()

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

  const clickMapDot = useCallback((id: string) => setShopId(id), [setShopId])

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
            onClick={() => clickMapDot(shop.id)}
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
  const [isOutOfView, setIsOutOfView] = useState(true)
  const checkPositionInView = useCallback(() => {
    if (!map || !userPosition) return
    setHasGetCafes(false)
    const currentZoom = map.getZoom() || 0
    const bounds = map.getBounds()
    if (!bounds) return

    if (currentZoom < ZOOM_THRESHOLD) setIsOutOfView(false)
    else setIsOutOfView(true)
  }, [map, userPosition])

  const getCurrentCenterCafes = useCallback(async () => {
    try {
      if (!map) return

      const center = map.getCenter()

      if (!!center?.lat && !!center?.lng) {
        await fetchCafeShops({ lat: center.lat(), lng: center.lng() })
        setHasGetCafes(true)
      }
    } catch {
      toast.error('Failed to get Cafe Shop')
    }
  }, [map, fetchCafeShops])

  // 錯誤TOAST，避免多次呼叫
  useEffect(() => {
    const timer = setTimeout(() => {
      if (geoError || cafesError) {
        toast.info(geoError || cafesError, { position: 'top-right' })
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [cafesError, geoError])

  if (!isLoaded) return <Loading />
  console.log(isOutOfView, !isGeoLoading, !hasGetCafes)

  return (
    <>
      <main className="relative w-full h-full">
        <nav className="absolute left-0 top-0 z-10">
          <ScrollArea className="w-screen whitespace-nowrap">
            <div className="flex gap-1 p-4">
              {filterList.map(d => (
                <Button
                  key={d.key}
                  variant="ghost"
                  className={clsx(
                    'rounded-full transition active:scale-95',
                    filters[d.key] ? 'bg-gray-200!' : 'bg-white!'
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

          <div className="w-screen flex justify-center px-4">
            {isOutOfView && !hasGetCafes && (
              <Button
                variant="outline"
                onClick={() => getCurrentCenterCafes()}
              >
                {t.map.button.searchThisArea}
              </Button>
            )}
          </div>
        </nav>

        <GoogleMap
          onLoad={handleMapLoad}
          center={userPosition}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={15}
          options={MAP_OPTIONS}
          onDragEnd={checkPositionInView}
          onZoomChanged={checkPositionInView}
        >
          {!isGeoLoading && allowedGeo && (
            <UserLocationDot position={userPosition} />
          )}
          {cafeMarkers}
        </GoogleMap>
      </main>
      <footer className="fixed bottom-0 left-0 w-full">
        <div className="m-4 flex justify-end">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full transition active:scale-95"
            onClick={() => renewPostion()}
          >
            <Navigation />
          </Button>
        </div>
        <Footer />
      </footer>
    </>
  )
}

export default Map
