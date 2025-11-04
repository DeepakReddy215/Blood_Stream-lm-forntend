import { create } from 'zustand';

const useStore = create((set) => ({
  notifications: [],
  bloodRequests: [],
  donations: [],
  
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [...state.notifications, notification] 
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
  
  setBloodRequests: (requests) => set({ bloodRequests: requests }),
  
  setDonations: (donations) => set({ donations }),
  
  clearStore: () => set({
    notifications: [],
    bloodRequests: [],
    donations: []
  })
}));

export default useStore;
