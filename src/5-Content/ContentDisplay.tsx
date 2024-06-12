import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { RootState } from '../redux-store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DOMAIN } from '@env';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import theme, { COLORS } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/toast-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import { ContentSourceEnum, ContentTypeEnum, MOBILE_CONTENT_SUPPORTED_SOURCES } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';
import ContentCard from './ContentCard';
import { Tab_Selector } from '../widgets';


/************************
 * CONTENT DISPLAY PAGE *
 ************************/

const MOBILE_SUPPORTED_CONTENT_TYPES = [ContentTypeEnum.ARTICLE, ContentTypeEnum.VIDEO];

const ContentDisplay = (props:{callback?:(() => void), navigation:NativeStackNavigationProp<any, string, undefined>}):JSX.Element => {

    const jwt = useAppSelector((state:RootState) => state.account.jwt);
    const userID = useAppSelector((state:RootState) => state.account.userID);

    const [contentOriginalList, setContentOriginalList] = useState<ContentListItem[]>([]);
    const [contentList, setContentList] = useState<ContentListItem[]>([]); //Apply filtering locally
    const [filterType, setFilterType] = useState<ContentTypeEnum | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

    useEffect(() => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/content-list', { headers: { jwt }})
        .then((response:{data:ContentListItem[]}) => {
          const list:ContentListItem[] = [...response.data]
            .filter((content:ContentListItem) => MOBILE_CONTENT_SUPPORTED_SOURCES.includes(content.source as ContentSourceEnum));
          setContentList(list) ;
          setContentOriginalList(list);
        }) //Custom strings won't match
        .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));        
    }, []);

    useEffect(() => {
        setContentList((filterType !== undefined) ? contentOriginalList.filter(item => item.type === filterType) : contentOriginalList);
    }, [contentOriginalList, filterType]);
  
    
      return (
        <View style={styles.contentPage}>
          <View style={styles.searchHeader} >
              {(searchTerm === undefined) ?
                <Tab_Selector
                    optionList={MOBILE_SUPPORTED_CONTENT_TYPES}
                    defaultIndex={(filterType !== undefined) ? MOBILE_SUPPORTED_CONTENT_TYPES.indexOf(filterType) : undefined}
                    onSelect={(item:string, index:number) => setFilterType(MOBILE_SUPPORTED_CONTENT_TYPES[index])}
                    onDeselect={() => setFilterType(undefined)}
                    isHeader={true}
                    style={styles.filterContainer}
                  />
                : <TextInput
                    style={styles.searchInput}
                    placeholder={'Search...'}
                    placeholderTextColor={COLORS.accent}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
              }
              <TouchableOpacity style={styles.searchIcon}
                onPress={() => setSearchTerm((searchTerm === undefined) ? '' : undefined)}
              >
                <Ionicons 
                    name='search-outline'
                    color={COLORS.white}
                    size={theme.header.fontSize}
                    onPress={() => setSearchTerm((searchTerm === undefined) ? '' : undefined)}
                />
              </TouchableOpacity>
          </View>
          <ScrollView >
            {[...contentList].map((content: ContentListItem, index: number) => (
              <ContentCard key={`content-${content.contentID}-${index}`} item={content} />
            ))}
        </ScrollView>
        </View>
      );
    };
    

  /***********************
   * CONTENT PAGE STYLES *
   ***********************/

    const styles = StyleSheet.create({
      ...theme,
      contentPage: {
        backgroundColor: COLORS.black,
        flex: 1,
        width: '100%'
      },
      searchHeader: {
        width: '100%',
        height: theme.header.fontSize + 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 5,
        paddingVertical: 10,
      },
      searchIcon: {
        position: 'absolute',
        left: 5,
        top: 5
      },
      searchInput: {
        width: '100%',
        paddingLeft: theme.header.fontSize + 10,
        paddingBottom: 2,

        ...theme.title,
        color: COLORS.white,
        fontSize: 20,
        borderBottomWidth: 1,
        borderColor: COLORS.accent
      },
      filterContainer: {
        marginHorizontal: theme.header.fontSize + 10,
      }
    });

export default ContentDisplay;
