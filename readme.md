# Hello! Welcome to the Video Embedder Plugin!

This is just a small Vue component that easily embeds a YouTube/Vimeo video with custom thumbnails, play buttons, and wired-up events all ready to go for you. The video will always display in a 16:9 format, although support for custom aspect ratios may come in the future if needed. You can wire up the player to respond to many different player state events such as played, paused, and finished. This allows you to easily integrate this custom element with any other Vue components you may already be using. 

## Initialization
In order to use the component, first you'll need to install it via npm:\
`npm install git+https://git@github.com/bsteward93/Video-Embedder.git`\
Once done, you'll need to import and initialize it within your app.js file:\
`import { VideoEmbedderPlugin } from 'video-embedder;`\
`Vue.use(VideoEmbedderPlugin);`

The element comes pre-loaded with a basic, CSS/Font-Awesome play button. You can feel free to restyle this as you please. Alternatively, you can build HTML within the `<video-embedder>` element that will act as the play button. If you do this, the default play button will be removed in favor of your custom one. Note: this feature is irrelevant if you have autoplay enabled.

## Usage
The component's name is "video-embedder". Use it like this:\
`<video-embedder :src="'youtube.com/video/1234'"></video-embedder>`\
There are other arguments that you can use, see examples below.

## Arguments
@param src: string, YouTube/Vimeo video URL (supports both embed/share links and video URLs).\
@param thumb: string, Image that displays over the video while the video is awaiting initialization/user click to play.\
@param vol: number, between 0 and 1. Sets initial volume. Defaults to 0.5.\
@param autoplay: boolean, toggle video auto-play (video will play as soon as player is ready)\
@param backgroundVideo: boolean, toggle video as a background video. NOTE: YouTube and Vimeo don't seem to like background videos anymore. Vimeo only supports if it the user who uploaded the video has Plus, PRO, Business, or Premium. YouTube doesn't care BUT the videos don't loop perfectly (there's a slight buffer) and the video info flashes at the beginning of playback. Use at your own risk.\
@param quality: string, either "low", "medium", or "high". This is WIP and doesn't work right now.\
@param debug: boolean, enables logging of events along every player step of the way. Mostly for dev.

## Events
The player should emit its events on all the basic forms of player state changes - pause, play, and ended. There is currently no support for buffering or cued videos, but that may come in the future. The currently-available functions are:
- playerReady: fires when the video is fully loaded and ready to play.
- playerPlaying: fires when the video begins to play after a user-initiated click (does not apply to autoplay since playerReady and playerPlaying are the same in that instance).
- playerPaused: fires when the video is paused by the user.
- playerFinished: fires when the video has played the full duration and reaches the end.\
Put these on your element like this:\
`@playerReady="yourCustomVueFunction"`\
These events work for YouTube but are still sketchy with Vimeo. Use accordingly.

## Road Map
One of the things I'd like to add is a custom video player GUI so that both the YouTube and Vimeo experiences are unified. The goal is the front-end user would never know which of the two video services is being used - just that a super fancy video player is playing your awesome video! I would also like to consider adding support for cued videos, although that is a much lower priority. Better player state recognition is one of my first to-do's, as I think support for buffered videos may be helpful to many people.

Custom video support may come in the future as well, although that is not something I currently have plans for.

## License
Licensed under the [MIT license](http://opensource.org/licenses/MIT).
