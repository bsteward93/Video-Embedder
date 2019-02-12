const VIMEO = "vimeo";
const VIMEO_API = "";

import Player from '@vimeo/player';

export default {
    computed: {
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
        // Vimeo-specific functions
        //-------------------------------------------------------
        initVimeoVideo () {
            // Vimeo doesn't need to check that the API is ready - since we `import` it, it should always be ready.
            if (this.debug) console.log("Preparing Vimeo video:", this.videoID);
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
                if (this.debug) console.log("Playing");
            }).catch((error)=>{
                console.log("Error:", error);
            });
            this.player.on('ended', (data)=>{
                this.hasPlayed = false;
            });
        },
    },
}
