const path = require("path");
const webpack = require("webpack");
const commonDomains = require("@jx3box/jx3box-common/data/jx3box.json");
module.exports = {
    configureWebpack: (config) => {
        if (Array.isArray(config.plugins)) {
            config.plugins = config.plugins.filter((plugin) => {
                const name = plugin && plugin.constructor ? plugin.constructor.name : "";
                // progress-webpack-plugin not compatible with webpack 5 schema
                if (name === "ProgressPlugin" || name === "Progress") return false;
                return true;
            });
        }
    },
    devServer: {
        host: "localhost",
        client: {
            progress: false,
        },
        // 与 @jx3box/jx3box-common/js/api.js 对齐：
        // 本地开发开启 `VUE_APP_PROXY_ENABLE=1` 后，会把请求 baseURL 切到 `${VUE_APP_PROXY_PREFIX}/${serviceKey}`
        proxy: buildEnvProxy(),
        allowedHosts: "all",
        port: process.env.DEV_PORT || 8080,
    },
    chainWebpack: (config) => {
        // Vue CLI 5 + webpack 5: remove legacy progress plugin to avoid schema errors
        config.plugins.delete("progress");
        //💝 in-line small imgs ~
        config.module
            .rule("images")
            .use("url-loader")
            .loader("url-loader")
            .tap((options) => Object.assign({}, options || {}, { limit: 10240 }));

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        var preload_styles = [];
        preload_styles.push(
            path.resolve(__dirname, "./node_modules/csslab/base.less"),
            path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/var.less"),
            path.resolve(__dirname, "./src/assets/css/var.less")
        );
        function addStyleResource(rule) {
            rule.use("style-resource").loader("style-resources-loader").options({
                patterns: preload_styles,
            });
        }
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));
    },
};

function normalizeTarget(value) {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, "")}`;
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEnvProxy() {
    const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
    if (nodeEnv && nodeEnv !== "development") return {};

    // Vue CLI 加载 .env 的时机/覆盖关系可能导致这里读不到或读到意外值：
    // - 明确设置为 false 才禁用
    // - 未设置/无法读取时，仍然生成代理（仅在 devServer 生效）
    const rawEnabled = String(process.env.VUE_APP_PROXY_ENABLE || "").toLowerCase();
    const disabled = ["0", "false", "no", "off"].includes(rawEnabled);
    if (disabled) return {};

    const prefix = process.env.VUE_APP_PROXY_PREFIX || "/__proxy";
    const mk = (serviceKey, target) => {
        const normalized = normalizeTarget(target);
        if (!normalized) return {};
        const context = `${prefix}/${serviceKey}`;
        const contextRe = new RegExp(`^${escapeRegExp(context)}`);
        return {
            [context]: {
                target: normalized,
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: "",
                pathRewrite: (p) => p.replace(contextRe, ""),
            },
        };
    };

    const serviceTargets = {
        cms: process.env.VUE_APP_CMS_API || commonDomains.__cms,
        next: process.env.VUE_APP_NEXT_API || commonDomains.__next,
        team: process.env.VUE_APP_TEAM_API || commonDomains.__team,
        pay: process.env.VUE_APP_PAY_API || commonDomains.__pay,
        lua: process.env.VUE_APP_LUA_API || commonDomains.__lua,
        node: process.env.VUE_APP_NODE_API || commonDomains.__node,
        helper: process.env.VUE_APP_HELPER_API || commonDomains.__helperUrl,
    };

    return Object.keys(serviceTargets).reduce((acc, key) => Object.assign(acc, mk(key, serviceTargets[key])), {});
}
