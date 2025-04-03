/**
 * Instagram Data Analysis Project - Backend Implementation
 * 
 * This file simulates a backend implementation using MySQL for database interactions.
 * It incorporates all SQL queries from the sql.txt file and provides functions for
 * common database operations.
 * 
 * Note: This is a simulation and does not actually connect to a database.
 */

// ===============================
// DATABASE CONNECTION SIMULATION
// ===============================

/**
 * Simulated MySQL database connection configuration
 */
const dbConfig = {
  host: 'localhost',
  user: 'instagram_admin',
  password: 'secure_password_123',
  database: 'instagram_data_analysis',
  port: 3306
};

console.log('Database configuration loaded:', dbConfig);

/**
 * Simulated database connection pool
 */
const pool = {
  getConnection: () => {
    console.log('Getting connection from pool...');
    return {
      query: (sql, params) => executeQuery(sql, params),
      release: () => console.log('Connection released back to pool')
    };
  }
};

// ===============================
// SIMULATED DATA
// ===============================

// Simulated users data
const usersData = [];

// Simulated photos data
const photosData = [];

// Simulated tags data
const tagsData = [];

// Simulated photo_tags data
const photoTagsData = [];

// Simulated likes data
const likesData = [];

// Simulated comments data
const commentsData = [];

// Simulated follows data
const followsData = [];

// ===============================
// SQL QUERY FUNCTIONS
// ===============================

/**
 * Simulates executing a SQL query
 * @param {string} sql - The SQL query to execute
 * @param {Array|Object} params - Optional parameters for the query
 * @returns {Promise} - A promise that resolves with the query results
 */
function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Executing SQL query:', sql);
      console.log('With parameters:', params);

      // Determine query type
      const queryType = sql.trim().split(' ')[0].toUpperCase();
      let result;

      switch (queryType) {
        case 'SELECT':
          result = handleSelectQuery(sql, params);
          break;
        case 'INSERT':
          result = handleInsertQuery(sql, params);
          break;
        case 'UPDATE':
          result = handleUpdateQuery(sql, params);
          break;
        case 'DELETE':
          result = handleDeleteQuery(sql, params);
          break;
        default:
          result = { affectedRows: 0, message: 'Query type not supported' };
      }

      console.log('Query result:', result);
      resolve(result);
    } catch (error) {
      console.error('Error executing query:', error);
      reject(error);
    }
  });
}

/**
 * Handles SELECT queries by simulating database retrieval
 * @param {string} sql - The SQL query
 * @param {Array|Object} params - Query parameters
 * @returns {Object} - Simulated query results
 */
function handleSelectQuery(sql, params) {
  // This is a simplified simulation that doesn't actually parse the SQL
  
  // Determine which table to query based on the SQL
  let data = [];
  
  if (sql.includes('FROM users')) {
    data = [...usersData];
  } else if (sql.includes('FROM photos')) {
    data = [...photosData];
  } else if (sql.includes('FROM tags')) {
    data = [...tagsData];
  } else if (sql.includes('FROM photo_tags')) {
    data = [...photoTagsData];
  } else if (sql.includes('FROM likes')) {
    data = [...likesData];
  } else if (sql.includes('FROM comments')) {
    data = [...commentsData];
  } else if (sql.includes('FROM follows')) {
    data = [...followsData];
  } else if (sql.includes('JOIN')) {
    // Handle JOIN queries (simplified)
    if (sql.includes('JOIN users') && sql.includes('JOIN photos')) {
      // Create joined data for users and photos
      data = photosData.map(photo => {
        const user = usersData.find(u => u.id === photo.user_id);
        return { ...photo, username: user ? user.username : 'unknown' };
      });
    } else if (sql.includes('JOIN comments') && sql.includes('JOIN users')) {
      // Create joined data for comments and users
      data = commentsData.map(comment => {
        const user = usersData.find(u => u.id === comment.user_id);
        return { ...comment, username: user ? user.username : 'unknown' };
      });
    }
  }

  // Apply very basic filtering if WHERE clause exists
  if (sql.includes('WHERE') && params.length > 0) {
    // This is an extremely simplified filter
    data = data.filter(item => {
      // Check if any property matches any parameter
      return Object.values(item).some(value => 
        params.some(param => String(value).includes(String(param)))
      );
    });
  }

  // Apply limit if specified
  if (sql.includes('LIMIT') && !isNaN(parseInt(sql.split('LIMIT')[1].trim()))) {
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch && limitMatch[1]) {
      const limit = parseInt(limitMatch[1], 10);
      data = data.slice(0, limit);
    }
  }

  return { rows: data, fields: data.length > 0 ? Object.keys(data[0]).map(key => ({ name: key })) : [] };
}

