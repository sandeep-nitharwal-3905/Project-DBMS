"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, Search, Filter, X, Loader2 } from "lucide-react"
import Link from "next/link"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  fetchAllData,
  type User,
  type Photo,
  type Comment,
  type Tag,
  type Like,
  type Follow,
  type PhotoTag,
  searchUsersByUsername,
  searchUsersByDateRange,
  searchPhotosByUser,
  searchPhotosByDateRange,
  searchPhotosByTags,
  getPhotosWithMinLikes,
  searchCommentsByUser,
  searchCommentsByPhoto,
  searchCommentsByKeyword,
  searchCommentsByDateRange,
  searchTagsByName,
  getTagsByPopularity,
  getFollowers,
  getFollowing,
} from "@/lib/data-service"

// Add import for the SQL query display component
import { SqlQueryDisplay } from "@/components/sql-query-display"
import { EnhancedDateRangePicker } from "@/components/enhanced-date-range-picker"

interface FilterState {
  users: {
    username: string
    dateRange: DateRange | undefined
  }
  photos: {
    userId: string
    dateRange: DateRange | undefined
    tags: string
    minLikes: number
  }
  comments: {
    userId: string
    photoId: string
    keyword: string
    dateRange: DateRange | undefined
  }
  tags: {
    name: string
    minPopularity: number
  }
  follows: {
    userId: string
    relationship: string
    dateRange: DateRange | undefined
  }
}

interface SearchResults {
  users: User[]
  photos: Photo[]
  comments: Comment[]
  tags: Tag[]
  follows: Follow[]
}

