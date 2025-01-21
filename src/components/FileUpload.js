import React from 'react'
import "./Fileupload.css"


const FileUpload = ({handleFileUpload}) => {
  return (
    <input type="file" multiple className="custom-file-upload" accept="application/json" onChange={handleFileUpload} />
  )
}

export default FileUpload