import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { RootState } from '../redux-store';
import { DOMAIN } from '@env';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import { ContentSourceEnum, ContentTypeEnum, MOBILE_CONTENT_SUPPORTED_SOURCES } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';
import SearchList from '../Widgets/SearchList/SearchList';
import { SearchFilterIdentifiable, SearchListKey, SearchListValue } from '../Widgets/SearchList/searchList-types';
import { ListItemTypesEnum, SearchType } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';


/************************
 * CONTENT DISPLAY PAGE *
 ************************/

const MOBILE_SUPPORTED_CONTENT_TYPES = [ContentTypeEnum.ARTICLE, ContentTypeEnum.VIDEO];

const ContentDisplay = (props:{callback?:(() => void), navigation:NativeStackNavigationProp<any, string, undefined>}):JSX.Element => {

    const jwt:string = useAppSelector((state:RootState) => state.account.jwt);
    const userID:number = useAppSelector((state:RootState) => state.account.userID);

    const [contentList, setContentList] = useState<ContentListItem[]>([]); //Apply filtering locally

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
        <SearchList
                key='content-page'
                name='content-page'
                filterOptions={MOBILE_SUPPORTED_CONTENT_TYPES}
                onFilter={(listValue:SearchListValue, appliedFilter?:SearchFilterIdentifiable) => ((listValue.displayItem as ContentListItem).type === ContentTypeEnum[appliedFilter?.filterOption as keyof typeof ContentTypeEnum])}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Content', searchType: SearchType.CONTENT_ARCHIVE }),
                            [...contentList].map((content) => new SearchListValue({displayType: ListItemTypesEnum.CONTENT_ARCHIVE, displayItem: content }))
                        ],
                    ])}
            />
      );
    };
    

export default ContentDisplay;
