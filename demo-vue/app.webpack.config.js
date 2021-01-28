const webpackConfig = require('./webpack.config.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const { readFileSync } = require('fs');
const { dirname, join, relative, resolve, sep } = require('path');
const nsWebpack = require('@nativescript/webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, params = {}) => {
    if (env.adhoc) {
        env = Object.assign({}, {
            production: true,
            sourceMap: true,
            uglify: true
        }, env);
    }
    const {
        appPath = 'app',
        appResourcesPath = 'app/App_Resources',
        development, // --env.development
        production, // --env.production
        sourceMap, // --env.sourceMap
        hiddenSourceMap, // --env.hiddenSourceMap
        inlineSourceMap, // --env.inlineSourceMap
        uglify, // --env.uglify
        adhoc, // --env.adhoc
    } = env;

    const platform = env && ((env.android && 'android') || (env.ios && 'ios'));
    const mode = production ? 'production' : 'development';
    const tsconfig = 'tsconfig.json';
    const projectRoot = params.projectRoot || __dirname;
    const dist = resolve(projectRoot, nsWebpack.getAppPath(platform, projectRoot));
    const appResourcesFullPath = resolve(projectRoot, appResourcesPath);

    const config = webpackConfig(env, params);

    if (!!development) {
        const srcFullPath = resolve(projectRoot, '..', 'src');
        Object.assign(config.resolve.alias, {
            '#': srcFullPath,
            '@nativescript-community/ui-svg$': '#/index.' + platform,
            '@nativescript-community/ui-svg/vue$': '#/vue/index',
        });
    }

    const defines = {
        PRODUCTION: !!production,
        process: 'global.process',
        'global.TNS_WEBPACK': 'true',
        'global.NS_PLATFORM': `"${platform}"`,
        'global.isIOS': platform === 'ios',
        'global.isAndroid': platform === 'android',
        TNS_ENV: JSON.stringify(mode),
    };

    const itemsToClean = [`${dist}/**/*`];
    if (platform === 'android') {
        itemsToClean.push(`${join(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'snapshots/**/*')}`);
        itemsToClean.push(`${join(projectRoot, 'platforms', 'android', 'app', 'build', 'configurations', 'nativescript-android-snapshot')}`);
    }

    const symbolsParser = require('scss-symbols-parser');
    const mdiSymbols = symbolsParser.parseSymbols(readFileSync(resolve(projectRoot, 'node_modules/@mdi/font/scss/_variables.scss')).toString());
    const mdiIcons = JSON.parse(`{${mdiSymbols.variables[mdiSymbols.variables.length - 1].value.replace(/" (F|0)(.*?)([,\n]|$)/g, '": "$1$2"$3')}}`);

    const scssPrepend = `$mdi-fontFamily: ${platform === 'android' ? 'materialdesignicons-webfont' : 'Material Design Icons'};`;

    config.module.rules.forEach((r) => {
        if (Array.isArray(r.use) && r.use.indexOf('sass-loader') !== -1) {
            r.use.splice(-1, 1, {
                loader: 'sass-loader',
                options: {
                    sourceMap: false,
                    additionalData: scssPrepend,
                },
            });
        }
    });
    const indexOfTsLoaderRule = config.module.rules.findIndex((r) => r.loader === 'ts-loader');
    config.module.rules[indexOfTsLoaderRule].options.transpileOnly = true;

    config.module.rules.push({
        // rules to replace mdi icons and not use nativescript-font-icon
        test: /\.(ts|js|scss|css|vue)$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'string-replace-loader',
                options: {
                    search: 'mdi-([a-z-]+)',
                    replace: (match, p1, offset, str) => {
                        if (mdiIcons[p1]) {
                            return String.fromCharCode(parseInt(mdiIcons[p1], 16));
                        }
                        return match;
                    },
                    flags: 'g',
                },
            },
        ],
    });

    // // we remove default rules
    config.plugins = config.plugins.filter((p) => ['DefinePlugin', 'CleanWebpackPlugin', 'CopyWebpackPlugin'].indexOf(p.constructor.name) === -1);

    const copyPatterns = [
        { from: 'fonts/!(ios|android)/**/*', to: 'fonts', flatten: true, noErrorOnMissing: true },
        { from: 'fonts/*', to: 'fonts', flatten: true, noErrorOnMissing: true },
        { from: `fonts/${platform}/**/*`, to: 'fonts', flatten: true, noErrorOnMissing: true },
        {
            from: '**/*.+(jpg|png)',
            globOptions: {
                ignore: [`${relative(appPath, appResourcesFullPath)}/**`],
            },
            noErrorOnMissing: true,
        },
        { from: 'assets/**/*', noErrorOnMissing: true },
        {
            from: '../node_modules/@mdi/font/fonts/materialdesignicons-webfont.ttf',
            to: 'fonts',
            noErrorOnMissing: true,
        },
    ];
    // we add our rules
    config.plugins.unshift(
        new CopyWebpackPlugin({
            patterns: copyPatterns,
        })
    );
    config.plugins.unshift(
        new CleanWebpackPlugin({
            dangerouslyAllowCleanPatternsOutsideProject: true,
            dry: false,
            verbose: false,
            cleanOnceBeforeBuildPatterns: itemsToClean,
        })
    );
    config.plugins.unshift(new webpack.DefinePlugin(defines));
    config.plugins.push(
        new webpack.EnvironmentPlugin({
            NODE_ENV: JSON.stringify(mode), // use 'development' unless process.env.NODE_ENV is defined
            DEBUG: false,
        })
    );

    config.devtool = inlineSourceMap ? 'inline-cheap-source-map' : false;
    if (hiddenSourceMap || sourceMap) {
        config.plugins.push(
            new webpack.SourceMapDevToolPlugin({
                noSources: true,
            })
        );
    }
    if (!!production) {
        config.plugins.push(
            new ForkTsCheckerWebpackPlugin({
                async: false,
                typescript: {
                    configFile: resolve(tsconfig),
                },
            })
        );
    }
    config.optimization.minimize = uglify !== undefined ? uglify : production;
    const isAnySourceMapEnabled = !!sourceMap || !!hiddenSourceMap || !!inlineSourceMap;
    config.optimization.minimizer = [
        new TerserPlugin({
            parallel: true,
            cache: true,
            sourceMap: isAnySourceMapEnabled,
            terserOptions: {
                ecma: 6,
                // warnings: true,
                // toplevel: true,
                output: {
                    comments: false,
                    semicolons: !isAnySourceMapEnabled,
                },
                compress: {
                    // The Android SBG has problems parsing the output
                    // when these options are enabled
                    collapse_vars: platform !== 'android',
                    sequences: platform !== 'android',
                    passes: 2,
                    drop_console: production && adhoc !== true,
                },
                keep_fnames: true,
            },
        }),
    ];
    return config;
};
