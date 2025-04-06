"use client"

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EnhancedDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}

export function EnhancedDateRangePicker({ className, dateRange, onDateRangeChange }: EnhancedDateRangePickerProps) {
  const [fromValue, setFromValue] = React.useState<string>("")
  const [toValue, setToValue] = React.useState<string>("")

  // Update input fields when dateRange changes
  React.useEffect(() => {
    if (dateRange?.from) {
      setFromValue(format(dateRange.from, "yyyy-MM-dd"))
    } else {
      setFromValue("")
    }

    if (dateRange?.to) {
      setToValue(format(dateRange.to, "yyyy-MM-dd"))
    } else {
      setToValue("")
    }
  }, [dateRange])

  // Handle manual date input
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromValue(value)

    try {
      const fromDate = value ? new Date(value) : undefined
      if (fromDate && !isNaN(fromDate.getTime())) {
        onDateRangeChange({
          from: fromDate,
          to: dateRange?.to,
        })
      } else if (!value) {
        onDateRangeChange({
          from: undefined,
          to: dateRange?.to,
        })
      }
    } catch (error) {
      console.error("Invalid date format", error)
    }
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setToValue(value)

    try {
      const toDate = value ? new Date(value) : undefined
      if (toDate && !isNaN(toDate.getTime())) {
        onDateRangeChange({
          from: dateRange?.from,
          to: toDate,
        })
      } else if (!value) {
        onDateRangeChange({
          from: dateRange?.from,
          to: undefined,
        })
      }
    } catch (error) {
      console.error("Invalid date format", error)
    }
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <div>
        <Label htmlFor="from-date" className="mb-1.5 block">
          From Date
        </Label>
        <Input id="from-date" type="date" value={fromValue} onChange={handleFromChange} className="w-full" />
      </div>
      <div>
        <Label htmlFor="to-date" className="mb-1.5 block">
          To Date
        </Label>
        <Input id="to-date" type="date" value={toValue} onChange={handleToChange} className="w-full" />
      </div>
    </div>
  )
}

