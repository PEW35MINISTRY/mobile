import React from "react";
import { CALLBACK_STATE, StackNavigationProps } from "../TypesAndInterfaces/custom-types";

import ProfileImageSettings from "./ProfileImageSettings";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import NewPartner from "../0-Pages/NewPartner";
import ComponentFlow from "../Widgets/ComponentFlow/ComponentFlow";

const InitialAccountFlow = ({navigation}:StackNavigationProps):JSX.Element => {

    return (
      <ComponentFlow 
        components={[
          <ProfileImageSettings />,
          <NewPartner />
        ]}
        onComplete={() => navigation.navigate(ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME)}
      />
    )
  }   

export default InitialAccountFlow;