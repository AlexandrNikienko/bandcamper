import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UploadCloud, Folder } from 'lucide-react';
import '../styles/Upload.css';

export const Upload: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { processCSV } = useData();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await processCSV(file);
      setMessage({ type: 'success', text: `✓ CSV processed: Releases ${result.releasesProcessed}, Tracks ${result.tracksProcessed}` });
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Failed to parse CSV'}` });
      console.error(error);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <UploadCloud size={40} />
        <h2>Upload Bandcamp Sales Report</h2>
        <p className="upload-description">
          Download your sales report from the Bandcamp Tools page as a CSV file and upload it here. Parsing happens locally in your browser.
        </p>

        <label className="file-input-label">
          <span className={isLoading ? 'btn-disabled' : 'btn-primary'}>
            {isLoading ? '⏳ Processing...' : <><Folder size={14} style={{ marginRight: 8 }} /> Choose CSV File</>}
          </span>
          <input type="file" accept=".csv" onChange={handleFileChange} disabled={isLoading} style={{ display: 'none' }} />
        </label>

        {message && <div className={`message message-${message.type}`}>{message.text}</div>}
      </div>
    </div>
  );
};
