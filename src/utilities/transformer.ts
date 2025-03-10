import { FOREVER_PRAYER_REQUEST_DURATION_DAYS, FOREVER_PRAYER_REQUEST_DURATION_ISO } from "@env";
import { PrayerRequestPatchRequestBody, PrayerRequestPostRequestBody, PrayerRequestResponseBody } from "../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types";
import { getDateDaysFuture } from "../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config";
import { PrayerRequestDurationsMap } from "../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config";

export const formatPrayerRequestCreateFields = (prayerRequest:PrayerRequestPostRequestBody):void => {
 // Convert date display to date object
    const durationDays = prayerRequest.expirationDate;
    console.log(durationDays);
    prayerRequest.expirationDate = getDateDaysFuture(parseInt(PrayerRequestDurationsMap[durationDays])).toISOString();
    console.log(prayerRequest.expirationDate);

    // Set 'isOngoing' if duration is set to 'Forever'
    prayerRequest.isOnGoing = durationDays === FOREVER_PRAYER_REQUEST_DURATION_DAYS ? true : false;
}

export const formatPrayerRequestEditIngestFields = (prayerRequest:PrayerRequestResponseBody):PrayerRequestResponseBody => {
    // @ts-ignore - convert bool to string
    prayerRequest.isResolved = prayerRequest.isResolved ? 'Inactive' : 'Active';
    return prayerRequest;
}

export const formatPrayerRequestEditExportFields = (prayerRequest:PrayerRequestPatchRequestBody):boolean => {
    var fieldsChanged = false;
    // Convert date display to date object
    const isoDuration = prayerRequest.expirationDate;
    if (isoDuration !== '') {
        // Set 'isOngoing' if duration is set to 'Forever'
        prayerRequest.isOnGoing = new Date(isoDuration).getTime() >= parseInt(FOREVER_PRAYER_REQUEST_DURATION_ISO) ? true : false;
        fieldsChanged = true;
    }

    if (prayerRequest.isResolved !== undefined) {
        // @ts-ignore - convert from string type to bool
        prayerRequest.isResolved = prayerRequest.isResolved === 'Active' ? false : true;
        fieldsChanged = true;
    };

    return fieldsChanged;
}