/**
 * Handles INSERT queries by simulating database insertion
 * @param {string} sql - The SQL query
 * @param {Array|Object} params - Query parameters
 * @returns {Object} - Simulated query results
 */
function handleInsertQuery(sql, params) {
  // In a real implementation, we would parse the SQL and insert data accordingly
  return { affectedRows: 1, insertId: Math.floor(Math.random() * 1000) + 100 };
}

/**
 * Handles UPDATE queries by simulating database updates
 * @param {string} sql - The SQL query
 * @param {Array|Object} params - Query parameters
 * @returns {Object} - Simulated query results
 */
function handleUpdateQuery(sql, params) {
  // In a real implementation, we would parse the SQL and update data accordingly
  return { affectedRows: Math.floor(Math.random() * 5) + 1, changedRows: Math.floor(Math.random() * 5) + 1 };
}

/**
 * Handles DELETE queries by simulating database deletions
 * @param {string} sql - The SQL query
 * @param {Array|Object} params - Query parameters
 * @returns {Object} - Simulated query results
 */
function handleDeleteQuery(sql, params) {
  // In a real implementation, we would parse the SQL and delete data accordingly
  return { affectedRows: Math.floor(Math.random() * 5) + 1 };
}

// ===============================
// DATABASE OPERATION FUNCTIONS
// ===============================

/**
 * Retrieves data from a specified table based on given conditions
 * @param {string} table - The table to query
 * @param {Object} conditions - The conditions for filtering data
 * @param {Array} fields - The fields to select (default: all fields)
 * @param {Object} options - Additional options (limit, offset, orderBy)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getData(table, conditions = {}, fields = ['*'], options = {}) {
  try {
    // Build the SELECT query
    let sql = `SELECT ${fields.join(', ')} FROM ${table}`;
    const params = [];

    // Add WHERE clause if conditions are provided
    if (Object.keys(conditions).length > 0) {
      sql += ' WHERE ';
      const whereClauses = [];

      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          whereClauses.push(`${key} IS NULL`);
        } else if (typeof value === 'object' && value.operator) {
          // Handle custom operators like { operator: '>', value: 10 }
          whereClauses.push(`${key} ${value.operator} ?`);
          params.push(value.value);
        } else {
          whereClauses.push(`${key} = ?`);
          params.push(value);
        }
      }

      sql += whereClauses.join(' AND ');
    }

    // Add ORDER BY clause if specified
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy.field} ${options.orderBy.direction || 'ASC'}`;
    }

    // Add LIMIT clause if specified
    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
      
      // Add OFFSET clause if specified
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }

    // Execute the query
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();

    return result.rows;
  } catch (error) {
    console.error(`Error retrieving data from ${table}:`, error);
    throw error;
  }
}

/**
 * Inserts data into a specified table
 * @param {string} table - The table to insert into
 * @param {Object} data - The data to insert
 * @returns {Promise} - A promise that resolves with the query results
 */
