const YOUTUBE = "youtube";
const YOUTUBE_API = "//www.youtube.com/iframe_api";

export default {
    computed: {
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
    },
    methods: {
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
    },
}
