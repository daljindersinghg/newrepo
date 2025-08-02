'use client';

import { useState } from 'react';

interface Receipt {
  id: string;
  patientName: string;
  patientEmail: string;
  fileName: string;
  uploadDate: string;
  url: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  adminMessage?: string;
}

export function ReceiptManagement() {
  const [receipts, setReceipts] = useState<Receipt[]>([
    // Mock data - replace with API call
    {
      id: '1',
      patientName: 'John Doe',
      patientEmail: 'john@example.com',
      fileName: 'receipt_dental_cleaning.pdf',
      uploadDate: '2024-01-15',
      url: 'https://example.com/receipt.pdf',
      status: 'pending'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      patientEmail: 'jane@example.com',
      fileName: 'treatment_receipt.jpg',
      uploadDate: '2024-01-14',
      url: 'https://example.com/receipt2.jpg',
      status: 'reviewed',
      adminMessage: 'Receipt approved for insurance claim'
    }
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [message, setMessage] = useState('');
  const [newStatus, setNewStatus] = useState<Receipt['status']>('reviewed');

  const handleUpdateReceipt = () => {
    if (!selectedReceipt) return;

    setReceipts(prev => prev.map(receipt => 
      receipt.id === selectedReceipt.id 
        ? { ...receipt, status: newStatus, adminMessage: message || undefined }
        : receipt
    ));

    setSelectedReceipt(null);
    setMessage('');
    setNewStatus('reviewed');
  };

  const downloadReceipt = (url: string, fileName: string) => {
    // Simple download - in production you might want to proxy through your server
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: Receipt['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const pendingCount = receipts.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Receipts</h3>
          <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">
            {receipts.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">
            {receipts.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Patient Receipts</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{receipt.patientName}</div>
                      <div className="text-sm text-gray-500">{receipt.patientEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{receipt.fileName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(receipt.uploadDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                    {receipt.adminMessage && (
                      <div className="text-xs text-gray-500 mt-1">Has message</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => window.open(receipt.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => downloadReceipt(receipt.url, receipt.fileName)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Review Receipt: {selectedReceipt.fileName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Receipt['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Patient (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message for the patient..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              {selectedReceipt.adminMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Message
                  </label>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedReceipt.adminMessage}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateReceipt}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedReceipt(null);
                  setMessage('');
                  setNewStatus('reviewed');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}