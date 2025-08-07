import React, { useState } from 'react';
import Messaging from './messaginghome';
import Conversation from './individualmessage';
import ParkingLot from './parkinglot';
import { useFocusEffect } from '@react-navigation/native';

const MessagingFunctionality = () => {
    const [screen, setScreen] = useState('MessagingHome');
    const [routeParams, setRouteParams] = useState(null);
  
    const navigateToConversation = (params) => {
      setRouteParams(params);
      setScreen('IndividualMessage');
    };

    const navigateToParkingLot = () => {
      setScreen('ParkingLot');
    };
  
    const navigateBack = () => {
      setScreen('MessagingHome');
    };

    // Reset to MessagingHome whenever the messaging tab is focused
    useFocusEffect(
      React.useCallback(() => {
        setScreen('MessagingHome');
      }, [])
    );
  
    return (
      <>
        {screen === 'MessagingHome' ? (
          <Messaging 
            navigateToConversation={navigateToConversation} 
            navigateToParkingLot={navigateToParkingLot}
          />
        ) : screen === 'IndividualMessage' ? (
          <Conversation route={{ params: routeParams }} navigateBack={navigateBack} />
        ) : (
          <ParkingLot navigateBack={navigateBack} />
        )}
      </>
    );
  };

export default MessagingFunctionality;