export default function SearchFiltersPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    users: User[]
    photos: Photo[]
    comments: Comment[]
    tags: Tag[]
    likes: Like[]
    follows: Follow[]
    photoTags: PhotoTag[]
  }>({
    users: [],
    photos: [],
    comments: [],
    tags: [],
    likes: [],
    follows: [],
    photoTags: [],
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    photos: [],
    comments: [],
    tags: [],
    follows: [],
  })
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("users")

  const [filters, setFilters] = useState<FilterState>({
    users: {
      username: "",
      dateRange: undefined,
    },
    photos: {
      userId: "",
      dateRange: undefined,
      tags: "",
      minLikes: 0,
    },
    comments: {
      userId: "",
      photoId: "",
      keyword: "",
      dateRange: undefined,
    },
    tags: {
      name: "",
      minPopularity: 0,
    },
    follows: {
      userId: "",
      relationship: "followers",
      dateRange: undefined,
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const allData = await fetchAllData()
        setData(allData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateFilter = (category: keyof FilterState, field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }))
  }

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  const clearFilters = () => {
    setActiveFilters([])
    setShowResults(false)
    setFilters({
      users: {
        username: "",
        dateRange: undefined,
      },
      photos: {
        userId: "",
        dateRange: undefined,
        tags: "",
        minLikes: 0,
      },
      comments: {
        userId: "",
        photoId: "",
        keyword: "",
        dateRange: undefined,
      },
      tags: {
        name: "",
        minPopularity: 0,
      },
      follows: {
        userId: "",
        relationship: "followers",
        dateRange: undefined,
      },
    })
  }

  const handleSearch = () => {
    if (loading) return

    let filteredUsers = [...data.users]
    let filteredPhotos = [...data.photos]
    let filteredComments = [...data.comments]
    let filteredTags = [...data.tags]
    let filteredFollows = [...data.follows]

    // Apply user filters
    if (filters.users.username) {
      filteredUsers = searchUsersByUsername(filteredUsers, filters.users.username)
      addFilter(`Username: ${filters.users.username}`)
    }

    if (filters.users.dateRange?.from) {
      // Ensure the dates are Date objects
      const fromDate = filters.users.dateRange.from instanceof Date 
        ? filters.users.dateRange.from 
        : new Date(filters.users.dateRange.from);
      const toDate = filters.users.dateRange.to 
        ? (filters.users.dateRange.to instanceof Date 
             ? filters.users.dateRange.to 
             : new Date(filters.users.dateRange.to))
        : new Date();
    
      // Apply the date range filter
      filteredUsers = searchUsersByDateRange(filteredUsers, fromDate, toDate);
    
      // Add the filter description with formatted dates
      addFilter(`User created: ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`);
    }
    

    // Apply photo filters
    if (filters.photos.userId) {
      filteredPhotos = searchPhotosByUser(filteredPhotos, filters.photos.userId)
      const user = data.users.find((u) => u.id === filters.photos.userId)
      addFilter(`Photos by: ${user?.username || filters.photos.userId}`)
    }

    if (filters.photos.dateRange?.from) {
      filteredPhotos = searchPhotosByDateRange(
        filteredPhotos,
        filters.photos.dateRange.from,
        filters.photos.dateRange.to,
      )
      addFilter(
        `Photos from: ${filters.photos.dateRange.from.toLocaleDateString()} - ${filters.photos.dateRange.to?.toLocaleDateString() || "now"}`,
      )
    }

    if (filters.photos.tags) {
      const tagNames = filters.photos.tags.split(",").map((t) => t.trim().toLowerCase())
      filteredPhotos = searchPhotosByTags(filteredPhotos, data.photoTags, data.tags, tagNames)
      addFilter(`Tags: ${tagNames.join(", ")}`)
    }

    if (filters.photos.minLikes > 0) {
      filteredPhotos = getPhotosWithMinLikes(filteredPhotos, data.likes, filters.photos.minLikes)
      addFilter(`Min likes: ${filters.photos.minLikes}`)
    }

    // Apply comment filters
    if (filters.comments.userId) {
      filteredComments = searchCommentsByUser(filteredComments, filters.comments.userId)
      const user = data.users.find((u) => u.id === filters.comments.userId)
      addFilter(`Comments by: ${user?.username || filters.comments.userId}`)
    }

    if (filters.comments.photoId) {
      filteredComments = searchCommentsByPhoto(filteredComments, filters.comments.photoId)
      addFilter(`Comments on photo: ${filters.comments.photoId}`)
    }

    if (filters.comments.keyword) {
      filteredComments = searchCommentsByKeyword(filteredComments, filters.comments.keyword)
      addFilter(`Keyword: ${filters.comments.keyword}`)
    }

    if (filters.comments.dateRange?.from) {
      filteredComments = searchCommentsByDateRange(
        filteredComments,
        filters.comments.dateRange.from,
        filters.comments.dateRange.to,
      )
      addFilter(
        `Comments from: ${filters.comments.dateRange.from.toLocaleDateString()} - ${filters.comments.dateRange.to?.toLocaleDateString() || "now"}`,
      )
    }

    // Apply tag filters
    if (filters.tags.name) {
      filteredTags = searchTagsByName(filteredTags, filters.tags.name)
      addFilter(`Tag name: ${filters.tags.name}`)
    }

    if (filters.tags.minPopularity > 0) {
      filteredTags = getTagsByPopularity(filteredTags, data.photoTags, filters.tags.minPopularity)
      addFilter(`Min tag popularity: ${filters.tags.minPopularity}`)
    }

    // Apply follow filters
    if (filters.follows.userId) {
      if (filters.follows.relationship === "followers") {
        const followerIds = getFollowers(data.follows, filters.follows.userId)
        filteredFollows = data.follows.filter((f) => f.followee_id === filters.follows.userId)
        const user = data.users.find((u) => u.id === filters.follows.userId)
        addFilter(`Followers of: ${user?.username || filters.follows.userId}`)
      } else {
        const followingIds = getFollowing(data.follows, filters.follows.userId)
        filteredFollows = data.follows.filter((f) => f.follower_id === filters.follows.userId)
        const user = data.users.find((u) => u.id === filters.follows.userId)
        addFilter(`Following by: ${user?.username || filters.follows.userId}`)
      }
    }

    if (filters.follows.dateRange?.from) {
      filteredFollows = filteredFollows.filter((follow) => {
        const followDate = new Date(follow.created_at)
        if (filters.follows.dateRange?.from && followDate < filters.follows.dateRange.from) return false
        if (filters.follows.dateRange?.to && followDate > filters.follows.dateRange.to) return false
        return true
      })
      addFilter(
        `Follow date: ${filters.follows.dateRange.from.toLocaleDateString()} - ${filters.follows.dateRange.to?.toLocaleDateString() || "now"}`,
      )
    }

    setSearchResults({
      users: filteredUsers,
      photos: filteredPhotos,
      comments: filteredComments,
      tags: filteredTags,
      follows: filteredFollows,
    })

    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Search Filters</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                  </CardTitle>
                  <CardDescription>Apply filters to search Instagram data</CardDescription>
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeFilters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                          {filter}
                          <button onClick={() => removeFilter(filter)}>
                            <X className="h-3 w-3" />
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
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 mb-4">
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="photos">Photos</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                      <TabsTrigger value="tags">Tags</TabsTrigger>
                      <TabsTrigger value="follows">Follows</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Username</label>
                        <Input
                          placeholder="Search by username"
                          value={filters.users.username}
                          onChange={(e) => updateFilter("users", "username", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Account Creation Date</label>
                        <EnhancedDateRangePicker
                          dateRange={filters.users.dateRange}
                          onDateRangeChange={(range) => updateFilter("users", "dateRange", range)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="photos" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">User</label>
                        <Select
                          value={filters.photos.userId}
                          onValueChange={(value) => updateFilter("photos", "userId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Upload Date</label>
                        <EnhancedDateRangePicker
                          dateRange={filters.photos.dateRange}
                          onDateRangeChange={(range) => updateFilter("photos", "dateRange", range)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tags</label>
                        <Input
                          placeholder="Enter tags (comma separated)"
                          value={filters.photos.tags}
                          onChange={(e) => updateFilter("photos", "tags", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 flex justify-between">
                          <span>Minimum Likes</span>
                          <span className="text-muted-foreground">{filters.photos.minLikes}</span>
                        </label>
                        <Slider
                          value={[filters.photos.minLikes]}
                          max={100}
                          step={5}
                          onValueChange={(value) => updateFilter("photos", "minLikes", value[0])}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="comments" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">User</label>
                        <Select
                          value={filters.comments.userId}
                          onValueChange={(value) => updateFilter("comments", "userId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Photo ID</label>
                        <Input
                          placeholder="Enter photo ID"
                          type="text"
                          value={filters.comments.photoId}
                          onChange={(e) => updateFilter("comments", "photoId", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Keyword</label>
                        <Input
                          placeholder="Search in comment text"
                          value={filters.comments.keyword}
                          onChange={(e) => updateFilter("comments", "keyword", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Comment Date</label>
                        <EnhancedDateRangePicker
                          dateRange={filters.comments.dateRange}
                          onDateRangeChange={(range) => updateFilter("comments", "dateRange", range)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="tags" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tag Name</label>
                        <Input
                          placeholder="Search by tag name"
                          value={filters.tags.name}
                          onChange={(e) => updateFilter("tags", "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 flex justify-between">
                          <span>Minimum Popularity</span>
                          <span className="text-muted-foreground">{filters.tags.minPopularity} photos</span>
                        </label>
                        <Slider
                          value={[filters.tags.minPopularity]}
                          max={50}
                          step={1}
                          onValueChange={(value) => updateFilter("tags", "minPopularity", value[0])}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="follows" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">User</label>
                        <Select
                          value={filters.follows.userId}
                          onValueChange={(value) => updateFilter("follows", "userId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Relationship</label>
                        <Select
                          value={filters.follows.relationship}
                          onValueChange={(value) => updateFilter("follows", "relationship", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="followers">Followers (who follows this user)</SelectItem>
                            <SelectItem value="following">Following (who this user follows)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Follow Date</label>
                        <EnhancedDateRangePicker
                          dateRange={filters.follows.dateRange}
                          onDateRangeChange={(range) => updateFilter("follows", "dateRange", range)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6">
                    <Button onClick={handleSearch} className="w-full" size="lg">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {showResults ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>
                      {activeTab === "users" && `Found ${searchResults.users.length} users`}
                      {activeTab === "photos" && `Found ${searchResults.photos.length} photos`}
                      {activeTab === "comments" && `Found ${searchResults.comments.length} comments`}
                      {activeTab === "tags" && `Found ${searchResults.tags.length} tags`}
                      {activeTab === "follows" && `Found ${searchResults.follows.length} follow relationships`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeTab === "users" && (
                      <>
                        <SqlQueryDisplay
                          title="SQL Query for User Search"
                          query={`SELECT id, username, created_at
FROM users
${filters.users.username ? `WHERE username LIKE '%${filters.users.username}%'` : ""}
${
  filters.users.dateRange?.from
    ? `${filters.users.username ? "AND" : "WHERE"} created_at BETWEEN 
  '${filters.users.dateRange.from.toISOString().split("T")[0]}' AND 
  '${filters.users.dateRange.to ? filters.users.dateRange.to.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}'`
    : ""
}
ORDER BY created_at DESC;`}
                        />
                        <ScrollArea className="h-[500px]">
                          {searchResults.users.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.users.map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center p-4 border rounded-md hover:bg-muted/50 transition-colors"
                                >
                                  <Avatar className="h-12 w-12 mr-4">
                                    <AvatarImage
                                      src={`/placeholder.svg?height=48&width=48&text=${user.username.charAt(0)}`}
                                    />
                                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-base mb-1">{user.username}</p>
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">ID:</span> {user.id}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">Created (MM/DD/YYYY):</span>{" "}
                                      {new Date(user.created_at).toLocaleDateString()}{" "}
                                      {new Date(user.created_at).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No users found matching your criteria</p>
                            </div>
                          )}
                        </ScrollArea>
                      </>
                    )}

                    {activeTab === "photos" && (
                      <>
                        <SqlQueryDisplay
                          title="SQL Query for Photo Search"
                          query={`SELECT p.id, p.image_url, p.user_id, p.created_dat, u.username
FROM photos p
JOIN users u ON p.user_id = u.id
${filters.photos.userId ? `WHERE p.user_id = '${filters.photos.userId}'` : ""}
${
  filters.photos.dateRange?.from
    ? `${filters.photos.userId ? "AND" : "WHERE"} p.created_dat BETWEEN 
  '${filters.photos.dateRange.from.toISOString().split("T")[0]}' AND 
  '${filters.photos.dateRange.to ? filters.photos.dateRange.to.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}'`
    : ""
}
${
  filters.photos.tags
    ? `${filters.photos.userId || filters.photos.dateRange?.from ? "AND" : "WHERE"} p.id IN (
    SELECT pt.photo_id FROM photo_tags pt
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.tag_name IN (${filters.photos.tags
      .split(",")
      .map((t) => `'${t.trim()}'`)
      .join(", ")})
  )`
    : ""
}
${
  filters.photos.minLikes > 0
    ? `${filters.photos.userId || filters.photos.dateRange?.from || filters.photos.tags ? "AND" : "WHERE"} p.id IN (
    SELECT photo_id FROM likes
    GROUP BY photo_id
    HAVING COUNT(*) >= ${filters.photos.minLikes}
  )`
    : ""
}
ORDER BY p.created_dat DESC;`}
                        />
                        <ScrollArea className="h-[500px]">
                          {searchResults.photos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {searchResults.photos.map((photo) => {
                                const user = data.users.find((u) => u.id === photo.user_id)
                                const photoTags = data.photoTags
                                  .filter((pt) => pt.photo_id === photo.id)
                                  .map((pt) => {
                                    const tag = data.tags.find((t) => t.id === pt.tag_id)
                                    return tag?.tag_name || ""
                                  })
                                  .filter(Boolean)

                                const likeCount = data.likes.filter((like) => like.photo_id === photo.id).length
                                const commentCount = data.comments.filter(
                                  (comment) => comment.photo_id === photo.id,
                                ).length

                                return (
                                  <div
                                    key={photo.id}
                                    className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                                  >
                                    <div className="aspect-square relative bg-muted">
                                      <img
                                        src={`/placeholder.svg?height=300&width=300&text=Photo${photo.id}`}
                                        alt={`Photo ${photo.id}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                          <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage
                                              src={`/placeholder.svg?height=24&width=24&text=${user?.username?.charAt(0) || "?"}`}
                                            />
                                            <AvatarFallback>
                                              {user?.username?.charAt(0).toUpperCase() || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <p className="font-medium text-sm truncate max-w-[120px]">
                                            {user?.username || "Unknown"}
                                          </p>
                                        </div>
                                        <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                                          <span>{likeCount} likes</span>
                                          <span>•</span>
                                          <span>{commentCount} comments</span>
                                        </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground mb-2">
                                        <span className="font-medium">ID:</span> {photo.id} •{" "}
                                        <span className="font-medium">Created:</span>{" "}
                                        {new Date(photo.created_dat).toLocaleDateString()}
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {photoTags.map((tag, j) => (
                                          <Badge key={j} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {photoTags.length === 0 && (
                                          <span className="text-xs text-muted-foreground">No tags</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No photos found matching your criteria</p>
                            </div>
                          )}
                        </ScrollArea>
                      </>
                    )}

                    {activeTab === "comments" && (
                      <>
                        <SqlQueryDisplay
                          title="SQL Query for Comment Search"
                          query={`SELECT c.id, c.comment_text, c.user_id, c.photo_id, c.created_at, u.username
FROM comments c
JOIN users u ON c.user_id = u.id
${filters.comments.userId ? `WHERE c.user_id = '${filters.comments.userId}'` : ""}
${
  filters.comments.photoId
    ? `${filters.comments.userId ? "AND" : "WHERE"} c.photo_id = '${filters.comments.photoId}'`
    : ""
}
${
  filters.comments.keyword
    ? `${filters.comments.userId || filters.comments.photoId ? "AND" : "WHERE"} c.comment_text LIKE '%${filters.comments.keyword}%'`
    : ""
}
${
  filters.comments.dateRange?.from
    ? `${filters.comments.userId || filters.comments.photoId || filters.comments.keyword ? "AND" : "WHERE"} c.created_at BETWEEN 
  '${filters.comments.dateRange.from.toISOString().split("T")[0]}' AND 
  '${filters.comments.dateRange.to ? filters.comments.dateRange.to.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}'`
    : ""
}
ORDER BY c.created_at DESC;`}
                        />
                        <ScrollArea className="h-[500px]">
                          {searchResults.comments.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.comments.map((comment) => {
                                const user = data.users.find((u) => u.id === comment.user_id)
                                const photo = data.photos.find((p) => p.id === comment.photo_id)

                                return (
                                  <div
                                    key={comment.id}
                                    className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center mb-3">
                                      <Avatar className="h-8 w-8 mr-2">
                                        <AvatarImage
                                          src={`/placeholder.svg?height=32&width=32&text=${user?.username?.charAt(0) || "?"}`}
                                        />
                                        <AvatarFallback>
                                          {user?.username?.charAt(0).toUpperCase() || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{user?.username || "Unknown"}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(comment.created_at).toLocaleDateString()}{" "}
                                          {new Date(comment.created_at).toLocaleTimeString()}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm mb-3 whitespace-pre-line">{comment.comment_text}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Comment ID:</span> {comment.id}
                                      </div>
                                      <div>
                                        <span className="font-medium">On photo:</span> {comment.photo_id}
                                        {photo && (
                                          <span>
                                            {" "}
                                            by {data.users.find((u) => u.id === photo.user_id)?.username || "Unknown"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No comments found matching your criteria</p>
                            </div>
                          )}
                        </ScrollArea>
                      </>
                    )}

                    {activeTab === "tags" && (
                      <>
                        <SqlQueryDisplay
                          title="SQL Query for Tag Search"
                          query={`SELECT t.id, t.tag_name, t.created_at, COUNT(pt.photo_id) as popularity
FROM tags t
LEFT JOIN photo_tags pt ON t.id = pt.tag_id
${filters.tags.name ? `WHERE t.tag_name LIKE '%${filters.tags.name}%'` : ""}
GROUP BY t.id, t.tag_name, t.created_at
${filters.tags.minPopularity > 0 ? `HAVING COUNT(pt.photo_id) >= ${filters.tags.minPopularity}` : ""}
ORDER BY popularity DESC;`}
                        />
                        <ScrollArea className="h-[500px]">
                          {searchResults.tags.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.tags.map((tag) => {
                                const popularity = data.photoTags.filter((pt) => pt.tag_id === tag.id).length
                                const recentPhotos = data.photoTags
                                  .filter((pt) => pt.tag_id === tag.id)
                                  .map((pt) => pt.photo_id)
                                  .slice(0, 3)

                                return (
                                  <div
                                    key={tag.id}
                                    className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h3 className="font-medium text-base mb-1">#{tag.tag_name}</h3>
                                        <p className="text-xs text-muted-foreground mb-1">
                                          <span className="font-medium">ID:</span> {tag.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-medium">Created:</span>{" "}
                                          {new Date(tag.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Badge className="ml-2">{popularity} photos</Badge>
                                    </div>

                                    {recentPhotos.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-2">
                                          Recent photos with this tag:
                                        </p>
                                        <div className="flex space-x-2">
                                          {recentPhotos.map((photoId) => (
                                            <div key={photoId} className="w-12 h-12 rounded bg-muted overflow-hidden">
                                              <img
                                                src={`/placeholder.svg?height=48&width=48&text=${photoId}`}
                                                alt={`Photo ${photoId}`}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No tags found matching your criteria</p>
                            </div>
                          )}
                        </ScrollArea>
                      </>
                    )}

                    {activeTab === "follows" && (
                      <>
                        <SqlQueryDisplay
                          title="SQL Query for Follow Relationship Search"
                          query={`${
                            filters.follows.relationship === "followers"
                              ? `SELECT f.follower_id, f.followee_id, f.created_at, 
     u1.username as follower_username, u2.username as followee_username
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.followee_id = u2.id
WHERE f.followee_id = '${filters.follows.userId}'`
                              : `SELECT f.follower_id, f.followee_id, f.created_at, 
     u1.username as follower_username, u2.username as followee_username
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.followee_id = u2.id
WHERE f.follower_id = '${filters.follows.userId}'`
                          }
${
  filters.follows.dateRange?.from
    ? ` AND f.created_at BETWEEN 
  '${filters.follows.dateRange.from.toISOString().split("T")[0]}' AND 
  '${filters.follows.dateRange.to ? filters.follows.dateRange.to.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}'`
    : ""
}
ORDER BY f.created_at DESC;`}
                        />
                        <ScrollArea className="h-[500px]">
                          {searchResults.follows.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.follows.map((follow, i) => {
                                const follower = data.users.find((u) => u.id === follow.follower_id)
                                const followee = data.users.find((u) => u.id === follow.followee_id)

                                return (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center">
                                      <Avatar className="h-12 w-12 mr-4">
                                        <AvatarImage
                                          src={`/placeholder.svg?height=48&width=48&text=${follower?.username?.charAt(0) || "?"}`}
                                        />
                                        <AvatarFallback>
                                          {follower?.username?.charAt(0).toUpperCase() || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="flex items-center">
                                          <p className="font-medium">{follower?.username || "Unknown"}</p>
                                          <span className="mx-2 text-muted-foreground">→</span>
                                          <p className="font-medium">{followee?.username || "Unknown"}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium">Since:</span>{" "}
                                          {new Date(follow.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-medium">Follower ID:</span> {follow.follower_id} •{" "}
                                          <span className="font-medium">Followee ID:</span> {follow.followee_id}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                      View Profile
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                No follow relationships found matching your criteria
                              </p>
                            </div>
                          )}
                        </ScrollArea>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center border rounded-lg bg-white dark:bg-gray-800 p-8">
                  <div className="text-center">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Search Results Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Apply filters and click the search button to see results
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

