// import styles from './styles/TheHopper.scss'

import VideoEmbedder from './components';

export const VideoEmbedderPlugin = {
    install(Vue, options) {
        Vue.use(VideoEmbedder);
    }
};
