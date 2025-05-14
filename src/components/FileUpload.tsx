import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertTriangle, X, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { sampleTracks } from '../utils/sampleData';

interface FileUploadProps {
  onFileUploaded: (file: File) => void;
  onFileRemove: () => void;
  onUseSampleData: (tracks: typeof sampleTracks) => void;
  isLoading: boolean;
  currentFileName?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  onFileRemove, 
  onUseSampleData,
  isLoading, 
  currentFileName 
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setError('Please upload an XML file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    
    onFileUploaded(file);
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleUseSampleData = () => {
    onUseSampleData(sampleTracks);
  };

  if (currentFileName) {
    return (
      <motion.div 
        className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <FileText className="text-primary-400" size={20} />
          <span className="text-gray-300">{currentFileName}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onFileRemove}
            className="px-4 py-2 text-sm bg-error-600/20 hover:bg-error-600 text-error-400 hover:text-white rounded-md transition-colors duration-200"
            disabled={isLoading}
          >
            <span className="flex items-center">
              <X size={16} className="mr-1.5" />
              Remove
            </span>
          </button>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <button
              type="button"
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Upload New File'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 mb-4
          text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-primary-400 bg-primary-900/20' : 'border-gray-600 hover:border-primary-500 hover:bg-gray-900/50'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {isDragActive ? (
            <>
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FileText size={48} className="text-primary-400" />
              </motion.div>
              <p className="text-lg font-medium text-primary-300">Drop your XML file here...</p>
            </>
          ) : (
            <>
              <Upload size={48} className="text-gray-400" />
              <p className="text-lg font-medium">Upload your playlist XML file</p>
              <p className="text-sm text-gray-400 max-w-lg">
                Supports XML exports from Apple Music and is likely compatible with other apps like Rekordbox.
              </p>
              <button
                type="button"
                className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Select XML File'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="text-center">
        <span className="text-gray-400">or</span>
        
        <button
          onClick={handleUseSampleData}
          className="mt-4 w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <Play size={18} />
          <span>Try with Sample Data (50 tracks)</span>
        </button>
      </div>
      
      {error && (
        <motion.div 
          className="mt-4 p-3 bg-error-900/50 border border-error-700 rounded-md flex items-center space-x-2 text-error-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileUpload;