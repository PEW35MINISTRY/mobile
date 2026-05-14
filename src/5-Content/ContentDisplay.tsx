import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { removeRecommendedContent, RootState } from '../redux-store';
import { DOMAIN } from '@env';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import { ContentSourceEnum, ContentTypeEnum, MOBILE_CONTENT_SUPPORTED_SOURCES } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';
import SearchList from '../Widgets/SearchList/SearchList';
import { SearchFilterIdentifiable, SearchListKey, SearchListValue } from '../Widgets/SearchList/searchList-types';
import { DisplayItemType, ListItemTypesEnum, SearchType } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';
import { Modal } from 'react-native';
import { Confirmation } from '../widgets';
import { set } from 'react-hook-form';


/************************
 * CONTENT DISPLAY PAGE *
 ************************/

const MOBILE_SUPPORTED_CONTENT_TYPES = [ContentTypeEnum.ARTICLE, ContentTypeEnum.VIDEO];

const ContentDisplay = (props:{callback?:(() => void), navigation:NativeStackNavigationProp<any, string, undefined>}):JSX.Element => {

    const jwt:string = useAppSelector((state:RootState) => state.account.jwt);
    const userID:number = useAppSelector((state:RootState) => state.account.userID);

    const [contentList, setContentList] = useState<ContentListItem[]>([]); //Apply filtering locally
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportedContentID, setReportedContentID] = useState<number>(0);

    const dispatch = useAppDispatch();

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }   
    }

    const reportContent = async () => {
        await axios.post(`${DOMAIN}/api/content-archive/${reportedContentID}/report`, {}, RequestAccountHeader).then(() => {

        setReportModalVisible(false);
        setContentList(current => current.filter(content => content.contentID !== reportedContentID));
        dispatch(removeRecommendedContent(reportedContentID));
        
        setReportedContentID(-1);
        ToastQueueManager.show({message: 'Report received'})

        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    useEffect(() => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/content-list', { headers: { jwt }})
        .then((response:{data:ContentListItem[]}) => {
          const list:ContentListItem[] = [...response.data]
            .filter((content:ContentListItem) => MOBILE_CONTENT_SUPPORTED_SOURCES.includes(content.source as ContentSourceEnum));
          setContentList(list);
        }) //Custom strings won't match
        .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));        
    }, []);
  
    
      return (
        <React.Fragment>
        <SearchList
                key='content-page'
                name='content-page'
                filterOptions={MOBILE_SUPPORTED_CONTENT_TYPES}
                onFilter={(listValue:SearchListValue, appliedFilter?:SearchFilterIdentifiable) => ((listValue.displayItem as ContentListItem).type === ContentTypeEnum[appliedFilter?.filterOption as keyof typeof ContentTypeEnum])}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Content', searchType: SearchType.CONTENT_ARCHIVE }),
                            [...contentList].map((content) => new SearchListValue({displayType: ListItemTypesEnum.CONTENT_ARCHIVE, displayItem: content, onAlternativeButtonCallback: (id, item) => { setReportedContentID(id); setReportModalVisible(true); }}))
                        ],
                    ])}
            />
            <Modal 
                visible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <Confirmation 
                    callback={() => reportContent()}
                    onCancel={() => setReportModalVisible(false)}
                    promptText={'report this content? This action will remove this content from your feed and send a report to our team for review.'}
                    buttonText='Report'
                    addPunctuation={false}
                />
            </Modal>
        </React.Fragment>
      );
    };
    

export default ContentDisplay;
