import { Badge } from '../ui/badge';
import { ApplicationStatus } from '../../lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState } from 'react';

const agentStatusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  [ApplicationStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
  },
  [ApplicationStatus.SUBMITTED]: {
    label: 'Application Submitted',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'Application Under Review',
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  [ApplicationStatus.OFFER_SENT]: {
    label: 'Offer Received',
    className: 'bg-purple-500 text-white hover:bg-purple-600',
  },
  [ApplicationStatus.OFFER_ACCEPTED]: {
    label: 'Offer Signed',
    className: 'bg-indigo-500 text-white hover:bg-indigo-600',
  },
  [ApplicationStatus.GS_DOCUMENTS_PENDING]: {
    label: 'Further Document Required',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: {
    label: 'GS In Progress',
    className: 'bg-cyan-500 text-white hover:bg-cyan-600',
  },
  [ApplicationStatus.GS_APPROVED]: {
    label: 'GS Approved',
    className: 'bg-teal-500 text-white hover:bg-teal-600',
  },
  [ApplicationStatus.FEE_PAYMENT_PENDING]: {
    label: 'Fee Payment Pending',
    className: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  [ApplicationStatus.COE_ISSUED]: {
    label: 'COE Issued',
    className: 'bg-green-500 text-white hover:bg-green-600',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-500 text-white hover:bg-red-600',
  },
  [ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED]: {
    label: 'Further Document Required',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
  },
};

const staffStatusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  [ApplicationStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
  },
  [ApplicationStatus.SUBMITTED]: {
    label: 'Application Received',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'Application Under Review',
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  [ApplicationStatus.OFFER_SENT]: {
    label: 'Offer Sent',
    className: 'bg-purple-500 text-white hover:bg-purple-600',
  },
  [ApplicationStatus.OFFER_ACCEPTED]: {
    label: 'Offer Accepted',
    className: 'bg-indigo-500 text-white hover:bg-indigo-600',
  },
  [ApplicationStatus.GS_DOCUMENTS_PENDING]: {
    label: 'GS Documents Pending',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: {
    label: 'GS In Progress',
    className: 'bg-cyan-500 text-white hover:bg-cyan-600',
  },
  [ApplicationStatus.GS_APPROVED]: {
    label: 'GS Approved / COE Issued',
    className: 'bg-green-500 text-white hover:bg-green-600',
  },
  [ApplicationStatus.FEE_PAYMENT_PENDING]: {
    label: 'Fee Payment Pending',
    className: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  [ApplicationStatus.COE_ISSUED]: {
    label: 'GS Approved / COE Issued',
    className: 'bg-green-500 text-white hover:bg-green-600',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-500 text-white hover:bg-red-600',
  },
  [ApplicationStatus.FURTHER_DOCUMENTS_REQUESTED]: {
    label: 'Further Documents Requested',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
  },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  portal?: 'agent' | 'staff';
  editable?: boolean;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
}

export function ApplicationStatusBadge({ 
  status, 
  portal = 'agent', 
  editable = false,
  onStatusChange 
}: ApplicationStatusBadgeProps) {
  const config = portal === 'staff' ? staffStatusConfig[status] : agentStatusConfig[status];
  
  // If not editable, just show the badge
  if (!editable || !onStatusChange) {
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  }

  // If editable, show as a select dropdown
  return (
    <Select value={status} onValueChange={(value) => onStatusChange(value as ApplicationStatus)}>
      <SelectTrigger className={`w-auto border-0 ${config.className} h-auto py-1 px-3`}>
        <SelectValue>
          <span className="text-sm">{config.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(staffStatusConfig).map(([statusKey, statusConfig]) => (
          <SelectItem key={statusKey} value={statusKey}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusConfig.className.split(' ')[0].replace('bg-', 'bg-')}`} />
              {statusConfig.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}