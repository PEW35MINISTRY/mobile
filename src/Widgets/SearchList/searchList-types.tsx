import { SearchType, DisplayItemType, ListItemTypesEnum } from "../../TypesAndInterfaces/config-sync/input-config-sync/search-config";


/********************
 * SEARCH LIST TYPES
 * ******************/

export type SearchFilterIdentifiable = {
    filterOption: string; 
    listKeyTitle: string;
};

export class SearchListKey { 
    displayTitle:string;
    showDisplayTitle:boolean | undefined;
    searchType:SearchType;
    searchFilter?:string; //Matches SearchTypeInfo.searchFilterList
    onSearchPress?:(id:number, item:DisplayItemType)=>void;
    searchPrimaryButtonText?:string;
    onSearchPrimaryButtonCallback?:(id:number, item:DisplayItemType)=>void;
    searchAlternativeButtonText?:string;
    onSearchAlternativeButtonCallback?:(id:number, item:DisplayItemType)=>void;

    constructor({...props}:{displayTitle:string, showDisplayTitle?:boolean, searchType?:SearchType, searchFilter?:string, onSearchPress?:(id:number, item:DisplayItemType)=>void, 
        searchPrimaryButtonText?:string, onSearchPrimaryButtonCallback?:(id:number, item:DisplayItemType)=>void, searchAlternativeButtonText?:string, onSearchAlternativeButtonCallback?:(id:number, item:DisplayItemType)=>void}) {
        this.displayTitle = props.displayTitle
        this.showDisplayTitle = props.showDisplayTitle ?? true;
        this.searchType = props.searchType || SearchType.NONE;
        this.searchFilter = props.searchFilter;
        this.onSearchPress = props.onSearchPress;
        this.searchPrimaryButtonText = props.searchPrimaryButtonText;
        this.onSearchPrimaryButtonCallback = props.onSearchPrimaryButtonCallback;
        this.searchAlternativeButtonText = props.searchAlternativeButtonText;
        this.onSearchAlternativeButtonCallback = props.onSearchAlternativeButtonCallback;
    }
}

export class SearchListValue {         //Every list item is wrapped in this view | allows list items of different types
    displayType:ListItemTypesEnum;
    displayItem:DisplayItemType;
    onPress?:(id:number, item:DisplayItemType)=>void;
    primaryButtonText?:string;
    onPrimaryButtonCallback?:(id:number, item:DisplayItemType)=>void;
    alternativeButtonText?:string;
    onAlternativeButtonCallback?:(id:number, item:DisplayItemType)=>void;
    

    constructor({...props}:{displayType:ListItemTypesEnum, displayItem:DisplayItemType, onPress?:(id:number, item:DisplayItemType)=>void, 
        primaryButtonText?:string, onPrimaryButtonCallback?:(id:number, item:DisplayItemType)=>void, alternativeButtonText?:string, onAlternativeButtonCallback?:(id:number, item:DisplayItemType)=>void}) {

        this.displayType = props.displayType;
        this.displayItem = props.displayItem;
        this.onPress = props.onPress;
        this.primaryButtonText = props.primaryButtonText;
        this.onPrimaryButtonCallback = props.onPrimaryButtonCallback;
        this.alternativeButtonText = props.alternativeButtonText;
        this.onAlternativeButtonCallback = props.onAlternativeButtonCallback;
    }
}
