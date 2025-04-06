// Data service for fetching and processing CSV data
import {
  validateUser,
  validateTag,
  validatePhoto,
  validatePhotoTag,
  validateLike,
  validateFollow,
  validateComment,
  validateRecords,
} from "./csv-validator"

export interface User {
  id: string
  username: string
  created_at: string
}

export interface Tag {
  id: string
  tag_name: string
  created_at: string
}

export interface Photo {
  id: string
  image_url: string
  user_id: string
  created_dat: string // Note: typo in the original schema
}

export interface PhotoTag {
  photo_id: string
  tag_id: string
}

export interface Like {
  user_id: string
  photo_id: string
  created_at: string
}

export interface Follow {
  follower_id: string
  followee_id: string
  created_at: string
}

export interface Comment {
  id: string
  comment_text: string
  user_id: string
  photo_id: string
  created_at: string
}

// Function to fetch and parse CSV data
async function fetchCSV<T>(url: string, validator: (record: Partial<T>) => T | null): Promise<T[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    const csvText = await response.text()
    const parsedData = parseCSV<T>(csvText)

    // Validate and clean the data
    return validateRecords(parsedData, validator)
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return []
  }
}

// Parse CSV text to array of objects
function parseCSV<T>(csvText: string): Partial<T>[] {
  const lines = csvText.trim().split("\n")
  if (lines.length <= 1) return []

  const headers = lines[0].split(",").map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim())
    const obj: Record<string, string> = {}

    headers.forEach((header, index) => {
      obj[header] = values[index] || ""
    })

    return obj as unknown as Partial<T>
  })
}

// Fetch all data sources
export async function fetchAllData() {
  // Local CSV file paths in the public folder
  const usersUrl = "/data/users.csv"
  const tagsUrl = "/data/tags.csv"
  const followsUrl = "/data/follows.csv"
  const photoTagsUrl = "/data/photo_tags.csv"
  const photosUrl = "/data/photos.csv"
  const commentsUrl = "/data/comments.csv"
  const likesUrl = "/data/likes.csv"

  const [users, tags, follows, photoTags, photos, comments, likes] = await Promise.all([
    fetchCSV<User>(usersUrl, validateUser),
    fetchCSV<Tag>(tagsUrl, validateTag),
    fetchCSV<Follow>(followsUrl, validateFollow),
    fetchCSV<PhotoTag>(photoTagsUrl, validatePhotoTag),
    fetchCSV<Photo>(photosUrl, validatePhoto),
    fetchCSV<Comment>(commentsUrl, validateComment),
    fetchCSV<Like>(likesUrl, validateLike),
  ])
  {
    console.log(users);
  }

  return {
    users,
    tags,
    follows,
    photoTags,
    photos,
    comments,
    likes,
  }
}


// Search users by username (prefix or full match)
export function searchUsersByUsername(users: User[], query: string): User[] {
  if (!query) return users
  const lowercaseQuery = query.toLowerCase()
  return users.filter((user) => user.username.toLowerCase().includes(lowercaseQuery)).sort((a, b) => a.username.localeCompare(b.username))
}

// Search users by creation date range
export function searchUsersByDateRange(users: User[], startDate?: Date, endDate?: Date): User[] {
  if (!startDate && !endDate) return users

  return users.filter((user) => {
    try {
      const userDate = new Date(user.created_at)
      if (isNaN(userDate.getTime())) return false
      if (startDate && userDate < startDate) return false
      if (endDate && userDate > endDate) return false
      return true
    } catch (e) {
      return false
    }
  })
}

// Search photos by user ID
export function searchPhotosByUser(photos: Photo[], userId: string): Photo[] {
  if (!userId) return photos
  return photos.filter((photo) => photo.user_id === userId)
}

