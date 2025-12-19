# Frontend UI - AI Video Creation MVP

This is the user-facing frontend interface for the AI Video Generation Engine.

## Features

### Video Creation Wizard
- **Step 1: Script Input** - Enter your video script with real-time preview and character/word count
- **Step 2: Avatar Selection** - Choose from professional and casual avatars with customization options
- **Step 3: Video Settings** - Configure language, voice style, speech speed, quality, and format
- **Step 4: Preview & Generate** - Review your selections and generate the video

### Avatar Customization
- Background options (solid color, office, studio, outdoor)
- Clothing style selection (professional, casual, formal, creative)
- Color picker for custom backgrounds

### Video Library
- View all generated videos in a grid layout
- Search videos by title or script content
- Play videos in a modal player
- Download videos to your device
- Delete videos with confirmation

### Settings & Options
- **Languages**: 11 language options including English (US/UK), Spanish, French, German, Italian, Portuguese, Japanese, Korean, and Chinese
- **Voice Styles**: Neutral, Cheerful, Empathetic, Calm, Professional
- **Speech Speed**: Adjustable from 0.5x to 2.0x
- **Video Quality**: HD (720p), Full HD (1080p), 4K Ultra HD
- **Output Formats**: MP4, WebM

## Technical Implementation

### Architecture
```
/app.html                    # Main application page
/css/app.css                 # Custom application styles
/js/app/
  ├── app.js                 # Main application controller
  ├── wizard.js              # Step-by-step wizard logic
  ├── videoLibrary.js        # Video storage and retrieval
  └── apiClient.js           # Backend API integration
```

### Technologies Used
- **Materialize CSS** - UI framework for responsive design
- **jQuery** - DOM manipulation and event handling
- **LocalStorage API** - Client-side video library storage
- **HTML5 Video** - Video preview and playback

### Key Components

#### VideoWizard
Manages the 4-step video creation flow:
- Form validation at each step
- Draft auto-saving to localStorage
- Real-time preview updates
- Step navigation with progress tracking

#### VideoLibrary
Handles video persistence:
- CRUD operations for videos
- Search functionality
- Date and duration formatting
- JSON import/export capability

#### ApiClient
Integrates with the backend video generation engine:
- Video generation requests
- Job status polling
- Video download handling
- Mock responses for testing

#### App
Main application coordinator:
- Section navigation (Creator/Library)
- Video card rendering
- Modal management
- Event coordination

## User Flow

### Creating a Video (Under 5 Clicks)
1. Click "Create Video" (or land on homepage)
2. Enter script → Click "Next"
3. Select avatar → Click "Next"
4. Adjust settings (optional) → Click "Preview"
5. Click "Generate Video"

Total: **3-5 clicks** to video generation ✓

### Managing Videos
- View all videos in "My Videos" section
- Click play icon to preview
- Click download to save locally
- Click delete to remove (with confirmation)

## Responsive Design

The UI is fully responsive and works on:
- **Desktop** - Full feature set with optimal layout
- **Tablet** - Adapted layout with touch-friendly controls
- **Mobile** - Simplified stepper, stacked layout (optional support)

### Breakpoints
- Large screens: 993px and up (3-column grid)
- Medium screens: 601px - 992px (2-column grid)
- Small screens: 600px and below (1-column grid)

## Browser Support

Tested and supported on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Storage

### LocalStorage Keys
- `growthx_videos` - Array of generated videos
- `growthx_video_draft` - Auto-saved draft of current video in progress

### Video Object Structure
```javascript
{
  id: "video_123...",
  title: "Video Title",
  script: "Full script text...",
  videoUrl: "https://...",
  thumbnailUrl: "https://...",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  metadata: {
    duration: 30,
    format: "mp4",
    quality: "1080p",
    language: "en-US",
    avatar: "avatar-1"
  }
}
```

## Future Enhancements

- [ ] Real backend API integration
- [ ] Video trimming and basic editing
- [ ] Batch video generation
- [ ] Template library
- [ ] Collaboration features
- [ ] Cloud storage integration
- [ ] Advanced avatar customization
- [ ] Voice cloning options
- [ ] Multiple avatar scenes
- [ ] Transition effects

## Development

### Testing the Frontend
1. Open `app.html` in a web browser
2. Start creating videos using the wizard
3. Videos are stored in localStorage and can be accessed in "My Videos"

### Mock Data
The `ApiClient` currently uses mock responses for development. To integrate with the real backend:

1. Update `API_BASE_URL` in `apiClient.js`
2. Replace mock methods with actual API calls
3. Handle authentication if required
4. Update error handling for production

## Performance Optimization

- Lazy loading of video thumbnails
- Debounced search input
- Efficient DOM manipulation
- Minimal re-renders
- Optimized event handlers

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color scheme
- Focus indicators

## Error Handling

- Form validation with user feedback
- API error messages with retry options
- Graceful degradation for unsupported features
- LocalStorage quota exceeded handling
