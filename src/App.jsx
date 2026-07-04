import { useState, useEffect } from 'react'
import './App.css'


function App() {
  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('yt-rater-videos')
    return saved ? JSON.parse(saved) : []
  })

  const [parameters, setParameters] = useState(() => {
    const saved = localStorage.getItem('yt-rater-params')
    return saved ? JSON.parse(saved) : ['Content Quality', 'Production Value', 'Engagement']
  })

  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddParam, setShowAddParam] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [customImage, setCustomImage] = useState('')
  const [newParam, setNewParam] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('yt-rater-videos', JSON.stringify(videos))
  }, [videos])

  useEffect(() => {
    localStorage.setItem('yt-rater-params', JSON.stringify(parameters))
  }, [parameters])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setCustomImage(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const addVideo = () => {
    if (!videoTitle.trim()) {
      setError('Please enter a title')
      return
    }

    const ratings = {}
    parameters.forEach(p => { ratings[p] = 0 })

    setVideos([...videos, {
      id: Date.now(),
      title: videoTitle.trim(),
      image: customImage || null,
      ratings,
      addedAt: new Date().toISOString()
    }])

    setVideoTitle('')
    setCustomImage('')
    setShowAddVideo(false)
    setError('')
  }

  const addParameter = () => {
    if (!newParam.trim()) return
    if (parameters.includes(newParam.trim())) {
      setError('Parameter already exists')
      return
    }

    const param = newParam.trim()
    setParameters([...parameters, param])

    // Add this param to all existing videos with rating 0
    setVideos(videos.map(v => ({
      ...v,
      ratings: { ...v.ratings, [param]: 0 }
    })))

    setNewParam('')
    setShowAddParam(false)
    setError('')
  }

  const updateRating = (videoId, param, value) => {
    setVideos(videos.map(v =>
      v.id === videoId
        ? { ...v, ratings: { ...v.ratings, [param]: value } }
        : v
    ))
  }

  const deleteVideo = (videoId) => {
    setVideos(videos.filter(v => v.id !== videoId))
  }

  const deleteParameter = (param) => {
    setParameters(parameters.filter(p => p !== param))
    setVideos(videos.map(v => {
      const newRatings = { ...v.ratings }
      delete newRatings[param]
      return { ...v, ratings: newRatings }
    }))
  }

  const getAverage = (video) => {
    const values = Object.values(video.ratings)
    if (values.length === 0) return 0
    const rated = values.filter(v => v > 0)
    if (rated.length === 0) return 0
    return (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1)
  }

  const getAnalysis = (video) => {
    const entries = Object.entries(video.ratings).filter(([, v]) => v > 0)
    if (entries.length === 0) return null

    const avg = parseFloat(getAverage(video))
    const highest = entries.reduce((a, b) => b[1] > a[1] ? b : a)
    const lowest = entries.reduce((a, b) => b[1] < a[1] ? b : a)

    let verdict = ''
    if (avg >= 4.5) verdict = 'Excellent'
    else if (avg >= 3.5) verdict = 'Great'
    else if (avg >= 2.5) verdict = 'Average'
    else if (avg >= 1.5) verdict = 'Below Average'
    else verdict = 'Poor'

    return { avg, highest, lowest, verdict, ratedCount: entries.length, totalParams: parameters.length }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>YT Rater</h1>
        <div className="header-actions">
          <button onClick={() => setShowAddParam(true)} className="btn btn-secondary">
            + Parameter
          </button>
          <button onClick={() => setShowAddVideo(true)} className="btn btn-primary">
            + Video
          </button>
        </div>
      </header>

      {/* Parameters bar */}
      {parameters.length > 0 && (
        <div className="params-bar">
          {parameters.map(p => (
            <span key={p} className="param-chip">
              {p}
              <button onClick={() => deleteParameter(p)} className="chip-delete">&times;</button>
            </span>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideo && (
        <div className="modal-overlay" onClick={() => { setShowAddVideo(false); setError(''); setCustomImage('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Video</h2>
            <input
              type="text"
              placeholder="Video title"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              className="modal-input"
              autoFocus
            />

            <div className="image-upload-section">
              <label className="image-upload-label">
                {customImage ? (
                  <div className="image-preview">
                    <img src={customImage} alt="Preview" />
                    <span className="change-text">Change image</span>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <span className="upload-icon">+</span>
                    <span>Add custom thumbnail</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input-hidden"
                />
              </label>
              {customImage && (
                <button onClick={() => setCustomImage('')} className="remove-image-btn">
                  Remove image
                </button>
              )}
            </div>

            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={() => { setShowAddVideo(false); setError(''); setCustomImage('') }} className="btn btn-secondary">Cancel</button>
              <button onClick={addVideo} className="btn btn-primary">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Parameter Modal */}
      {showAddParam && (
        <div className="modal-overlay" onClick={() => { setShowAddParam(false); setError('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Rating Parameter</h2>
            <input
              type="text"
              placeholder="e.g. Audio Quality"
              value={newParam}
              onChange={e => setNewParam(e.target.value)}
              className="modal-input"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addParameter()}
            />
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={() => { setShowAddParam(false); setError('') }} className="btn btn-secondary">Cancel</button>
              <button onClick={addParameter} className="btn btn-primary">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="videos-grid">
        {videos.length === 0 && (
          <div className="empty-state">
            <p>No videos yet. Add one to start rating!</p>
          </div>
        )}

        {videos.map(video => (
          <div key={video.id} className="video-card">
            {video.image && (
              <div className="video-thumbnail">
                <img
                  src={video.image}
                  alt={video.title}
                />
              </div>
            )}

            <div className="video-info">
              <div className="video-title-section">
                <h3>{video.title}</h3>
                <span className="avg-score">{getAverage(video)}</span>
              </div>

              <div className="ratings">
                {parameters.map(param => (
                  <div key={param} className="rating-row">
                    <label>{param}</label>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(val => {
                        const rating = video.ratings[param] || 0
                        const isFull = rating >= val
                        const isHalf = !isFull && rating >= val - 0.5

                        return (
                          <button
                            key={val}
                            className="star-btn"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const clickX = e.clientX - rect.left
                              const isLeftHalf = clickX < rect.width / 2
                              const newVal = isLeftHalf ? val - 0.5 : val
                              updateRating(video.id, param, rating === newVal ? 0 : newVal)
                            }}
                          >
                            <span className={`star ${isFull ? 'full' : ''} ${isHalf ? 'half' : ''}`}>
                              &#9733;
                            </span>
                          </button>
                        )
                      })}
                      <span className="rating-value">
                        {video.ratings[param] || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {getAnalysis(video) && (
                <div className="analysis">
                  <div className="analysis-verdict">
                    <span className={`verdict-badge verdict-${getAnalysis(video).verdict.toLowerCase().replace(' ', '-')}`}>
                      {getAnalysis(video).verdict}
                    </span>
                    <span className="analysis-summary">
                      {getAnalysis(video).ratedCount}/{getAnalysis(video).totalParams} rated
                    </span>
                  </div>
                  <div className="analysis-details">
                    <span className="analysis-item best">
                      Best: {getAnalysis(video).highest[0]} ({getAnalysis(video).highest[1]})
                    </span>
                    {getAnalysis(video).ratedCount > 1 && (
                      <span className="analysis-item weak">
                        Weakest: {getAnalysis(video).lowest[0]} ({getAnalysis(video).lowest[1]})
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button onClick={() => deleteVideo(video.id)} className="delete-btn">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
