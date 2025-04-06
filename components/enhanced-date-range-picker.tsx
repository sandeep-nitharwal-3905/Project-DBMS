"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EnhancedDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}

export function EnhancedDateRangePicker({ className, dateRange, onDateRangeChange }: EnhancedDateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
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
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <Label className="mb-1.5 block">Calendar Selection</Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={4} style={{ position: "static" }}>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range)
                if (range?.to) {
                  setIsOpen(false)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

