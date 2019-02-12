# Hello! Welcome to the Video Embedder Plugin!

This is just a small Vue component that supports video parameters and displays a 16:9 video wrapper with wired-up events ready to use. WIP is better support for Vimeo player states (not working correctly atm), custom player events (on ready, on play, on end, etc).

## Initialization
In order to use the component, first you'll need to install it via npm.
Once done, you'll need to import and initialize it within your app.js file:
`import { VideoEmbedderPlugin } from 'VideoEmbedder;`
`Vue.use(VideoEmbedderPlugin);`

## Usage
The component's name is "video-embedder". Use it like this:
`<video-embedder :src="'youtube.com/video/1234'"></video-embedder>`
There are other arguments that you can use, see examples below.

## Arguments
@param src: string, YouTube/Vimeo video URL (supports both embed/share links and video URLs).
@param thumb: string, Image that displays over the video while the video is awaiting initialization/user click to play.
@param vol: number, between 0 and 1. Sets initial volume. Defaults to 0.5.
@param autoplay: boolean, toggle video auto-play (video will play as soon as player is ready)
@param debug: boolean, enables logging of events along every player step of the way. Mostly for dev.

## Events
You can add custom events to your player that will fire during different play states. The available functions are:
- playerReady: fires when the video is fully loaded and ready to play.
- playerPlaying: fires when the video begins to play after a user-initiated click (does not apply to autoplay since playerReady and playerPlaying are the same in that instance).
- playerPaused: fires when the video is paused by the user.
- playerFinished: fires when the video has played the full duration and reaches the end.
Put these on your element like this:
`@playerReady="yourCustomVueFunction"`
These events work for YouTube but are still sketchy with Vimeo. Use accordingly.

## License
Licensed under the [MIT license](http://opensource.org/licenses/MIT).
