import { useState, useEffect } from 'react'
import './App.css'


function App() {
  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('yt-rater-videos')
    return saved ? JSON.parse(saved) : []
  })

  const [parameters, setParameters] = useState(() => {
    const saved = localStorage.getItem('yt-rater-params')
    return saved ? JSON.parse(saved) : []
  })

  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('yt-rater-folders')
    return saved ? JSON.parse(saved) : []
  })

  const [activeFolder, setActiveFolder] = useState('all')
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddParam, setShowAddParam] = useState(false)
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoFolder, setVideoFolder] = useState('')
  const [customImages, setCustomImages] = useState([])
  const [newParam, setNewParam] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [error, setError] = useState('')
  const [editingTitle, setEditingTitle] = useState(null)
  const [expandedAnalysis, setExpandedAnalysis] = useState({})
  const [imageIndex, setImageIndex] = useState({})
  const [lightbox, setLightbox] = useState(null) // { videoId, index }
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const handleSwipe = (videoId, images) => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipe = 50
    if (Math.abs(distance) < minSwipe) return

    const currentIdx = imageIndex[videoId] || 0
    const safeIdx = currentIdx % images.length

    if (distance > 0) {
      // swipe left = next
      setImageIndex(prev => ({ ...prev, [videoId]: (safeIdx + 1) % images.length }))
    } else {
      // swipe right = prev
      setImageIndex(prev => ({ ...prev, [videoId]: (safeIdx - 1 + images.length) % images.length }))
    }
  }
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('yt-rater-theme') || 'default'
  })

  const themes = [
    { id: 'default', name: 'Default', color: '#1a1a1a' },
    { id: 'black', name: 'Black', color: '#000000' },
    { id: 'ocean', name: 'Ocean', color: '#1565c0' },
    { id: 'forest', name: 'Forest', color: '#2e7d32' },
    { id: 'sunset', name: 'Sunset', color: '#e65100' },
    { id: 'berry', name: 'Berry', color: '#7b1fa2' },
    { id: 'rose', name: 'Rose', color: '#c62828' },
    { id: 'midnight', name: 'Midnight', color: '#1a1a2e' },
    { id: 'teal', name: 'Teal', color: '#00695c' },
  ]

  useEffect(() => {
    localStorage.setItem('yt-rater-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('yt-rater-videos', JSON.stringify(videos))
  }, [videos])

  useEffect(() => {
    localStorage.setItem('yt-rater-params', JSON.stringify(parameters))
  }, [parameters])

  useEffect(() => {
    localStorage.setItem('yt-rater-folders', JSON.stringify(folders))
  }, [folders])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      setError('Please select image files')
      return
    }

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomImages(prev => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index))
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
      images: customImages.length > 0 ? [...customImages] : [],
      folder: videoFolder || null,
      ratings,
      addedAt: new Date().toISOString()
    }])

    setVideoTitle('')
    setCustomImages([])
    setVideoFolder('')
    setShowAddVideo(false)
    setError('')
  }

  const addFolder = () => {
    if (!newFolderName.trim()) return
    if (folders.some(f => f.name === newFolderName.trim())) {
      setError('Folder already exists')
      return
    }

    setFolders([...folders, {
      id: Date.now(),
      name: newFolderName.trim()
    }])

    setNewFolderName('')
    setShowAddFolder(false)
    setError('')
  }

  const deleteFolder = (folderId) => {
    const folder = folders.find(f => f.id === folderId)
    // Move videos from this folder to "uncategorized"
    setVideos(videos.map(v =>
      v.folder === folder.name ? { ...v, folder: null } : v
    ))
    setFolders(folders.filter(f => f.id !== folderId))
    if (activeFolder === folder.name) setActiveFolder('all')
  }

  const moveVideoToFolder = (videoId, folderName) => {
    setVideos(videos.map(v =>
      v.id === videoId ? { ...v, folder: folderName || null } : v
    ))
  }

  const addParameter = () => {
    if (!newParam.trim()) return
    if (parameters.includes(newParam.trim())) {
      setError('Parameter already exists')
      return
    }

    const param = newParam.trim()
    setParameters([...parameters, param])

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

  const addImagesToVideo = (videoId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setVideos(prev => prev.map(v =>
          v.id === videoId
            ? { ...v, images: [...(v.images || []), event.target.result] }
            : v
        ))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImageFromVideo = (videoId, imageIndex) => {
    setVideos(videos.map(v =>
      v.id === videoId
        ? { ...v, images: (v.images || []).filter((_, i) => i !== imageIndex) }
        : v
    ))
  }

  const updateTitle = (videoId, newTitle) => {
    if (!newTitle.trim()) return
    setVideos(videos.map(v =>
      v.id === videoId ? { ...v, title: newTitle.trim() } : v
    ))
    setEditingTitle(null)
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
    const totalScore = entries.reduce((sum, [, v]) => sum + v, 0)
    const maxPossible = entries.length * 5
    const percentage = Math.round((totalScore / maxPossible) * 100)

    // Consistency (std deviation)
    const mean = totalScore / entries.length
    const variance = entries.reduce((sum, [, v]) => sum + Math.pow(v - mean, 2), 0) / entries.length
    const stdDev = Math.sqrt(variance)
    let consistency = ''
    if (stdDev <= 0.5) consistency = 'Very Consistent'
    else if (stdDev <= 1) consistency = 'Consistent'
    else if (stdDev <= 1.5) consistency = 'Mixed'
    else consistency = 'Inconsistent'

    // Verdict
    let verdict = ''
    if (avg >= 4.5) verdict = 'Excellent'
    else if (avg >= 3.5) verdict = 'Great'
    else if (avg >= 2.5) verdict = 'Average'
    else if (avg >= 1.5) verdict = 'Below Average'
    else verdict = 'Poor'

    // Recommendation
    let recommendation = ''
    if (avg >= 4.5) recommendation = 'Outstanding — excels across the board'
    else if (avg >= 3.5) recommendation = 'Strong performance — minor areas to polish'
    else if (avg >= 2.5) recommendation = 'Solid foundation — clear room to grow'
    else if (avg >= 1.5) recommendation = 'Falls short — significant gaps to address'
    else recommendation = 'Needs major improvement across most areas'

    // Sorted entries for breakdown
    const sorted = [...entries].sort((a, b) => b[1] - a[1])

    return {
      avg, highest, lowest, verdict, recommendation, consistency,
      ratedCount: entries.length, totalParams: parameters.length,
      totalScore, maxPossible, percentage, sorted, stdDev: stdDev.toFixed(2)
    }
  }

  const filteredVideos = activeFolder === 'all'
    ? videos
    : activeFolder === 'uncategorized'
      ? videos.filter(v => !v.folder)
      : videos.filter(v => v.folder === activeFolder)

  return (
    <div className="app">
      <header className="header">
        <h1>YT Rater</h1>
        <div className="header-actions">
          <button onClick={() => setShowAddFolder(true)} className="btn btn-secondary">
            + Folder
          </button>
          <button onClick={() => setShowAddParam(true)} className="btn btn-secondary">
            + Parameter
          </button>
          <button onClick={() => setShowAddVideo(true)} className="btn btn-primary">
            + Video
          </button>
        </div>
      </header>

      {/* Folders tabs */}
      <div className="folders-bar">
        <button
          className={`folder-tab ${activeFolder === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFolder('all')}
        >
          All ({videos.length})
        </button>
        {folders.map(folder => (
          <div key={folder.id} className="folder-tab-wrapper">
            <button
              className={`folder-tab ${activeFolder === folder.name ? 'active' : ''}`}
              onClick={() => setActiveFolder(folder.name)}
            >
              {folder.name} ({videos.filter(v => v.folder === folder.name).length})
            </button>
            <button
              className="folder-delete"
              onClick={() => deleteFolder(folder.id)}
            >&times;</button>
          </div>
        ))}
        {videos.some(v => !v.folder) && folders.length > 0 && (
          <button
            className={`folder-tab ${activeFolder === 'uncategorized' ? 'active' : ''}`}
            onClick={() => setActiveFolder('uncategorized')}
          >
            Uncategorized ({videos.filter(v => !v.folder).length})
          </button>
        )}
      </div>

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
        <div className="modal-overlay" onClick={() => { setShowAddVideo(false); setError(''); setCustomImages([]) }}>
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

            {folders.length > 0 && (
              <select
                value={videoFolder}
                onChange={e => setVideoFolder(e.target.value)}
                className="modal-input modal-select"
              >
                <option value="">No folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
            )}

            <div className="image-upload-section">
              {customImages.length > 0 && (
                <div className="image-previews">
                  {customImages.map((img, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={img} alt={`Preview ${index + 1}`} />
                      <button onClick={() => removeImage(index)} className="image-remove-x">&times;</button>
                    </div>
                  ))}
                </div>
              )}
              <label className="image-upload-label">
                <div className="image-upload-placeholder">
                  <span className="upload-icon">+</span>
                  <span>{customImages.length > 0 ? 'Add more images' : 'Add images (optional)'}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="file-input-hidden"
                />
              </label>
            </div>

            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={() => { setShowAddVideo(false); setError(''); setCustomImages([]) }} className="btn btn-secondary">Cancel</button>
              <button onClick={addVideo} className="btn btn-primary">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showAddFolder && (
        <div className="modal-overlay" onClick={() => { setShowAddFolder(false); setError('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Folder</h2>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="modal-input"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addFolder()}
            />
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={() => { setShowAddFolder(false); setError('') }} className="btn btn-secondary">Cancel</button>
              <button onClick={addFolder} className="btn btn-primary">Create</button>
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
        {filteredVideos.length === 0 && (
          <div className="empty-state">
            <p>{activeFolder === 'all' ? 'No videos yet. Add one to start rating!' : 'No videos in this folder.'}</p>
          </div>
        )}

        {filteredVideos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-images">
              {(() => {
                const images = (video.images || [video.image]).filter(Boolean)
                const currentIdx = imageIndex[video.id] || 0
                const safeIdx = images.length > 0 ? currentIdx % images.length : 0

                return images.length > 0 ? (
                  <div
                    className="video-thumbnail"
                    onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                    onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
                    onTouchEnd={() => { handleSwipe(video.id, images); setTouchStart(null); setTouchEnd(null) }}
                  >
                    <img
                      src={images[safeIdx]}
                      alt={`${video.title} ${safeIdx + 1}`}
                      onClick={() => setLightbox({ videoId: video.id, index: safeIdx })}
                      className="thumbnail-clickable"
                    />
                    <button
                      className="thumbnail-remove"
                      onClick={(e) => { e.stopPropagation(); removeImageFromVideo(video.id, safeIdx) }}
                    >&times;</button>

                    <label className="add-image-corner" onClick={(e) => e.stopPropagation()}>
                      <span>+</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => addImagesToVideo(video.id, e)}
                        className="file-input-hidden"
                      />
                    </label>

                    {images.length > 1 && (
                      <>
                        <button
                          className="slide-arrow slide-left"
                          onClick={(e) => { e.stopPropagation(); setImageIndex(prev => ({ ...prev, [video.id]: (safeIdx - 1 + images.length) % images.length })) }}
                        >&#8249;</button>
                        <button
                          className="slide-arrow slide-right"
                          onClick={(e) => { e.stopPropagation(); setImageIndex(prev => ({ ...prev, [video.id]: (safeIdx + 1) % images.length })) }}
                        >&#8250;</button>
                        <div className="slide-counter">{safeIdx + 1}/{images.length}</div>
                      </>
                    )}
                  </div>
                ) : (
                  <label className="add-image-empty">
                    <span>+</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => addImagesToVideo(video.id, e)}
                      className="file-input-hidden"
                    />
                  </label>
                )
              })()}
            </div>

            <div className="video-info">
              <div className="video-title-section">
                {editingTitle === video.id ? (
                  <input
                    type="text"
                    className="edit-title-input"
                    defaultValue={video.title}
                    autoFocus
                    onBlur={(e) => updateTitle(video.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateTitle(video.id, e.target.value)
                      if (e.key === 'Escape') setEditingTitle(null)
                    }}
                  />
                ) : (
                  <h3 onClick={() => setEditingTitle(video.id)} className="editable-title">
                    {video.title}
                  </h3>
                )}
                <span className="avg-score">{getAverage(video)}</span>
              </div>

              {folders.length > 0 && (
                <div className="video-folder-select">
                  <select
                    value={video.folder || ''}
                    onChange={(e) => moveVideoToFolder(video.id, e.target.value)}
                    className="folder-select"
                  >
                    <option value="">No folder</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}

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

              {getAnalysis(video) && (() => {
                const analysis = getAnalysis(video)
                const isExpanded = expandedAnalysis[video.id]
                return (
                  <div className="analysis">
                    <div
                      className="analysis-header clickable"
                      onClick={() => setExpandedAnalysis(prev => ({ ...prev, [video.id]: !prev[video.id] }))}
                    >
                      <div className="analysis-header-left">
                        <span className={`verdict-badge verdict-${analysis.verdict.toLowerCase().replace(' ', '-')}`}>
                          {analysis.verdict}
                        </span>
                        <span className="analysis-summary-inline">
                          {analysis.ratedCount}/{analysis.totalParams} rated
                        </span>
                      </div>
                      <div className="analysis-header-right">
                        <span className="analysis-score-big">{analysis.avg}/5</span>
                        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>&#9662;</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="analysis-expanded">
                        <div className="analysis-stats">
                          <div className="stat-item">
                            <span className="stat-label">Score</span>
                            <span className="stat-value">{analysis.totalScore}/{analysis.maxPossible} ({analysis.percentage}%)</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Rated</span>
                            <span className="stat-value">{analysis.ratedCount}/{analysis.totalParams} parameters</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Consistency</span>
                            <span className={`stat-value consistency-${analysis.consistency.toLowerCase().replace(' ', '-')}`}>{analysis.consistency}</span>
                          </div>
                        </div>

                        <div className="analysis-bar-section">
                          <div className="analysis-progress-bar">
                            <div
                              className="analysis-progress-fill"
                              style={{ width: `${analysis.percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="analysis-breakdown">
                          {analysis.sorted.map(([param, score]) => (
                            <div key={param} className="breakdown-row">
                              <span className="breakdown-label">{param}</span>
                              <div className="breakdown-bar-bg">
                                <div
                                  className="breakdown-bar-fill"
                                  style={{ width: `${(score / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="breakdown-score">{score}</span>
                            </div>
                          ))}
                        </div>

                        <div className="analysis-highlights">
                          <span className="analysis-item best">
                            Best: {analysis.highest[0]} ({analysis.highest[1]})
                          </span>
                          {analysis.ratedCount > 1 && analysis.lowest[1] < analysis.highest[1] && (
                            <span className="analysis-item weak">
                              Weakest: {analysis.lowest[0]} ({analysis.lowest[1]})
                            </span>
                          )}
                        </div>

                        <div className="analysis-recommendation">
                          {analysis.recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              <button onClick={() => deleteVideo(video.id)} className="delete-btn">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (() => {
        const video = videos.find(v => v.id === lightbox.videoId)
        if (!video) return null
        const images = (video.images || [video.image]).filter(Boolean)
        if (images.length === 0) return null
        const idx = lightbox.index % images.length

        return (
          <div
            className="lightbox-overlay"
            onClick={() => setLightbox(null)}
            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
            onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
            onTouchEnd={() => {
              if (touchStart && touchEnd && images.length > 1) {
                const distance = touchStart - touchEnd
                if (Math.abs(distance) > 50) {
                  if (distance > 0) {
                    setLightbox({ ...lightbox, index: (idx + 1) % images.length })
                  } else {
                    setLightbox({ ...lightbox, index: (idx - 1 + images.length) % images.length })
                  }
                }
              }
              setTouchStart(null)
              setTouchEnd(null)
            }}
          >
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
              <img src={images[idx]} alt={`${video.title} ${idx + 1}`} className="lightbox-img" />

              {images.length > 1 && (
                <>
                  <button
                    className="lightbox-arrow lightbox-left"
                    onClick={() => setLightbox({ ...lightbox, index: (idx - 1 + images.length) % images.length })}
                  >&#8249;</button>
                  <button
                    className="lightbox-arrow lightbox-right"
                    onClick={() => setLightbox({ ...lightbox, index: (idx + 1) % images.length })}
                  >&#8250;</button>
                  <div className="lightbox-counter">{idx + 1} / {images.length}</div>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default App