async function insertData(table, data) {
  try {
    // Build the INSERT query
    const fields = Object.keys(data);
    const placeholders = Array(fields.length).fill('?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    // Execute the query
    const connection = pool.getConnection();
    const result = await connection.query(sql, values);
    connection.release();

    return { id: result.insertId, ...data };
  } catch (error) {
    console.error(`Error inserting data into ${table}:`, error);
    throw error;
  }
}

/**
 * Updates data in a specified table based on given conditions
 * @param {string} table - The table to update
 * @param {Object} data - The data to update
 * @param {Object} conditions - The conditions for filtering data
 * @returns {Promise} - A promise that resolves with the query results
 */
async function updateData(table, data, conditions) {
  try {
    // Build the UPDATE query
    const updates = Object.keys(data).map(key => `${key} = ?`);
    let sql = `UPDATE ${table} SET ${updates.join(', ')}`;
    const params = [...Object.values(data)];

    // Add WHERE clause if conditions are provided
    if (Object.keys(conditions).length > 0) {
      sql += ' WHERE ';
      const whereClauses = [];

      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          whereClauses.push(`${key} IS NULL`);
        } else {
          whereClauses.push(`${key} = ?`);
          params.push(value);
        }
      }

      sql += whereClauses.join(' AND ');
    }

    // Execute the query
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();

    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
  } catch (error) {
    console.error(`Error updating data in ${table}:`, error);
    throw error;
  }
}

/**
 * Deletes data from a specified table based on given conditions
 * @param {string} table - The table to delete from
 * @param {Object} conditions - The conditions for filtering data
 * @returns {Promise} - A promise that resolves with the query results
 */
async function deleteData(table, conditions) {
  try {
    // Build the DELETE query
    let sql = `DELETE FROM ${table}`;
    const params = [];

    // Add WHERE clause if conditions are provided
    if (Object.keys(conditions).length > 0) {
      sql += ' WHERE ';
      const whereClauses = [];

      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          whereClauses.push(`${key} IS NULL`);
        } else {
          whereClauses.push(`${key} = ?`);
          params.push(value);
        }
      }

      sql += whereClauses.join(' AND ');
    }

    // Execute the query
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();

    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error(`Error deleting data from ${table}:`, error);
    throw error;
  }
}

// ===============================
// SQL QUERIES IMPLEMENTATION
// ===============================

/**
 * SQL QUERY CATEGORY 1: USER SEARCH QUERIES
 */

/**
 * 1.1 Basic User Search by Username
 * Purpose: Search for users whose usernames contain a specific string
 * @param {string} username - The username to search for
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchUsersByUsername(username) {
  try {
    const sql = `
      SELECT id, username, created_at
      FROM users
      WHERE username LIKE ?
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const params = [`%${username}%`];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching users by username:', error);
    throw error;
  }
}

/**
 * 1.2 User Search by Date Range
 * Purpose: Find users who created their accounts within a specific date range
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchUsersByDateRange(startDate, endDate) {
  try {
    const sql = `
      SELECT id, username, created_at
      FROM users
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const params = [startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching users by date range:', error);
    throw error;
  }
}

/**
 * 1.3 User Search by Username and Date Range
 * Purpose: Combined search for users by both username and creation date
 * @param {string} username - The username to search for
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchUsersByUsernameAndDateRange(username, startDate, endDate) {
  try {
    const sql = `
      SELECT id, username, created_at
      FROM users
      WHERE username LIKE ?
      AND created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const params = [`%${username}%`, startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching users by username and date range:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 2: PHOTO SEARCH QUERIES
 */

