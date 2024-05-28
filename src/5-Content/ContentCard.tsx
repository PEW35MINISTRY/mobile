import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import theme, { COLORS, RADIUS } from '../theme';
import { makeDisplayText } from '../utilities/utilities';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/toast-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';

/* Asset Imports */
const MEDIA_DEFAULT = require('../../assets/media-blue.png');
const GOT_QUESTIONS = require('../../assets/got-questions.png');
const BIBLE_PROJECT = require('../../assets/bible-project.png');
const THROUGH_THE_WORD = require('../../assets/through-the-word.png');


const getSourceImage = (itemSource: string) =>
  itemSource === 'YOUTUBE' ? MEDIA_DEFAULT
  : itemSource === 'GOT_QUESTIONS' ? GOT_QUESTIONS
  : itemSource === 'BIBLE_PROJECT' ? BIBLE_PROJECT
  : itemSource === 'THROUGH_THE_WORD' ? THROUGH_THE_WORD
  : MEDIA_DEFAULT;


interface ContentCardProps {
  item:ContentListItem;
  onPress?:(item:ContentListItem) => void;
  style?:StyleProp<ViewStyle>;
  onKeywordPress?:(keyword:string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onPress, style, onKeywordPress }) => {

  const jwt = useAppSelector((state: RootState) => state.account.jwt);
  const userID = useAppSelector((state: RootState) => state.account.userID);
  const [likeCount, setLikeCount] = useState<number>(item.contentID);
  
  const onLikeContent = (contentID:number) => {
    axios.post(`${DOMAIN}/api/user/`+ userID + '/content/' + contentID + '/like', {}, { headers: { jwt: jwt }})
      .then((response:{data:ContentListItem[]}) => setLikeCount(current => current + 1))
      .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));   
  }

  return (
    <TouchableOpacity onPress={() => onPress && onPress(item)} style={StyleSheet.flatten([styles.card, style])}>
      <View style={styles.imageContainer}>
        <Image source={getSourceImage(item.source)} style={styles.image} />
      </View>
      <View style={styles.footerVertical}>
        <View style={styles.footerTitleRow}>
          <Text style={styles.title}>{makeDisplayText(item.title || item.type)}</Text>
          <TouchableOpacity onPress={() => onLikeContent(item.contentID)}>
            <View style={styles.likeContainer}>
                <Ionicons 
                    name="thumbs-up-outline"
                    color={COLORS.white}
                    size={15}
                />
                <Text style={styles.likeCountText}>{likeCount}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.footerDetailRow}>
          <Text style={styles.detailText}>{makeDisplayText(item.source)}</Text>
          <Text style={styles.verticalDivider}>|</Text>
          <View style={styles.tagContainer}>
            {item.keywordList.map((keyword, index) => (
              <TouchableOpacity key={`${keyword}-${index}`} onPress={() => onKeywordPress && onKeywordPress(keyword)}>
                <Text style={styles.tag}>{makeDisplayText(keyword)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...theme,
  card: {
    width: '100%',
    height: 200,
    marginVertical: 5,
    borderRadius: RADIUS,
    overflow: 'hidden',
    elevation: 2,
    padding: 10,
    margin: 2,
    backgroundColor: COLORS.grayDark,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  footerVertical: {
    flexDirection: 'column',
    justifyContent: 'flex-start',

    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,
    paddingHorizontal: 5,
  },
  footerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: 0,
    paddingTop: 5,
  },
  footerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
  },
  verticalDivider: {
    ...theme.detailText,
    fontWeight: '700',
    marginLeft: 5,
    marginRight: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
  tag: {
    ...theme.detailText,

    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    color: COLORS.accent,
    borderColor: COLORS.accent,
    borderWidth: 0.5,
    borderRadius: RADIUS,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 5,
    paddingVertical: 2,

    borderColor: COLORS.accent,
    borderWidth: 1,
    borderRadius: RADIUS,
  },
  likeCountText: {
    ...theme.text,
    color: COLORS.white,
    paddingHorizontal: 3,
  },
});

export default ContentCard;
