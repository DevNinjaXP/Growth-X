# Testing the Frontend UI

## Manual Testing Guide

### 1. Access the Application
Open `app.html` in a web browser to access the video creation interface.

### 2. Video Creation Flow Test

#### Step 1: Script Input
- [ ] Enter a script (minimum 10 characters)
- [ ] Verify character count updates in real-time
- [ ] Verify word count updates in real-time
- [ ] Verify estimated duration updates
- [ ] Verify script appears in the preview box
- [ ] Try clicking "Next" without a script (should show error)
- [ ] Enter a valid script and click "Next"

#### Step 2: Avatar Selection
- [ ] Verify 4 avatar cards are displayed
- [ ] Click on an avatar card
- [ ] Verify the avatar card shows selected state (blue border)
- [ ] Verify customization options appear below
- [ ] Change background type (color, office, studio, outdoor)
- [ ] Change background color (if color type selected)
- [ ] Change clothing style
- [ ] Click "Back" to return to Step 1
- [ ] Click "Next" to proceed to Step 3

#### Step 3: Video Settings
- [ ] Select a language from the dropdown
- [ ] Select a voice style
- [ ] Adjust speech speed slider (verify value updates)
- [ ] Select video quality (720p, 1080p, 4K)
- [ ] Select output format (MP4, WebM)
- [ ] Click "Back" to return to Step 2
- [ ] Click "Preview" to proceed to Step 4

#### Step 4: Preview & Generate
- [ ] Verify video summary shows correct information:
  - Script word count
  - Selected avatar name
  - Language
  - Quality
  - Format
  - Estimated duration
- [ ] Click "Generate Video" button
- [ ] Verify progress indicator appears
- [ ] Wait for video generation to complete
- [ ] Verify video preview appears in the player
- [ ] Click play on the video preview
- [ ] Click "Download" button
- [ ] Verify download starts

### 3. Video Library Test

#### Navigate to My Videos
- [ ] Click "My Videos" in the navigation
- [ ] Verify the video library section appears
- [ ] Verify the generated video appears in the grid

#### Video Card Actions
- [ ] Click "Play" button on a video card
- [ ] Verify video plays in a modal
- [ ] Close the modal
- [ ] Click "Download" button on a video card
- [ ] Verify download starts
- [ ] Click "Delete" button on a video card
- [ ] Verify confirmation modal appears
- [ ] Click "Cancel" in confirmation modal
- [ ] Click "Delete" again and confirm
- [ ] Verify video is removed from the grid

#### Search Functionality
- [ ] Enter a search query in the search box
- [ ] Verify videos are filtered based on the query
- [ ] Clear the search box
- [ ] Verify all videos appear again

### 4. Navigation Test
- [ ] Click "Create New Video" button from library
- [ ] Verify wizard resets to Step 1
- [ ] Verify all form fields are cleared
- [ ] Navigate between sections using top navigation

### 5. Draft Auto-Save Test
- [ ] Start creating a video (enter script, select avatar)
- [ ] Refresh the page or close and reopen
- [ ] Verify the draft is restored
- [ ] Complete and generate the video
- [ ] Verify draft is cleared after generation

### 6. Responsive Design Test

#### Desktop (1920x1080)
- [ ] Verify 3-column grid in video library
- [ ] Verify all stepper labels are visible
- [ ] Verify layout is optimal

#### Tablet (768x1024)
- [ ] Verify 2-column grid in video library
- [ ] Verify stepper is readable
- [ ] Verify forms are touch-friendly

#### Mobile (375x667)
- [ ] Verify 1-column grid in video library
- [ ] Verify stepper icons only (no labels)
- [ ] Verify mobile navigation works
- [ ] Verify forms are usable on small screens

### 7. Browser Compatibility Test
Test the above flows in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 8. Error Handling Test
- [ ] Try to proceed without entering a script
- [ ] Try to proceed without selecting an avatar
- [ ] Simulate API error (modify apiClient.js to throw error)
- [ ] Verify error messages are displayed
- [ ] Verify user can retry after error

## Automated Testing (Future)

### Unit Tests
- VideoLibrary CRUD operations
- Video search functionality
- Duration and date formatting
- Video data validation

### Integration Tests
- Wizard step navigation
- Form data persistence
- API client mock responses
- LocalStorage operations

### E2E Tests (with Playwright/Cypress)
- Complete video creation flow
- Video library management
- Search and filter
- Responsive behavior

## Performance Testing

### Metrics to Monitor
- [ ] Time to interactive (TTI) < 3s
- [ ] First contentful paint (FCP) < 1.5s
- [ ] Script input responsiveness < 100ms
- [ ] Video card rendering < 500ms
- [ ] LocalStorage read/write < 50ms

### Load Testing
- [ ] Test with 0 videos
- [ ] Test with 10 videos
- [ ] Test with 50 videos
- [ ] Test with 100+ videos (performance degradation?)

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Navigate wizard steps with keyboard
- [ ] Activate buttons with Enter/Space
- [ ] Close modals with Escape

### Screen Reader
- [ ] Test with NVDA/JAWS
- [ ] Verify form labels are read correctly
- [ ] Verify button purposes are clear
- [ ] Verify error messages are announced

## Known Limitations (MVP)

1. **Mock API Responses**: The API client uses mock data. Real backend integration needed.
2. **LocalStorage Only**: Videos stored in browser. Need cloud storage for production.
3. **No Authentication**: Anyone with access can use the app. Add auth for production.
4. **Limited Video Editing**: Basic settings only. Advanced editing features to be added.
5. **No Collaboration**: Single-user experience. Multi-user features pending.
6. **Sample Video URLs**: Using demo videos for preview. Real generation pending backend integration.

## Bug Reporting

When reporting bugs, please include:
1. Browser and version
2. Screen size / device
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Screenshots/video if applicable
7. Console errors (if any)
