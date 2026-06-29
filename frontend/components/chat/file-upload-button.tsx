'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Paperclip, X } from 'lucide-react'

interface FileUploadButtonProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUploadButton({ onFilesSelected }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
    onFilesSelected(files)
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
        title="Upload files"
      >
        <Paperclip className="w-5 h-5" />
      </motion.button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.json"
      />

      {/* File List */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border"
        >
          <p className="text-xs font-semibold text-muted-foreground">
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
          </p>
          {selectedFiles.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between gap-2 p-2 rounded bg-background text-xs"
            >
              <span className="flex items-center gap-2 truncate">
                <span>📎</span>
                <span className="truncate text-foreground">{file.name}</span>
                <span className="text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