/**
 * 2.1 Photos by User
 * Purpose: Find all photos uploaded by a specific user
 * @param {string} userId - The user ID
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getPhotosByUser(userId) {
  try {
    const sql = `
      SELECT p.id, p.image_url, p.user_id, p.created_dat, u.username
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_dat DESC
      LIMIT 100
    `;
    
    const params = [userId];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting photos by user:', error);
    throw error;
  }
}

/**
 * 2.2 Photos by Date Range
 * Purpose: Find photos uploaded within a specific date range
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getPhotosByDateRange(startDate, endDate) {
  try {
    const sql = `
      SELECT p.id, p.image_url, p.user_id, p.created_dat, u.username
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.created_dat BETWEEN ? AND ?
      ORDER BY p.created_dat DESC
      LIMIT 100
    `;
    
    const params = [startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting photos by date range:', error);
    throw error;
  }
}

/**
 * 2.3 Photos by Tags
 * Purpose: Find photos that have specific tags
 * @param {Array} tags - Array of tag names
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getPhotosByTags(tags) {
  try {
    // Create placeholders for the tags
    const placeholders = tags.map(() => '?').join(',');
    
    const sql = `
      SELECT p.id, p.image_url, p.user_id, p.created_dat, u.username
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.id IN (
        SELECT pt.photo_id FROM photo_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE t.tag_name IN (${placeholders})
      )
      ORDER BY p.created_dat DESC
      LIMIT 100
    `;
    
    const params = [...tags];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting photos by tags:', error);
    throw error;
  }
}

/**
 * 2.4 Photos with Minimum Likes
 * Purpose: Find photos that have at least a specified number of likes
 * @param {number} minLikes - The minimum number of likes
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getPhotosWithMinimumLikes(minLikes) {
  try {
    const sql = `
      SELECT p.id, p.image_url, p.user_id, p.created_dat, u.username
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.id IN (
        SELECT photo_id FROM likes
        GROUP BY photo_id
        HAVING COUNT(*) >= ?
      )
      ORDER BY p.created_dat DESC
      LIMIT 100
    `;
    
    const params = [minLikes];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting photos with minimum likes:', error);
    throw error;
  }
}

/**
 * 2.5 Combined Photo Search
 * Purpose: Search photos with multiple criteria (user, date, tags, minimum likes)
 * @param {string} userId - The user ID
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @param {Array} tags - Array of tag names
 * @param {number} minLikes - The minimum number of likes
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchPhotos(userId, startDate, endDate, tags, minLikes) {
  try {
    // Create placeholders for the tags
    const placeholders = tags.map(() => '?').join(',');
    
    const sql = `
      SELECT p.id, p.image_url, p.user_id, p.created_dat, u.username
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      AND p.created_dat BETWEEN ? AND ?
      AND p.id IN (
        SELECT pt.photo_id FROM photo_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE t.tag_name IN (${placeholders})
      )
      AND p.id IN (
        SELECT photo_id FROM likes
        GROUP BY photo_id
        HAVING COUNT(*) >= ?
      )
      ORDER BY p.created_dat DESC
      LIMIT 100
    `;
    
    const params = [userId, startDate, endDate, ...tags, minLikes];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching photos:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 3: COMMENT SEARCH QUERIES
 */

/**
 * 3.1 Comments by User
 * Purpose: Find all comments made by a specific user
 * @param {string} userId - The user ID
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getCommentsByUser(userId) {
  try {
    const sql = `
      SELECT c.id, c.comment_text, c.user_id, c.photo_id, c.created_at, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT 100
    `;
    
    const params = [userId];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting comments by user:', error);
    throw error;
  }
}

/**
 * 3.2 Comments on a Specific Photo
 * Purpose: Find all comments on a specific photo
 * @param {string} photoId - The photo ID
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getCommentsByPhoto(photoId) {
  try {
    const sql = `
      SELECT c.id, c.comment_text, c.user_id, c.photo_id, c.created_at, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.photo_id = ?
      ORDER BY c.created_at DESC
      LIMIT 100
    `;
    
    const params = [photoId];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting comments by photo:', error);
    throw error;
  }
}

/**
 * 3.3 Comments Containing a Keyword
 * Purpose: Find comments that contain a specific keyword
 * @param {string} keyword - The keyword to search for
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getCommentsByKeyword(keyword) {
  try {
    const sql = `
      SELECT c.id, c.comment_text, c.user_id, c.photo_id, c.created_at, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.comment_text LIKE ?
      ORDER BY c.created_at DESC
      LIMIT 100
    `;
    
    const params = [`%${keyword}%`];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting comments by keyword:', error);
    throw error;
  }
}

/**
 * 3.4 Comments by Date Range
 * Purpose: Find comments made within a specific date range
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getCommentsByDateRange(startDate, endDate) {
  try {
    const sql = `
      SELECT c.id, c.comment_text, c.user_id, c.photo_id, c.created_at, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.created_at BETWEEN ? AND ?
      ORDER BY c.created_at DESC
      LIMIT 100
    `;
    
    const params = [startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting comments by date range:', error);
    throw error;
  }
}

/**
 * 3.5 Combined Comment Search
 * Purpose: Search comments with multiple criteria (user, photo, keyword, date)
 * @param {string} userId - The user ID
 * @param {string} photoId - The photo ID
 * @param {string} keyword - The keyword to search for
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchComments(userId, photoId, keyword, startDate, endDate) {
  try {
    const sql = `
      SELECT c.id, c.comment_text, c.user_id, c.photo_id, c.created_at, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      AND c.photo_id = ?
      AND c.comment_text LIKE ?
      AND c.created_at BETWEEN ? AND ?
      ORDER BY c.created_at DESC
      LIMIT 100
    `;
    
    const params = [userId, photoId, `%${keyword}%`, startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching comments:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 4: TAG SEARCH QUERIES
 */

