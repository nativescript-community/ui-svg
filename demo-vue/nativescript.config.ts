import { NativeScriptConfig } from '@nativescript/core';

export default {
    id: 'org.nativescript.demovuecanvaslabel',
    appResourcesPath: 'app/App_Resources',
    android: {
        v8Flags: '--expose_gc',
        markingMode: 'none',
    },
    webpackConfigPath:'./app.webpack.config.js',
    appPath: 'app',
} as NativeScriptConfig;
