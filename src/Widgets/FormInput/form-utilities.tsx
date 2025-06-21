import { DOMAIN, ENVIRONMENT } from "@env";
import axios from 'axios';
import ToastQueueManager from '../../utilities/ToastQueueManager';


/* General Utilities used in abstract FormInput.tsx rendering of InputField Lists */

//Verifies unique fields are available in the database
export const testAccountAvailable = async(fields:Map<string, string>):Promise<boolean|undefined> => new Promise((resolve, reject) => {
    const fieldQuery:string = Array.from(fields.entries()).map(([key, value]) => `${key}=${value}`).join('&');

    axios.get(`${DOMAIN}/resources/available-account?${fieldQuery}`)
        .then(response => resolve(true)) //notification handled in FormInput.tsx
        .catch(error => {
            if(error.response.status === 403) {
                resolve(false); 
            } else {
                ToastQueueManager.show({message: 'Unable to verify account availability'});
                console.error('Bad request; unable to test account available', fields, error);
                resolve(undefined); 
            }
        });
    });