// Search photos by date range
export function searchPhotosByDateRange(photos: Photo[], startDate?: Date, endDate?: Date): Photo[] {
  if (!startDate && !endDate) return photos

  return photos.filter((photo) => {
    try {
      const photoDate = new Date(photo.created_dat)
      if (isNaN(photoDate.getTime())) return false
      if (startDate && photoDate < startDate) return false
      if (endDate && photoDate > endDate) return false
      return true
    } catch (e) {
      return false
    }
  })
}

// Search photos by tags
export function searchPhotosByTags(photos: Photo[], photoTags: PhotoTag[], tags: Tag[], tagNames: string[]): Photo[] {
  if (!tagNames.length) return photos

  // Find tag IDs for the given tag names
  const tagIds = tags.filter((tag) => tagNames.includes(tag.tag_name.toLowerCase())).map((tag) => tag.id)

  if (!tagIds.length) return []

  // Find photo IDs that have these tags
  const photoIds = photoTags.filter((pt) => tagIds.includes(pt.tag_id)).map((pt) => pt.photo_id)

  // Return photos that match these IDs
  return photos.filter((photo) => photoIds.includes(photo.id))
}

// Get photos with minimum number of likes
export function getPhotosWithMinLikes(photos: Photo[], likes: Like[], minLikes: number): Photo[] {
  // Count likes for each photo
  const likeCounts: Record<string, number> = {}

  likes.forEach((like) => {
    likeCounts[like.photo_id] = (likeCounts[like.photo_id] || 0) + 1
  })

  // Filter photos with at least minLikes
  return photos.filter((photo) => (likeCounts[photo.id] || 0) >= minLikes)
}

// Search comments by user
export function searchCommentsByUser(comments: Comment[], userId: string): Comment[] {
  if (!userId) return comments
  return comments.filter((comment) => comment.user_id === userId)
}

// Search comments by photo
export function searchCommentsByPhoto(comments: Comment[], photoId: string): Comment[] {
  if (!photoId) return comments
  return comments.filter((comment) => comment.photo_id === photoId)
}

// Search comments by keyword
export function searchCommentsByKeyword(comments: Comment[], keyword: string): Comment[] {
  if (!keyword) return comments
  const lowercaseKeyword = keyword.toLowerCase()
  return comments.filter((comment) => comment.comment_text.toLowerCase().includes(lowercaseKeyword))
}

// Search comments by date range
export function searchCommentsByDateRange(comments: Comment[], startDate?: Date, endDate?: Date): Comment[] {
  if (!startDate && !endDate) return comments

  return comments.filter((comment) => {
    try {
      const commentDate = new Date(comment.created_at)
      if (isNaN(commentDate.getTime())) return false
      if (startDate && commentDate < startDate) return false
      if (endDate && commentDate > endDate) return false
      return true
    } catch (e) {
      return false
    }
  })
}

// Search tags by name
export function searchTagsByName(tags: Tag[], query: string): Tag[] {
  if (!query) return tags
  const lowercaseQuery = query.toLowerCase()
  return tags.filter((tag) => tag.tag_name.toLowerCase().includes(lowercaseQuery))
}

// Get tags by popularity (number of photos using the tag)
export function getTagsByPopularity(tags: Tag[], photoTags: PhotoTag[], minCount = 0): Tag[] {
  // Count occurrences of each tag
  const tagCounts: Record<string, number> = {}

  photoTags.forEach((pt) => {
    tagCounts[pt.tag_id] = (tagCounts[pt.tag_id] || 0) + 1
  })

  // Filter and sort tags by popularity
  return tags
    .filter((tag) => (tagCounts[tag.id] || 0) >= minCount)
    .sort((a, b) => (tagCounts[b.id] || 0) - (tagCounts[a.id] || 0))
}

// Get followers of a user
export function getFollowers(follows: Follow[], userId: string): string[] {
  if (!userId) return []
  return follows.filter((follow) => follow.followee_id === userId).map((follow) => follow.follower_id)
}

