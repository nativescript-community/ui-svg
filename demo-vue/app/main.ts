import Vue from 'nativescript-vue';
import { isAndroid } from '@nativescript/core/platform';

import CollectionView from '@nativescript-community/ui-collectionview/vue';
Vue.use(CollectionView);
import CanvasSVG from '@nativescript-community/ui-svg/vue';
Vue.use(CanvasSVG);
import Canvas from '@nativescript-community/ui-canvas/vue';
Vue.use(Canvas);
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = true;

import Home from './views/App.vue';
new Vue({
    render: (h) => h('frame', [h(Home)]),
}).$start();
