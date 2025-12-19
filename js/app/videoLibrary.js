// Video Library Manager
// Handles storage and retrieval of user videos using localStorage

const VideoLibrary = {
  STORAGE_KEY: 'growthx_videos',

  /**
   * Get all videos from storage
   * @returns {Array} Array of video objects
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading videos from storage:', error);
      return [];
    }
  },

  /**
   * Get a video by ID
   * @param {string} id - Video ID
   * @returns {Object|null} Video object or null if not found
   */
  getById(id) {
    const videos = this.getAll();
    return videos.find(v => v.id === id) || null;
  },

  /**
   * Save a video to storage
   * @param {Object} video - Video object to save
   * @returns {Object} Saved video with ID
   */
  save(video) {
    try {
      const videos = this.getAll();
      
      // Add metadata
      const newVideo = {
        id: video.id || this._generateId(),
        ...video,
        createdAt: video.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Check if video already exists
      const existingIndex = videos.findIndex(v => v.id === newVideo.id);
      if (existingIndex !== -1) {
        videos[existingIndex] = newVideo;
      } else {
        videos.unshift(newVideo); // Add to beginning
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(videos));
      return newVideo;
    } catch (error) {
      console.error('Error saving video:', error);
      throw new Error('Failed to save video');
    }
  },

  /**
   * Delete a video by ID
   * @param {string} id - Video ID to delete
   * @returns {boolean} True if deleted, false otherwise
   */
  delete(id) {
    try {
      const videos = this.getAll();
      const filteredVideos = videos.filter(v => v.id !== id);
      
      if (filteredVideos.length === videos.length) {
        return false; // Video not found
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredVideos));
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Failed to delete video');
    }
  },

  /**
   * Search videos by query
   * @param {string} query - Search query
   * @returns {Array} Filtered videos
   */
  search(query) {
    if (!query || !query.trim()) {
      return this.getAll();
    }
    
    const videos = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return videos.filter(video => {
      return (
        (video.title && video.title.toLowerCase().includes(lowerQuery)) ||
        (video.script && video.script.toLowerCase().includes(lowerQuery)) ||
        (video.metadata && video.metadata.avatar && video.metadata.avatar.toLowerCase().includes(lowerQuery))
      );
    });
  },

  /**
   * Get video count
   * @returns {number} Number of videos
   */
  count() {
    return this.getAll().length;
  },

  /**
   * Clear all videos
   */
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing videos:', error);
      throw new Error('Failed to clear videos');
    }
  },

  /**
   * Export videos as JSON
   * @returns {string} JSON string of all videos
   */
  export() {
    return JSON.stringify(this.getAll(), null, 2);
  },

  /**
   * Import videos from JSON
   * @param {string} jsonData - JSON string of videos
   * @returns {boolean} True if successful
   */
  import(jsonData) {
    try {
      const videos = JSON.parse(jsonData);
      if (!Array.isArray(videos)) {
        throw new Error('Invalid data format');
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(videos));
      return true;
    } catch (error) {
      console.error('Error importing videos:', error);
      throw new Error('Failed to import videos');
    }
  },

  // Helper methods
  _generateId() {
    return 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Format duration in seconds to MM:SS
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format date to readable string
   * @param {string} isoDate - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(isoDate) {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  },
};

// Make it available globally
window.VideoLibrary = VideoLibrary;
