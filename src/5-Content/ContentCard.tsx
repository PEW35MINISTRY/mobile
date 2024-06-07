import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Linking, Dimensions, Modal } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import YoutubePlayer from 'react-native-youtube-iframe';
import { DOMAIN } from '@env';
import theme, { COLORS, RADIUS } from '../theme';
import { ContentListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/content-types';
import { makeDisplayText } from '../utilities/utilities';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { ContentSourceEnum, extractYouTubeVideoId } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';
import { BackButton, IconCounter } from '../widgets';
import { ContentThumbnail } from './content-widgets';



interface ContentCardProps {
  key:string,
  item:ContentListItem;
  onPress?:(item:ContentListItem) => void;
  style?:StyleProp<ViewStyle>;
  onKeywordPress?:(keyword:string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ key, item, onPress, style, onKeywordPress }) => {

  const userID = useAppSelector((state: RootState) => state.account.userID);  
  const [showDescription, setShowDescription] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);

  return (
    <View key={`content-${key}`} style={StyleSheet.flatten([styles.card, style])} >
        <ContentThumbnail imageUri={item.image} contentSource={item.source} onPress={() => {
          if(onPress) onPress(item);
          if(item.url && item.url.length > 5) { //Already filtered by MOBILE_CONTENT_SUPPORTED_SOURCES
            if(item.source === ContentSourceEnum.YOUTUBE) setShowYouTube(true);
            else openInAppBrowser(item.url);
          }
        }} />

        <TouchableOpacity onPress={() => setShowDescription(current => !current)} >
          <View style={styles.footerVertical}>
            <View style={styles.footerTitleRow}>
              <Text style={styles.title}>{item.title}</Text>
              <IconCounter 
                initialCount={item.likeCount}
                ionsIconsName='thumbs-up-outline'
                postURL={`${DOMAIN}/api/user/`+ userID + '/content/' + item.contentID + '/like'}
              />
            </View>
            <View style={styles.footerDetailRow}>
              <Text style={styles.detailText} numberOfLines={1} ellipsizeMode='tail' >{makeDisplayText(item.source)}</Text>
              <Text style={styles.verticalDivider}>|</Text>
              <View style={styles.tagContainer}>
                {item.keywordList.map((keyword, index) => (
                  <TouchableOpacity key={`${keyword}-${index}`} onPress={() => onKeywordPress && onKeywordPress(keyword)}>
                    <Text style={styles.tag}>#{makeDisplayText(keyword)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {(showDescription && item.description && item.description.length > 0) &&
              <View style={styles.descriptionContainer}>
                <Text style={styles.text} >{item.description}</Text>
              </View>
            }

          <Modal
            visible={showYouTube}
            animationType="slide"
            onRequestClose={() => setShowYouTube(false)}
          >
            <View style={styles.youTubePlayerPage}>
              <BackButton callback={() => setShowYouTube(false)}
              />
              <View style={styles.youTubePlayer}>
                <YoutubePlayer
                  height={Dimensions.get('window').height * 0.5}
                  width={Dimensions.get('window').width}
                  videoId={extractYouTubeVideoId(item.url) || ''}
                  play={true}
                />
              </View>
            </View>
          </Modal>
        </View>
      </TouchableOpacity>
    </View>
  );
}



/*********************
 * CONTENT UTILITIES *
 *********************/

const openInAppBrowser = async (url: string): Promise<void> => {
  try {
    const isAvailable = await InAppBrowser.isAvailable();
    if (!isAvailable) throw new Error('InAppBrowser Unavailable');

    await InAppBrowser.open(url, {
       // IOS Options
       dismissButtonStyle: 'done',
       preferredBarTintColor: COLORS.primary,
       preferredControlTintColor: COLORS.accent,
       readerMode: false,
       animated: true,
       modalPresentationStyle: 'fullScreen',
       modalTransitionStyle: 'coverVertical',
       modalEnabled: true,

       // Android Options
       showTitle: false,
       toolbarColor: COLORS.primary,
       secondaryToolbarColor: COLORS.accent,
       enableUrlBarHiding: true,
       enableDefaultShare: true,
       forceCloseOnRedirection: false,
    });
  } catch (error) {
    console.error('ERROR - ContentCard - Failed to open browser - ', url, error);
    Linking.openURL(url); // Fallback to system browser
  }
};


/******************
 * CONTENT STYLES *
 ******************/

const styles = StyleSheet.create({
  ...theme,
  card: {
    width: '100%',
    margin: 0,
    marginBottom: 10,
    borderRadius: RADIUS,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: COLORS.grayDark,
  },
  footerVertical: {
    flexDirection: 'column',
    justifyContent: 'flex-start',

    borderTopWidth: 0.5,
    borderTopColor: COLORS.grayLight,

    margin: 0,
    paddingHorizontal: 5,
    paddingBottom: 5,
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

    color: COLORS.accent,
    marginRight: 5,
    overflow: 'hidden',
  },
  descriptionContainer: {
    padding: 5,
  },
  youTubePlayerPage: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  youTubePlayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContentCard;
