'use client';

import { useState, ChangeEvent, FormEvent, DragEvent } from 'react';
import { Escalation } from '@/lib/types';

interface UploadCSVProps {
  onUpload: (escalations: Escalation[]) => void;
}

export default function UploadCSV({ onUpload }: UploadCSVProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name);
      setError(null);
      // Store the dropped file temporarily
      if (typeof window !== 'undefined') {
        try {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          const fileInput = document.querySelector('input[name="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.files = dataTransfer.files;
          }
        } catch (err) {
          // Fallback if DataTransfer is not available
          console.warn('DataTransfer not available, file will be handled on submit');
        }
      }
    } else if (file) {
      setError('Please drop a CSV file');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setProgress('');

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setProgress('Uploading file...');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      setProgress(`Uploading ${file.name}...`);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(`Processing ${data.count} escalations...`);

      // Simulate processing time for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(`✅ Processed ${data.count} escalations successfully!`);
      onUpload(data.escalations);

      // Clear success message after 2 seconds
      setTimeout(() => {
        setProgress('');
        setFileName(null);
        (e.currentTarget as HTMLFormElement).reset();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">📤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Escalations</h2>
            <p className="text-sm text-gray-600 mt-1">Import your CSV data to start monitoring</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : fileName
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input
            type="file"
            name="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="sr-only"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <div className={`text-4xl mb-3 transition-transform ${isDragging ? 'scale-125' : ''}`}>
              {fileName ? '✅' : isDragging ? '⬇️' : '📁'}
            </div>
            {fileName ? (
              <>
                <p className="text-lg font-semibold text-green-700 mb-1">File ready to upload</p>
                <p className="text-sm text-green-600">{fileName}</p>
                <p className="text-xs text-gray-500 mt-3">Click or drag to change file</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
                </p>
                <p className="text-sm text-gray-600 mb-4">or</p>
                <span className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Browse Files
                </span>
                <p className="text-xs text-gray-500 mt-4">CSV files only • Max 10MB</p>
              </>
            )}
          </label>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span> Required Columns
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">subject</code>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">body</code>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">sent_at</code>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">✨</span> Optional Column
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">★</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">sender</code>
              </li>
              <li className="text-xs text-gray-500 mt-3 pl-7">Email address or name of the escalation sender</li>
            </ul>
          </div>
        </div>

        {/* Status Messages */}
        {progress && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm flex items-center gap-3 animate-pulse">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <div>
              <p className="font-semibold">{progress}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Upload Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
              : fileName
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl scale-100 hover:scale-105'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Processing...
            </>
          ) : (
            <>
              <span className="text-lg">🚀</span>
              Upload & Process
            </>
          )}
        </button>
      </form>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center mt-6">
        💡 Tip: Make sure your CSV dates are in ISO format (YYYY-MM-DD) for best results
      </p>
    </div>
  );
}
