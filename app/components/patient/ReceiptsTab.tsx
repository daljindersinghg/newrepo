'use client';

import { useState, useRef } from 'react';
import { usePatientAuth } from '@/hooks/usePatientAuth';

interface Receipt {
  id: string;
  fileName: string;
  uploadDate: string;
  url: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  adminMessage?: string;
}

export function ReceiptsTab() {
  const { patientInfo } = usePatientAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary config from environment variables
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dydxct3vw';
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'reciepts';

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `receipts/${patientInfo?._id}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Add to receipts list
      const newReceipt: Receipt = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        url: data.secure_url,
        status: 'pending'
      };

      setReceipts(prev => [newReceipt, ...prev]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: Receipt['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Upload Receipt</h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          disabled={uploading}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600">Click to upload receipt</p>
              <p className="text-sm text-gray-500">JPG, PNG, or PDF (max 5MB)</p>
            </div>
          )}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Receipts List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">My Receipts</h3>
        
        {receipts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No receipts uploaded yet</p>
        ) : (
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{receipt.fileName}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(receipt.uploadDate).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </div>
                  <a
                    href={receipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </a>
                </div>
                
                {receipt.adminMessage && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">Admin Message:</p>
                    <p className="text-sm text-gray-600">{receipt.adminMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}