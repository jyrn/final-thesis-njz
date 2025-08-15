import React, { useState, useCallback } from 'react'
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi'
import { OCRService } from '../utils/ocrService'
import { parseResume } from '../utils/resumeParser'

interface ResumeUploadProps {
  onResumeProcessed: (resumeData: any) => void
  onClose?: () => void
}

interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeProcessed, onClose }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: 'Ready to upload resume'
  })
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'Please select a PDF file'
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'File size must be less than 10MB'
      })
      return
    }

    setFile(selectedFile)
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: `Selected: ${selectedFile.name}`
    })
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }, [handleFileSelect])

  const processResume = useCallback(async () => {
    if (!file) return

    try {
      setUploadProgress({
        status: 'processing',
        progress: 0,
        message: 'Starting OCR processing...'
      })

      // Use the existing resume parser which integrates with OCR
      const resumeData = await parseResume(file, (progress) => {
        setUploadProgress({
          status: 'processing',
          progress: progress.progress,
          message: progress.message
        })
      })

      setUploadProgress({
        status: 'completed',
        progress: 100,
        message: 'Resume processed successfully!'
      })

      // Pass the processed resume data to parent component
      onResumeProcessed(resumeData)

    } catch (error) {
      console.error('Error processing resume:', error)
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to process resume'}`
      })
    }
  }, [file, onResumeProcessed])

  const resetUpload = useCallback(() => {
    setFile(null)
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: 'Ready to upload resume'
    })
  }, [])

  const getStatusIcon = () => {
    switch (uploadProgress.status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" size={24} />
      case 'error':
        return <FiAlertCircle className="text-red-500" size={24} />
      case 'processing':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      default:
        return <FiFileText className="text-gray-400" size={24} />
    }
  }

  const getStatusColor = () => {
    switch (uploadProgress.status) {
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'processing':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <FiUpload size={32} className="text-gray-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {file ? 'Resume Selected' : 'Upload your resume'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {file 
                    ? `File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                    : 'Drag and drop your PDF resume here, or click to browse'
                  }
                </p>
                
                {!file && (
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <FiUpload className="mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* File Actions */}
          {file && (
            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiFileText className="text-blue-500" size={20} />
                <span className="font-medium text-gray-900">{file.name}</span>
                <span className="text-sm text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={processResume}
                  disabled={uploadProgress.status === 'processing'}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadProgress.status === 'processing' ? 'Processing...' : 'Process Resume'}
                </button>
              </div>
            </div>
          )}

          {/* Progress */}
          {uploadProgress.status !== 'idle' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon()}
                <span className={`font-medium ${getStatusColor()}`}>
                  {uploadProgress.message}
                </span>
              </div>
              
              {uploadProgress.status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* OCR Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFileText className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">OCR Technology</h4>
                <p className="text-sm text-blue-700">
                  Your resume will be processed using advanced OCR (Optical Character Recognition) 
                  technology to extract text and information automatically. This ensures accurate 
                  data extraction from your PDF resume.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          {uploadProgress.status === 'completed' && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeUpload
