"use client"

import { useState, useEffect } from "react"
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
import { DatePickerWithRange } from "@/components/date-range-picker"
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
      filteredUsers = searchUsersByDateRange(filteredUsers, filters.users.dateRange.from, filters.users.dateRange.to)
      addFilter(
        `User created: ${filters.users.dateRange.from.toLocaleDateString()} - ${filters.users.dateRange.to?.toLocaleDateString() || "now"}`,
      )
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
                        <DatePickerWithRange
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
                            {data.users.slice(0, 20).map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Upload Date</label>
                        <DatePickerWithRange
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
                            {data.users.slice(0, 20).map((user) => (
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
                        <DatePickerWithRange
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
                            {data.users.slice(0, 20).map((user) => (
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
                        <DatePickerWithRange
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
                    <ScrollArea className="h-[600px]">
                      {activeTab === "users" && (
                        <div className="space-y-4">
                          {searchResults.users.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.users.slice(0, 20).map((user) => (
                                <div key={user.id} className="flex items-center p-3 border rounded-md">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage
                                      src={`/placeholder.svg?height=40&width=40&text=${user.username.charAt(0)}`}
                                    />
                                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.username}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Created: {new Date(user.created_at).toLocaleDateString()}
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
                        </div>
                      )}

                      {activeTab === "photos" && (
                        <div className="space-y-4">
                          {searchResults.photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                              {searchResults.photos.slice(0, 20).map((photo) => {
                                const user = data.users.find((u) => u.id === photo.user_id)
                                const photoTags = data.photoTags
                                  .filter((pt) => pt.photo_id === photo.id)
                                  .map((pt) => {
                                    const tag = data.tags.find((t) => t.id === pt.tag_id)
                                    return tag?.tag_name || ""
                                  })
                                  .filter(Boolean)

                                const likeCount = data.likes.filter((like) => like.photo_id === photo.id).length

                                return (
                                  <div key={photo.id} className="border rounded-md overflow-hidden">
                                    <img
                                      src={`/placeholder.svg?height=150&width=150&text=Photo${photo.id}`}
                                      alt={`Photo ${photo.id}`}
                                      className="w-full h-32 object-cover"
                                    />
                                    <div className="p-2">
                                      <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">{user?.username || "Unknown"}</p>
                                        <p className="text-xs text-muted-foreground">{likeCount} likes</p>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {photoTags.slice(0, 3).map((tag, j) => (
                                          <Badge key={j} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {photoTags.length > 3 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{photoTags.length - 3} more
                                          </Badge>
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
                        </div>
                      )}

                      {activeTab === "comments" && (
                        <div className="space-y-4">
                          {searchResults.comments.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.comments.slice(0, 20).map((comment) => {
                                const user = data.users.find((u) => u.id === comment.user_id)

                                return (
                                  <div key={comment.id} className="p-3 border rounded-md">
                                    <div className="flex items-center mb-2">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage
                                          src={`/placeholder.svg?height=24&width=24&text=${user?.username?.charAt(0) || "?"}`}
                                        />
                                        <AvatarFallback>
                                          {user?.username?.charAt(0).toUpperCase() || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <p className="text-sm font-medium">{user?.username || "Unknown"}</p>
                                      <p className="text-xs text-muted-foreground ml-auto">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <p className="text-sm">{comment.comment_text}</p>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                      On photo #{comment.photo_id}
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
                        </div>
                      )}

                      {activeTab === "tags" && (
                        <div className="space-y-4">
                          {searchResults.tags.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.tags.slice(0, 20).map((tag) => {
                                const popularity = data.photoTags.filter((pt) => pt.tag_id === tag.id).length

                                return (
                                  <div key={tag.id} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                      <p className="font-medium">#{tag.tag_name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Created: {new Date(tag.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge>{popularity} photos</Badge>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No tags found matching your criteria</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "follows" && (
                        <div className="space-y-4">
                          {searchResults.follows.length > 0 ? (
                            <div className="grid gap-4">
                              {searchResults.follows.slice(0, 20).map((follow, i) => {
                                const follower = data.users.find((u) => u.id === follow.follower_id)
                                const followee = data.users.find((u) => u.id === follow.followee_id)

                                return (
                                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center">
                                      <Avatar className="h-10 w-10 mr-3">
                                        <AvatarImage
                                          src={`/placeholder.svg?height=40&width=40&text=${follower?.username?.charAt(0) || "?"}`}
                                        />
                                        <AvatarFallback>
                                          {follower?.username?.charAt(0).toUpperCase() || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{follower?.username || "Unknown"}</p>
                                        <p className="text-sm text-muted-foreground">
                                          follows {followee?.username || "Unknown"} since{" "}
                                          {new Date(follow.created_at).toLocaleDateString()}
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
                        </div>
                      )}
                    </ScrollArea>
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

