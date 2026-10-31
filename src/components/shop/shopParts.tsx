'use client'

import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import clsx from 'clsx'

interface FeatureItemProps {
  icon?: React.ReactNode
  label: React.ReactNode
  className?: string
  isEmpty?: boolean
}

export const SmallLabel = ({ str }: { str: string }) => {
  return <div className="text-xs font-bold">{str}</div>
}

export const EditItem = ({
  title,
  component,
}: {
  title: string
  component: ReactNode
}) => {
  return (
    <Item className="p-2">
      <ItemContent>
        <ItemTitle className="pb-1 text-sm">{title}</ItemTitle>
        {component}
      </ItemContent>
    </Item>
  )
}

export const FeatureItem = ({
  icon,
  label,
  className = '',
  isEmpty = false,
}: FeatureItemProps) => {
  return (
    <Item
      variant="muted"
      className={`rounded-4xl ${className} ${isEmpty ? 'opacity-50' : ''}`}
    >
      {icon && (
        <ItemMedia className={isEmpty ? 'text-gray-400' : ''}>{icon}</ItemMedia>
      )}
      <ItemContent className="w-full">
        <div className={isEmpty ? 'text-gray-400' : ''}>{label}</div>
      </ItemContent>
    </Item>
  )
}

export const ToggleButton = ({
  children,
  values,
  onChange,
  value,
  className = '',
}: {
  children: React.ReactNode
  values: string[]
  onChange: (values: string[]) => void
  value: string
  className?: string
}) => {
  return (
    <Button
      variant="outline"
      className={clsx(
        'rounded-none shadow-none',
        values.includes(value) ? 'bg-accent!' : 'bg-white!',
        className
      )}
      type="button"
      onClick={() => {
        if (values.includes(value)) {
          onChange(values.filter((v: string) => v !== value))
        } else {
          onChange([...values, value])
        }
      }}
    >
      {children}
    </Button>
  )
}
