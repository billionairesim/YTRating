import { useState, useEffect, useRef } from 'react'
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

  const [parameterSets, setParameterSets] = useState(() => {
    const saved = localStorage.getItem('yt-rater-param-sets')
    return saved ? JSON.parse(saved) : []
  })

  const [paramSetMap, setParamSetMap] = useState(() => {
    const saved = localStorage.getItem('yt-rater-param-set-map')
    return saved ? JSON.parse(saved) : {}
  })

  const [activeFolder, setActiveFolder] = useState('all')
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddParam, setShowAddParam] = useState(false)
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [showAddSet, setShowAddSet] = useState(false)
  const [showManageSets, setShowManageSets] = useState(false)
  const [newSetName, setNewSetName] = useState('')
  const [newSetColor, setNewSetColor] = useState('#5c6bc0')
  const [editingSet, setEditingSet] = useState(null)
  const [showSetSelector, setShowSetSelector] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoFolder, setVideoFolder] = useState('')
  const [customImages, setCustomImages] = useState([])
  const [newParam, setNewParam] = useState('')
  const [newParamSet, setNewParamSet] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [videoSelectedSets, setVideoSelectedSets] = useState([])
  const [error, setError] = useState('')
  const [editingTitle, setEditingTitle] = useState(null)
  const [expandedAnalysis, setExpandedAnalysis] = useState({})
  const [imageIndex, setImageIndex] = useState({})
  const [lightbox, setLightbox] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [toast, setToast] = useState(null)
  const [sortOrder, setSortOrder] = useState('newest')
  const [showDashboard, setShowDashboard] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelection, setCompareSelection] = useState([])
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('yt-rater-view') || 'list'
  })
  const toastTimeout = useRef(null)
  const importRef = useRef(null)

  const handleSwipe = (videoId, images) => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipe = 50
    if (Math.abs(distance) < minSwipe) return

    const currentIdx = imageIndex[videoId] || 0
    const safeIdx = currentIdx % images.length

    if (distance > 0) {
      setImageIndex(prev => ({ ...prev, [videoId]: (safeIdx + 1) % images.length }))
    } else {
      setImageIndex(prev => ({ ...prev, [videoId]: (safeIdx - 1 + images.length) % images.length }))
    }
  }

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('yt-rater-theme') || 'black'
  })

  const themes = [
    { id: 'black', color: '#0a0a0a' },
    { id: 'grey-dark', color: '#2c2c2c' },
    { id: 'grey-mid', color: '#6e6e6e' },
    { id: 'grey-light', color: '#d0d0d0' },
    { id: 'sunset', color: '#e65100' },
    { id: 'midnight', color: '#1a1a2e' },
  ]

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].id)
  }

  // Toast helper
  const showToast = (message) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast(message)
    toastTimeout.current = setTimeout(() => setToast(null), 2500)
  }

  // Haptic feedback
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10)
  }

  // Export data
  const exportData = () => {
    const data = {
      videos,
      parameters,
      parameterSets,
      paramSetMap,
      folders,
      theme,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yt-rater-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported!')
  }

  // Import data
  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.videos) setVideos(data.videos)
        if (data.parameters) setParameters(data.parameters)
        if (data.parameterSets) setParameterSets(data.parameterSets)
        if (data.paramSetMap) setParamSetMap(data.paramSetMap)
        if (data.folders) setFolders(data.folders)
        if (data.theme) setTheme(data.theme)
        showToast('Data imported!')
      } catch {
        showToast('Invalid file format')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

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

  useEffect(() => {
    localStorage.setItem('yt-rater-param-sets', JSON.stringify(parameterSets))
  }, [parameterSets])

  useEffect(() => {
    localStorage.setItem('yt-rater-param-set-map', JSON.stringify(paramSetMap))
  }, [paramSetMap])

  useEffect(() => {
    localStorage.setItem('yt-rater-view', viewMode)
  }, [viewMode])

  // Share card as image
  const shareCard = async (video) => {
    const avg = getAverage(video)
    const analysis = getAnalysis(video)
    const images = (video.images || []).filter(Boolean)

    const visibleParams = getVisibleParams(video)
    const width = 600
    const imgHeight = images.length > 0 ? 280 : 0
    const contentHeight = 400 + visibleParams.length * 36
    const height = imgHeight + contentHeight
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Draw image if available
    const drawContent = () => {
      let startY = imgHeight

      // Border
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.roundRect(10, 10, width - 20, height - 20, 16)
      ctx.stroke()

      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText(video.title, 30, startY + 40)

      // Average badge
      ctx.fillStyle = '#f5a623'
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText(`${avg}/5`, width - 90, startY + 40)

      // Verdict
      if (analysis) {
        ctx.fillStyle = '#888'
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.fillText(`${analysis.verdict} • ${analysis.percentage}% • ${analysis.consistency}`, 30, startY + 70)
      }

      // Ratings
      let y = startY + 110
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
      visibleParams.forEach(param => {
        const score = video.ratings[param] || 0

        // Label
        ctx.fillStyle = '#aaa'
        ctx.fillText(param, 30, y)

        // Stars
        const starX = 200
        for (let i = 1; i <= 5; i++) {
          ctx.fillStyle = score >= i ? '#f5a623' : (score >= i - 0.5 ? '#c78a1a' : '#444')
          ctx.font = '18px sans-serif'
          ctx.fillText('★', starX + (i - 1) * 24, y)
        }

        // Score number
        ctx.fillStyle = '#666'
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.fillText(score > 0 ? score.toString() : '-', starX + 130, y)

        y += 36
      })

      // Progress bar
      y += 10
      ctx.fillStyle = '#333'
      ctx.fillRect(30, y, width - 60, 8)
      if (analysis) {
        ctx.fillStyle = '#f5a623'
        ctx.fillRect(30, y, (width - 60) * (analysis.percentage / 100), 8)
      }

      // Footer
      y += 40
      ctx.fillStyle = '#555'
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText('Made with YT Rater', 30, y)

      if (analysis) {
        ctx.fillStyle = '#666'
        ctx.fillText(analysis.recommendation, 30, y + 20)
      }

      // Convert to blob and download/share
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${video.title}-rating.png`, { type: 'image/png' })
          const shareData = { files: [file], title: `${video.title} - Rating Card` }
          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData)
              showToast('Shared!')
              return
            } catch (e) {
              // User cancelled or share failed, fall through to download
            }
          }
        }
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${video.title}-rating.png`
        a.click()
        URL.revokeObjectURL(url)
        showToast('Card image saved!')
      }, 'image/png')
    }

    if (images.length > 0) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Draw image covering full width at top
        const aspect = img.width / img.height
        let drawW = width - 20
        let drawH = drawW / aspect
        if (drawH > imgHeight - 20) {
          drawH = imgHeight - 20
          drawW = drawH * aspect
        }
        const drawX = (width - drawW) / 2
        const drawY = 10 + (imgHeight - 20 - drawH) / 2

        // Clip rounded corners for image
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(10, 10, width - 20, imgHeight - 10, [16, 16, 0, 0])
        ctx.clip()
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.restore()

        drawContent()
      }
      img.onerror = () => {
        drawContent()
      }
      img.src = images[0]
    } else {
      drawContent()
    }
  }

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

  // Parameter Set CRUD
  const addParameterSet = () => {
    if (!newSetName.trim()) return
    if (parameterSets.some(s => s.name === newSetName.trim())) {
      setError('Set already exists')
      return
    }
    setParameterSets([...parameterSets, {
      id: Date.now(),
      name: newSetName.trim(),
      color: newSetColor
    }])
    setNewSetName('')
    setNewSetColor('#5c6bc0')
    setShowAddSet(false)
    setError('')
    showToast('Parameter set created!')
  }

  const updateParameterSet = (setId, newName, newColor) => {
    setParameterSets(parameterSets.map(s =>
      s.id === setId ? { ...s, name: newName, color: newColor } : s
    ))
    setEditingSet(null)
    showToast('Set updated!')
  }

  const deleteParameterSet = (setId) => {
    // Remove set assignment from parameters
    const newMap = { ...paramSetMap }
    Object.keys(newMap).forEach(param => {
      if (newMap[param] === setId) delete newMap[param]
    })
    setParamSetMap(newMap)

    // Remove from videos' selectedSets
    setVideos(videos.map(v => {
      if (v.selectedSets) {
        const filtered = v.selectedSets.filter(id => id !== setId)
        return { ...v, selectedSets: filtered.length > 0 ? filtered : [] }
      }
      return v
    }))

    setParameterSets(parameterSets.filter(s => s.id !== setId))
    showToast('Set deleted')
  }

  // Special "Unassigned" set ID for parameters without a set
  const UNASSIGNED_SET_ID = -1
  const UNASSIGNED_SET = { id: UNASSIGNED_SET_ID, name: 'Unassigned', color: '#888888' }

  // Get all sets including the virtual "Unassigned" set if there are unassigned params
  const getAllSetsWithUnassigned = () => {
    const unassignedParams = parameters.filter(p => !paramSetMap[p])
    if (unassignedParams.length > 0) {
      return [...parameterSets, UNASSIGNED_SET]
    }
    return parameterSets
  }

  // Get parameters that belong to a specific set
  const getParamsForSet = (setId) => {
    if (setId === UNASSIGNED_SET_ID) {
      return parameters.filter(p => !paramSetMap[p])
    }
    return parameters.filter(p => paramSetMap[p] === setId)
  }

  // Get parameters visible for a specific video (based on its selectedSets)
  const getVisibleParams = (video) => {
    // If no sets exist at all, show all parameters
    if (parameterSets.length === 0) return parameters

    // If video has no selectedSets set yet (legacy video), default to all sets including unassigned
    const allSetIds = getAllSetsWithUnassigned().map(s => s.id)
    const selectedSets = video.selectedSets && video.selectedSets.length > 0
      ? video.selectedSets
      : allSetIds

    return parameters.filter(p => {
      const setId = paramSetMap[p]
      // If param has no set, it belongs to "Unassigned"
      const effectiveSetId = setId || UNASSIGNED_SET_ID
      return selectedSets.includes(effectiveSetId)
    })
  }

  const addVideo = () => {
    if (!videoTitle.trim()) {
      setError('Please enter a title')
      return
    }

    // If there are parameter sets, must select at least one
    if (parameterSets.length > 0 && videoSelectedSets.length === 0) {
      setError('Please select at least 1 parameter set')
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
      selectedSets: parameterSets.length > 0 ? [...videoSelectedSets] : [],
      addedAt: new Date().toISOString()
    }])

    setVideoTitle('')
    setCustomImages([])
    setVideoFolder('')
    setVideoSelectedSets([])
    setShowAddVideo(false)
    setError('')
    showToast('Video added!')
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
    showToast('Folder created!')
  }

  const deleteFolder = (folderId) => {
    const folder = folders.find(f => f.id === folderId)
    setVideos(videos.map(v =>
      v.folder === folder.name ? { ...v, folder: null } : v
    ))
    setFolders(folders.filter(f => f.id !== folderId))
    if (activeFolder === folder.name) setActiveFolder('all')
    showToast('Folder deleted')
  }

  const moveVideoToFolder = (videoId, folderName) => {
    setVideos(videos.map(v =>
      v.id === videoId ? { ...v, folder: folderName || null } : v
    ))
    showToast(folderName ? `Moved to ${folderName}` : 'Removed from folder')
  }

  const addParameter = () => {
    if (!newParam.trim()) return
    if (parameters.includes(newParam.trim())) {
      setError('Parameter already exists')
      return
    }

    if (parameterSets.length > 0 && !newParamSet) {
      setError('Please select a parameter set')
      return
    }

    const param = newParam.trim()
    setParameters([...parameters, param])

    // Assign to set if one selected
    if (newParamSet) {
      setParamSetMap(prev => ({ ...prev, [param]: parseInt(newParamSet) }))
    }

    setVideos(videos.map(v => ({
      ...v,
      ratings: { ...v.ratings, [param]: 0 }
    })))

    setNewParam('')
    setNewParamSet('')
    setShowAddParam(false)
    setError('')
    showToast('Parameter added!')
  }

  const updateRating = (videoId, param, value) => {
    triggerHaptic()
    setVideos(videos.map(v =>
      v.id === videoId
        ? { ...v, ratings: { ...v.ratings, [param]: value } }
        : v
    ))
  }

  const deleteVideo = (videoId) => {
    setVideos(videos.filter(v => v.id !== videoId))
    showToast('Video removed')
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
    showToast('Image added!')
  }

  const removeImageFromVideo = (videoId, imageIndex) => {
    setVideos(videos.map(v =>
      v.id === videoId
        ? { ...v, images: (v.images || []).filter((_, i) => i !== imageIndex) }
        : v
    ))
    showToast('Image removed')
  }

  const updateTitle = (videoId, newTitle) => {
    if (!newTitle.trim()) return
    setVideos(videos.map(v =>
      v.id === videoId ? { ...v, title: newTitle.trim() } : v
    ))
    setEditingTitle(null)
    showToast('Title updated')
  }

  const deleteParameter = (param) => {
    setParameters(parameters.filter(p => p !== param))
    setVideos(videos.map(v => {
      const newRatings = { ...v.ratings }
      delete newRatings[param]
      return { ...v, ratings: newRatings }
    }))
    // Clean up set map
    const newMap = { ...paramSetMap }
    delete newMap[param]
    setParamSetMap(newMap)
    showToast('Parameter removed')
  }

  const getAverage = (video) => {
    const visibleParams = getVisibleParams(video)
    const values = visibleParams.map(p => video.ratings[p] || 0)
    if (values.length === 0) return 0
    const rated = values.filter(v => v > 0)
    if (rated.length === 0) return 0
    return (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1)
  }

  const getAnalysis = (video) => {
    const visibleParams = getVisibleParams(video)
    const entries = visibleParams
      .map(p => [p, video.ratings[p] || 0])
      .filter(([, v]) => v > 0)
    if (entries.length === 0) return null

    const avg = parseFloat(getAverage(video))
    const highest = entries.reduce((a, b) => b[1] > a[1] ? b : a)
    const lowest = entries.reduce((a, b) => b[1] < a[1] ? b : a)
    const totalScore = entries.reduce((sum, [, v]) => sum + v, 0)
    const maxPossible = entries.length * 5
    const percentage = Math.round((totalScore / maxPossible) * 100)

    const mean = totalScore / entries.length
    const variance = entries.reduce((sum, [, v]) => sum + Math.pow(v - mean, 2), 0) / entries.length
    const stdDev = Math.sqrt(variance)
    let consistency = ''
    if (stdDev <= 0.5) consistency = 'Very Consistent'
    else if (stdDev <= 1) consistency = 'Consistent'
    else if (stdDev <= 1.5) consistency = 'Mixed'
    else consistency = 'Inconsistent'

    let verdict = ''
    if (avg >= 4.5) verdict = 'Excellent'
    else if (avg >= 3.5) verdict = 'Great'
    else if (avg >= 2.5) verdict = 'Average'
    else if (avg >= 1.5) verdict = 'Below Average'
    else verdict = 'Poor'

    let recommendation = ''
    if (avg >= 4.5) recommendation = 'Outstanding — excels across the board'
    else if (avg >= 3.5) recommendation = 'Strong performance — minor areas to polish'
    else if (avg >= 2.5) recommendation = 'Solid foundation — clear room to grow'
    else if (avg >= 1.5) recommendation = 'Falls short — significant gaps to address'
    else recommendation = 'Needs major improvement across most areas'

    const sorted = [...entries].sort((a, b) => b[1] - a[1])

    return {
      avg, highest, lowest, verdict, recommendation, consistency,
      ratedCount: entries.length, totalParams: visibleParams.length,
      totalScore, maxPossible, percentage, sorted, stdDev: stdDev.toFixed(2)
    }
  }

  // Dashboard stats
  const getDashboardStats = () => {
    if (videos.length === 0) return null

    const ratedVideos = videos.filter(v => {
      const vals = Object.values(v.ratings).filter(x => x > 0)
      return vals.length > 0
    })

    if (ratedVideos.length === 0) return { totalVideos: videos.length, ratedVideos: 0 }

    const averages = ratedVideos.map(v => parseFloat(getAverage(v)))
    const overallAvg = (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2)
    const bestVideo = ratedVideos.reduce((a, b) => parseFloat(getAverage(b)) > parseFloat(getAverage(a)) ? b : a)
    const worstVideo = ratedVideos.reduce((a, b) => parseFloat(getAverage(b)) < parseFloat(getAverage(a)) ? b : a)

    // Per-parameter averages
    const paramAverages = {}
    parameters.forEach(p => {
      const scores = videos.map(v => v.ratings[p] || 0).filter(x => x > 0)
      if (scores.length > 0) {
        paramAverages[p] = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      }
    })

    // Folder stats
    const folderStats = folders.map(f => {
      const folderVideos = videos.filter(v => v.folder === f.name)
      const folderRated = folderVideos.filter(v => Object.values(v.ratings).some(x => x > 0))
      const folderAvg = folderRated.length > 0
        ? (folderRated.map(v => parseFloat(getAverage(v))).reduce((a, b) => a + b, 0) / folderRated.length).toFixed(2)
        : '-'
      return { name: f.name, count: folderVideos.length, avg: folderAvg }
    })

    return {
      totalVideos: videos.length,
      ratedVideos: ratedVideos.length,
      overallAvg,
      bestVideo,
      worstVideo,
      paramAverages,
      folderStats
    }
  }

  // Compare toggle
  const toggleCompare = (videoId) => {
    if (compareSelection.includes(videoId)) {
      setCompareSelection(compareSelection.filter(id => id !== videoId))
    } else if (compareSelection.length < 2) {
      setCompareSelection([...compareSelection, videoId])
    } else {
      showToast('Only 2 videos can be compared')
    }
  }

  const filteredVideos = (() => {
    let list = activeFolder === 'all'
      ? videos
      : activeFolder === 'uncategorized'
        ? videos.filter(v => !v.folder)
        : videos.filter(v => v.folder === activeFolder)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(v =>
        v.title.toLowerCase().includes(q)
      )
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortOrder === 'newest') return (b.id || 0) - (a.id || 0)
      return (a.id || 0) - (b.id || 0)
    })

    return list
  })()

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="header-left">
            <h1>YT Rater</h1>
            <button
              onClick={cycleTheme}
              className="theme-circle"
              title="Change theme"
              style={{ background: themes.find(t => t.id === theme)?.color }}
            ></button>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowSearch(!showSearch)} className="btn btn-secondary search-toggle">
              {showSearch ? '✕' : '⌕'}
            </button>
            <button onClick={() => setShowAddFolder(true)} className="btn btn-secondary">
              + Folder
            </button>
            <button onClick={() => setShowAddSet(true)} className="btn btn-secondary">
              + Set
            </button>
            <button onClick={() => setShowAddParam(true)} className="btn btn-secondary">
              + Parameter
            </button>
            <button onClick={() => setShowAddVideo(true)} className="btn btn-primary">
              + Video
            </button>
          </div>
        </div>
        <div className="header-toolbar">
          <button
            className="btn btn-sm btn-secondary sort-btn"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          >
            {sortOrder === 'newest' ? '↓ New' : '↑ Old'}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowDashboard(true)}
          >
            Stats
          </button>
          {parameterSets.length > 0 && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowManageSets(true)}
            >
              Sets
            </button>
          )}
          <button
            className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCompareMode(!compareMode); setCompareSelection([]) }}
          >
            {compareMode ? 'Cancel' : 'Compare'}
          </button>
          <button
            className="btn btn-sm btn-secondary view-toggle"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            title={viewMode === 'list' ? 'Grid view' : 'List view'}
          >
            {viewMode === 'list' ? '▦' : '☰'}
          </button>
          <button onClick={exportData} className="btn btn-sm btn-secondary">Export</button>
          <button onClick={() => importRef.current?.click()} className="btn btn-sm btn-secondary">Import</button>
          <input
            type="file"
            accept=".json"
            ref={importRef}
            onChange={importData}
            className="file-input-hidden"
          />
        </div>
      </header>

      {/* Search bar */}
      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>&times;</button>
          )}
        </div>
      )}

      {/* Compare bar */}
      {compareMode && (
        <div className="compare-bar">
          <span>Select 2 videos to compare ({compareSelection.length}/2)</span>
          {compareSelection.length === 2 && (
            <button className="btn btn-primary" onClick={() => {}}>
              View Comparison
            </button>
          )}
        </div>
      )}

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

            {parameterSets.length > 0 && (
              <div className="set-selector-section">
                <label className="set-selector-label">Parameter Sets (select at least 1):</label>
                <div className="set-checkboxes">
                  {getAllSetsWithUnassigned().map(s => (
                    <label key={s.id} className="set-checkbox-item">
                      <input
                        type="checkbox"
                        checked={videoSelectedSets.includes(s.id)}
                        onChange={() => {
                          setVideoSelectedSets(prev =>
                            prev.includes(s.id)
                              ? prev.filter(id => id !== s.id)
                              : [...prev, s.id]
                          )
                        }}
                      />
                      <span className="set-checkbox-dot" style={{ background: s.color }}></span>
                      <span>{s.name}</span>
                      <span className="set-checkbox-count">({getParamsForSet(s.id).length} params)</span>
                    </label>
                  ))}
                </div>
              </div>
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
              <button onClick={() => { setShowAddVideo(false); setError(''); setCustomImages([]); setVideoSelectedSets([]) }} className="btn btn-secondary">Cancel</button>
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
        <div className="modal-overlay" onClick={() => { setShowAddParam(false); setError(''); setNewParamSet('') }}>
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
            {parameterSets.length > 0 && (
              <select
                value={newParamSet}
                onChange={e => setNewParamSet(e.target.value)}
                className="modal-input modal-select"
              >
                <option value="">Select parameter set...</option>
                {parameterSets.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={() => { setShowAddParam(false); setError(''); setNewParamSet('') }} className="btn btn-secondary">Cancel</button>
              <button onClick={addParameter} className="btn btn-primary">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className={`videos-grid ${viewMode === 'grid' ? 'grid-view' : ''}`}>
        {filteredVideos.length === 0 && (
          <div className="empty-state">
            {searchQuery ? (
              <p>No results for "{searchQuery}"</p>
            ) : (
              <>
                <p>{activeFolder === 'all' ? 'No videos yet.' : `No videos in this folder.`}</p>
                <button onClick={() => setShowAddVideo(true)} className="btn btn-primary empty-add-btn">
                  + Add Video
                </button>
              </>
            )}
          </div>
        )}

        {filteredVideos.map(video => (
          <div key={video.id} className="video-card card-animate">
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
              {compareMode && (
                <label className="compare-check">
                  <input
                    type="checkbox"
                    checked={compareSelection.includes(video.id)}
                    onChange={() => toggleCompare(video.id)}
                  />
                  <span>Select to compare</span>
                </label>
              )}
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
                {(() => {
                  const visibleParams = getVisibleParams(video)
                  // Group by set
                  if (parameterSets.length > 0) {
                    const grouped = {}
                    visibleParams.forEach(p => {
                      const setId = paramSetMap[p] || UNASSIGNED_SET_ID
                      if (!grouped[setId]) grouped[setId] = []
                      grouped[setId].push(p)
                    })

                    return Object.entries(grouped).map(([setId, params]) => {
                      const numId = parseInt(setId)
                      const set = numId === UNASSIGNED_SET_ID
                        ? UNASSIGNED_SET
                        : parameterSets.find(s => s.id === numId)
                      return (
                        <div key={setId} className="param-set-group">
                          {set && (
                            <div className="param-set-header" style={{ borderLeftColor: set.color }}>
                              <span className="param-set-dot" style={{ background: set.color }}></span>
                              {set.name}
                            </div>
                          )}
                          {params.map(param => (
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
                      )
                    })
                  } else {
                    // No sets — show all parameters flat
                    return visibleParams.map(param => (
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
                    ))
                  }
                })()}
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

              <div className="card-actions">
                {parameterSets.length > 0 && (
                  <button onClick={() => setShowSetSelector(video.id)} className="sets-btn">
                    Sets ({(video.selectedSets && video.selectedSets.length > 0) ? video.selectedSets.length : getAllSetsWithUnassigned().length})
                  </button>
                )}
                <button onClick={() => shareCard(video)} className="share-btn">
                  Share
                </button>
                <button onClick={() => deleteVideo(video.id)} className="delete-btn">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Modal */}
      {showDashboard && (() => {
        const stats = getDashboardStats()
        return (
          <div className="modal-overlay" onClick={() => setShowDashboard(false)}>
            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
              <h2>Dashboard</h2>
              {!stats || stats.ratedVideos === 0 ? (
                <p className="dashboard-empty">No rated videos yet. Rate some videos to see stats!</p>
              ) : (
                <div className="dashboard-content">
                  <div className="dashboard-grid">
                    <div className="dash-card">
                      <span className="dash-label">Total Videos</span>
                      <span className="dash-value">{stats.totalVideos}</span>
                    </div>
                    <div className="dash-card">
                      <span className="dash-label">Rated</span>
                      <span className="dash-value">{stats.ratedVideos}</span>
                    </div>
                    <div className="dash-card">
                      <span className="dash-label">Overall Avg</span>
                      <span className="dash-value">{stats.overallAvg}/5</span>
                    </div>
                  </div>

                  <div className="dash-section">
                    <h4>Best Rated</h4>
                    <div className="dash-highlight best">
                      {stats.bestVideo.title} — {getAverage(stats.bestVideo)}/5
                    </div>
                  </div>

                  <div className="dash-section">
                    <h4>Worst Rated</h4>
                    <div className="dash-highlight weak">
                      {stats.worstVideo.title} — {getAverage(stats.worstVideo)}/5
                    </div>
                  </div>

                  {Object.keys(stats.paramAverages).length > 0 && (
                    <div className="dash-section">
                      <h4>Per Parameter Avg</h4>
                      <div className="dash-params">
                        {Object.entries(stats.paramAverages).sort((a, b) => b[1] - a[1]).map(([param, avg]) => (
                          <div key={param} className="dash-param-row">
                            <span>{param}</span>
                            <div className="breakdown-bar-bg">
                              <div className="breakdown-bar-fill" style={{ width: `${(avg / 5) * 100}%` }}></div>
                            </div>
                            <span className="dash-param-score">{avg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.folderStats.length > 0 && (
                    <div className="dash-section">
                      <h4>Folders</h4>
                      <div className="dash-folders">
                        {stats.folderStats.map(f => (
                          <div key={f.name} className="dash-folder-row">
                            <span className="dash-folder-name">{f.name}</span>
                            <span className="dash-folder-count">{f.count} videos</span>
                            <span className="dash-folder-avg">avg {f.avg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="modal-actions">
                <button onClick={() => setShowDashboard(false)} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Comparison Modal */}
      {compareMode && compareSelection.length === 2 && (() => {
        const videoA = videos.find(v => v.id === compareSelection[0])
        const videoB = videos.find(v => v.id === compareSelection[1])
        if (!videoA || !videoB) return null

        return (
          <div className="modal-overlay" onClick={() => { setCompareMode(false); setCompareSelection([]) }}>
            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
              <h2>Comparison</h2>
              <div className="compare-content">
                {/* Images row */}
                <div className="compare-images-row">
                  <div className="compare-img-col"></div>
                  <div className="compare-img-col">
                    {(() => {
                      const imgs = (videoA.images || []).filter(Boolean)
                      return imgs.length > 0 ? (
                        <img src={imgs[0]} alt={videoA.title} className="compare-thumb" />
                      ) : (
                        <div className="compare-thumb-empty">No image</div>
                      )
                    })()}
                  </div>
                  <div className="compare-img-col">
                    {(() => {
                      const imgs = (videoB.images || []).filter(Boolean)
                      return imgs.length > 0 ? (
                        <img src={imgs[0]} alt={videoB.title} className="compare-thumb" />
                      ) : (
                        <div className="compare-thumb-empty">No image</div>
                      )
                    })()}
                  </div>
                </div>

                <div className="compare-header-row">
                  <div className="compare-col compare-label-col"></div>
                  <div className="compare-col">{videoA.title}</div>
                  <div className="compare-col">{videoB.title}</div>
                </div>

                <div className="compare-header-row">
                  <div className="compare-col compare-label-col">Average</div>
                  <div className="compare-col compare-score">{getAverage(videoA)}</div>
                  <div className="compare-col compare-score">{getAverage(videoB)}</div>
                </div>

                {parameters.map(param => {
                  const scoreA = videoA.ratings[param] || 0
                  const scoreB = videoB.ratings[param] || 0
                  const winner = scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : ''
                  const diff = Math.abs(scoreA - scoreB)
                  return (
                    <div key={param} className="compare-row">
                      <div className="compare-col compare-label-col">{param}</div>
                      <div className={`compare-col compare-score ${winner === 'a' ? 'compare-winner' : ''}`}>
                        <div className="compare-score-cell">
                          <div className="compare-bar-wrap">
                            <div className="compare-bar-fill-a" style={{ width: `${(scoreA / 5) * 100}%` }}></div>
                          </div>
                          <span>{scoreA || '-'}</span>
                        </div>
                      </div>
                      <div className={`compare-col compare-score ${winner === 'b' ? 'compare-winner' : ''}`}>
                        <div className="compare-score-cell">
                          <div className="compare-bar-wrap">
                            <div className="compare-bar-fill-b" style={{ width: `${(scoreB / 5) * 100}%` }}></div>
                          </div>
                          <span>{scoreB || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Summary stats */}
                {(() => {
                  const analysisA = getAnalysis(videoA)
                  const analysisB = getAnalysis(videoB)
                  const avgA = parseFloat(getAverage(videoA))
                  const avgB = parseFloat(getAverage(videoB))
                  const winsA = parameters.filter(p => (videoA.ratings[p] || 0) > (videoB.ratings[p] || 0)).length
                  const winsB = parameters.filter(p => (videoB.ratings[p] || 0) > (videoA.ratings[p] || 0)).length
                  const ties = parameters.length - winsA - winsB

                  return (
                    <>
                      <div className="compare-summary">
                        <div className="compare-summary-row">
                          <span className="compare-summary-label">Parameters Won</span>
                          <span className={winsA > winsB ? 'compare-winner' : ''}>{winsA}</span>
                          <span className={winsB > winsA ? 'compare-winner' : ''}>{winsB}</span>
                        </div>
                        {ties > 0 && (
                          <div className="compare-summary-row">
                            <span className="compare-summary-label">Tied</span>
                            <span colSpan="2" className="compare-tie">{ties}</span>
                            <span></span>
                          </div>
                        )}
                        {analysisA && analysisB && (
                          <>
                            <div className="compare-summary-row">
                              <span className="compare-summary-label">Score %</span>
                              <span>{analysisA.percentage}%</span>
                              <span>{analysisB.percentage}%</span>
                            </div>
                            <div className="compare-summary-row">
                              <span className="compare-summary-label">Consistency</span>
                              <span>{analysisA.consistency}</span>
                              <span>{analysisB.consistency}</span>
                            </div>
                            <div className="compare-summary-row">
                              <span className="compare-summary-label">Verdict</span>
                              <span>{analysisA.verdict}</span>
                              <span>{analysisB.verdict}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="compare-header-row compare-verdict-row">
                        <div className="compare-col compare-label-col">Winner</div>
                        <div className="compare-col compare-score">
                          {avgA > avgB ? '🏆' : avgA === avgB ? '🤝' : ''}
                        </div>
                        <div className="compare-col compare-score">
                          {avgB > avgA ? '🏆' : avgA === avgB ? '🤝' : ''}
                        </div>
                      </div>

                      {avgA !== avgB && (
                        <div className="compare-lead-note">
                          {avgA > avgB ? videoA.title : videoB.title} leads by {Math.abs(avgA - avgB).toFixed(1)} points
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              <div className="modal-actions">
                <button onClick={() => { setCompareMode(false); setCompareSelection([]) }} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Add Parameter Set Modal */}
      {showAddSet && (
        <div className="modal-overlay" onClick={() => { setShowAddSet(false); setError('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Parameter Set</h2>
            <input
              type="text"
              placeholder="Set name (e.g. Visual Quality)"
              value={newSetName}
              onChange={e => setNewSetName(e.target.value)}
              className="modal-input"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addParameterSet()}
            />
            <div className="color-picker-row">
              <label className="color-label">Color:</label>
              <div className="color-options">
                {['#5c6bc0', '#f5a623', '#2e7d32', '#e53935', '#00897b', '#8e24aa', '#f57c00', '#1565c0'].map(c => (
                  <button
                    key={c}
                    className={`color-dot ${newSetColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewSetColor(c)}
                  ></button>
                ))}
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={() => { setShowAddSet(false); setError('') }} className="btn btn-secondary">Cancel</button>
              <button onClick={addParameterSet} className="btn btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Parameter Sets Modal */}
      {showManageSets && (
        <div className="modal-overlay" onClick={() => { setShowManageSets(false); setEditingSet(null) }}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h2>Parameter Sets</h2>
            <div className="manage-sets-list">
              {parameterSets.map(s => (
                <div key={s.id} className="manage-set-item">
                  {editingSet === s.id ? (
                    <div className="manage-set-edit">
                      <input
                        type="text"
                        className="modal-input"
                        defaultValue={s.name}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') updateParameterSet(s.id, e.target.value, s.color)
                          if (e.key === 'Escape') setEditingSet(null)
                        }}
                        onBlur={e => updateParameterSet(s.id, e.target.value, s.color)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="manage-set-info">
                        <span className="set-color-dot" style={{ background: s.color }}></span>
                        <span className="manage-set-name">{s.name}</span>
                        <span className="manage-set-count">
                          {getParamsForSet(s.id).length} params
                        </span>
                      </div>
                      <div className="manage-set-actions">
                        <button onClick={() => setEditingSet(s.id)} className="manage-set-btn">Edit</button>
                        <button onClick={() => deleteParameterSet(s.id)} className="manage-set-btn danger">Delete</button>
                      </div>
                    </>
                  )}
                  {editingSet !== s.id && getParamsForSet(s.id).length > 0 && (
                    <div className="manage-set-params">
                      {getParamsForSet(s.id).map(p => (
                        <span key={p} className="manage-param-chip">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Show Unassigned set if there are unassigned params */}
              {getParamsForSet(UNASSIGNED_SET_ID).length > 0 && (
                <div className="manage-set-item unassigned-set">
                  <div className="manage-set-info">
                    <span className="set-color-dot" style={{ background: UNASSIGNED_SET.color }}></span>
                    <span className="manage-set-name">{UNASSIGNED_SET.name}</span>
                    <span className="manage-set-count">
                      {getParamsForSet(UNASSIGNED_SET_ID).length} params
                    </span>
                  </div>
                  {getParamsForSet(UNASSIGNED_SET_ID).length > 0 && (
                    <div className="manage-set-params">
                      {getParamsForSet(UNASSIGNED_SET_ID).map(p => (
                        <span key={p} className="manage-param-chip">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {parameterSets.length === 0 && getParamsForSet(UNASSIGNED_SET_ID).length === 0 && (
                <p className="dashboard-empty">No parameter sets yet. Create one with "+ Set".</p>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => { setShowManageSets(false); setEditingSet(null) }} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Video Set Selector Modal */}
      {showSetSelector && (() => {
        const video = videos.find(v => v.id === showSetSelector)
        if (!video) return null
        // Default to all sets (including Unassigned) if video has none assigned yet
        const allSetIds = getAllSetsWithUnassigned().map(s => s.id)
        const currentSets = video.selectedSets && video.selectedSets.length > 0
          ? video.selectedSets
          : allSetIds

        const toggleVideoSet = (setId) => {
          const isSelected = currentSets.includes(setId)
          if (isSelected && currentSets.length <= 1) {
            showToast('Must keep at least 1 set')
            return
          }
          const newSets = isSelected
            ? currentSets.filter(id => id !== setId)
            : [...currentSets, setId]
          setVideos(videos.map(v =>
            v.id === showSetSelector ? { ...v, selectedSets: newSets } : v
          ))
        }

        return (
          <div className="modal-overlay" onClick={() => setShowSetSelector(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Select Sets for "{video.title}"</h2>
              <p className="set-selector-hint">Only parameters from selected sets will be shown and rated.</p>
              <div className="set-checkboxes">
                {getAllSetsWithUnassigned().map(s => (
                  <label key={s.id} className="set-checkbox-item">
                    <input
                      type="checkbox"
                      checked={currentSets.includes(s.id)}
                      onChange={() => toggleVideoSet(s.id)}
                    />
                    <span className="set-checkbox-dot" style={{ background: s.color }}></span>
                    <span>{s.name}</span>
                    <span className="set-checkbox-count">({getParamsForSet(s.id).length} params)</span>
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowSetSelector(null)} className="btn btn-primary">Done</button>
              </div>
            </div>
          </div>
        )
      })()}

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

      {/* Toast */}
      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  )
}

export default App
