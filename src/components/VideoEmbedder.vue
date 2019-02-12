<style lang="scss" scoped>
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
                    <template v-else>
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
    </div>
</template>

<script>

/*
    Vimeo and YouTube video creator - takes a source URL (either Vimeo or YouTube - and either direct link or embed code) and creates a wrapper
    for the video that includes things like thumbnail creation, dynamic state readings, and maybe other cool stuff eventually idk. The YouTube
    and Vimeo systems share basically no code - I tried to break them out as much as possible, so one isn't reliant on the same variables that the other may be. It was important to me to make this one component, which is why there isn't just a YouTube component and a Vimeo one - I wanted a good, catch-all solution. Hopefully this is it.
*/

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
        volume: {
            type: Number,
            required: false,
            default: 0.5,
            validator: (val) => {
                // Volume can only be between 0 and 1
                return ((Math.round(val * 100) / 100) === val && val >= 0 && val <= 1);
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
            hasPlayed: false,
        };
    },
    mounted () {
        if (this.provider === YOUTUBE) this.initYouTubeVideo();
        else if (this.provider === VIMEO) this.initVimeoVideo();
    },
    computed: {
        videoPlayerID () {
            return "video-player-" + this.videoID;
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
            var srcFragments = this.src.split('/');
            return srcFragments[srcFragments.length - 1]
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