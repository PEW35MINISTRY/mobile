import axios, { AxiosError } from 'axios';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SearchFilterIdentifiable, SearchListKey, SearchListValue} from './searchList-types';
import { ContentListItem } from '../../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import SearchDetail, { SearchTypeInfo, DisplayItemType, SearchType, ListItemTypesEnum, SEARCH_MIN_CHARS } from '../../TypesAndInterfaces/config-sync/input-config-sync/search-config';
import { useAppSelector } from '../../TypesAndInterfaces/hooks';
import { ServerErrorResponse } from '../../TypesAndInterfaces/config-sync/api-type-sync/toast-types';
import ToastQueueManager from '../../utilities/ToastQueueManager';
import { Page_Title, Raised_Button, Tab_Selector } from '../../widgets';
import ContentCard from '../../5-Content/ContentCard';
import theme, { COLORS } from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DOMAIN } from '@env';
import { ContentSearchFilterEnum } from '../../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';
import debounce from '../../utilities/debounceHook';


/*********************************************************************************
 *                DYNAMIC SEARCH & DISPLAY LIST                                  *
 *  Full Page List View Dynamically Populates base on ListItemType               *
 *  Handles Relevant Searching, Filtering, toggling multi List Display           *
 *  Callbacks available of onPress, action buttons, and filter by sub properties *
 *********************************************************************************/