// Get users followed by a user
export function getFollowing(follows: Follow[], userId: string): string[] {
  if (!userId) return []
  return follows.filter((follow) => follow.follower_id === userId).map((follow) => follow.followee_id)
}

// Get followers gained in a date range
export function getFollowersInDateRange(follows: Follow[], startDate?: Date, endDate?: Date): Follow[] {
  if (!startDate && !endDate) return follows

  return follows.filter((follow) => {
    try {
      const followDate = new Date(follow.created_at)
      if (isNaN(followDate.getTime())) return false
      if (startDate && followDate < startDate) return false
      if (endDate && followDate > endDate) return false
      return true
    } catch (e) {
      return false
    }
  })
}

// Get users who gained the most followers in a period
export function getUsersWithMostNewFollowers(
  follows: Follow[],
  startDate?: Date,
  endDate?: Date,
): Record<string, number> {
  const followsInRange = getFollowersInDateRange(follows, startDate, endDate)

  // Count new followers for each user
  const followerCounts: Record<string, number> = {}

  followsInRange.forEach((follow) => {
    followerCounts[follow.followee_id] = (followerCounts[follow.followee_id] || 0) + 1
  })

  return followerCounts
}

// Data analysis functions

// Get new users over time (for line chart)
export function getNewUsersOverTime(users: User[]): { date: string; count: number }[] {
  // Group users by date
  const usersByDate: Record<string, number> = {}

  users.forEach((user) => {
    try {
      const date = new Date(user.created_at)
      if (isNaN(date.getTime())) return

      const dateStr = date.toISOString().split("T")[0] // Extract date part
      usersByDate[dateStr] = (usersByDate[dateStr] || 0) + 1
    } catch (e) {
      // Skip invalid dates
    }
  })

  // Convert to array and sort by date
  return Object.entries(usersByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get most active users (by posts, likes, comments)
export function getMostActiveUsers(
  users: User[],
  photos: Photo[],
  likes: Like[],
  comments: Comment[],
): { username: string; posts: number; likes: number; comments: number }[] {
  const userActivity: Record<string, { username: string; posts: number; likes: number; comments: number }> = {}

  // Initialize with all users
  users.forEach((user) => {
    userActivity[user.id] = {
      username: user.username,
      posts: 0,
      likes: 0,
      comments: 0,
    }
  })

  // Count posts
  photos.forEach((photo) => {
    if (userActivity[photo.user_id]) {
      userActivity[photo.user_id].posts += 1
    }
  })

  // Count likes given
  likes.forEach((like) => {
    if (userActivity[like.user_id]) {
      userActivity[like.user_id].likes += 1
    }
  })

  // Count comments made
  comments.forEach((comment) => {
    if (userActivity[comment.user_id]) {
      userActivity[comment.user_id].comments += 1
    }
  })

  // Convert to array, sort by total activity
  return Object.values(userActivity).sort((a, b) => {
    const totalA = a.posts + a.likes + a.comments
    const totalB = b.posts + b.likes + b.comments
    return totalB - totalA
  })
  // Return all active users
}

// Get photo likes trend over time
export function getPhotoLikesTrend(likes: Like[]): { date: string; count: number }[] {
  // Group likes by date
  const likesByDate: Record<string, number> = {}

  likes.forEach((like) => {
    try {
      const date = new Date(like.created_at)
      if (isNaN(date.getTime())) return

      const dateStr = date.toISOString().split("T")[0] // Extract date part
      likesByDate[dateStr] = (likesByDate[dateStr] || 0) + 1
    } catch (e) {
      // Skip invalid dates
    }
  })

  // Convert to array and sort by date
  return Object.entries(likesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get top liked photos
export function getTopLikedPhotos(
  photos: Photo[],
  likes: Like[],
  users: User[],
): { photoId: string; username: string; likes: number }[] {
  // Count likes for each photo
  const likeCounts: Record<string, number> = {}

  likes.forEach((like) => {
    likeCounts[like.photo_id] = (likeCounts[like.photo_id] || 0) + 1
  })

  // Create a map of user IDs to usernames
  const userMap: Record<string, string> = {}
  users.forEach((user) => {
    userMap[user.id] = user.username
  })

  // Map photos to their like counts and usernames
  return photos
    .map((photo) => ({
      photoId: photo.id,
      username: userMap[photo.user_id] || "Unknown",
      likes: likeCounts[photo.id] || 0,
    }))
    .sort((a, b) => b.likes - a.likes)
  // Return all liked photos
}

// Get top commented photos
export function getTopCommentedPhotos(
  photos: Photo[],
  comments: Comment[],
  users: User[],
): { photoId: string; username: string; comments: number }[] {
  // Count comments for each photo
  const commentCounts: Record<string, number> = {}

  comments.forEach((comment) => {
    commentCounts[comment.photo_id] = (commentCounts[comment.photo_id] || 0) + 1
  })

  // Create a map of user IDs to usernames
  const userMap: Record<string, string> = {}
  users.forEach((user) => {
    userMap[user.id] = user.username
  })

  // Map photos to their comment counts and usernames
  return photos
    .map((photo) => ({
      photoId: photo.id,
      username: userMap[photo.user_id] || "Unknown",
      comments: commentCounts[photo.id] || 0,
    }))
    .sort((a, b) => b.comments - a.comments)
  // Return all commented photos
}

// Get most engaging users (total likes + comments received)
export function getMostEngagingUsers(
  users: User[],
  photos: Photo[],
  likes: Like[],
  comments: Comment[],
): { username: string; likes: number; comments: number }[] {
  // Map photos to their user IDs
  const photoUserMap: Record<string, string> = {}
  photos.forEach((photo) => {
    photoUserMap[photo.id] = photo.user_id
  })

  // Count likes and comments received by each user
  const userEngagement: Record<string, { likes: number; comments: number }> = {}

  // Initialize for all users
  users.forEach((user) => {
    userEngagement[user.id] = { likes: 0, comments: 0 }
  })

  // Count likes received
  likes.forEach((like) => {
    const userId = photoUserMap[like.photo_id]
    if (userId && userEngagement[userId]) {
      userEngagement[userId].likes += 1
    }
  })

  // Count comments received
  comments.forEach((comment) => {
    const userId = photoUserMap[comment.photo_id]
    if (userId && userEngagement[userId]) {
      userEngagement[userId].comments += 1
    }
  })

  // Map to array with usernames
  return users
    .map((user) => ({
      username: user.username,
      likes: userEngagement[user.id]?.likes || 0,
      comments: userEngagement[user.id]?.comments || 0,
    }))
    .sort((a, b) => {
      const totalA = a.likes + a.comments
      const totalB = b.likes + b.comments
      return totalB - totalA
    })
  // Return all engaging users
}

// Get follower growth over time
export function getFollowerGrowthOverTime(follows: Follow[]): { date: string; count: number }[] {
  // Group follows by date
  const followsByDate: Record<string, number> = {}

  follows.forEach((follow) => {
    try {
      const date = new Date(follow.created_at)
      if (isNaN(date.getTime())) return

      const dateStr = date.toISOString().split("T")[0] // Extract date part
      followsByDate[dateStr] = (followsByDate[dateStr] || 0) + 1
    } catch (e) {
      // Skip invalid dates
    }
  })

  // Convert to array and sort by date
  return Object.entries(followsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get most followed users
export function getMostFollowedUsers(users: User[], follows: Follow[]): { username: string; followers: number }[] {
  // Count followers for each user
  const followerCounts: Record<string, number> = {}

  follows.forEach((follow) => {
    followerCounts[follow.followee_id] = (followerCounts[follow.followee_id] || 0) + 1
  })

  // Map to array with usernames
  return users
    .map((user) => ({
      username: user.username,
      followers: followerCounts[user.id] || 0,
    }))
    .sort((a, b) => b.followers - a.followers)
  // Return all followed users
}

// Get trending tags over time
export function getTrendingTagsOverTime(
  tags: Tag[],
  photoTags: PhotoTag[],
  photos: Photo[],
): { date: string; tagCounts: Record<string, number> }[] {
  // Create a map of photo IDs to their creation dates
  const photoDateMap: Record<string, string> = {}
  photos.forEach((photo) => {
    try {
      const date = new Date(photo.created_dat)
      if (isNaN(date.getTime())) return

      photoDateMap[photo.id] = date.toISOString().split("T")[0] // Extract date part
    } catch (e) {
      // Skip invalid dates
    }
  })

  // Create a map of tag IDs to tag names
  const tagNameMap: Record<string, string> = {}
  tags.forEach((tag) => {
    tagNameMap[tag.id] = tag.tag_name
  })

  // Group photo tags by date and count occurrences of each tag
  const tagsByDate: Record<string, Record<string, number>> = {}

  photoTags.forEach((pt) => {
    const date = photoDateMap[pt.photo_id]
    const tagName = tagNameMap[pt.tag_id]

    if (date && tagName) {
      if (!tagsByDate[date]) {
        tagsByDate[date] = {}
      }

      tagsByDate[date][tagName] = (tagsByDate[date][tagName] || 0) + 1
    }
  })

  // Convert to array and sort by date
  return Object.entries(tagsByDate)
    .map(([date, tagCounts]) => ({ date, tagCounts }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get most used tags
export function getMostUsedTags(tags: Tag[], photoTags: PhotoTag[]): { name: string; count: number }[] {
  // Count occurrences of each tag
  const tagCounts: Record<string, number> = {}

  photoTags.forEach((pt) => {
    tagCounts[pt.tag_id] = (tagCounts[pt.tag_id] || 0) + 1
  })

  // Map to array with tag names
  return tags
    .map((tag) => ({
      name: tag.tag_name,
      count: tagCounts[tag.id] || 0,
    }))
    .sort((a, b) => b.count - a.count)
  // Return all tags
}

// Get user preferences based on tags
export function getUserPreferencesByTags(
  users: User[],
  photos: Photo[],
  photoTags: PhotoTag[],
  tags: Tag[],
): { username: string; tagPreferences: Record<string, number> }[] {
  // Create a map of photo IDs to their user IDs
  const photoUserMap: Record<string, string> = {}
  photos.forEach((photo) => {
    photoUserMap[photo.id] = photo.user_id
  })

  // Create a map of tag IDs to tag names
  const tagNameMap: Record<string, string> = {}
  tags.forEach((tag) => {
    tagNameMap[tag.id] = tag.tag_name
  })

  // Count tag usage for each user
  const userTagPreferences: Record<string, Record<string, number>> = {}

  // Initialize for all users
  users.forEach((user) => {
    userTagPreferences[user.id] = {}
  })

  // Count tag usage
  photoTags.forEach((pt) => {
    const userId = photoUserMap[pt.photo_id]
    const tagName = tagNameMap[pt.tag_id]

    if (userId && tagName && userTagPreferences[userId]) {
      userTagPreferences[userId][tagName] = (userTagPreferences[userId][tagName] || 0) + 1
    }
  })

  // Map to array with usernames
  return users
    .map((user) => ({
      username: user.username,
      tagPreferences: userTagPreferences[user.id] || {},
    }))
    .filter((user) => Object.keys(user.tagPreferences).length > 0) // Only users with tag preferences
    .sort((a, b) => {
      const totalA = Object.values(a.tagPreferences).reduce((sum, count) => sum + (count as number), 0)
      const totalB = Object.values(b.tagPreferences).reduce((sum, count) => sum + (count as number), 0)
      return totalB - totalA
    })
  // Return all users with tag preferences
}

