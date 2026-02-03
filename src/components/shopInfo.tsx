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
import { Card, CardContent } from '@/components/ui/card'

import { ScrollArea } from './ui/scroll-area'
import clsx from 'clsx'
import { Cafe } from '@prisma/client'

// const Photo = () => {
//   return (
//     <div className="p-2">
//       <Carousel className="w-full">
//         <CarouselContent className="-ml-4">
//           {shopInfo.photos && shopInfo.photos.length > 0 ? (
//             shopInfo.photos.map((photo, index) => (
//               <CarouselItem
//                 key={index}
//                 className="basis-1/3 pl-4" // 移除這裡的 rounded 和 overflow，改放在內部容器
//               >
//                 <div className="overflow-hidden rounded-md">
//                   {/* 這裡控制圓角和裁切 */}
//                   <AspectRatio ratio={4 / 3}>
//                     <img
//                       src={photo.getURI({
//                         maxWidth: 100,
//                         maxHeight: 100,
//                       })}
//                       alt={`Photo ${index + 1} of ${shopInfo.displayName}`}
//                       className="h-full w-full object-cover" // 關鍵：撐滿容器並自動裁切比例
//                     />
//                   </AspectRatio>
//                 </div>
//               </CarouselItem>
//             ))
//           ) : (
//             <CarouselItem className="w-full">
//               <AspectRatio
//                 ratio={6 / 3}
//                 className="w-full bg-gray-200 flex items-center justify-center rounded-md"
//               >
//                 <span className="text-gray-500">No Photos Available</span>
//               </AspectRatio>
//             </CarouselItem>
//           )}
//         </CarouselContent>
//       </Carousel>
//     </div>
//   )
// }

const infoItems = [
  { label: 'seat Capacity Max', value: '123' },
  { label: 'has Wifi', value: '20250202' },
  { label: 'wifi SpeedMbps', value: '20250202' },
  { label: 'has Power Outlets', value: '20250202' },
  { label: 'outlet Coverage', value: '20250202' },
]

const ShopInfo = (props: {
  shopInfo: Cafe | null
  setShopInfo: (shopInfo: google.maps.places.Place | null) => void
}) => {
  const { shopInfo, setShopInfo } = props
  if (!shopInfo) return null

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

          {/* Details */}

          <div className="p-2 flex flex-col gap-5">
            <Card className="w-full">
              <CardContent>
                <div className="text-lg font-bold">核心連接性</div>
                <div>
                  {infoItems.map(i => (
                    <div
                      key={i.label}
                      className="grid grid-cols-3 border-b-2 p-2"
                    >
                      <div className="text-sm ">{i.label}</div>
                      <div className="col-span-2">{i.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardContent>
                <div className="text-lg font-bold">核心連接性</div>
                <div>
                  {infoItems.map(i => (
                    <div
                      key={i.label}
                      className="grid grid-cols-3 border-b-2 p-2"
                    >
                      <div className="text-sm ">{i.label}</div>
                      <div className="col-span-2">{i.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardContent>
                <div className="text-lg font-bold">核心連接性</div>
                <div>
                  {infoItems.map(i => (
                    <div
                      key={i.label}
                      className="grid grid-cols-3 border-b-2 p-2"
                    >
                      <div className="text-sm ">{i.label}</div>
                      <div className="col-span-2">{i.value}</div>
                    </div>
                  ))}
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
