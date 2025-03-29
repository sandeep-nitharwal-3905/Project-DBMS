"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChartControls } from "@/components/chart-controls"
import { debounce } from "@/lib/utils"

interface ResponsiveChartContainerProps {
  children: React.ReactNode
  height?: number
  className?: string
  yAxisInteger?: boolean
  minDomain?: number
  maxDomain?: number
}

export function ResponsiveChartContainer({
  children,
  height = 300,
  className = "",
  yAxisInteger = false,
  minDomain,
  maxDomain,
}: ResponsiveChartContainerProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(height)
  const [isResizing, setIsResizing] = useState(false)

  // Clone children with additional props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Find YAxis elements and add integer-only ticks if needed
      if (yAxisInteger && React.isValidElement(child) && child.type && child.props.children) {
        const newChildren = React.Children.map(child.props.children, (yaxisChild) => {
          if (React.isValidElement(yaxisChild) && yaxisChild.type && yaxisChild.type.toString().includes("YAxis")) {
            return React.cloneElement(yaxisChild, {
              allowDecimals: false,
              domain: [minDomain || "auto", maxDomain || "auto"],
              ...yaxisChild.props,
            })
          }
          return yaxisChild
        })

        return React.cloneElement(child, {
          ...child.props,
          children: newChildren,
        })
      }

      // Add responsive width and height to ResponsiveContainer
      if (child.type && child.type.toString().includes("ResponsiveContainer")) {
        return React.cloneElement(child, {
          width: "100%",
          height: containerHeight,
          ...child.props,
        })
      }
    }
    return child
  })

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth)
      setContainerHeight(isFullscreen ? window.innerHeight * 0.8 : height)
    }
  }, [height, isFullscreen])

  // Debounced resize handler
  const debouncedResize = useCallback(
    debounce(() => {
      updateDimensions()
      setIsResizing(false)
    }, 150),
    [updateDimensions],
  )

  useEffect(() => {
    updateDimensions()

    const handleResize = () => {
      setIsResizing(true)
      debouncedResize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [height, isFullscreen, debouncedResize, updateDimensions])

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom)
  }

  const handleReset = () => {
    setZoomLevel(1)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // Allow time for the container to resize before updating dimensions
    setTimeout(updateDimensions, 100)
  }

  return (
    <div className={`relative ${className}`}>
      <ChartControls
        onZoomChange={handleZoomChange}
        onReset={handleReset}
        onFullscreen={toggleFullscreen}
        hasFullscreen={true}
      />
      <div
        ref={containerRef}
        className={`relative overflow-auto transition-all duration-300 ${
          isFullscreen ? "fixed inset-4 z-50 bg-background p-4 shadow-xl rounded-lg" : ""
        }`}
        style={{
          height: `${containerHeight}px`,
          width: isFullscreen ? "auto" : "100%",
        }}
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
          }}
          className="transition-transform duration-200"
        >
          {isResizing ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Resizing chart...</p>
            </div>
          ) : (
            enhancedChildren
          )}
        </div>
      </div>
    </div>
  )
}

