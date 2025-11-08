import { CALLBACK_STATE } from "../../TypesAndInterfaces/custom-types";

export interface ComponentFlowProps {
    callback: (state:CALLBACK_STATE) => void,
    continueNavigation: boolean,
    context: any
    setContext: React.Dispatch<React.SetStateAction<any>>
}