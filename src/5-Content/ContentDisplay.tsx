import { DOMAIN } from "@env";
import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, RADIUS } from "../theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/toast-types";
import ToastQueueManager from "../utilities/ToastQueueManager";
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import { ContentSourceEnum, ContentTypeEnum, MOBILE_SUPPORTED_CONTENT_SOURCES, MOBILE_SUPPORTED_CONTENT_TYPES } from "../TypesAndInterfaces/config-sync/input-config-sync/content-field-config";
import ContentCard from "./ContentCard";
import Ionicons from "react-native-vector-icons/Ionicons";


const ContentDisplay = (props:{callback?:(() => void), navigation:NativeStackNavigationProp<any, string, undefined>}):JSX.Element => {

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);

    const [contentList, setContentList] = useState<ContentListItem[]>([]);
    const [selectedContent, setSelectedContent] = useState<ContentListItem | undefined>(undefined);
    const [filterType, setFilterType] = useState<ContentTypeEnum | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

    useEffect(() => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/content-list', { headers: { jwt: jwt }})
        .then((response:{data:ContentListItem[]}) => setContentList([...response.data]
            .filter((content:ContentListItem) => MOBILE_SUPPORTED_CONTENT_SOURCES.includes(content.source as ContentSourceEnum)))) //Custom strings won't match
        .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));        
    }, []);
  
    
      return (
        <View style={styles.contentPage}>
          <View style={styles.searchHeader} >
              {(searchTerm === undefined) ?
                <View style={styles.filterContainer}>
                  {[...MOBILE_SUPPORTED_CONTENT_TYPES].map((type:ContentTypeEnum, index:number) => (
                    <TouchableOpacity key={`${type}-${index}`} onPress={() => setFilterType((filterType === type) ? undefined : type)} >
                        <Text style={(type === filterType) ? styles.filterSelected : styles.filterNotSelected}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                : <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              }
              <TouchableOpacity style={styles.searchIcon}
                onPress={() => setSearchTerm((searchTerm === undefined) ? '' : undefined)}
              >
                <Ionicons 
                    name="search-outline"
                    color={COLORS.white}
                    size={theme.header.fontSize}
                    onPress={() => setSearchTerm((searchTerm === undefined) ? '' : undefined)}
                />
              </TouchableOpacity>
          </View>
          <ScrollView >
            {[...contentList].map((content: ContentListItem, index: number) => (
              <ContentCard key={`content-${content.contentID}-${index}`} item={content} 
                onPress={(item) => setSelectedContent(item)} />
            ))}
        </ScrollView>
        </View>
      );
    };
    


    const styles = StyleSheet.create({
      ...theme,
      contentPage: {
        backgroundColor: COLORS.black,
        flex: 1,
        width: '100%'
      },
      searchHeader: {
        width: "100%",
        height: theme.header.fontSize + 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 5,
        paddingVertical: 10,
      },
      searchIcon: {
        position: "absolute",
        left: 5,
        top: 5
      },
      searchInput: {
        width: "100%",
        paddingLeft: theme.header.fontSize + 10,
        paddingBottom: 2,

        ...theme.title,
        borderBottomWidth: 1,
        borderColor: COLORS.accent
      },
      filterContainer: {
        flexDirection: "row",
        marginHorizontal: theme.header.fontSize + 10,
        padding:0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: RADIUS,
      },
      filterSelected: {
        ...theme.title,
        paddingVertical: 1,
        paddingHorizontal: 10,
        backgroundColor: COLORS.primary
      },
      filterNotSelected: {
        ...theme.title,
        paddingVertical: 1,
        paddingHorizontal: 10,
        color: COLORS.grayDark
      },      
      overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.transparentBlack,
        justifyContent: 'center',
        alignItems: 'center',
      },
      backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
      },
      webView: {
        width: '100%',
        height: '100%',
      },
    });

export default ContentDisplay;
