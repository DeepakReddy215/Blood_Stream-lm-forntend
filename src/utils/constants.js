export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = {
  critical: { label: 'Critical', color: 'red', priority: 1 },
  urgent: { label: 'Urgent', color: 'orange', priority: 2 },
  normal: { label: 'Normal', color: 'green', priority: 3 }
};

export const BADGE_LEVELS = {
  bronze: { label: 'Bronze', color: 'amber', minDonations: 0 },
  silver: { label: 'Silver', color: 'gray', minDonations: 5 },
  gold: { label: 'Gold', color: 'yellow', minDonations: 10 },
  platinum: { label: 'Platinum', color: 'purple', minDonations: 20 }
};

export const DELIVERY_STATUS = {
  assigned: { label: 'Assigned', color: 'blue' },
  'picked-up': { label: 'Picked Up', color: 'yellow' },
  'in-transit': { label: 'In Transit', color: 'orange' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' }
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