/**
 * 4.1 Tags by Name
 * Purpose: Find tags whose names contain a specific string
 * @param {string} tagName - The tag name to search for
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getTagsByName(tagName) {
  try {
    const sql = `
      SELECT t.id, t.tag_name, t.created_at, COUNT(pt.photo_id) as popularity
      FROM tags t
      LEFT JOIN photo_tags pt ON t.id = pt.tag_id
      WHERE t.tag_name LIKE ?
      GROUP BY t.id, t.tag_name, t.created_at
      ORDER BY popularity DESC
      LIMIT 100
    `;
    
    const params = [`%${tagName}%`];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting tags by name:', error);
    throw error;
  }
}

/**
 * 4.2 Tags by Popularity
 * Purpose: Find tags with at least a specified number of photos
 * @param {number} minPopularity - The minimum number of photos
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getTagsByPopularity(minPopularity) {
  try {
    const sql = `
      SELECT t.id, t.tag_name, t.created_at, COUNT(pt.photo_id) as popularity
      FROM tags t
      LEFT JOIN photo_tags pt ON t.id = pt.tag_id
      GROUP BY t.id, t.tag_name, t.created_at
      HAVING COUNT(pt.photo_id) >= ?
      ORDER BY popularity DESC
      LIMIT 100
    `;
    
    const params = [minPopularity];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting tags by popularity:', error);
    throw error;
  }
}

/**
 * 4.3 Combined Tag Search
 * Purpose: Search tags by both name and minimum popularity
 * @param {string} tagName - The tag name to search for
 * @param {number} minPopularity - The minimum number of photos
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchTags(tagName, minPopularity) {
  try {
    const sql = `
      SELECT t.id, t.tag_name, t.created_at, COUNT(pt.photo_id) as popularity
      FROM tags t
      LEFT JOIN photo_tags pt ON t.id = pt.tag_id
      WHERE t.tag_name LIKE ?
      GROUP BY t.id, t.tag_name, t.created_at
      HAVING COUNT(pt.photo_id) >= ?
      ORDER BY popularity DESC
      LIMIT 100
    `;
    
    const params = [`%${tagName}%`, minPopularity];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching tags:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 5: FOLLOW RELATIONSHIP QUERIES
 */

/**
 * 5.1 Followers of a User
 * Purpose: Find all users who follow a specific user
 * @param {string} userId - The user ID
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getFollowersOfUser(userId) {
  try {
    const sql = `
      SELECT f.follower_id, f.followee_id, f.created_at, 
             u1.username as follower_username, u2.username as followee_username
      FROM follows f
      JOIN users u1 ON f.follower_id = u1.id
      JOIN users u2 ON f.followee_id = u2.id
      WHERE f.followee_id = ?
      ORDER BY f.created_at DESC
      LIMIT 100
    `;
    
    const params = [userId];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting followers of user:', error);
    throw error;
  }
}

/**
 * 5.2 Users Followed by a User
 * Purpose: Find all users followed by a specific user
 * @param {string} userId - The user ID
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getUsersFollowedByUser(userId) {
  try {
    const sql = `
      SELECT f.follower_id, f.followee_id, f.created_at, 
             u1.username as follower_username, u2.username as followee_username
      FROM follows f
      JOIN users u1 ON f.follower_id = u1.id
      JOIN users u2 ON f.followee_id = u2.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT 100
    `;
    
    const params = [userId];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting users followed by user:', error);
    throw error;
  }
}

/**
 * 5.3 Follow Relationships by Date Range
 * Purpose: Find follow relationships created within a specific date range
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getFollowRelationshipsByDateRange(startDate, endDate) {
  try {
    const sql = `
      SELECT f.follower_id, f.followee_id, f.created_at, 
             u1.username as follower_username, u2.username as followee_username
      FROM follows f
      JOIN users u1 ON f.follower_id = u1.id
      JOIN users u2 ON f.followee_id = u2.id
      WHERE f.created_at BETWEEN ? AND ?
      ORDER BY f.created_at DESC
      LIMIT 100
    `;
    
    const params = [startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting follow relationships by date range:', error);
    throw error;
  }
}

/**
 * 5.4 Combined Follow Relationship Search
 * Purpose: Search follow relationships with multiple criteria (user, relationship type, date)
 * @param {string} userId - The user ID
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise} - A promise that resolves with the query results
 */
