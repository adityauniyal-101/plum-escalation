'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Escalation } from '@/lib/types';

interface UploadCSVProps {
  onUpload: (escalations: Escalation[]) => void;
}

export default function UploadCSV({ onUpload }: UploadCSVProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Escalations</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            name="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {fileName && <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>}
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">CSV must include columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>subject</li>
            <li>body</li>
            <li>sent_at</li>
            <li>sender (optional)</li>
          </ul>
        </div>

        {/* Progress Message */}
        {progress && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm animate-pulse">
            {progress}
          </div>
        )}

        {/* Error Message */}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>}

        {/* Loading State */}
        {loading && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded text-sm">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
              Processing your data... Please wait
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : 'Upload & Process'}
        </button>
      </form>
    </div>
  );
}
