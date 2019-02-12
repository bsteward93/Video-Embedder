export default {
	methods: {
		onPlayerReady () {
			this.$emit('playerReady');
		},
		onPlayerPlaying () {
			this.$emit('playerPlaying');
		},
		onPlayerPaused () {
			this.$emit('playerPaused');
		},
		onPlayerFinished () {
			this.$emit('playerFinished');
		},
	}
}