async function searchFollowRelationships(userId, startDate, endDate) {
  try {
    const sql = `
      SELECT f.follower_id, f.followee_id, f.created_at, 
             u1.username as follower_username, u2.username as followee_username
      FROM follows f
      JOIN users u1 ON f.follower_id = u1.id
      JOIN users u2 ON f.followee_id = u2.id
      WHERE f.followee_id = ?
      AND f.created_at BETWEEN ? AND ?
      ORDER BY f.created_at DESC
      LIMIT 100
    `;
    
    const params = [userId, startDate, endDate];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error searching follow relationships:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 6: USER ACTIVITY ANALYSIS QUERIES
 */

/**
 * 6.1 New Users Over Time
 * Purpose: Count the number of new user accounts created per day
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getNewUsersOverTime(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting new users over time:', error);
    throw error;
  }
}

/**
 * 6.2 Most Active Users
 * Purpose: Find users with the most posts, likes, and comments
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getMostActiveUsers(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT u.username,
             COUNT(DISTINCT p.id) as posts,
             COUNT(DISTINCT l.photo_id) as likes,
             COUNT(DISTINCT c.id) as comments
      FROM users u
      LEFT JOIN photos p ON u.id = p.user_id
      LEFT JOIN likes l ON u.id = l.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      WHERE 
        (p.created_dat >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) OR p.id IS NULL)
        AND (l.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) OR l.photo_id IS NULL)
        AND (c.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) OR c.id IS NULL)
      GROUP BY u.id, u.username
      ORDER BY (COUNT(DISTINCT p.id) + COUNT(DISTINCT l.photo_id) + COUNT(DISTINCT c.id)) DESC
      LIMIT 5
    `;
    
    const params = [days, days, days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting most active users:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 7: ENGAGEMENT ANALYSIS QUERIES
 */

/**
 * 7.1 Photo Likes Trend
 * Purpose: Count the number of likes received on all photos per day
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getPhotoLikesTrend(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM likes
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting photo likes trend:', error);
    throw error;
  }
}

/**
 * 7.2 Top Liked Photos
 * Purpose: Find photos with the highest number of likes
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getTopLikedPhotos(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT p.id as photoId, u.username, COUNT(l.photo_id) as likes
      FROM photos p
      JOIN users u ON p.user_id = u.id
      JOIN likes l ON p.id = l.photo_id
      WHERE l.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY p.id, u.username
      ORDER BY likes DESC
      LIMIT 5
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting top liked photos:', error);
    throw error;
  }
}

/**
 * 7.3 Top Commented Photos
 * Purpose: Find photos with the highest number of comments
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getTopCommentedPhotos(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT p.id as photoId, u.username, COUNT(c.id) as comments
      FROM photos p
      JOIN users u ON p.user_id = u.id
      JOIN comments c ON p.id = c.photo_id
      WHERE c.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY p.id, u.username
      ORDER BY comments DESC
      LIMIT 5
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting top commented photos:', error);
    throw error;
  }
}

/**
 * 7.4 Most Engaging Users
 * Purpose: Find users whose content receives the most likes and comments
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getMostEngagingUsers(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT u.username,
             COUNT(l.photo_id) as likes,
             COUNT(c.id) as comments
      FROM users u
      JOIN photos p ON u.id = p.user_id
      LEFT JOIN likes l ON p.id = l.photo_id
      LEFT JOIN comments c ON p.id = c.photo_id
      WHERE 
        (l.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) OR l.photo_id IS NULL)
        AND (c.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) OR c.id IS NULL)
      GROUP BY u.id, u.username
      ORDER BY (COUNT(l.photo_id) + COUNT(c.id)) DESC
      LIMIT 5
    `;
    
    const params = [days, days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting most engaging users:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 8: SOCIAL NETWORK ANALYSIS QUERIES
 */

/**
 * 8.1 Follower Growth Over Time
 * Purpose: Count the number of new followers gained per day
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getFollowerGrowthOverTime(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM follows
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting follower growth over time:', error);
    throw error;
  }
}

/**
 * 8.2 Most Followed Users
 * Purpose: Find users with the highest number of followers
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getMostFollowedUsers(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT u.username, COUNT(f.follower_id) as followers
      FROM users u
      JOIN follows f ON u.id = f.followee_id
      WHERE f.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY u.id, u.username
      ORDER BY followers DESC
      LIMIT 5
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting most followed users:', error);
    throw error;
  }
}

/**
 * SQL QUERY CATEGORY 9: TAG ANALYSIS QUERIES
 */

/**
 * 9.1 Most Used Tags
 * Purpose: Find tags with the highest frequency of occurrence in photos
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getMostUsedTags(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT t.tag_name as name, COUNT(pt.photo_id) as count
      FROM tags t
      JOIN photo_tags pt ON t.id = pt.tag_id
      JOIN photos p ON pt.photo_id = p.id
      WHERE p.created_dat >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY t.id, t.tag_name
      ORDER BY count DESC
      LIMIT 7
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting most used tags:', error);
    throw error;
  }
}

/**
 * 9.2 Trending Tags Over Time
 * Purpose: Track the frequency of top tags used in photos over time
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getTrendingTagsOverTime(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      WITH tag_counts AS (
        SELECT 
          DATE(p.created_dat) as date,
          t.tag_name,
          COUNT(pt.photo_id) as tag_count
        FROM photos p
        JOIN photo_tags pt ON p.id = pt.photo_id
        JOIN tags t ON pt.tag_id = t.id
        WHERE p.created_dat >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
        GROUP BY DATE(p.created_dat), t.tag_name
      ),
      top_tags AS (
        SELECT tag_name
        FROM tag_counts
        GROUP BY tag_name
        ORDER BY SUM(tag_count) DESC
        LIMIT 3
      )
      SELECT tc.date, tc.tag_name, tc.tag_count
      FROM tag_counts tc
      JOIN top_tags tt ON tc.tag_name = tt.tag_name
      ORDER BY tc.date, tc.tag_count DESC
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting trending tags over time:', error);
    throw error;
  }
}

/**
 * 9.3 User Tag Preferences
 * Purpose: Analyze which users frequently use which tags
 * @param {string} timeRange - The time range (e.g., '30days', '90days', '1year')
 * @returns {Promise} - A promise that resolves with the query results
 */
async function getUserTagPreferences(timeRange) {
  try {
    // Convert time range to days
    let days;
    switch (timeRange) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    const sql = `
      SELECT 
        u.username,
        t.tag_name,
        COUNT(pt.photo_id) as tag_count
      FROM users u
      JOIN photos p ON u.id = p.user_id
      JOIN photo_tags pt ON p.id = pt.photo_id
      JOIN tags t ON pt.tag_id = t.id
      WHERE p.created_dat >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      GROUP BY u.id, u.username, t.id, t.tag_name
      HAVING COUNT(pt.photo_id) > 0
      ORDER BY u.username, tag_count DESC
    `;
    
    const params = [days];
    
    const connection = pool.getConnection();
    const result = await connection.query(sql, params);
    connection.release();
    
    return result.rows;
  } catch (error) {
    console.error('Error getting user tag preferences:', error);
    throw error;
  }
}

// ===============================
// ERROR HANDLING
// ===============================

/**
 * Global error handler for database operations
 * @param {Error} error - The error object
 * @param {string} operation - The operation that caused the error
 * @returns {Object} - Error response object
 */
function handleDatabaseError(error, operation) {
  console.error(`Database error during ${operation}:`, error);
  
  // Log the error  operation) {
  console.error(`Database error during ${operation}:`, error);
  
  // Log the error
  logError(error, operation);
  
  // Determine error type and return appropriate response
  if (error.code === 'ER_DUP_ENTRY') {
    return {
      success: false,
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    };
  } else if (error.code === 'ER_NO_REFERENCED_ROW') {
    return {
      success: false,
      error: 'Foreign key constraint failed',
      message: 'The referenced record does not exist'
    };
  } else {
    return {
      success: false,
      error: 'Database error',
      message: 'An error occurred while processing your request'
    };
  }
}

/**
 * Log error to monitoring system
 * @param {Error} error - The error object
 * @param {string} operation - The operation that caused the error
 */
function logError(error, operation) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    operation,
    errorCode: error.code || 'UNKNOWN',
    errorMessage: error.message,
    stack: error.stack
  };
  
  console.error('ERROR LOG:', JSON.stringify(errorLog, null, 2));
  
  // In a real implementation, this would send the error to a logging service
  // Example: await sendToLoggingService(errorLog);
}

