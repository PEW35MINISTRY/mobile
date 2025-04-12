import { PrayerRequestPatchRequestBody, PrayerRequestPostRequestBody, PrayerRequestResponseBody } from "../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types";
import { getDateDaysFuture } from "../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config";
import { PrayerRequestDurationsMap } from "../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config";

export const formatPrayerRequestCreateFields = (prayerRequest:PrayerRequestPostRequestBody):void => {
 // Convert date display to date object
    const durationDays = prayerRequest.expirationDate;

    prayerRequest.expirationDate = getDateDaysFuture(parseInt(PrayerRequestDurationsMap[durationDays])).toISOString();
}

export const formatPrayerRequestEditIngestFields = (prayerRequest:PrayerRequestResponseBody):PrayerRequestResponseBody => {
    // @ts-ignore - convert bool to string
    prayerRequest.isResolved = prayerRequest.isResolved ? 'Inactive' : 'Active';
    return prayerRequest;
}

export const formatPrayerRequestEditExportFields = (prayerRequest:PrayerRequestPatchRequestBody):boolean => {
    var fieldsChanged = false;

    if (prayerRequest.isResolved !== undefined) {
        // @ts-ignore - convert from string type to bool
        prayerRequest.isResolved = prayerRequest.isResolved === 'Active' ? false : true;
        fieldsChanged = true;
    };

    return fieldsChanged;
}