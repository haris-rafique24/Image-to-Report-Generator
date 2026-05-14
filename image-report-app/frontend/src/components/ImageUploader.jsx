import { useRef, useState } from 'react'
import './ImageUploader.css'

export default function ImageUploader({ preview, filename, onFile, onReset }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
  }

  if (preview) {
    return (
      <div className="preview-area">
        <img src={preview} alt="Uploaded preview" className="preview-img" />
        <div className="preview-meta">
          <span className="preview-name">{filename}</span>
          <button className="change-btn" onClick={onReset}>← change</button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`upload-area ${dragging ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="drop-zone">
        <div className="drop-icon">🖼</div>
        <div className="drop-title">Drop image here</div>
        <div className="drop-sub">or click to browse · PNG, JPG, WEBP</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  )
}
