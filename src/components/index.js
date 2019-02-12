import VideoEmbedder from './VideoEmbedder'

export default {
    install(Vue, options) {
        Vue.component('video-embedder', VideoEmbedder);
    }
}