/**
 * CSV Validation and Cleaning Utilities
 *
 * This module provides functions to validate and clean CSV data
 * to ensure consistency and proper formatting.
 */

import type { User, Tag, Photo, PhotoTag, Like, Follow, Comment } from "./data-service"

/**
 * Validates and cleans a date string
 * @param dateStr The date string to validate
 * @returns A valid date string or null if invalid
 */
export function validateDate(dateStr: string): string | null {
  // Return null if the input is empty or just whitespace
  if (!dateStr || dateStr.trim() === "") return null;

  // Try to parse the date string
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  // Return the date as an ISO string (e.g., "2025-04-04T15:43:49.548Z")
  return date.toISOString();
}

/**
 * Validates and cleans a user record.
 * Ensures the user has an id and username and a valid created_at date.
 * If the provided created_at is invalid, it defaults to the current date/time.
 */
export function validateUser(user: Partial<User>): User | null {
  // Ensure mandatory fields are present
  if (!user.id || !user.username) return null;

  // Validate the created_at date field
  {
    console.log("user", user.created_at);
  }
  const validatedDate = validateDate(user.created_at || "");

  return {
    id: user.id,
    username: user.username,
    created_at: validatedDate || new Date().toISOString(), // Default to current date if invalid
  };
}


/**
 * Validates and cleans a tag record
 */
export function validateTag(tag: Partial<Tag>): Tag | null {
  if (!tag.id || !tag.tag_name) return null

  const validatedDate = validateDate(tag.created_at || "")

  return {
    id: tag.id,
    tag_name: tag.tag_name,
    created_at: validatedDate || new Date().toISOString(), // Default to current date if invalid
  }
}

/**
 * Validates and cleans a photo record
 */
export function validatePhoto(photo: Partial<Photo>): Photo | null {
  if (!photo.id || !photo.user_id) return null

  // Note: The field is called created_dat in the schema (typo)
  const validatedDate = validateDate(photo.created_dat || "")

  return {
    id: photo.id,
    image_url: photo.image_url || "",
    user_id: photo.user_id,
    created_dat: validatedDate || new Date().toISOString(), // Default to current date if invalid
  }
}

/**
 * Validates and cleans a photo tag record
 */
export function validatePhotoTag(photoTag: Partial<PhotoTag>): PhotoTag | null {
  if (!photoTag.photo_id || !photoTag.tag_id) return null

  return {
    photo_id: photoTag.photo_id,
    tag_id: photoTag.tag_id,
  }
}

/**
 * Validates and cleans a like record
 */
export function validateLike(like: Partial<Like>): Like | null {
  if (!like.user_id || !like.photo_id) return null

  const validatedDate = validateDate(like.created_at || "")

  return {
    user_id: like.user_id,
    photo_id: like.photo_id,
    created_at: validatedDate || new Date().toISOString(), // Default to current date if invalid
  }
}

/**
 * Validates and cleans a follow record
 */
export function validateFollow(follow: Partial<Follow>): Follow | null {
  if (!follow.follower_id || !follow.followee_id) return null

  const validatedDate = validateDate(follow.created_at || "")

  return {
    follower_id: follow.follower_id,
    followee_id: follow.followee_id,
    created_at: validatedDate || new Date().toISOString(), // Default to current date if invalid
  }
}

/**
 * Validates and cleans a comment record
 */
export function validateComment(comment: Partial<Comment>): Comment | null {
  if (!comment.id || !comment.user_id || !comment.photo_id) return null

  const validatedDate = validateDate(comment.created_at || "")

  return {
    id: comment.id,
    comment_text: comment.comment_text || "",
    user_id: comment.user_id,
    photo_id: comment.photo_id,
    created_at: validatedDate || new Date().toISOString(), // Default to current date if invalid
  }
}

/**
 * Validates and cleans an array of records based on their type
 */
export function validateRecords<T>(records: Partial<T>[], validator: (record: Partial<T>) => T | null): T[] {
  return records.map((record) => validator(record)).filter((record): record is T => record !== null)
}

