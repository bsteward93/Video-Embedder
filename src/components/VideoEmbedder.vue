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

import Player from '@vimeo/player';

const YOUTUBE = "youtube";
const YOUTUBE_API = "//www.youtube.com/iframe_api";

const VIMEO = "vimeo";
const VIMEO_API = "";

const $ = require('jquery');

const VIDEO_NOT_READY = -5;

import _ from 'lodash'

export default {
    name: "video-embedder",
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

        //----------------------------------------------------------
        // YouTube-specific computed props
        //-------------------------------------------------------
        YouTubePlayerStates () {
            return typeof YT === "object" ? YT.PlayerState : {};
        },
        YouTubeCurrentPlayerState () {
            if (this.currentPlayerState === this.YouTubePlayerStates.UNSTARTED) return 'UNSTARTED';
            else if (this.currentPlayerState === this.YouTubePlayerStates.BUFFERING) return 'BUFFERING';
            else if (this.currentPlayerState === this.YouTubePlayerStates.PLAYING) return 'PLAYING';
            else if (this.currentPlayerState === this.YouTubePlayerStates.PAUSED) return 'PAUSED';
            else if (this.currentPlayerState === this.YouTubePlayerStates.ENDED) return 'ENDED';
            else return 'UNLOADED';
        },

        //----------------------------------------------------------
        // Vimeo-specific computed props
        //-------------------------------------------------------
        VimeoCurrentPlayerState () {
            if (this.currentPlayerState === this.VimeoPlayerStates.UNSTARTED) return 'UNSTARTED';
            else if (this.currentPlayerState === this.VimeoPlayerStates.BUFFERING) return 'BUFFERING';
            else if (this.currentPlayerState === this.VimeoPlayerStates.PLAYING) return 'PLAYING';
            else if (this.currentPlayerState === this.VimeoPlayerStates.PAUSED) return 'PAUSED';
            else if (this.currentPlayerState === this.VimeoPlayerStates.ENDED) return 'ENDED';
            else return 'UNLOADED';
        },
        VimeoPlayerStates () {
            // These are just the YouTube player states - but YT serves them from the API, and Vimeo doesnt, so we just pretend theyre the same.
            return {
                UNSTARTED: -1,
                BUFFERING: 3,
                CUED: 5,
                PLAYING: 1,
                PAUSED: 2,
                ENDED: 0,
            }
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

        //----------------------------------------------------------
        // YouTube-specific functions
        //-------------------------------------------------------
        initYouTubeVideo () {
            var script = $('script[src="' + YOUTUBE_API + '"]');
            if (this.debug) console.log("Checking for script!");
            if (script.length) {
                if (this.debug) console.log("Script found!");
                this.YouTubeCheckReadyForPlayback();
            } else {
                if (this.debug) console.log("Script NOT found!");
                this.addYouTubeAPI();
            }
        },
        addYouTubeAPI () {
            if (this.debug) console.log("Adding script!");
            var tag = document.createElement('script');
            tag.src = YOUTUBE_API;
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            this.initYouTubeVideo();
        },
        YouTubeCheckReadyForPlayback () {
            if ( typeof YT === "object" && YT.loaded === 1 ) {
                this.prepareYouTubeVideo();
            } else {
                (_.debounce(()=>{
                    if (this.debug) console.log("Script not ready - debouncing!");
                    this.YouTubeCheckReadyForPlayback();
                }, 100))();
            }
        },
        prepareYouTubeVideo () {
            if (this.debug) console.log("Preparing YouTube video:", this.videoID);
            var player = new YT.Player(this.videoPlayerID, {
                width: "100%",
                height: "100%",
                videoId: this.videoID,
                playerVars: {
                    rel: 0,
                },
                events: {
                    'onReady': this.YouTubePlayerReady,
                    'onError': this.YouTubePlayerError,
                    'onStateChange': this.YouTubePlayerStateChange,
                },
            });
            this.player = player;
        },
        YouTubePlayerReady (event) {
            if (this.debug) console.log("Player ready:", event);
            this.currentPlayerState = this.YouTubePlayerStates.UNSTARTED;
            if (this.autoplay) this.YouTubePlayVideo();
        },
        YouTubePlayVideo () {
            if (typeof this.player === "object" && typeof this.player.playVideo === "function") {
                this.hasPlayed = true;
                this.player.setVolume(this.adjustedVolume);
                this.player.playVideo();
            };
        },
        YouTubePlayerError (event) {
            if (this.debug) console.log("Error with player:", event);
        },
        YouTubePlayerStateChange (event) {
            if (this.debug) console.log("Player state changed to:", event.data);
            this.currentPlayerState = event.data;
        },


        //----------------------------------------------------------
        // Vimeo-specific functions
        //-------------------------------------------------------
        initVimeoVideo () {
            // Vimeo doesn't need to check that the API is ready - since we `import` it, it should always be ready.
            console.log("Preparing Vimeo video:", this.videoID);
            var player = new Player(this.videoPlayerID, {
                id: this.videoID,
                width: "100%",
                height: "100%",
                quality: 'auto',
            });
            this.player = player;
            if (this.autoplay) this.VimeoPlayVideo();
        },

        VimeoPlayVideo () {
            this.player.play().then(()=>{
                this.hasPlayed = true;
                this.player.setVolume(this.adjustedVolume);
                console.log("Playing");
            }).catch((error)=>{
                console.log("Error:", error);
            });
            this.player.on('ended', (data)=>{
                this.hasPlayed = false;
            });
        },


    },
    watch: {

    },
}
</script>