// ===============================
// EXAMPLE USAGE
// ===============================

// Simulate request and response objects
const req = {
  params: { id: '1' },
  query: { username: 'john', startDate: '2023-01-01', endDate: '2023-12-31', timeRange: '30days' },
  body: { username: 'newuser' }
};

const res = {
  status: (code) => ({
    json: (data) => {
      console.log(`Response (${code}):`, JSON.stringify(data, null, 2));
      return data;
    }
  })
};

// Example usage of the functions
async function runExamples() {
  console.log('\n=== RUNNING EXAMPLES ===\n');
  
  try {
    // Example 1: Search users by username
    console.log('\n--- Example 1: Search users by username ---\n');
    const users = await searchUsersByUsername('john');
    console.log('Users found:', users);
    
    // Example 2: Get photos by user
    console.log('\n--- Example 2: Get photos by user ---\n');
    const photos = await getPhotosByUser('1');
    console.log('Photos found:', photos);
    
    // Example 3: Get comments by keyword
    console.log('\n--- Example 3: Get comments by keyword ---\n');
    const comments = await getCommentsByKeyword('beautiful');
    console.log('Comments found:', comments);
    
    // Example 4: Get most active users
    console.log('\n--- Example 4: Get most active users ---\n');
    const activeUsers = await getMostActiveUsers('30days');
    console.log('Most active users:', activeUsers);
    
    // Example 5: Get trending tags over time
    console.log('\n--- Example 5: Get trending tags over time ---\n');
    const trendingTags = await getTrendingTagsOverTime('30days');
    console.log('Trending tags:', trendingTags);
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runExamples();

// Export functions for external use
module.exports = {
  // Database functions
  executeQuery,
  getData,
  insertData,
  updateData,
  deleteData,
  
  // User search functions
  searchUsersByUsername,
  searchUsersByDateRange,
  searchUsersByUsernameAndDateRange,
  
  // Photo search functions
  getPhotosByUser,
  getPhotosByDateRange,
  getPhotosByTags,
  getPhotosWithMinimumLikes,
  searchPhotos,
  
  // Comment search functions
  getCommentsByUser,
  getCommentsByPhoto,
  getCommentsByKeyword,
  getCommentsByDateRange,
  searchComments,
  
  // Tag search functions
  getTagsByName,
  getTagsByPopularity,
  searchTags,
  
  // Follow relationship functions
  getFollowersOfUser,
  getUsersFollowedByUser,
  getFollowRelationshipsByDateRange,
  searchFollowRelationships,
  
  // Analysis functions
  getNewUsersOverTime,
  getMostActiveUsers,
  getPhotoLikesTrend,
  getTopLikedPhotos,
  getTopCommentedPhotos,
  getMostEngagingUsers,
  getFollowerGrowthOverTime,
  getMostFollowedUsers,
  getMostUsedTags,
  getTrendingTagsOverTime,
  getUserTagPreferences
};