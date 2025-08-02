'use client';

interface AppointmentStatusBadgeProps {
  status: 'pending' | 'counter-offered' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AppointmentStatusBadge({ 
  status, 
  className = '', 
  size = 'md' 
}: AppointmentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Pending Review',
          icon: '⏳'
        };
      case 'counter-offered':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          text: 'Alternative Suggested',
          icon: '💬'
        };
      case 'confirmed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Confirmed',
          icon: '✅'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Declined',
          icon: '❌'
        };
      case 'cancelled':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Cancelled',
          icon: '🚫'
        };
      case 'completed':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          text: 'Completed',
          icon: '✨'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: status,
          icon: '•'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1 text-xs';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses} ${className}`}
    >
      <span className="text-current">{config.icon}</span>
      {config.text}
    </span>
  );
}