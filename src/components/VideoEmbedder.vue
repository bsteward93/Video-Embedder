<style lang="scss">
    .video-fade-enter-active, .video-fade-leave-active {
        transition: opacity .5s;
    }
    .video-fade-enter,
    .video-fade-leave-to {
        opacity: 0;
    }
    .video-embedder-component {
        width: 100%;
        padding-top: 56.25%;
        position: relative;
        .full-size {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .video-inner {
            z-index: 1;
            div,
            iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        }
        .video-thumbnail-wrapper {
            z-index: 2;
            cursor: pointer;
            span {
                display: block;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 4em;
            }
            i.fa {
                &.fa-circle {
                    color: #fff;
                }
                &.fa-play-circle {
                    color: #005d83;
                }
            }
        }
        .background-video-overlay {
            z-index: 5;
        }
    }
</style>

<template>
    <div class="video-embedder-component video-embedder video-component">
        <transition name="video-fade">
            <div class="video-thumbnail-wrapper full-size" v-if="hasThumbnail && !hasPlayed && !autoplay">
                <div class="video-thumbnail full-size" :style="thumbStyle" @click="playVideoBasedOnProvider">
                    <template v-if="hasDefaultSlot">
                        <slot></slot>
                    </template>
                    <template v-else-if="!backgroundVideo">
                        <span class="fa fa-stack fa-lg">
                            <i class="fa fa-circle fa-stack-2x" aria-hidden="true"></i>
                            <i class="fa fa-play-circle fa-stack-2x" aria-hidden="true"></i>
                        </span>
                    </template>
                </div>
            </div>
        </transition>
        <div class="video-inner full-size">
            <div :id="videoPlayerID"></div>
        </div>
        <div class="background-video-overlay full-size" v-if="backgroundVideo"></div>
    </div>
</template>

<script>

const YOUTUBE = "youtube";
const YOUTUBE_API = "//www.youtube.com/iframe_api";

const VIMEO = "vimeo";
const VIMEO_API = "";

const $ = require('jquery');

const VIDEO_NOT_READY = -5;

import _ from 'lodash';

import youtube from '../mixins/youtube';
import vimeo from '../mixins/vimeo';

export default {
    name: "video-embedder",
    mixins: [ youtube, vimeo ],
    props : {
        src: {
            type: String,
            required: true,
        },
        backgroundVideo: {
            type: Boolean,
            required: false,
            default: false,
        },
        volume: {
            type: Number,
            required: false,
            default: 0.5,
            validator: (val) => {
                // Volume can only be between 0 and 1
                return ((Math.round(val * 100) / 100) === val && val >= 0 && val <= 1);
            },
        },
        quality: {
            type: String,
            required: false,
            validator: (val) => {
                var supportedQualities = [ 'low', 'medium', 'high', ];
                return (supportedQualities.indexOf(val) !== -1);
            },
        },
        autoplay: {
             type: Boolean,
             required: false,
             default: false,
        },
        thumb: {
            type: String,
            required: false,
        },
        debug: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            player: null,
            currentPlayerState: VIDEO_NOT_READY,
            randomId: Math.round(Math.random() * 100000),
            hasPlayed: false,
        };
    },
    mounted () {
        if (this.provider === YOUTUBE) this.initYouTubeVideo();
        else if (this.provider === VIMEO) this.initVimeoVideo();
    },
    computed: {
        videoPlayerID () {
            return `video-player-${this.videoID}-${this.randomId}`;
        },
        hasThumbnail () {
            return Boolean(this.thumb);
        },
        hasDefaultSlot () {
            return !!this.$slots.default;
        },
        provider () {
            if (this.isYouTubeURL) {
                return YOUTUBE;
            };
            if (this.isVimeoURL) {
                return VIMEO;
            };
        },
        videoID () {
            /* 
             * 99 times out of 100, a YouTube of Vimeo link will have one of these formats:
             * https://vimeo.com/67039623
             * https://player.vimeo.com/video/67039623
             * https://www.youtube.com/watch?v=Gs069dndIYk
             * https://www.youtube.com/embed/Gs069dndIYk
             * https://youtu.be/Gs069dndIYk
             * In all cases, the video ID is the last piece of the URL (except where we need to strip out watch?v=).
             */
            var srcFragments = this.src.split('/');
            var presumedVideoID = srcFragments[srcFragments.length - 1];
            presumedVideoID = presumedVideoID.replace('watch?v=', '');
            return presumedVideoID;
        },
        isYouTubeURL () {
            var reg = new RegExp(/youtube/g);
            return reg.test(this.src);
        },
        isVimeoURL () {
            var reg = new RegExp(/vimeo/g);
            return reg.test(this.src);
        },
        thumbStyle () {
            if (!this.hasThumbnail) return {};
            return {
                backgroundImage: 'url("' + this.thumb + '")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            };
        },
        adjustedVolume () {
            switch (this.provider) {
                case YOUTUBE:
                    return this.volume * 100;
                    break;
                case VIMEO:
                    return this.volume;
                    break;
            };
        },
    },
    methods: {

        //----------------------------------------------------------
        // Shared functions
        //-------------------------------------------------------
        playVideoBasedOnProvider () {
            if (this.provider === YOUTUBE) this.YouTubePlayVideo();
            else if (this.provider === VIMEO) this.VimeoPlayVideo();
        },

    },
    watch: {

    },
}
</script>