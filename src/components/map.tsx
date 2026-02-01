'use client'

import {
  GoogleMap,
  MarkerF,
  OverlayView,
  OverlayViewF,
  OverlayViewProps,
  useJsApiLoader,
} from '@react-google-maps/api'
import UniversalError from './error'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleQuestionMark, DoorClosed, Hamburger } from 'lucide-react'
import { Button } from './ui/button'

type CafeShop = {
  data: google.maps.places.Place
  isOpenNow?: boolean
}

const defaultCenter: google.maps.LatLngLiteral = { lat: 35.6808, lng: 139.7669 } //東京車站

const UserLocationDot: React.FC<OverlayViewProps> = ({ position }) => {
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
const ShopUnknown: React.FC<OverlayViewProps> = ({ position }) => {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      {/* 修正位移，確保圓心對準座標 */}
      <CircleQuestionMark />
    </OverlayViewF>
  )
}

const Map: React.FC<{
  setShopInfo: (shopInfo: google.maps.places.Place) => void
}> = ({ setShopInfo }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map',
    version: 'beta',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  })
  const [cafeShops, setCafeShops] = useState<CafeShop[]>([])

  const [map, setMap] = useState<google.maps.Map | null>()
  const [curPos, setCurPos] = useState<google.maps.LatLngLiteral>(defaultCenter)
  const [geoError, setGeoError] = useState<string>('')
  const [hasGetPos, setHasGetPos] = useState(false)

  const fetchCafeShops = useCallback(
    async (location: google.maps.LatLngLiteral) => {
      try {
        const { Place } = (await google.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary
        const { places } = await Place.searchNearby({
          locationRestriction: { center: location, radius: 1000 },
          includedTypes: ['cafe'],
          fields: ['displayName', 'location'],
        })
        const newPlaces = (await Promise.all(
          places.map(async p => {
            const isOpenNow = await p.isOpen()
            return { data: p, isOpenNow }
          })
        )) as CafeShop[]

        setCafeShops(newPlaces)
      } catch (err) {
        console.error('Error fetching cafe shops:', err)
      }
    },
    []
  )

  const getDetailInfo = useCallback(
    async (placeId: string) => {
      try {
        const { Place } = (await google.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary
        const detailPlace = new Place({ id: placeId })
        const { place } = await detailPlace.fetchFields({
          fields: [
            'displayName',
            'formattedAddress',
            'photos',
            'googleMapsURI',
            // 'allowsDogs',
          ],
        })
        setShopInfo(place)
      } catch (err) {
        console.error('Error fetching cafe shops:', err)
      }
    },
    [setShopInfo]
  )

  // 獲取當前位置的函數
  useEffect(() => {
    if (!map) return
    const handleLocateUser = () => {
      if (!navigator.geolocation) return setGeoError('')
      navigator.geolocation.getCurrentPosition(
        position => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurPos(newPos)
          map.panTo(newPos)
          setGeoError('')
          setHasGetPos(true)
        },
        error => {
          setGeoError(error.message)
        },
        { enableHighAccuracy: true }
      )
    }
    handleLocateUser()
  }, [map])

  useEffect(() => {
    if (!map) return
    if (hasGetPos.current === false) return
    const timer = setTimeout(() => fetchCafeShops(curPos), 0)
    return () => clearTimeout(timer)
  }, [map, curPos, fetchCafeShops, hasGetPos])

  if (!isLoaded) return <div>Loading...</div>

  return (
    <GoogleMap
      onLoad={mapIns => setMap(mapIns)}
      center={curPos}
      mapContainerStyle={{ width: '100%', height: '100%' }}
      zoom={15}
      options={{
        streetViewControl: false,
        cameraControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,

        styles: [
          {
            featureType: 'poi',
            // 修正：使用 labels.icon 而不是 icons
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'poi',
            // 隱藏文字標籤
            elementType: 'labels.text',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      {hasGetPos && (
        <UserLocationDot
          position={curPos}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        />
      )}

      {cafeShops.map(shop => {
        if (shop.isOpenNow === undefined) {
          return (
            <OverlayViewF
              key={shop.data.id}
              position={shop.data.location!}
              mapPaneName={'floatPane'}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={e => {
                  getDetailInfo(shop.data.id!)
                }}
              >
                <CircleQuestionMark />
              </Button>
            </OverlayViewF>
          )
        }
        if (shop.isOpenNow) {
          return (
            <OverlayViewF
              key={shop.data.id}
              position={shop.data.location!}
              mapPaneName={'floatPane'}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={e => {
                  getDetailInfo(shop.data.id!)
                }}
              >
                <Hamburger onClick={() => getDetailInfo(shop.data.id!)} />
              </Button>
            </OverlayViewF>
          )
        }

        if (!shop.isOpenNow) {
          return (
            <OverlayViewF
              key={shop.data.id}
              position={shop.data.location!}
              mapPaneName={'floatPane'}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={e => {
                  e.stopPropagation()
                  getDetailInfo(shop.data.id!)
                }}
              >
                <DoorClosed />
              </Button>
            </OverlayViewF>
          )
        }
        return null
      })}
    </GoogleMap>
  )
}

export default Map
