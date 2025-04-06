"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataLimitControlProps {
  limit: number
  onLimitChange: (limit: number) => void
  options?: number[]
  label?: string
}

export function DataLimitControl({
  limit,
  onLimitChange,
  options = [5, 10, 20, 50, 100],
  label = "Show Top",
}: DataLimitControlProps) {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="data-limit">{label}</Label>
      <Select value={limit.toString()} onValueChange={(value) => onLimitChange(Number.parseInt(value))}>
        <SelectTrigger id="data-limit" className="w-[120px]">
          <SelectValue placeholder="Select limit" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              Top {option}
            </SelectItem>
          ))}
          <SelectItem value="0">All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

