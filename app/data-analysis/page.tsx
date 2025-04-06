"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, BarChart3, LineChartIcon, PieChart, TrendingUp, Loader2, Filter } from "lucide-react"
import Link from "next/link"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  fetchAllData,
  getNewUsersOverTime,
  getMostActiveUsers,
  getPhotoLikesTrend,
  getTopLikedPhotos,
  getTopCommentedPhotos,
  getMostEngagingUsers,
  getFollowerGrowthOverTime,
  getMostFollowedUsers,
  getTrendingTagsOverTime,
  getMostUsedTags,
  getUserPreferencesByTags,
} from "@/lib/data-service"

// Import components
import { SqlQueryDisplay } from "@/components/sql-query-display"
import { ResponsiveChartContainer } from "@/components/responsive-chart-container"
import { EnhancedDateRangePicker } from "@/components/enhanced-date-range-picker"
import { DataLimitControl } from "@/components/data-limit-control"
import { Badge } from "@/components/ui/badge"

export default function DataAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [dataLimit, setDataLimit] = useState<number>(10)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [chartData, setChartData] = useState({
    newUsersOverTime: [],
    mostActiveUsers: [],
    photoLikesTrend: [],
    topLikedPhotos: [],
    topCommentedPhotos: [],
    mostEngagingUsers: [],
    followerGrowthOverTime: [],
    mostFollowedUsers: [],
    trendingTagsOverTime: [],
    mostUsedTags: [],
    userTagPreferences: [],
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllData()

        // Process data for charts
        const newUsersData = getNewUsersOverTime(data.users)
        const mostActiveUsersData = getMostActiveUsers(data.users, data.photos, data.likes, data.comments)
        const photoLikesTrendData = getPhotoLikesTrend(data.likes)
        const topLikedPhotosData = getTopLikedPhotos(data.photos, data.likes, data.users)
        const topCommentedPhotosData = getTopCommentedPhotos(data.photos, data.comments, data.users)
        const mostEngagingUsersData = getMostEngagingUsers(data.users, data.photos, data.likes, data.comments)
        const followerGrowthData = getFollowerGrowthOverTime(data.follows)
        const mostFollowedUsersData = getMostFollowedUsers(data.users, data.follows)
        const trendingTagsData = getTrendingTagsOverTime(data.tags, data.photoTags, data.photos)
        const mostUsedTagsData = getMostUsedTags(data.tags, data.photoTags)
        const userTagPreferencesData = getUserPreferencesByTags(data.users, data.photos, data.photoTags, data.tags)

        setChartData({
          newUsersOverTime: newUsersData,
          mostActiveUsers: mostActiveUsersData,
          photoLikesTrend: photoLikesTrendData,
          topLikedPhotos: topLikedPhotosData,
          topCommentedPhotos: topCommentedPhotosData,
          mostEngagingUsers: mostEngagingUsersData,
          followerGrowthOverTime: followerGrowthData,
          mostFollowedUsers: mostFollowedUsersData,
          trendingTagsOverTime: trendingTagsData,
          mostUsedTags: mostUsedTagsData,
          userTagPreferences: userTagPreferencesData,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    updateActiveFilters(range)
  }

  // Update active filters
  const updateActiveFilters = (range: DateRange | undefined) => {
    // Remove any existing date filter
    const updatedFilters = activeFilters.filter((filter) => !filter.startsWith("Date:"))

    // Add new date filter if range exists
    if (range?.from) {
      const fromDate = format(range.from, "MMM dd, yyyy")
      const toDate = range.to ? format(range.to, "MMM dd, yyyy") : "present"
      updatedFilters.push(`Date: ${fromDate} to ${toDate}`)
    }

    setActiveFilters(updatedFilters)
  }

  // Handle data limit change
  const handleDataLimitChange = (limit: number) => {
    setDataLimit(limit)

    // Update active filters
    const updatedFilters = activeFilters.filter((filter) => !filter.startsWith("Limit:"))
    if (limit > 0) {
      updatedFilters.push(`Limit: Top ${limit}`)
    }
    setActiveFilters(updatedFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    setDateRange(undefined)
    setDataLimit(10)
    setActiveFilters([])
  }

  // Remove specific filter
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Date:")) {
      setDateRange(undefined)
    } else if (filter.startsWith("Limit:")) {
      setDataLimit(10)
    }

    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  // Filter data based on date range
  const filterDataByDateRange = useCallback(
    (data, dateKey = "date") => {
      if (!data || data.length === 0 || !dateRange?.from) return data

      return data.filter((item) => {
        const itemDate = new Date(item[dateKey])
        if (dateRange.from && itemDate < dateRange.from) return false
        if (dateRange.to && itemDate > dateRange.to) return false
        return true
      })
    },
    [dateRange],
  )

  // Apply data limit to array
  const applyDataLimit = useCallback(
    (data) => {
      if (!data || data.length === 0 || dataLimit === 0) return data
      return data.slice(0, dataLimit)
    },
    [dataLimit],
  )

  // Format trending tags data for chart
  const formatTrendingTagsData = useCallback((data) => {
    if (!data || data.length === 0) return []

    // Get top 3 tags
    const allTags = {}
    data.forEach((item) => {
      Object.entries(item.tagCounts).forEach(([tag, count]) => {
        allTags[tag] = (allTags[tag] || 0) + (count as number)
      })
    })

    const topTags = Object.entries(allTags)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([tag]) => tag)

    // Format data for chart
    return data.map((item) => {
      const formattedItem: any = { date: item.date }

      topTags.forEach((tag) => {
        formattedItem[tag] = item.tagCounts[tag] || 0
      })

      return formattedItem
    })
  }, [])

  // Calculate max value for Y axis
  const getMaxValue = useCallback((data, key) => {
    if (!data || data.length === 0) return 10
    const max = Math.max(...data.map((item) => item[key] || 0))
    // Round up to next multiple of 5 or 10 depending on size
    return max <= 20 ? Math.ceil(max / 5) * 5 : Math.ceil(max / 10) * 10
  }, [])

  const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"]

  // Helper function to format dates
  const format = (date: Date, formatStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  // Generate SQL date filter based on current date range
  const getSqlDateFilter = useCallback(() => {
    if (!dateRange?.from) return ""

    const fromDate = dateRange.from.toISOString().split("T")[0]
    const toDate = dateRange.to ? dateRange.to.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    return `BETWEEN '${fromDate}' AND '${toDate}'`
  }, [dateRange])

  // Generate SQL limit clause
  const getSqlLimitClause = useCallback(() => {
    return dataLimit > 0 ? `LIMIT ${dataLimit}` : ""
  }, [dataLimit])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Data Analysis</h1>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Data Filters
            </CardTitle>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                    {filter}
                    <button onClick={() => removeFilter(filter)} className="ml-1 hover:text-destructive">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6">
                  Clear all
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Date Range</h3>
                <EnhancedDateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
              </div>

              <div>
                <DataLimitControl
                  limit={dataLimit}
                  onLimitChange={handleDataLimitChange}
                  options={[5, 10, 20, 50, 100]}
                  label="Data Limit"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading data...</span>
          </div>
        ) : (
          <Tabs defaultValue="user-activity">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="user-activity" className="flex items-center">
                <LineChartIcon className="mr-2 h-4 w-4" />
                User Activity
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Engagement
              </TabsTrigger>
              <TabsTrigger value="social-network" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Social Network
              </TabsTrigger>
              <TabsTrigger value="tag-analysis" className="flex items-center">
                <PieChart className="mr-2 h-4 w-4" />
                Tag Analysis
              </TabsTrigger>
            </TabsList>

            {/* User Activity Analysis */}
            <TabsContent value="user-activity">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for New Users Over Time"
                    query={`SELECT DATE(created_at) as date, COUNT(*) as count
FROM users
${dateRange?.from ? `WHERE created_at ${getSqlDateFilter()}` : ""}
GROUP BY DATE(created_at)
ORDER BY date;`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>New Users Over Time</CardTitle>
                      <CardDescription>Number of new user accounts created per day</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer
                        yAxisInteger={true}
                        minDomain={0}
                        maxDomain={getMaxValue(filterDataByDateRange(chartData.newUsersOverTime), "count")}
                      >
                        <ChartContainer
                          config={{
                            count: {
                              label: "New Users",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={filterDataByDateRange(chartData.newUsersOverTime)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                            >
                              <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value)
                                  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                }}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                domain={[0, "auto"]}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--color-count)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Most Active Users"
                    query={`SELECT u.username,
     COUNT(DISTINCT p.id) as posts,
     COUNT(DISTINCT l.photo_id) as likes,
     COUNT(DISTINCT c.id) as comments
FROM users u
LEFT JOIN photos p ON u.id = p.user_id
LEFT JOIN likes l ON u.id = l.user_id
LEFT JOIN comments c ON u.id = c.user_id
${
  dateRange?.from
    ? `WHERE 
(p.created_dat ${getSqlDateFilter()} OR p.id IS NULL)
AND (l.created_at ${getSqlDateFilter()} OR l.photo_id IS NULL)
AND (c.created_at ${getSqlDateFilter()} OR c.id IS NULL)`
    : ""
}
GROUP BY u.id, u.username
ORDER BY (COUNT(DISTINCT p.id) + COUNT(DISTINCT l.photo_id) + COUNT(DISTINCT c.id)) DESC
${getSqlLimitClause()};`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Active Users</CardTitle>
                      <CardDescription>Users with the most posts, likes, and comments</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer yAxisInteger={true}>
                        <ChartContainer
                          config={{
                            posts: {
                              label: "Posts",
                              color: "hsl(var(--chart-1))",
                            },
                            likes: {
                              label: "Likes",
                              color: "hsl(var(--chart-2))",
                            },
                            comments: {
                              label: "Comments",
                              color: "hsl(var(--chart-3))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={applyDataLimit(chartData.mostActiveUsers)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                              barGap={4}
                            >
                              <XAxis
                                dataKey="username"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="posts" fill="var(--color-posts)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="comments" fill="var(--color-comments)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Engagement Analysis */}
            <TabsContent value="engagement">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Photo Likes Trend"
                    query={`SELECT DATE(created_at) as date, COUNT(*) as count
FROM likes
${dateRange?.from ? `WHERE created_at ${getSqlDateFilter()}` : ""}
GROUP BY DATE(created_at)
ORDER BY date;`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Photo Likes Trend</CardTitle>
                      <CardDescription>Total number of likes received on all photos over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer
                        yAxisInteger={true}
                        minDomain={0}
                        maxDomain={getMaxValue(filterDataByDateRange(chartData.photoLikesTrend), "count")}
                      >
                        <ChartContainer
                          config={{
                            count: {
                              label: "Likes",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={filterDataByDateRange(chartData.photoLikesTrend)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                            >
                              <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value)
                                  {
                                    console.log(date)
                                  }
                                  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                }}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                domain={[0, "auto"]}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--color-count)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Top Liked Photos"
                    query={`SELECT p.id as photoId, u.username, COUNT(l.photo_id) as likes
FROM photos p
JOIN users u ON p.user_id = u.id
JOIN likes l ON p.id = l.photo_id
${dateRange?.from ? `WHERE l.created_at ${getSqlDateFilter()}` : ""}
GROUP BY p.id, u.username
ORDER BY likes DESC
${getSqlLimitClause()};`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Liked Photos</CardTitle>
                      <CardDescription>Photos with the highest number of likes</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer yAxisInteger={true}>
                        <ChartContainer
                          config={{
                            likes: {
                              label: "Likes",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={applyDataLimit(chartData.topLikedPhotos)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                              layout="vertical"
                            >
                              <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                dataKey="photoId"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => `Photo ${value}`}
                                width={80}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="likes" fill="var(--color-likes)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Top Commented Photos"
                    query={`SELECT p.id as photoId, u.username, COUNT(c.id) as comments
FROM photos p
JOIN users u ON p.user_id = u.id
JOIN comments c ON p.id = c.photo_id
${dateRange?.from ? `WHERE c.created_at ${getSqlDateFilter()}` : ""}
GROUP BY p.id, u.username
ORDER BY comments DESC
${getSqlLimitClause()};`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Commented Photos</CardTitle>
                      <CardDescription>Photos with the highest number of comments</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer yAxisInteger={true}>
                        <ChartContainer
                          config={{
                            comments: {
                              label: "Comments",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={applyDataLimit(chartData.topCommentedPhotos)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                              layout="vertical"
                            >
                              <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                dataKey="photoId"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => `Photo ${value}`}
                                width={80}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="comments" fill="var(--color-comments)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Most Engaging Users"
                    query={`SELECT u.username,
     COUNT(l.photo_id) as likes,
     COUNT(c.id) as comments
FROM users u
JOIN photos p ON u.id = p.user_id
LEFT JOIN likes l ON p.id = l.photo_id
LEFT JOIN comments c ON p.id = c.photo_id
${
  dateRange?.from
    ? `WHERE 
(l.created_at ${getSqlDateFilter()} OR l.photo_id IS NULL)
AND (c.created_at ${getSqlDateFilter()} OR c.id IS NULL)`
    : ""
}
GROUP BY u.id, u.username
ORDER BY (COUNT(l.photo_id) + COUNT(c.id)) DESC
${getSqlLimitClause()};`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Engaging Users</CardTitle>
                      <CardDescription>Users with the highest total engagement (likes + comments)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer yAxisInteger={true}>
                        <ChartContainer
                          config={{
                            likes: {
                              label: "Likes",
                              color: "hsl(var(--chart-1))",
                            },
                            comments: {
                              label: "Comments",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={applyDataLimit(chartData.mostEngagingUsers)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                              barGap={4}
                            >
                              <XAxis
                                dataKey="username"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="comments" fill="var(--color-comments)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Social Network Analysis */}
            <TabsContent value="social-network">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Follower Growth Over Time"
                    query={`SELECT DATE(created_at) as date, COUNT(*) as count
FROM follows
${dateRange?.from ? `WHERE created_at ${getSqlDateFilter()}` : ""}
GROUP BY DATE(created_at)
ORDER BY date;`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Follower Growth Over Time</CardTitle>
                      <CardDescription>Number of new followers gained over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer
                        yAxisInteger={true}
                        minDomain={0}
                        maxDomain={getMaxValue(filterDataByDateRange(chartData.followerGrowthOverTime), "count")}
                      >
                        <ChartContainer
                          config={{
                            count: {
                              label: "New Followers",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={filterDataByDateRange(chartData.followerGrowthOverTime)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                            >
                              <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value)
                                  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                }}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                domain={[0, "auto"]}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--color-count)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Most Followed Users"
                    query={`SELECT u.username, COUNT(f.follower_id) as followers
FROM users u
JOIN follows f ON u.id = f.followee_id
${dateRange?.from ? `WHERE f.created_at ${getSqlDateFilter()}` : ""}
GROUP BY u.id, u.username
ORDER BY followers DESC
${getSqlLimitClause()};`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Followed Users</CardTitle>
                      <CardDescription>Users with the highest number of followers</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer yAxisInteger={true}>
                        <ChartContainer
                          config={{
                            followers: {
                              label: "Followers",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={applyDataLimit(chartData.mostFollowedUsers)}
                              margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                            >
                              <XAxis
                                dataKey="username"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                              />
                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="followers" fill="var(--color-followers)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tag Analysis */}
            <TabsContent value="tag-analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Most Used Tags"
                    query={`SELECT t.tag_name as name, COUNT(pt.photo_id) as count
FROM tags t
JOIN photo_tags pt ON t.id = pt.tag_id
JOIN photos p ON pt.photo_id = p.id
${dateRange?.from ? `WHERE p.created_dat ${getSqlDateFilter()}` : ""}
GROUP BY t.id, t.tag_name
ORDER BY count DESC
${getSqlLimitClause()};`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Used Tags</CardTitle>
                      <CardDescription>Tags with the highest frequency of occurrence in photos</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={applyDataLimit(chartData.mostUsedTags)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {applyDataLimit(chartData.mostUsedTags).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [`${value} photos`, props.payload.name]}
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SqlQueryDisplay
                    title="SQL Query for Trending Tags Over Time"
                    query={`WITH tag_counts AS (
  SELECT 
    DATE(p.created_dat) as date,
    t.tag_name,
    COUNT(pt.photo_id) as tag_count
  FROM photos p
  JOIN photo_tags pt ON p.id = pt.photo_id
  JOIN tags t ON pt.tag_id = t.id
  ${dateRange?.from ? `WHERE p.created_dat ${getSqlDateFilter()}` : ""}
  GROUP BY DATE(p.created_dat), t.tag_name
),
top_tags AS (
  SELECT tag_name
  FROM tag_counts
  GROUP BY tag_name
  ORDER BY SUM(tag_count) DESC
  LIMIT ${dataLimit > 0 ? Math.min(dataLimit, 5) : 5}
)
SELECT tc.date, tc.tag_name, tc.tag_count
FROM tag_counts tc
JOIN top_tags tt ON tc.tag_name = tt.tag_name
ORDER BY tc.date, tc.tag_count DESC;`}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Trending Tags Over Time</CardTitle>
                      <CardDescription>Frequency of top tags used in photos over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveChartContainer yAxisInteger={true}>
                        {chartData.trendingTagsOverTime.length > 0 && (
                          <ChartContainer
                            config={Object.keys(
                              formatTrendingTagsData(filterDataByDateRange(chartData.trendingTagsOverTime))[0] || {},
                            )
                              .filter((key) => key !== "date")
                              .reduce((acc, tag, index) => {
                                acc[tag] = {
                                  label: `#${tag}`,
                                  color: `hsl(var(--chart-${index + 1}))`,
                                }
                                return acc
                              }, {})}
                          >
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart
                                data={filterDataByDateRange(formatTrendingTagsData(chartData.trendingTagsOverTime))}
                                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                              >
                                <XAxis
                                  dataKey="date"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                  tick={{ fontSize: 12 }}
                                  tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                  }}
                                />
                                <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                  allowDecimals={false}
                                  domain={[0, "auto"]}
                                  tick={{ fontSize: 12 }}
                                />
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                {Object.keys(
                                  formatTrendingTagsData(filterDataByDateRange(chartData.trendingTagsOverTime))[0] ||
                                    {},
                                )
                                  .filter((key) => key !== "date")
                                  .map((tag, index) => (
                                    <Line
                                      key={tag}
                                      type="monotone"
                                      dataKey={tag}
                                      stroke={`var(--color-${tag})`}
                                      strokeWidth={2}
                                      dot={false}
                                      activeDot={{ r: 6 }}
                                    />
                                  ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        )}
                      </ResponsiveChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>User Preferences Based on Tags</CardTitle>
                    <CardDescription>Heatmap showing which users frequently use which tags</CardDescription>
                  </CardHeader>
                  <CardHeader className="pt-0 pb-2">
                    <SqlQueryDisplay
                      title="SQL Query for User Tag Preferences"
                      query={`SELECT 
  u.username,
  t.tag_name,
  COUNT(pt.photo_id) as tag_count
FROM users u
JOIN photos p ON u.id = p.user_id
JOIN photo_tags pt ON p.id = pt.photo_id
JOIN tags t ON pt.tag_id = t.id
${dateRange?.from ? `WHERE p.created_dat ${getSqlDateFilter()}` : ""}
GROUP BY u.id, u.username, t.id, t.tag_name
HAVING COUNT(pt.photo_id) > 0
ORDER BY u.username, tag_count DESC
${getSqlLimitClause()};`}
                    />
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ResponsiveChartContainer height={400}>
                      {chartData.userTagPreferences.length > 0 && (
                        <div className="min-w-[800px] overflow-x-auto">
                          <div className="grid grid-cols-[150px_repeat(8,1fr)] gap-1">
                            <div className="font-medium p-2">User</div>
                            {Object.keys(applyDataLimit(chartData.userTagPreferences)[0]?.tagPreferences || {})
                              .slice(0, 8)
                              .map((tag) => (
                                <div key={tag} className="font-medium p-2 text-center">
                                  #{tag}
                                </div>
                              ))}

                            {applyDataLimit(chartData.userTagPreferences).map((user, i) => (
                              <React.Fragment key={i}>
                                <div className="font-medium p-2 truncate" title={user.username}>
                                  {user.username}
                                </div>
                                {Object.keys(user.tagPreferences)
                                  .slice(0, 8)
                                  .map((tag) => {
                                    const value = user.tagPreferences[tag] || 0
                                    const maxValue = Math.max(
                                      ...applyDataLimit(chartData.userTagPreferences).map(
                                        (u) => u.tagPreferences[tag] || 0,
                                      ),
                                    )
                                    const intensity = maxValue > 0 ? Math.min(value / maxValue, 1) : 0
                                    const bgColor = `rgba(124, 58, 237, ${intensity})`
                                    return (
                                      <div
                                        key={`${user.username}-${tag}`}
                                        className="p-2 text-center rounded-md"
                                        style={{ backgroundColor: bgColor }}
                                        title={`${user.username} used #${tag} ${value} times`}
                                      >
                                        {value}
                                      </div>
                                    )
                                  })}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                    </ResponsiveChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

