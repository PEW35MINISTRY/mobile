import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Image, StyleSheet, ImageStyle, ImageSourcePropType, Dimensions, TouchableOpacity } from 'react-native';
import { ContentSourceEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/content-field-config';


/* Content Default Thumbnails */
const MEDIA_DEFAULT = require('../../assets/media-blue.png');
const GOT_QUESTIONS = require('../../assets/got-questions.png');
const BIBLE_PROJECT = require('../../assets/bible-project.png');
const THROUGH_THE_WORD = require('../../assets/through-the-word.png');

export const ContentThumbnail = (props:{imageUri:string|undefined, contentSource:ContentSourceEnum, onPress?:()=>void, style?:ImageStyle}):JSX.Element => {
 
    const getDefaultThumbnail = () =>
        props.contentSource === ContentSourceEnum.GOT_QUESTIONS ? GOT_QUESTIONS
        : props.contentSource === ContentSourceEnum.BIBLE_PROJECT ? BIBLE_PROJECT
        : props.contentSource === ContentSourceEnum.THROUGH_THE_WORD ? THROUGH_THE_WORD
        : MEDIA_DEFAULT;

    const [image, setImage] = useState<ImageSourcePropType>(getDefaultThumbnail());
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    const setDefaultThumbnail = () => {
        const defaultThumbnail = getDefaultThumbnail();
        const { width, height } = Image.resolveAssetSource(defaultThumbnail);
        setImage(defaultThumbnail);
        setAspectRatio(width / height);
    };

    useLayoutEffect(() => {
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
