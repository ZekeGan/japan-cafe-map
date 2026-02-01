/* eslint-disable @next/next/no-img-element */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { ScrollArea } from './ui/scroll-area'

const checkIfOpen = (placeDetail: any): string => {
  const hours = placeDetail.regularOpeningHours
  const utcOffset = placeDetail.utcOffsetMinutes // 務必在 fetchFields 包含此欄位

  if (!hours || !hours.periods) return 'Unknown'

  // 1. 取得咖啡廳當地的當前時間
  const now = new Date()
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
  const localTime = new Date(utcTime + utcOffset * 60000)

  const day = localTime.getDay() // 0 (週日) - 6 (週六)
  const currentTime = localTime.getHours() * 100 + localTime.getMinutes() // 轉為數字如 1430

  // 2. 尋找匹配今天的營業時段
  const isOpen = hours.periods.some((period: any) => {
    if (period.open.day !== day) return false

    const openTime = parseInt(period.open.time)
    const closeTime = period.close ? parseInt(period.close.time) : 2359

    // 處理 24 小時營業
    if (!period.close) return true

    // 處理跨子夜 (例如 18:00 - 02:00)
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime
    }

    return currentTime >= openTime && currentTime <= closeTime
  })

  return isOpen ? 'OPEN' : 'CLOSED'
}

const ShopInfo = (props: {
  shopInfo: google.maps.places.Place | null
  setShopInfo: (shopInfo: google.maps.places.Place | null) => void
}) => {
  const { shopInfo, setShopInfo } = props
  if (!shopInfo) return null
  const isOpen = false
  console.log(shopInfo)

  return (
    <Drawer
      open={Boolean(shopInfo)}
      onOpenChange={() => {}}
      onClose={() => {
        setShopInfo(null)
      }}
    >
      <DrawerContent className="h-[80%] ">
        <ScrollArea className="h-full no-scrollbar">
          <DrawerHeader>
            <DrawerTitle className="text-lg">
              {shopInfo?.displayName}
            </DrawerTitle>
            {/* 顯示營業狀態標籤 */}
            <DrawerDescription>{shopInfo?.formattedAddress}</DrawerDescription>
          </DrawerHeader>

          <div className="p-2">
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {shopInfo.photos && shopInfo.photos.length > 0 ? (
                  shopInfo.photos.map((photo, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-1/3 pl-4" // 移除這裡的 rounded 和 overflow，改放在內部容器
                    >
                      <div className="overflow-hidden rounded-md">
                        {/* 這裡控制圓角和裁切 */}
                        <AspectRatio ratio={4 / 3}>
                          <img
                            src={photo.getURI({
                              maxWidth: 100,
                              maxHeight: 100,
                            })}
                            alt={`Photo ${index + 1} of ${shopInfo.displayName}`}
                            className="h-full w-full object-cover" // 關鍵：撐滿容器並自動裁切比例
                          />
                        </AspectRatio>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="w-full">
                    <AspectRatio
                      ratio={6 / 3}
                      className="w-full bg-gray-200 flex items-center justify-center rounded-md"
                    >
                      <span className="text-gray-500">No Photos Available</span>
                    </AspectRatio>
                  </CarouselItem>
                )}
              </CarouselContent>
            </Carousel>
          </div>

          <div className="p-2">
            <Card className="w-full max-w-md">
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">插頭</span>
                  <span className="font-medium">123</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">WI-Fi</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">寵物友善</span>
                  <span className="font-medium">20250202</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">end</span>
                  <span className="font-medium">20250202</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="h-0" />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default ShopInfo