const SearchList = ({...props}:{key:any, pageTitle?:string, displayMap:Map<SearchListKey, SearchListValue[]>, showMultiListFilter?:boolean, filterOptions?:string[], onFilter?:(listValue:SearchListValue, appliedFilter?:SearchFilterIdentifiable) => boolean, headerItems?:JSX.Element[], footerItems?:JSX.Element[]}) => {
    const jwt:string = useAppSelector((state) => state.account.jwt);

    /* Properties for Auto-hiding Sticky Header Handling */
    const scrollPosition = useRef<Animated.Value>(new Animated.Value(0)).current;
    const lastScrollPosition = useRef(0);
    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef<View>(null);

    /* Search List State */
    const [displayList, setDisplayList] = useState<SearchListValue[]>([]);
    const [selectedKey, setSelectedKey] = useState<SearchListKey>(new SearchListKey({displayTitle: 'Default'}));
    const [searchCacheMap, setSearchCacheMap] = useState<Map<string, SearchListValue>|undefined>(undefined); //Quick pairing for accurate button options
    const [appliedFilter, setAppliedFilter] = useState<SearchFilterIdentifiable | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState<string|undefined>(undefined);
    const [lastEmptySearchTerm, setLastEmptySearchTerm] = useState<string|undefined>(undefined); //Efficiently detect failed sequential searches

    /* Utility displayMap Accessors */
    const getKey = (keyTitle:string = selectedKey.displayTitle):SearchListKey => Array.from(props.displayMap.keys()).find((k) => k.displayTitle === keyTitle) || new SearchListKey({displayTitle: 'Default'});
    const getList = (keyTitle:string = selectedKey.displayTitle):SearchListValue[] => props.displayMap.get(getKey(keyTitle)) || [];
    const getSearchDetail = (searchType:SearchType = selectedKey.searchType):SearchTypeInfo<DisplayItemType> => SearchDetail[selectedKey.searchType];

    const getListTitles = (filterEmptyLists:boolean = false):string[] => Array.from(props.displayMap.entries())
        .filter(([key, valueList]:[SearchListKey, SearchListValue[]]) => !filterEmptyLists || valueList.length > 0)
        .map(([key, valueList]:[SearchListKey, SearchListValue[]]) => key.displayTitle);

    const getKeyIndex = (keyTitle:string = selectedKey.displayTitle):number|undefined => {
        const index = Array.from(props.displayMap.keys()).findIndex((k) => k.displayTitle === keyTitle);
        return index !== -1 ? index : undefined;
    };
    
    const getFilterIndex = (filterOption?:string): number | undefined => {
        if (appliedFilter === undefined || props.filterOptions === undefined) return undefined;
        else if(filterOption === undefined) filterOption = appliedFilter.filterOption;
        const index = props.filterOptions.findIndex((option) => option === filterOption);
        return index !== -1 ? index : undefined;
    };

    /* Setup Default List */
    //Note: Currently not supporting multiple list types like portal
    const getDefaultDisplayList = ():SearchListValue[] => {
        const defaultList:SearchListValue[] = [];
        const firstEntry:[SearchListKey, SearchListValue[]] | undefined = Array.from(props.displayMap.entries()).find(([key, itemList]) => itemList.length > 0);
        if(firstEntry !== undefined) {
            defaultList.push(...firstEntry[1]);
            setSelectedKey(firstEntry[0] || new SearchListKey({displayTitle: 'Default'}));
        }
        return defaultList;
    }

    useLayoutEffect(() => {        
        setDisplayList(getDefaultDisplayList());
    },[props.displayMap]);


    /**************************************************************
     *                          SERVER SEARCH
     * Use Cache list of current items to optimize button settings
     * *************************************************************/
    const executeSearch = async(value:string|undefined = searchTerm) => { //copy over primary/alternative button settings (optimize buttons)
        if(value === undefined || value.length === 0 || selectedKey.searchType === undefined 
            || selectedKey.searchType === SearchType.NONE || (lastEmptySearchTerm && value.includes(lastEmptySearchTerm))) {
                ToastQueueManager.show({message: 'Searching Unavailable'});
                return;
        }

        const selectedDetail:SearchTypeInfo<DisplayItemType> = getSearchDetail();
        const params:{[key: string]:string} = { search:value };
        if(selectedDetail.searchFilterList.length > 0 && selectedKey.searchFilter !== undefined) params['filter'] = ContentSearchFilterEnum.MOBILE;
        if(process.env.SEARCH_IGNORE_CACHE === 'true') params['ignoreCache'] = 'true';

        await axios.get(`${DOMAIN}` + selectedDetail.route, { headers: { jwt }, params} )
            .then((response:{status:number, data:DisplayItemType[]}) => {
                //No matches found
                if(response.status === 205) {
                    setDisplayList([]);
                    setLastEmptySearchTerm(value);
                    ToastQueueManager.show({message: 'No Matches Found'});
                    return;
                }

                const cacheMap:Map<string, SearchListValue> = searchCacheMap || assembleSearchButtonCache();
                const resultList:SearchListValue[] = [];  
                const displayType:ListItemTypesEnum = selectedDetail.itemType;

                Array.from(response.data).forEach((displayItem) => {
                    const itemID:number = selectedDetail.getID(displayItem);
                    let listValueItem:SearchListValue|undefined = cacheMap.get(`${selectedKey.searchType}-${itemID}`); //First attempt local cache

                    if(listValueItem === undefined) {
                        listValueItem = new SearchListValue({displayType, displayItem: displayItem, 
                            onClick: selectedKey.onSearchClick,
                            primaryButtonText: selectedKey.searchPrimaryButtonText,
                            onPrimaryButtonCallback: selectedKey.onSearchPrimaryButtonCallback,
                            alternativeButtonText: selectedKey.searchAlternativeButtonText,
                            onAlternativeButtonCallback: selectedKey.onSearchAlternativeButtonCallback
                        });
                    }
                    resultList.push(listValueItem);
                });

                //Attempt to apply current Filter, no matches reset filter, list could still be empty
                const applyActiveFilter:boolean = (appliedFilter !== undefined) && (props.onFilter !== undefined)
                    && resultList.some((item:SearchListValue) => props.onFilter && props.onFilter(item, appliedFilter));

                if(applyActiveFilter)
                    setDisplayList(resultList.filter((item:SearchListValue) => props.onFilter && props.onFilter(item, appliedFilter)));
                else {
                    setDisplayList(resultList);
                    setAppliedFilter(undefined);
                }

            }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    
    //Save Map as: 'type-id' : SearchListValue = CIRCLE-1 : {...}
    const assembleSearchButtonCache = ():Map<string, SearchListValue> => { 
        const selectedDetail:SearchTypeInfo<DisplayItemType> = getSearchDetail();
        const cacheMap = new Map();
        Array.from(props.displayMap.values()).reverse().flatMap(list => list).forEach((item:SearchListValue) => {
            const itemID:number = selectedDetail.getID(item.displayItem);
            if(itemID > 0)
                cacheMap.set(`${item.displayType}-${selectedDetail.getID(item.displayItem)}`, item);
        });
        setSearchCacheMap(cacheMap);
        return cacheMap;
    }


    /*****************************************
     *   APPLY FILTER to current displayList *
     * props.onFilter determines filter      *
     * ***************************************/
    const onApplyFilter = (filterOption:string) => {
        if(!props.filterOptions || !props.filterOptions.includes(filterOption) || (displayList.length === 0)) {
            setAppliedFilter(undefined);
            ToastQueueManager.show({message: 'Filter Unavailable'});
            return;
        }
        const currentList:SearchListValue[] = appliedFilter ? getList() : displayList;
        setDisplayList(currentList.filter((item:SearchListValue) => !props.onFilter || props.onFilter(item, appliedFilter)));
        setAppliedFilter({filterOption, listKeyTitle: selectedKey.displayTitle});
    }


    /******************
     * Input Handlers *
     ******************/
    //Delay Search until typing pauses
    const onExecuteSearch = useCallback(debounce(executeSearch, 1500), [searchTerm]);

    const onSearchInput = (value:string = '') => {
        setSearchTerm(value);
        if(value.length >= SEARCH_MIN_CHARS && (searchTerm?.trim() !== value.trim()))
            onExecuteSearch(value);
    }

    const onListSelection = (keyTitle:string) => {
        setSelectedKey(getKey(keyTitle));
        setDisplayList(getList(keyTitle));
        setAppliedFilter(undefined);
        setSearchTerm(undefined);
    }

    const resetPage = (keyTitle?: string):void => {
        setSelectedKey(getKey(keyTitle));
        setDisplayList((!keyTitle || (keyTitle.length === 0)) ? getDefaultDisplayList() : getList(keyTitle));
        setAppliedFilter(undefined);
        setSearchTerm(undefined);
        setSearchCacheMap(undefined);
        ToastQueueManager.show({message: 'Page Reset'});
    };


    /*******************************************************
     *       AUTO-HIDING STICKY HEADER HANDLING            *
     * Hides on scroll down, reappears on slight scroll up *
     *******************************************************/
    const headerTranslate = scrollPosition.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight],
        extrapolate: 'clamp',
    });

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollPosition } } }],
        {
            useNativeDriver: true,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const currentY = event.nativeEvent.contentOffset.y;
                setIsScrollingDown(currentY > lastScrollPosition.current);
                lastScrollPosition.current = currentY;
            },
        }
    );

    const showHeader = ():boolean =>
        (searchTerm !== undefined)
        || (props.pageTitle !== undefined)
        || (props.showMultiListFilter && getListTitles().length > 1)
        || (props.filterOptions !== undefined)
        || (selectedKey.searchType !== SearchType.NONE);

    return (
        <View style={styles.container}>
            {showHeader() &&
                <Animated.View ref={headerRef} 
                    style={[ styles.headerContainer, { transform: [{ translateY: isScrollingDown ? headerTranslate : 0 }] } ]}
                    onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
                >

                    {(searchTerm !== undefined) ?
                        <TextInput
                            style={styles.searchInput}
                            placeholder={'Search...'}
                            placeholderTextColor={COLORS.accent}
                            value={searchTerm}
                            onChangeText={onSearchInput}
                            onSubmitEditing={() => executeSearch()}
                        />
                    : (props.pageTitle !== undefined) &&
                        <Page_Title title={props.pageTitle} containerStyle={styles.titleContainer} />
                    }
                    {(props.showMultiListFilter && getListTitles().length > 1) &&
                        <Tab_Selector
                            optionList={getListTitles()}
                            defaultIndex={getKeyIndex()}
                            onSelect={(title:string, index:number) => onListSelection(title)}
                            containerStyle={styles.tabHeaderContainer}
                            textStyle={styles.title}
                        />
                    }
                    { (props.filterOptions !== undefined) &&
                        <Tab_Selector
                            optionList={props.filterOptions}
                            defaultIndex={getFilterIndex()}
                            onSelect={(item:string, index:number) => onApplyFilter(item)}
                            onDeselect={() => setDisplayList(getList())}
                            containerStyle={styles.tabHeaderContainer}
                            textStyle={styles.title}
                        />
                    }
                    {(selectedKey.searchType !== SearchType.NONE) &&
                        <Ionicons 
                            name='search-outline'
                            color={COLORS.accent}
                            size={theme.title.fontSize}
                            style={styles.searchIcon}
                            onPress={() => setSearchTerm((searchTerm === undefined) ? '' : undefined)}
                        />
                    }
                </Animated.View>
            }

            {(displayList.length === 0) ?
                <View style={styles.resetWrapper} >
                    <Raised_Button 
                        text={`Reset Page`}
                        onPress={() => resetPage()}
                    />
                </View>

            : <Animated.ScrollView style={[styles.displayScrollList, { paddingTop: headerHeight }]} onScroll={onScroll} scrollEventThrottle={16} >
                {(props.headerItems !== undefined) && (searchTerm === undefined) &&
                    props.headerItems.map((item:JSX.Element, index) => (
                        <React.Fragment key={`${props.key}-header-${index}`}>
                            {item}
                        </React.Fragment>
                ))}

                {displayList.map((item: SearchListValue, index) => (
                    <React.Fragment key={`${props.key}-${index}`}>
                        { item.displayType === ListItemTypesEnum.CONTENT_ARCHIVE ? (
                            <ContentCard {...item} item={item.displayItem as ContentListItem} onPress={item.onClick} />
                        ) : (
                            <Text>ERROR</Text>
                        )}
                    </React.Fragment>
                ))}

                {(props.footerItems !== undefined) && (searchTerm === undefined) &&
                    props.footerItems.map((item:JSX.Element, index) => (
                        <React.Fragment key={`${props.key}-footer-${index}`}>
                            {item}
                        </React.Fragment>
                ))}
              </Animated.ScrollView>
            }
        </View>
    );
}

export default SearchList;


const styles = StyleSheet.create({
    ...theme,
    container: {
        backgroundColor: COLORS.black,
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: COLORS.black,

        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',

        paddingHorizontal: 5,
        paddingVertical: 15,
    },  
    searchHeaderField: {
        flex: 1,
        paddingHorizontal: theme.header.fontSize + 10,
        marginBottom: theme.header.fontSize / 4,
    },
    searchInput: {
        width: '100%',
        paddingLeft: theme.header.fontSize + 10,
        marginBottom: theme.header.fontSize / 4,

        ...theme.text,
        color: COLORS.white,
        borderBottomWidth: 1,
        borderColor: COLORS.accent
    },  
    titleContainer: {
        padding: 0,
        marginHorizontal: theme.header.fontSize + 10,
        marginBottom: theme.header.fontSize / 4,
     },
    searchHeaderSearch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabHeaderContainer: {
        marginBottom: theme.title.fontSize / 4,
    },
    searchIcon: {
        position: 'absolute',
        zIndex: 2,
        left: 5,
        top: 10,
    },
    displayScrollList: {
        flex: 1,
    },
    resetWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
