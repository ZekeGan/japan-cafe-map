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
  Book,
  CalendarOffIcon,
  Cigarette,
  CircleDollarSign,
  Clock,
  Coffee,
  Infinity,
  Navigation,
  Plug,
  Scroll,
  Wifi,
} from 'lucide-react'
import { getDistance } from '@/lib/utils'
import { mockCafeShop } from '@public/mockCafeShop'
import clsx from 'clsx'
import { Cafe } from '@prisma/client'
import { defaultLagitude, defaultLongitude } from '@/constant/location'
import Loading from './loading'
import { Button } from './ui/button'
import { Toggle } from './ui/toggle'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

const FETCH_RADIUS = 500 // meters
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
      {/* 修正位移，確保圓心對準座標 */}
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
}> = ({ position, close = false, onClick }) => {
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
        aria-label={`Cafe location${close ? ' (closed)' : ''}`}
      >
        <div className="flex space-x-8 p-10">
          <div className="relative">
            <div
              className={clsx(
                close ? 'bg-gray-500' : 'bg-yellow-800',
                'w-5 h-5 p-0.5 rounded-full rounded-bl-none -rotate-45 flex items-center justify-center shadow-md'
              )}
            >
              <Coffee
                className="rotate-45 text-white"
                size={16}
              />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-700 rounded-[100%] blur-[1px]" />
          </div>
        </div>
      </div>
    </OverlayViewF>
  )
}

const useGeolocation = () => {
  const [position, setPosition] = useState<google.maps.LatLngLiteral>({
    lat: defaultLagitude,
    lng: defaultLongitude,
  })
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const handlePosition = useCallback(() => {
    const successHandler = (pos: GeolocationPosition) => {
      // setPosition({
      //   lat: pos.coords.latitude,
      //   lng: pos.coords.longitude,
      // })
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

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Geolocation is not supported by your browser')
      setIsLoading(false)
      return
    }

    handlePosition()
  }, [handlePosition])

  return { position, error, isLoading, handlePosition }
}

const useCafeShops = (
  map: google.maps.Map | null | undefined,
  currentPosition: google.maps.LatLngLiteral,
  hasGeolocation: boolean
) => {
  const [cafeShops, setCafeShops] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const lastFetchPos = useRef<google.maps.LatLngLiteral | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchCafeShops = useCallback(
    async (location: google.maps.LatLngLiteral) => {
      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 檢查是否需要重新獲取
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
        // 使用 mock 數據（在生產環境中替換為實際的 Google Places API 調用）
        const formatData = mockCafeShop

        const response = await fetch('/api/cafe/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatData),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch cafes: ${response.statusText}`)
        }

        const dbCafes: Cafe[] = await response.json()
        setCafeShops(dbCafes)
        lastFetchPos.current = location
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // 請求被取消，不做處理
          return
        }
        console.error('Error fetching cafe shops:', err)
        setError('Failed to load nearby cafes. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!map || !hasGeolocation) return

    const timer = setTimeout(() => {
      fetchCafeShops(currentPosition)
    }, 300) // 添加防抖

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [map, currentPosition, hasGeolocation, fetchCafeShops])

  return { cafeShops, isLoading, error, refetch: fetchCafeShops }
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

  const [map, setMap] = useState<google.maps.Map | null>()
  const {
    position: userPosition,
    error: geoError,
    isLoading: isGeoLoading,
    handlePosition,
  } = useGeolocation()

  const {
    cafeShops,
    isLoading: isCafesLoading,
    error: cafesError,
  } = useCafeShops(map, userPosition, !isGeoLoading)

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
          console.error('Failed to fetch shop info:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching shop info:', error)
      }
    },
    [setShopInfo]
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
        return (
          <CafeLocationDot
            key={shop.id}
            onClick={() => clickMapDot(shop)}
            position={shop.location!}
            close={shop.businessStatus !== 'OPERATIONAL'}
          />
        )
      })
  }, [cafeShops, clickMapDot, filters])

  const filterList: {
    key: keyof typeof initialFilters
    icon: ReactNode
    label: string
  }[] = [
    {
      key: 'hasSmokingArea',
      icon: <Cigarette />,
      label: '吸菸室',
    },
    {
      key: 'hasWifi',
      icon: <Wifi />,
      label: 'WIFI',
    },
    {
      key: 'hasPowerOutlets',
      icon: <Plug />,
      label: '插座',
    },

    {
      key: 'timeLimit',
      icon: <Infinity />,
      label: '無時限',
    },
    {
      key: 'isBookingRequired',
      icon: <CalendarOffIcon />,
      label: '無預約',
    },
    {
      key: 'minConsumption',
      icon: <Coffee />,
      label: '一杯飲料',
    },
  ]

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
      </nav>

      <section className=" absolute bottom-0 right-0 z-10 p-2">
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full "
          onClick={() => handlePosition()}
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
      >
        {!isGeoLoading && <UserLocationDot position={userPosition} />}
        {cafeMarkers}
      </GoogleMap>

      {/* 錯誤提示 */}
      {(geoError || cafesError) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 max-w-md text-center">
          {geoError || cafesError}
        </div>
      )}
    </main>
  )
}

export default Map
