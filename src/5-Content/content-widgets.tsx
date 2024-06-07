import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, ImageStyle, ImageSourcePropType, Dimensions, TouchableOpacity } from 'react-native';
import { ContentSourceEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';


/* Content Default Thumbnails */
const MEDIA_DEFAULT = require('../../assets/media-blue.png');
const GOT_QUESTIONS = require('../../assets/got-questions.png');
const BIBLE_PROJECT = require('../../assets/bible-project.png');
const THROUGH_THE_WORD = require('../../assets/through-the-word.png');

export const ContentThumbnail = (props:{imageUri:string|undefined, contentSource:ContentSourceEnum, onPress?:()=>void, style?:ImageStyle}):JSX.Element => {
 
    const getDefaultThumbnail = (itemSource:ContentSourceEnum) =>
        itemSource === 'GOT_QUESTIONS' ? GOT_QUESTIONS
        : itemSource === 'BIBLE_PROJECT' ? BIBLE_PROJECT
        : itemSource === 'THROUGH_THE_WORD' ? THROUGH_THE_WORD
        : MEDIA_DEFAULT;

    const [image, setImage] = useState<ImageSourcePropType>(getDefaultThumbnail(props.contentSource));
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    const setDefaultThumbnail = () => {
        const defaultThumbnail = getDefaultThumbnail(props.contentSource);
        const { width, height } = Image.resolveAssetSource(defaultThumbnail);
        setImage(defaultThumbnail);
        setAspectRatio(width / height);
    };

    useEffect(() => {
        if (props.imageUri) {
            setImage({ uri: props.imageUri });
            Image.getSize(props.imageUri, (width, height) => {
                setAspectRatio(width / height);
            }, setDefaultThumbnail);
        } else
            setDefaultThumbnail();
    }, [props.imageUri, props.contentSource]);

    const styles = StyleSheet.create({
        thumbnail: {
            width: '100%',
            resizeMode: 'contain',
            ...props.style
        },
    });

    return (<TouchableOpacity onPress={() => props.onPress && props.onPress()} >
                <Image source={image} onError={setDefaultThumbnail} 
                    style={[styles.thumbnail, { width: Dimensions.get('window').width, height: (Dimensions.get('window').width / aspectRatio) }]} /> 
            </TouchableOpacity>);
}
