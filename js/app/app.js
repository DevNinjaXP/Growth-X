// Main Application
// Coordinates all components and handles app-level logic

const App = {
  currentVideoId: null,
  
  init() {
    console.log('Initializing Growth-X Video Creator...');
    
    // Initialize Materialize components
    this.initMaterialize();
    
    // Initialize wizard
    VideoWizard.init();
    
    // Bind events
    this.bindEvents();
    
    // Show appropriate section
    this.showSection('creator');
    
    console.log('App initialized successfully');
  },

  initMaterialize() {
    // Initialize sidenav
    $('.sidenav').sidenav();
    
    // Initialize modals
    $('.modal').modal();
    
    // Initialize dropdowns
    $('.dropdown-trigger').dropdown();
    
    // Initialize collapsibles
    $('.collapsible').collapsible();
  },

  bindEvents() {
    // Navigation
    $('#my-videos-nav, #my-videos-nav-mobile').on('click', (e) => {
      e.preventDefault();
      this.showSection('library');
    });

    $('#new-video-btn').on('click', (e) => {
      e.preventDefault();
      this.showSection('creator');
      VideoWizard.reset();
    });

    // Video generation
    $('#generate-video-btn').on('click', () => {
      this.generateVideo();
    });

    // Video download
    $('#download-video-btn').on('click', () => {
      this.downloadCurrentVideo();
    });

    // Video search
    $('#video-search').on('input', (e) => {
      this.searchVideos($(e.target).val());
    });

    // Delete confirmation
    $('#confirm-delete-btn').on('click', () => {
      if (this.currentVideoId) {
        this.deleteVideo(this.currentVideoId);
      }
    });
  },

  showSection(section) {
    if (section === 'creator') {
      $('#video-creator-section').show();
      $('#my-videos-section').hide();
    } else if (section === 'library') {
      $('#video-creator-section').hide();
      $('#my-videos-section').show();
      this.loadVideos();
    }
  },

  async generateVideo() {
    // Validate wizard
    if (!VideoWizard.validateStep(4)) {
      return;
    }

    const videoData = VideoWizard.getData();
    
    // Show progress
    $('#generation-progress').show();
    $('#generate-video-btn').prop('disabled', true);
    $('#generation-status').text('Preparing video generation...');

    try {
      // Call API to generate video
      $('#generation-status').text('Generating your video...');
      const result = await ApiClient.generateVideo(videoData);
      
      $('#generation-status').text('Video generated successfully!');
      
      // Save to library
      const video = {
        id: result.jobId,
        title: this.generateVideoTitle(videoData.script),
        script: videoData.script,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        metadata: result.metadata,
      };
      
      VideoLibrary.save(video);
      
      // Show video preview
      this.showVideoPreview(result.videoUrl);
      
      // Show download button
      $('#download-video-btn').show();
      this.currentVideoId = result.jobId;
      
      // Clear draft
      VideoWizard.clearDraft();
      
      M.toast({ 
        html: '<i class="material-icons left">check_circle</i>Video generated successfully!', 
        classes: 'green',
        displayLength: 4000
      });
    } catch (error) {
      console.error('Error generating video:', error);
      M.toast({ 
        html: '<i class="material-icons left">error</i>Failed to generate video. Please try again.', 
        classes: 'red',
        displayLength: 5000
      });
      $('#generation-status').text('Generation failed. Please try again.');
    } finally {
      $('#generate-video-btn').prop('disabled', false);
    }
  },

  showVideoPreview(videoUrl) {
    $('#video-preview-placeholder').hide();
    $('#video-preview-player').show();
    $('#video-preview-player source').attr('src', videoUrl);
    $('#video-preview-player')[0].load();
  },

  generateVideoTitle(script) {
    // Generate a title from the first few words of the script
    const words = script.trim().split(/\s+/).slice(0, 8).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
  },

  downloadCurrentVideo() {
    if (!this.currentVideoId) {
      M.toast({ html: 'No video to download', classes: 'orange' });
      return;
    }

    const video = VideoLibrary.getById(this.currentVideoId);
    if (!video) {
      M.toast({ html: 'Video not found', classes: 'red' });
      return;
    }

    const filename = `${video.title.replace(/[^a-z0-9]/gi, '_')}.${video.metadata.format}`;
    ApiClient.downloadVideo(video.videoUrl, filename);
    
    M.toast({ 
      html: '<i class="material-icons left">download</i>Downloading video...', 
      classes: 'blue' 
    });
  },

  loadVideos(query = null) {
    const videos = query ? VideoLibrary.search(query) : VideoLibrary.getAll();
    
    if (videos.length === 0) {
      $('#videos-grid').hide();
      $('#no-videos-message').show();
      return;
    }

    $('#videos-grid').show();
    $('#no-videos-message').hide();
    
    const html = videos.map(video => this.createVideoCard(video)).join('');
    $('#videos-grid').html(html);
    
    // Bind video card events
    this.bindVideoCardEvents();
  },

  createVideoCard(video) {
    const date = VideoLibrary.formatDate(video.createdAt);
    const duration = VideoLibrary.formatDuration(video.metadata?.duration || 0);
    const quality = video.metadata?.quality || 'HD';
    const format = video.metadata?.format?.toUpperCase() || 'MP4';

    return `
      <div class="col s12 m6 l4 video-item">
        <div class="video-card">
          <div class="video-thumbnail" style="background-image: url('${video.thumbnailUrl}')">
            <div class="play-overlay">
              <i class="material-icons">play_circle_filled</i>
            </div>
          </div>
          <div class="video-info">
            <div class="video-title">${this.escapeHtml(video.title)}</div>
            <div class="video-meta">
              ${date} &bull; ${duration} &bull; ${quality} &bull; ${format}
            </div>
            <div class="video-actions">
              <button class="btn-small waves-effect waves-light blue play-video-btn" data-id="${video.id}">
                <i class="material-icons left">play_arrow</i>Play
              </button>
              <button class="btn-small waves-effect waves-light green download-video-btn" data-id="${video.id}">
                <i class="material-icons left">download</i>Download
              </button>
              <button class="btn-small waves-effect waves-light red delete-video-btn" data-id="${video.id}">
                <i class="material-icons left">delete</i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindVideoCardEvents() {
    // Play video
    $('.play-video-btn').on('click', (e) => {
      const videoId = $(e.currentTarget).data('id');
      this.playVideo(videoId);
    });

    // Download video
    $('.download-video-btn').on('click', (e) => {
      const videoId = $(e.currentTarget).data('id');
      this.downloadVideo(videoId);
    });

    // Delete video
    $('.delete-video-btn').on('click', (e) => {
      const videoId = $(e.currentTarget).data('id');
      this.confirmDelete(videoId);
    });
  },

  playVideo(videoId) {
    const video = VideoLibrary.getById(videoId);
    if (!video) {
      M.toast({ html: 'Video not found', classes: 'red' });
      return;
    }

    // Create a modal to play the video
    const modalHtml = `
      <div id="video-player-modal" class="modal modal-fixed-footer">
        <div class="modal-content">
          <h5>${this.escapeHtml(video.title)}</h5>
          <video controls autoplay style="width: 100%;">
            <source src="${video.videoUrl}" type="video/${video.metadata?.format || 'mp4'}">
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="modal-footer">
          <a href="#!" class="modal-close waves-effect btn-flat">Close</a>
        </div>
      </div>
    `;

    // Remove existing modal if any
    $('#video-player-modal').remove();
    
    // Add modal to body
    $('body').append(modalHtml);
    
    // Initialize and open modal
    $('#video-player-modal').modal();
    $('#video-player-modal').modal('open');
  },

  downloadVideo(videoId) {
    const video = VideoLibrary.getById(videoId);
    if (!video) {
      M.toast({ html: 'Video not found', classes: 'red' });
      return;
    }

    const filename = `${video.title.replace(/[^a-z0-9]/gi, '_')}.${video.metadata?.format || 'mp4'}`;
    ApiClient.downloadVideo(video.videoUrl, filename);
    
    M.toast({ 
      html: '<i class="material-icons left">download</i>Downloading video...', 
      classes: 'blue' 
    });
  },

  confirmDelete(videoId) {
    this.currentVideoId = videoId;
    $('#delete-modal').modal('open');
  },

  deleteVideo(videoId) {
    try {
      VideoLibrary.delete(videoId);
      this.loadVideos();
      this.currentVideoId = null;
      
      M.toast({ 
        html: '<i class="material-icons left">delete</i>Video deleted', 
        classes: 'orange' 
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      M.toast({ html: 'Failed to delete video', classes: 'red' });
    }
  },

  searchVideos(query) {
    this.loadVideos(query);
  },

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },
};

// Initialize app when DOM is ready
$(document).ready(() => {
  App.init();
});
