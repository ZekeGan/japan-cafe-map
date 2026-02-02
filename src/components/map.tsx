'use client'

import {
  GoogleMap,
  OverlayView,
  OverlayViewF,
  useJsApiLoader,
} from '@react-google-maps/api'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Coffee } from 'lucide-react'
import { getDistance } from '@/lib/utils'
import { mockCafeShop } from '@public/mockCafeShop'
import clsx from 'clsx'

type CafeShop = {
  data: google.maps.places.Place
  isOpenNow?: boolean
}

const defaultCenter: google.maps.LatLngLiteral = { lat: 35.6808, lng: 139.7669 } //東京車站

const UserLocationDot: React.FC<{ position: google.maps.LatLngLiteral }> = ({
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
  position: google.maps.LatLngLiteral
  onClick: () => void
  close?: boolean
}> = ({ position, close = false, onClick }) => {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        onClick={onClick}
        className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        <div className="flex space-x-8 p-10">
          {/* 地圖大頭針造型 */}
          <div className="relative">
            <div
              className={clsx(
                close ? 'bg-gray-500' : 'bg-yellow-800',
                'w-4 h-4 p-0.5  rounded-full rounded-bl-none -rotate-45 flex items-center justify-center'
              )}
            >
              {/* ICON */}
              <Coffee className="rotate-45 text-white" />
            </div>
            {/* 下方的陰影 */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-700 rounded-[100%] blur-[1px]"></div>
          </div>
        </div>
      </div>
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

  const lastFetchPos = useRef<google.maps.LatLngLiteral | null>(null)

  const fetchCafeShops = useCallback(
    async (location: google.maps.LatLngLiteral) => {
      try {
        if (
          lastFetchPos.current &&
          getDistance(lastFetchPos.current, location) < 500
        ) {
          return
        }

        const { Place } = (await google.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary
        // const { places } = await Place.searchNearby({
        //   locationRestriction: { center: location, radius: 500 },
        //   includedTypes: ['cafe'],
        //   fields: [
        //     'id',
        //     'location',
        //     'displayName',
        //     'businessStatus',
        //     'formattedAddress',
        //   ],
        // })

        lastFetchPos.current = location // 拿到資料後一定要更新，否則下次還會進來
        // mock data
        const places = mockCafeShop

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCafeShops(places.map(p => ({ data: p })) as any[])
      } catch (err) {
        console.error('Error fetching cafe shops:', err)
      }
    },
    []
  )

  // 獲取當前位置的函數
  useEffect(() => {
    if (!map) return
    const handleLocateUser = () => {
      if (!navigator.geolocation) return setGeoError('')
      navigator.geolocation.getCurrentPosition(
        position => {
          // const newPos = {
          //   lat: position.coords.latitude,
          //   lng: position.coords.longitude,
          // }
          setCurPos(defaultCenter)
          // setCurPos(newPos)
          // map.panTo(newPos)
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
    if (hasGetPos === false) return
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
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      {hasGetPos && <UserLocationDot position={curPos} />}

      {cafeShops.map(shop => {
        if (shop.data.businessStatus === 'OPERATIONAL') {
          return (
            <CafeLocationDot
              key={shop.data.id}
              onClick={() => setShopInfo(shop.data)}
              position={shop.data.location as any}
            />
          )
        }
        if (
          shop.data.businessStatus === 'CLOSED_TEMPORARILY' ||
          shop.data.businessStatus === 'CLOSED_PERMANENTLY'
        ) {
          return (
            <CafeLocationDot
              key={shop.data.id}
              onClick={() => setShopInfo(shop.data)}
              position={shop.data.location as any}
              close
            />
          )
        }

        return null
      })}
    </GoogleMap>
  )
}

export default Map

new Set([
  'id',
  'resourceName',
  'accessibilityOptions',
  'addressComponents',
  'adrFormatAddress',
  'attributions',
  'businessStatus',
  'displayName',
  'displayNameLanguageCode',
  'formattedAddress',
  'shortFormattedAddress',
  'googleMapsURI',
  'hasCurbsidePickup',
  'hasDelivery',
  'hasDineIn',
  'hasTakeout',
  'isReservable',
  'servesBreakfast',
  'servesLunch',
  'servesDinner',
  'servesBeer',
  'servesWine',
  'servesBrunch',
  'servesVegetarianFood',
  'iconBackgroundColor',
  'svgIconMaskURI',
  'internationalPhoneNumber',
  'location',
  'nationalPhoneNumber',
  'regularOpeningHours',
  'parkingOptions',
  'paymentOptions',
  'photos',
  'plusCode',
  'postalAddress',
  'priceLevel',
  'rating',
  'reviews',
  'types',
  'userRatingCount',
  'utcOffsetMinutes',
  'viewport',
  'websiteURI',
  'editorialSummary',
  'editorialSummaryLanguageCode',
  'generativeSummary',
  'reviewSummary',
  'evChargeAmenitySummary',
  'neighborhoodSummary',
  'allowsDogs',
  'hasLiveMusic',
  'hasMenuForChildren',
  'hasOutdoorSeating',
  'hasRestroom',
  'hasWiFi',
  'isGoodForChildren',
  'isGoodForGroups',
  'isGoodForWatchingSports',
  'servesCocktails',
  'servesCoffee',
  'servesDessert',
  'primaryType',
  'primaryTypeDisplayName',
  'primaryTypeDisplayNameLanguageCode',
  'evChargeOptions',
  'fuelOptions',
  'priceRange',
  'googleMapsLinks',
  'consumerAlert',
  'timeZone',
  'isPureServiceAreaBusiness',
])
