"use client"

import { useState } from "react"
import { ZoomIn, ZoomOut, RefreshCw, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChartControlsProps {
  onZoomChange: (zoomLevel: number) => void
  onReset: () => void
  onFullscreen?: () => void
  hasFullscreen?: boolean
}

export function ChartControls({ onZoomChange, onReset, onFullscreen, hasFullscreen = false }: ChartControlsProps) {
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0]
    setZoomLevel(newZoom)
    onZoomChange(newZoom)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.1, 2)
    setZoomLevel(newZoom)
    onZoomChange(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.1, 0.5)
    setZoomLevel(newZoom)
    onZoomChange(newZoom)
  }

  const handleReset = () => {
    setZoomLevel(1)
    onReset()
  }

  return (
    <div className="flex items-center space-x-2 mb-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleZoomOut} aria-label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-32">
        <Slider
          value={[zoomLevel]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={handleZoomChange}
          aria-label="Zoom level"
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleZoomIn} aria-label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleReset} aria-label="Reset view">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {hasFullscreen && onFullscreen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onFullscreen} aria-label="Toggle fullscreen">
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fullscreen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

