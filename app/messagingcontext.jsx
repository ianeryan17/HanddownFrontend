import React, { createContext, useContext, useState } from 'react';

const MessagingContext = createContext();

export const MessagingProvider = ({ children }) => {
  const [listingDeletedCallback, setListingDeletedCallback] = useState(null);

  const registerListingDeletedCallback = (callback) => {
    setListingDeletedCallback(callback);
  };

  const notifyListingDeleted = (listingId) => {
    if (listingDeletedCallback) {
      listingDeletedCallback(listingId);
    }
  };

  return (
    <MessagingContext.Provider value={{ registerListingDeletedCallback, notifyListingDeleted }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}; 