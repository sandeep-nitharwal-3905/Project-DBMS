"use client"

import { useState } from "react"
import { Code, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SqlQueryDisplayProps {
  title: string
  query: string
  defaultVisible?: boolean
}

export function SqlQueryDisplay({ title, query, defaultVisible = false }: SqlQueryDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(defaultVisible)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card className="mb-4 border-primary/20">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-muted/50">
        <CardTitle className="text-sm font-medium flex items-center">
          <Code className="h-4 w-4 mr-2" />
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setIsVisible(!isVisible)}
            aria-expanded={isVisible}
            aria-controls={`sql-query-${title.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {isVisible ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Hide SQL
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Show SQL
              </>
            )}
          </Button>
          {isVisible && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      {isVisible && (
        <CardContent className="p-0">
          <pre
            id={`sql-query-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className="text-xs sm:text-sm p-4 overflow-x-auto bg-muted/30 rounded-b-lg max-h-[200px]"
          >
            <code className="text-foreground">{query}</code>
          </pre>
        </CardContent>
      )}
    </Card>
  )
}

