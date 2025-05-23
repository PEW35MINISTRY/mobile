import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { addMemberCircle, addPartner, addPartnerPendingPartner, removeInviteCircle, removePartnerPendingUser, RootState, setTabFocus } from '../redux-store';
import theme, { COLORS, FONT_SIZES } from '../theme';
import { DOMAIN } from '@env';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import { ContentSourceEnum,  MOBILE_CONTENT_SUPPORTED_SOURCES } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';
import SearchList from '../Widgets/SearchList/SearchList';
import { SearchListKey, SearchListValue } from '../Widgets/SearchList/searchList-types';
import { ListItemTypesEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';
import { PartnerListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { CircleAnnouncementListItem, CircleListItem, CircleResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { Flat_Button, ProfileImage } from '../widgets';
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PartnershipContractModal } from '../4-Partners/partnership-widgets';
import { PartnerStatusEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';


/**************************
 * DASHBOARD DISPLAY PAGE *
 **************************/
const DashboardDisplay = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const jwt:string = useAppSelector((state:RootState) => state.account.jwt);
    const partnerPendingUserList:PartnerListItem[] = useAppSelector((state:RootState) => state.account.userProfile.partnerPendingUserList) || [];
    const circleInviteList:CircleListItem[] = useAppSelector((state:RootState) => state.account.userProfile.circleInviteList) || [];
    const circleAnnouncementList:CircleAnnouncementListItem[] = useAppSelector((state:RootState) => state.account.userProfile.circleAnnouncementList) || [];
    const newPrayerRequestList:PrayerRequestListItem[] = useAppSelector((state:RootState) => state.account.userProfile.newPrayerRequestList) || [];
    const expiringPrayerRequestList:PrayerRequestListItem[] = useAppSelector((state:RootState) => state.account.userProfile.expiringPrayerRequestList) || [];
    const recommendedContentList:ContentListItem[] = useAppSelector((state:RootState) => state.account.userProfile.recommendedContentList) || [];
    const [newPartner, setNewPartner] = useState<PartnerListItem|undefined>(undefined);

    return (
        <SafeAreaView style={styles.pageContainer} >
            <SearchList
                key='dashboard-page'
                name='dashboard-page'
                additionalHeaderRows={[
                    <View style={styles.headerContainer} >
                        <ProfileImage
                            style={styles.headerIcon}
                            onPress={() => navigation.navigate(ROUTE_NAMES.EDIT_PROFILE_ROUTE_NAME)}
                        />
                        <Ionicons
                                name={'settings-outline'}
                                color={COLORS.accent}
                                size={styles.headerIcon.height} 
                                style={styles.headerIcon}
                                onPress={() => navigation.navigate(ROUTE_NAMES.PROFILE_SETTINGS_ROUTE_NAME)}
                        />
                    </View>
                ]}
                showMultiListFilter={false}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Partner Requests'}),
                            [...partnerPendingUserList].map((partner) => new SearchListValue({displayType: ListItemTypesEnum.PARTNER, displayItem: partner,
                                primaryButtonText:'View Contract', onPrimaryButtonCallback:(id:number, item) => setNewPartner(item as PartnerListItem)}))
                        ],
                        [
                            new SearchListKey({displayTitle:'Circle Invites'}),
                            [...circleInviteList].map((circle) => new SearchListValue({displayType: ListItemTypesEnum.CIRCLE, displayItem: circle,
                                onPress: (id, circleItem) => navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, { CircleProps: circleItem }),
                                primaryButtonText: 'Accept Invite', onPrimaryButtonCallback:(id, circleItem) => 
                                    axios.post(`${DOMAIN}/api/circle/` + id + '/accept', {}, {headers: { jwt }})
                                        .then(response => {
                                            navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, { CircleProps: circleItem });
                                            dispatch(removeInviteCircle(id));
                                            dispatch(addMemberCircle(circleItem as CircleListItem));
                                        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error})),
                            }))
                        ],
                        [
                            new SearchListKey({displayTitle:'Expiring Prayer Requests'}),
                            [...expiringPrayerRequestList].map((prayerRequest) => new SearchListValue({displayType: ListItemTypesEnum.PRAYER_REQUEST, displayItem: prayerRequest,
                                onPress: (id, item) => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, {
                                            PrayerRequestProps: item,
                                            navigateToEdit: true
                                        }
                                    )}))
                        ],
                        [
                            new SearchListKey({displayTitle:'New Prayer Requests'}),
                            [...newPrayerRequestList].map((prayerRequest) => new SearchListValue({displayType: ListItemTypesEnum.PRAYER_REQUEST, displayItem: prayerRequest,
                                onPress: (id, item) => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, {
                                    PrayerRequestProps: item}
                                )}))
                        ],
                        [
                            new SearchListKey({displayTitle:'Announcements'}),
                            [...circleAnnouncementList].map((announcement) => new SearchListValue({displayType: ListItemTypesEnum.CIRCLE_ANNOUNCEMENT, displayItem: announcement,
                                onPress: (id, announcementItem) => navigation.navigate(ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME, { 
                                    params: {CircleProps: {circleID: announcement.circleID, name: '', image: ''}},
                                    screen: ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME
                                })
                             }))
                        ],
                        [
                            new SearchListKey({displayTitle:'Recommended'}),
                            [...recommendedContentList].map((content) => new SearchListValue({displayType: ListItemTypesEnum.CONTENT_ARCHIVE, displayItem: content }))
                        ],
                    ])}
                footerItems={[
                    <Flat_Button
                        text='View More'
                        onPress={() => {
                            dispatch(setTabFocus(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME));
                            navigation.navigate(ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME);
                        }}
                    />
                ]}
            />

            {newPartner &&
                <PartnershipContractModal
                    visible={newPartner !== undefined}
                    partner={newPartner}
                    acceptPartnershipRequest={(id, partnerItem) => 
                        axios.post(`${DOMAIN}/api/partner-pending/`+ newPartner.userID + '/accept', {}, {headers: {jwt}})
                            .then((response:AxiosResponse) => {
                                setNewPartner(undefined);
                                dispatch(removePartnerPendingUser(id));
                                if(newPartner.status === PartnerStatusEnum.PENDING_CONTRACT_USER) dispatch(addPartner(partnerItem));
                                else dispatch(addPartnerPendingPartner(partnerItem));
                            })
                            .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}))
                    }
                    declinePartnershipRequest={(id, partnerItem) => 
                        axios.delete(`${DOMAIN}/api/partner-pending/`+ newPartner.userID + '/decline', {headers: {jwt}})
                            .then((response:AxiosResponse) => { 
                                setNewPartner(undefined); 
                                dispatch(removePartnerPendingUser(id)); 
                            })
                            .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}))}
                    onClose={() => setNewPartner(undefined)}
                />
        }
        </SafeAreaView>
    );
};
    

export default DashboardDisplay;


const styles = StyleSheet.create({
    ...theme,
    pageContainer: {
        backgroundColor: COLORS.black,
        flex: 1,
    },
    headerContainer: {        
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 0,
    },
    headerIcon: {
        height: FONT_SIZES.XL,
        width: FONT_SIZES.XL,
    }
});
