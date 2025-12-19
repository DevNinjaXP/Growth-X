// Video Creation Wizard
// Manages the step-by-step video creation flow

const VideoWizard = {
  currentStep: 1,
  totalSteps: 4,
  videoData: {
    script: '',
    avatar: null,
    background: { type: 'color', value: '#4285f4' },
    clothing: 'professional',
    language: 'en-US',
    voiceStyle: 'neutral',
    speechSpeed: 1.0,
    quality: '1080p',
    format: 'mp4',
  },

  init() {
    this.bindEvents();
    this.updateStepDisplay();
    this.initializeSelects();
    this.loadDraft();
  },

  bindEvents() {
    // Next step buttons
    $('.next-step').on('click', (e) => {
      const nextStep = parseInt($(e.currentTarget).data('next'));
      if (this.validateStep(this.currentStep)) {
        this.goToStep(nextStep);
      }
    });

    // Previous step buttons
    $('.prev-step').on('click', (e) => {
      const prevStep = parseInt($(e.currentTarget).data('prev'));
      this.goToStep(prevStep);
    });

    // Step clicks
    $('.stepper-horizontal .step').on('click', (e) => {
      const step = parseInt($(e.currentTarget).data('step'));
      if (step <= this.currentStep || this.isStepCompleted(step - 1)) {
        this.goToStep(step);
      }
    });

    // Script input
    $('#script-input').on('input', () => {
      this.updateScriptPreview();
      this.saveDraft();
    });

    // Avatar selection
    $('.avatar-card').on('click', (e) => {
      const avatarId = $(e.currentTarget).data('avatar');
      this.selectAvatar(avatarId);
    });

    // Background type change
    $('input[name="background-type"]').on('change', (e) => {
      const type = $(e.currentTarget).val();
      this.videoData.background.type = type;
      
      if (type === 'color') {
        $('#color-picker-wrapper').show();
        this.videoData.background.value = $('#background-color').val();
      } else {
        $('#color-picker-wrapper').hide();
        this.videoData.background.value = type;
      }
      this.saveDraft();
    });

    // Background color change
    $('#background-color').on('change', (e) => {
      this.videoData.background.value = $(e.target).val();
      this.saveDraft();
    });

    // Clothing style change
    $('#clothing-style').on('change', (e) => {
      this.videoData.clothing = $(e.target).val();
      this.saveDraft();
    });

    // Language change
    $('#language-select').on('change', (e) => {
      this.videoData.language = $(e.target).val();
      this.updateSummary();
      this.saveDraft();
    });

    // Voice style change
    $('#voice-style').on('change', (e) => {
      this.videoData.voiceStyle = $(e.target).val();
      this.saveDraft();
    });

    // Speech speed change
    $('#speech-speed').on('input', (e) => {
      const speed = parseFloat($(e.target).val());
      this.videoData.speechSpeed = speed;
      $('#speech-speed-value').text(speed.toFixed(1) + 'x');
      this.updateScriptPreview();
      this.saveDraft();
    });

    // Quality change
    $('#video-quality').on('change', (e) => {
      this.videoData.quality = $(e.target).val();
      this.updateSummary();
      this.saveDraft();
    });

    // Format change
    $('#video-format').on('change', (e) => {
      this.videoData.format = $(e.target).val();
      this.updateSummary();
      this.saveDraft();
    });
  },

  goToStep(step) {
    if (step < 1 || step > this.totalSteps) return;

    // Update step display
    $('.step-content').removeClass('active');
    $(`#step-${step}`).addClass('active');

    // Update stepper
    $('.stepper-horizontal .step').removeClass('active');
    $(`.stepper-horizontal .step[data-step="${step}"]`).addClass('active');

    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
      $(`.stepper-horizontal .step[data-step="${i}"]`).addClass('completed');
    }

    this.currentStep = step;

    // Update summary on preview step
    if (step === 4) {
      this.updateSummary();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  validateStep(step) {
    switch (step) {
      case 1:
        if (!this.videoData.script || !this.videoData.script.trim()) {
          M.toast({ html: 'Please enter a script', classes: 'red' });
          return false;
        }
        if (this.videoData.script.length < 10) {
          M.toast({ html: 'Script is too short. Please add more content.', classes: 'orange' });
          return false;
        }
        return true;
      
      case 2:
        if (!this.videoData.avatar) {
          M.toast({ html: 'Please select an avatar', classes: 'red' });
          return false;
        }
        return true;
      
      case 3:
        return true;
      
      default:
        return true;
    }
  },

  isStepCompleted(step) {
    switch (step) {
      case 1:
        return this.videoData.script && this.videoData.script.trim().length > 0;
      case 2:
        return this.videoData.avatar !== null;
      case 3:
        return true;
      default:
        return false;
    }
  },

  updateStepDisplay() {
    $('.step-content').removeClass('active');
    $(`#step-${this.currentStep}`).addClass('active');
  },

  selectAvatar(avatarId) {
    $('.avatar-card').removeClass('selected');
    $(`.avatar-card[data-avatar="${avatarId}"]`).addClass('selected');
    
    this.videoData.avatar = avatarId;
    const avatarName = $(`.avatar-card[data-avatar="${avatarId}"] .avatar-name`).text();
    
    // Show customization options
    $('#avatar-customization').slideDown();
    
    this.saveDraft();
    M.toast({ html: `Selected: ${avatarName}`, classes: 'teal' });
  },

  updateScriptPreview() {
    const script = $('#script-input').val();
    this.videoData.script = script;
    
    // Update preview
    $('#script-preview').text(script || 'Your script will appear here...');
    
    // Update character and word count
    const charCount = script.length;
    const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
    $('#char-count').text(charCount);
    $('#word-count').text(wordCount);
    
    // Estimate duration (average speaking rate: 150 words per minute)
    const estimatedMinutes = wordCount / 150;
    const estimatedSeconds = Math.round(estimatedMinutes * 60);
    const adjustedSeconds = Math.round(estimatedSeconds / this.videoData.speechSpeed);
    const duration = VideoLibrary.formatDuration(adjustedSeconds);
    
    $('#estimated-duration').text(duration);
    this.videoData.estimatedDuration = adjustedSeconds;
  },

  updateSummary() {
    const wordCount = this.videoData.script.trim() ? this.videoData.script.trim().split(/\s+/).length : 0;
    $('#summary-words').text(`${wordCount} words`);
    
    const avatarName = this.videoData.avatar 
      ? $(`.avatar-card[data-avatar="${this.videoData.avatar}"] .avatar-name`).text()
      : 'None selected';
    $('#summary-avatar').text(avatarName);
    
    const languageName = $('#language-select option:selected').text();
    $('#summary-language').text(languageName);
    
    const qualityName = $('#video-quality option:selected').text();
    $('#summary-quality').text(qualityName);
    
    const formatName = this.videoData.format.toUpperCase();
    $('#summary-format').text(formatName);
    
    const duration = VideoLibrary.formatDuration(this.videoData.estimatedDuration || 0);
    $('#summary-duration').text(duration);
  },

  initializeSelects() {
    $('select').formSelect();
  },

  reset() {
    this.currentStep = 1;
    this.videoData = {
      script: '',
      avatar: null,
      background: { type: 'color', value: '#4285f4' },
      clothing: 'professional',
      language: 'en-US',
      voiceStyle: 'neutral',
      speechSpeed: 1.0,
      quality: '1080p',
      format: 'mp4',
    };

    $('#script-input').val('');
    $('.avatar-card').removeClass('selected');
    $('#avatar-customization').hide();
    $('input[name="background-type"][value="color"]').prop('checked', true);
    $('#background-color').val('#4285f4');
    $('#speech-speed').val(1);
    $('#speech-speed-value').text('1.0x');
    
    this.updateScriptPreview();
    this.goToStep(1);
    this.initializeSelects();
    this.clearDraft();
    
    M.toast({ html: 'Wizard reset. Ready to create a new video!', classes: 'blue' });
  },

  saveDraft() {
    try {
      localStorage.setItem('growthx_video_draft', JSON.stringify({
        step: this.currentStep,
        data: this.videoData,
      }));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  },

  loadDraft() {
    try {
      const draft = localStorage.getItem('growthx_video_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        this.videoData = { ...this.videoData, ...parsed.data };
        
        // Restore UI state
        if (this.videoData.script) {
          $('#script-input').val(this.videoData.script);
          this.updateScriptPreview();
        }
        
        if (this.videoData.avatar) {
          this.selectAvatar(this.videoData.avatar);
        }
        
        if (this.videoData.background) {
          $(`input[name="background-type"][value="${this.videoData.background.type}"]`).prop('checked', true);
          if (this.videoData.background.type === 'color') {
            $('#background-color').val(this.videoData.background.value);
          }
        }
        
        $('#clothing-style').val(this.videoData.clothing);
        $('#language-select').val(this.videoData.language);
        $('#voice-style').val(this.videoData.voiceStyle);
        $('#speech-speed').val(this.videoData.speechSpeed);
        $('#speech-speed-value').text(this.videoData.speechSpeed.toFixed(1) + 'x');
        $('#video-quality').val(this.videoData.quality);
        $('#video-format').val(this.videoData.format);
        
        this.initializeSelects();
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  },

  clearDraft() {
    try {
      localStorage.removeItem('growthx_video_draft');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  },

  getData() {
    return { ...this.videoData };
  },
};

// Make it available globally
window.VideoWizard = VideoWizard;
