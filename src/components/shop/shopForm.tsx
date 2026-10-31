'use client'

import { Button } from '@/components/ui/button'
import { Controller, useForm } from 'react-hook-form'
import { ReportFormValues, reportSchema } from '@/lib/validations/report'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAuth } from '@/context/authContext'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/context/languageContext'
import { toast } from 'sonner'
import { SmallLabel, EditItem, ToggleButton } from '@/components/shop/shopParts'

export const ShopForm = ({
  shopInfo,
  setIsEditing,
  onReported,
}: {
  shopInfo: CafeWithReports
  setIsEditing: (isEditing: boolean) => void
  onReported: (id: string) => Promise<void>
}) => {
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()
  const s = t.shopInfo
  const f = s.form

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      cafeId: shopInfo?.id || '',
      userId: user?.id || '',
      hasWifi: null,
      outletCoverage: null,
      seatCapacity: null,
      noiseLevel: null,
      minConsumption: null,
      timeLimit: null,
      isBookingRequired: null,
      smokingAreaType: null,
      allowCigaretteType: [],
    },
  })

  const onSubmit = async (data: ReportFormValues) => {
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Report submission failed')

      await onReported(shopInfo.id)
      await refreshUser()
      setIsEditing(false)
    } catch {
      toast.error(s.error.reportFailed)
    }
  }

  useEffect(() => {
    if (!shopInfo) form.reset()
  }, [form, shopInfo])

  return (
    <Card className="p-4">
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* 設施 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.facility}</h1>

          <EditItem
            title={f.field.hasWifi}
            component={
              <Controller
                name="hasWifi"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={String(field.value)}
                    onValueChange={val =>
                      field.onChange(
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="true">
                      <SmallLabel str={t.common.yes} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="false">
                      <SmallLabel str={t.common.no} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.outletCoverage}
            component={
              <Controller
                name="outletCoverage"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <ToggleGroupItem value="NONE">
                      <SmallLabel str={f.outlet.NONE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="SOME">
                      <SmallLabel str={f.outlet.SOME} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="MOST">
                      <SmallLabel str={f.outlet.MOST} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="EVERY">
                      <SmallLabel str={f.outlet.EVERY} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />
        </section>

        {/* 環境 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.environment}</h1>

          <EditItem
            title={f.field.seatCapacity}
            component={
              <Controller
                name="seatCapacity"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <ToggleGroupItem value="MINIMAL">
                      <SmallLabel str="1-5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="LIMITED">
                      <SmallLabel str="6-15" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="STANDARD">
                      <SmallLabel str="16-30" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="GENEROUS">
                      <SmallLabel str="31+" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.noiseLevel}
            component={
              <Controller
                name="noiseLevel"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <ToggleGroupItem value="SILENT">
                      <SmallLabel str={s.noise.SILENT} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="QUIET">
                      <SmallLabel str={s.noise.QUIET} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="MODERATE">
                      <SmallLabel str={s.noise.MODERATE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="VIBRANT">
                      <SmallLabel str={s.noise.VIBRANT} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />
        </section>

        {/* 消費 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.consumption}</h1>

          <EditItem
            title={f.field.isBookingRequired}
            component={
              <Controller
                name="isBookingRequired"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={String(field.value)}
                    onValueChange={val =>
                      field.onChange(
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="true">
                      <SmallLabel str={t.common.yes} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="false">
                      <SmallLabel str={t.common.no} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.timeLimit}
            component={
              <Controller
                name="timeLimit"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={String(field.value)}
                    onValueChange={val =>
                      field.onChange(
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="false">
                      <SmallLabel str={f.timeLimit.unlimited} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="true">
                      <SmallLabel str={f.timeLimit.limited} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.minConsumption}
            component={
              <Controller
                name="minConsumption"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={String(field.value)}
                    onValueChange={val =>
                      field.onChange(
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="true">
                      <SmallLabel str={f.minConsumption.required} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="false">
                      <SmallLabel str={f.minConsumption.oneDrink} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />
        </section>

        {/* 吸菸 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.smoking}</h1>

          <EditItem
            title={f.field.smokingAreaType}
            component={
              <Controller
                name="smokingAreaType"
                control={form.control}
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <ToggleGroupItem value="NONE">
                      <SmallLabel str={f.smokingAreaType.NONE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="INDOOR_TABLE">
                      <SmallLabel str={f.smokingAreaType.INDOOR_TABLE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="INDOOR_SEPARATED">
                      <SmallLabel str={f.smokingAreaType.INDOOR_SEPARATED} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="OUTDOOR">
                      <SmallLabel str={f.smokingAreaType.OUTDOOR} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.allowCigaretteType}
            component={
              <Controller
                name="allowCigaretteType"
                control={form.control}
                render={({ field }) => (
                  <div className="flex ">
                    <ToggleButton
                      className="rounded-l-sm"
                      values={field.value}
                      onChange={field.onChange}
                      value="TRADITIONAL"
                    >
                      <SmallLabel str={f.cigaretteType.TRADITIONAL} />
                    </ToggleButton>
                    <ToggleButton
                      values={field.value}
                      onChange={field.onChange}
                      value="ELECTRONIC"
                    >
                      <SmallLabel str={f.cigaretteType.ELECTRONIC} />
                    </ToggleButton>
                    <ToggleButton
                      className="rounded-r-sm"
                      values={field.value}
                      onChange={field.onChange}
                      value="VAPE"
                    >
                      <SmallLabel str={f.cigaretteType.VAPE} />
                    </ToggleButton>
                  </div>
                )}
              />
            }
          />
        </section>

        {/* 按鈕組 */}
        <div className="flex flex-col gap-2 mt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {t.common.submit}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="w-full"
          >
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
