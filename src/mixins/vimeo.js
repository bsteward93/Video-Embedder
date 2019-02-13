const VIMEO = "vimeo";
const VIMEO_API = "";

import Player from '@vimeo/player';
import events from '../mixins/events';

export default {
    mixins: [ events, ],
    computed: {
        //----------------------------------------------------------
        // Vimeo-specific computed props
        //-------------------------------------------------------
        VimeoCurrentPlayerState () {
            // I do it this way (even though it isnt really supported by Vimeo the same way it is by YouTube) in order to keep
            // the methods by which both players keep track of the current play state the same.
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
        VimeoVideoQuality () {
            // From https://github.com/vimeo/player.js#embed-options
            switch(this.quality) {
                case "low":
                    return "540p";
                    break;
                case "medium":
                    return "720p";
                    break;
                case "high":
                    return "1080p";
                    break;
                default:
                    return "auto";
                    break;
            }
        },
    },
    methods: {
        //----------------------------------------------------------
        // Vimeo-specific functions
        //-------------------------------------------------------
        initVimeoVideo () {
            // Vimeo doesn't need to check that the API is ready - since we `import` it, it should always be ready.
            if (this.debug) console.log("Preparing Vimeo video:", this.videoID);
            var player = new Player(this.videoPlayerID, {
                id: this.videoID,
                width: "100%",
                height: "100%",
                // quality: this.VimeoVideoQuality,
            });
            this.player = player;

            this.player.on('ended', this.VimeoVideoEnded);
            this.player.on('play', this.VimeoVideoPlayed);
            this.player.on('pause', this.VimeoVideoPaused);
            
            this.currentPlayerState = this.VimeoPlayerStates.UNSTARTED;
            
            this.onPlayerReady();

            if (this.autoplay) this.VimeoPlayVideo();
        },

        VimeoPlayVideo () {
            // Fires when video is manually played
            this.player.play().then(()=>{
                this.hasPlayed = true;
                this.player.setVolume(this.adjustedVolume);
            }).catch((error)=>{
                console.log("Error:", error);
            });
        },

        VimeoVideoPlayed () {
            if (this.debug) console.log("Played Vimeo video...");
            this.onPlayerPlaying();
            this.currentPlayerState = this.VimeoPlayerStates.PLAYING;
        },

        VimeoVideoPaused () {
            if (this.debug) console.log("Paused Vimeo video...");
            this.onPlayerPaused();
            this.currentPlayerState = this.VimeoPlayerStates.PAUSED;
        },

        VimeoVideoEnded (data) {
            if (this.debug) console.log("Vimeo video has ended...");
            this.hasPlayed = false;
            this.onPlayerFinished();
            this.currentPlayerState = this.VimeoPlayerStates.ENDED;
        },
    },
}
