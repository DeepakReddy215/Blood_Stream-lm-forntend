export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = {
  critical: { label: 'Critical', color: 'red', priority: 1 },
  urgent: { label: 'Urgent', color: 'orange', priority: 2 },
  normal: { label: 'Normal', color: 'green', priority: 3 }
};

// Updated badge levels with hero terminology
export const BADGE_LEVELS = {
  bronze: { 
    label: 'Rising Hero', 
    color: 'amber', 
    minDonations: 0,
    description: 'Just started their life-saving journey'
  },
  silver: { 
    label: 'Dedicated Hero', 
    color: 'gray', 
    minDonations: 5,
    description: 'Committed to saving lives regularly'
  },
  gold: { 
    label: 'Champion Hero', 
    color: 'yellow', 
    minDonations: 10,
    description: 'An exemplary life-saver in the community'
  },
  platinum: { 
    label: 'Legendary Hero', 
    color: 'purple', 
    minDonations: 20,
    description: 'An inspiration to all, saved countless lives'
  }
};

export const HERO_MESSAGES = [
  "Heroes don't wear capes, they donate blood",
  "Be someone's hero today",
  "Every drop counts, every hero matters",
  "Your donation is someone's lifeline",
  "Real heroes save lives with compassion"
];

export const DELIVERY_STATUS = {
  assigned: { label: 'Assigned', color: 'blue' },
  'picked-up': { label: 'Picked Up', color: 'yellow' },
  'in-transit': { label: 'In Transit', color: 'orange' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' }
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
