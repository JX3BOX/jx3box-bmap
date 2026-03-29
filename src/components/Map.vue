<template>
    <div class="m-completed-map" v-loading="loading" ref="container">
        <el-button class="u-phone-download" @click="exportToImage">
            <el-icon class="u-download-icon"><Download /></el-icon>
            下载
        </el-button>
        <div class="m-boss-list" ref="map">
            <div
                class="u-step"
                :class="currentBoss.dwBossID ? 'has-info' : ''"
                v-for="(item, stepIndex) in list"
                :key="stepIndex"
            >
                <div
                    class="u-floor"
                    :class="[
                        floor.nEffectID ? 'is-effect' : '',
                        floor.dwBossID === currentBoss.dwBossID ? 'is-info' : '',
                        getCurrentStyle(floor, stepIndex * $attrs.column + index + 1),
                    ]"
                    v-for="(floor, index) in item"
                    :key="index"
                    @click.prevent="setBossHandler(stepIndex * $attrs.column + index + 1)"
                >
                    <div class="u-floor-content">
                        <div class="u-index" :class="floor.nEffectID && 'u-effect'">
                            {{ stepIndex * $attrs.column + index + 1 }}
                        </div>
                        <div class="u-img">
                            <img :src="getBossAvatar(floor.dwBossID)" :alt="floor.bossName || '未知'" />
                        </div>
                        <div class="u-name" :class="currentBossName === floor.bossName && 'is-current'">
                            {{ floor.bossName }}
                        </div>
                        <div
                            v-if="
                                getEffectInfo(effects, floor.nEffectID, 'tags').length ||
                                getEffectInfo(effects, floor.nEffectID, 'reward')
                            "
                            class="u-desc"
                        >
                            <div v-if="getEffectInfo(effects, floor.nEffectID, 'tags').length" class="u-sketch">
                                <div
                                    class="u-sketch-info"
                                    v-for="(tag, si) in getEffectInfo(effects, floor.nEffectID, 'tags')"
                                    :key="si"
                                >
                                    {{ tag }}
                                </div>
                            </div>
                            <div v-if="getEffectInfo(effects, floor.nEffectID, 'reward')" class="u-coin">
                                <img class="u-coin-img" src="../assets/img/coin.svg" svg-inline />
                                <span>{{ getEffectInfo(effects, floor.nEffectID, "reward") }}</span>
                            </div>
                        </div>
                    </div>
                    <el-icon class="u-info-icon is-up"><ArrowUp /></el-icon>
                    <el-icon class="u-info-icon is-down"><ArrowDown /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import { arr1to2, isPhone, isQQ, isWeChat, getEffectInfo } from "../utils";
import { cloneDeep } from "lodash";
import html2canvas from "html2canvas";
import { moment } from "@jx3box/jx3box-common/js/moment";
import { ArrowDown, ArrowUp, Download } from "@element-plus/icons-vue";
export default {
    name: "MapCompleted",
    components: {
        ArrowDown,
        ArrowUp,
        Download,
    },
    props: ["effectsFilter", "updatedAt"],
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        __imgRoot() {
            return __imgPath + "pve/baizhan/";
        },
        list() {
            const data = cloneDeep(this.$attrs.maps);
            return arr1to2(data, this.$attrs.column);
        },
        currentBoss() {
            return this.$attrs.currentBoss || {};
        },
        currentEffectIds() {
            return this.$attrs.currentEffect?.ids || [];
        },
        currentBossName() {
            return this.$attrs.currentBossName || "";
        },
        effects() {
            return this.$attrs.effects || [];
        },
        mapFilterInit() {
            return this.$attrs.mapFilterInit || "init";
        },
        update_moment() {
            return moment(this.updatedAtt);
        },
        duration() {
            return {
                start: this.update_moment.startOf("week").format("MM/DD"),
                end: this.update_moment.endOf("week").format("MM/DD"),
            };
        },
    },
    methods: {
        getCurrentStyle(floor, index) {
            const indexes = [10, 20, 30, 40, 50, 60];
            if (this.mapFilterInit === "init") {
                return indexes.includes(index) || this.effectsFilter[0].ids.includes(floor.nEffectID)
                    ? "is-current"
                    : "";
            } else {
                if (this.currentBossName && this.currentEffectIds.length) {
                    return (this.currentBossName === "精英首领"
                        ? indexes.includes(index)
                        : this.currentBossName === floor.bossName) && this.currentEffectIds.includes(floor.nEffectID)
                        ? "is-current"
                        : "";
                }
                return (
                    (!this.currentBossName && this.currentEffectIds.includes(floor.nEffectID) ? "is-current" : "") ||
                    (!this.currentEffectIds.length &&
                    (this.currentBossName === "精英首领"
                        ? indexes.includes(index)
                        : this.currentBossName === floor.bossName)
                        ? "is-current"
                        : "")
                );
            }
        },
        isPhone,
        getBossAvatar(id) {
            const avatar =
                this.$attrs.bosses.find((item) => item.id === id)?.avatar || `${this.__imgRoot}fbcdpanel02_51.png`;
            return avatar;
        },
        getEffectInfo,
        setBossHandler(i) {
            if (i === this.initQuery.index) {
                this.$store.commit("baizhan/setState", {
                    key: "currentBoss",
                    val: {},
                });
                return this.$router.push({ query: {} });
            }
            this.$router.push({ query: { floor: i } });
        },
        setBoss(floor, i) {
            console.log(floor, i);
            // let val = floor;
            // if (floor.dwBossID === this.currentBoss?.dwBossID) {
            //     console.log(123);
            //     val = {};
            // } else {
            //     val = Object.assign(floor, {
            //         floor: i,
            //     });
            // }
            // // this.$store.dispatch("baizhan/setInit", val);
            // this.$store.commit("baizhan/setState", {
            //     key: "currentBoss",
            //     val,
            // });
        },
        exportToImage() {
            if (isPhone() && (isWeChat() || isQQ())) {
                return this.$message({
                    message: "请在游览器中打开",
                    type: "warning",
                });
            }
            const map = this.$refs.map;
            this.loading = true;
            html2canvas(map, {
                useCORS: true,
                width: map.offsetWidth,
                height: map.offsetHeight,
                scale: 2,
            })
                .then((canvas) => {
                    this.createWatermark().then((waterCanvas) => {
                        const newCanvas = document.createElement("canvas");
                        const newCtx = newCanvas.getContext("2d");
                        newCanvas.width = map.offsetWidth * 2;
                        newCanvas.height = map.offsetHeight * 2;
                        newCtx.drawImage(canvas, 0, 0);
                        newCtx.drawImage(waterCanvas, 0, 0);
                        // this.canvas = newCanvas.toDataURL();
                        // 创建一个虚拟链接
                        const link = document.createElement("a");
                        link.href = newCanvas.toDataURL(); // 将 Canvas 转换为 Data URL
                        link.download = `魔盒百战${this.duration.start}至${this.duration.end}.png`; // 下载文件的名称

                        link.addEventListener("click", () => {
                            setTimeout(() => {
                                URL.revokeObjectURL(link.href); // 删除链接的资源
                            }, 100); // 延迟删除以确保下载完成

                            link.removeEventListener("click", () => {}); // 移除事件监听器
                            document.body.removeChild(link);
                        });
                        document.body.appendChild(link);
                        link.click();
                        this.loading = false;
                        // this.$store.commit("baizhan/setState", {
                        //     key: "downLoading",
                        //     val: false,
                        // });
                    });
                })
                .catch((error) => {
                    this.loading = false;
                    this.$store.commit("baizhan/setState", {
                        key: "downLoading",
                        val: false,
                    });
                    console.error("导出图片出错:", error);
                });
        },
        createWatermark() {
            return new Promise((resolve) => {
                const map = this.$refs.map;
                const canvas = document.createElement("canvas");
                canvas.width = map.offsetWidth * 2;
                canvas.height = map.offsetHeight * 2;
                const ctx = canvas.getContext("2d");

                // 绘制顶部文字
                ctx.font = `bold 48px Arial`;
                ctx.fillStyle = "#deddd3";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center"; // 设置居中对齐

                const topTxt = `百战异闻录 ${this.duration.start} 至 ${this.duration.end}`;
                const topTxtX = canvas.width / 2; // 居中位置
                const topTxtY = 30 * 1.5; // 垂直位置
                ctx.fillText(topTxt, topTxtX, topTxtY);

                const bottomTxt = "魔盒·百战查询 https://www.jx3box.com/fb/baizhan";
                ctx.font = `bold 30px Arial`;
                const txtBottomWidth = ctx.measureText(bottomTxt).width;
                const bottomTxtX = canvas.width - txtBottomWidth / 2 - 30 * 2;
                const bottomTxtY = canvas.height - topTxtY; // 垂直位置
                ctx.fillText(bottomTxt, bottomTxtX, bottomTxtY);

                // 绘制文字水印
                // const txt = "JX3BOX";
                const txt = "";
                const txtHeight = canvas.height / 6;
                const txtWidth = ctx.measureText(txt).width;
                const txtRepeat = Math.ceil(canvas.width / (txtWidth + 20)) * 2; // 添加间隔距离
                const txtRows = Math.ceil(canvas.height / (txtHeight + 20)) * 2; // 添加间隔距离
                ctx.font = `bold 12px Arial`;
                ctx.fillStyle = "#deddd31a";
                ctx.transform(1, 0.5, -0.5, 1, 0, -canvas.height / 2);
                for (let i = 0; i < txtRows; i++) {
                    for (let j = 0; j < txtRepeat; j++) {
                        const x = j * (txtWidth + 20); // 添加间隔距离
                        const y = i * (txtHeight + 20); // 添加间隔距离
                        ctx.fillText(txt, x, y);
                    }
                }

                // 加载本地图片
                const image = new Image();
                image.src = require("../assets/img/logo.svg");
                image.crossOrigin = "";
                image.onload = () => {
                    // 创建临时canvas用于处理图片
                    const imageSize = 30 * 2;
                    const tempCanvas = document.createElement("canvas");
                    tempCanvas.width = imageSize;
                    tempCanvas.height = imageSize;
                    const tempCtx = tempCanvas.getContext("2d");
                    tempCtx.drawImage(image, 0, 0, imageSize, imageSize);

                    // 获取图片的ImageData对象
                    const imageData = tempCtx.getImageData(0, 0, imageSize, imageSize);

                    // 修改图片颜色
                    const pixels = imageData.data;
                    for (let i = 0; i < pixels.length; i += 4) {
                        // 修改RGBA颜色值
                        pixels[i] = 255 - pixels[i]; // R
                        pixels[i + 1] = 255 - pixels[i + 1]; // G
                        pixels[i + 2] = 255 - pixels[i + 2]; // B
                    }

                    // 将修改后的ImageData对象绘制到canvas中
                    const textWidth = ctx.measureText(topTxt).width * 2; // 顶部文字的宽度
                    const padding = 10; // 图片与文字之间的间距
                    const imageX = topTxtX - textWidth - imageSize - padding;
                    ctx.putImageData(imageData, imageX, 15);

                    resolve(canvas);
                };
            });
        },
    },
};
</script>

<style lang="less">
@import "../assets/css/var.less";
.m-completed-map {
    .flex;
    justify-content: center;
    align-items: flex-start;
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin-top: -25px;
    .u-phone-download {
        .none;
    }
    @media screen and (max-width: @phone) {
        flex-direction: column;
        align-items: center;
        .u-phone-download {
            position: absolute;
            top: 0;
            .db;
            width: 80%;
        }
    }
    .m-boss-list {
        position: relative;
        box-sizing: border-box;
        .flex;
        flex-direction: column;
        box-sizing: border-box;
        transition: transform 0.2s ease-out;
        cursor: grab;
        background-color: @baizhan_bg;
        user-select: none;
        padding: 30px;
        .u-watermark {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            .u-title {
                .flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                color: @baizhan_map_select_color;
                margin: 0;
                padding-top: 5px;
                font-size: 18px;
                svg {
                    width: 30px;
                    height: 30px;
                }
            }
            .u-bottom-title {
                position: absolute;
                bottom: 10px;
                width: 100%;
                text-align: center;
            }
            .u-watermark-content {
                position: absolute;
                top: 10%;
                left: 10%;
                width: 90%;
                height: 80%;
                box-sizing: border-box;
                z-index: 0;
                overflow: hidden;
                .flex;
                flex-wrap: wrap;
                gap: 100px;
                .u-title {
                    opacity: 0.1;
                    color: @baizhan_map_select_color;
                    transform: rotate(30deg);
                }
            }
        }
        .u-download {
            position: absolute;
            right: -30px;
            top: 55px;
            display: none;
            z-index: 2;
        }
        &:hover {
            .u-download {
                display: block;
            }
        }
        .u-floor {
            position: relative;
            flex: none;
            width: 100px;
            height: 100px;
            border-radius: 10px;
            background: @baizhan_map_bg;
            .flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 2;
            transition: height 0.2s ease-out;
            color: @baizhan_map_color;
            .u-floor-content {
                .flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 4px;
                width: 100%;
                height: 100%;
            }
            .u-info-icon {
                .none;
                position: absolute;
                transform: rotate(134deg);
                color: @baizhan_active;
                font-weight: bold;
            }
            .u-info-icon.is-down {
                top: -10px;
                left: -10px;
            }
            .u-info-icon.is-up {
                bottom: -10px;
                right: -10px;
            }
            .u-img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                user-select: none;
                img {
                    user-select: none;
                }
            }
            .u-index {
                position: absolute;
                left: 4px;
                top: 4px;
                font-size: 12px;
                color: #fff;
                font-weight: bold;
                color: @baizhan_active;
            }
            .u-name {
                color: @baizhan_active;
                font-size: 14px;
                font-weight: bold;
                width: 80px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .u-desc {
                .size(80px, 52px);
                .flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: @baizhan_active;
                .u-coin {
                    .flex;
                    justify-content: center;
                    align-items: center;
                    gap: 2px;
                }
            }
            .u-icon {
                position: absolute;
                bottom: 4px;
                right: 4px;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    .size(100%, 100%);
                    border-radius: 50%;
                    transform: scale(1.2);
                    user-select: none;
                }
            }
            &::after {
                position: absolute;
                right: -8px;
                width: 8px;
                height: 4px;
                display: block;
                background-color: @baizhan_map_bg;
                content: "";
            }
            &.is-effect {
                // background-color: @baizhan_active;
                // color: @baizhan_map_select_color;
                .u-floor-content {
                    justify-content: flex-start;
                }
                .u-img {
                    position: absolute;
                    top: -20px;
                    border: 2px solid @baizhan_map_bg;
                    box-sizing: border-box;
                    user-select: none;
                }
                .u-name {
                    margin-top: 20px;
                    font-size: 16px;
                }
                .u-desc {
                    font-size: 12px;
                    text-align: center;
                    .u-coin-img {
                        filter: invert(50%) sepia(74%) saturate(353%) hue-rotate(201deg) brightness(86%) contrast(92%);
                    }
                }
            }
            &.is-gray {
                // opacity: 0.3;
                background-color: @baizhan_map_bg;
                color: @baizhan_map_color;
            }
            &.is-current {
                // height: 110px;
                // opacity: 1;
                background-color: @baizhan_active !important;
                color: @baizhan_map_select_color !important;
                .u-name,
                .u-index {
                    color: @baizhan_map_select_color;
                }
                &.is-effect {
                    .u-img {
                        border-color: @baizhan_active;
                    }
                    .u-desc {
                        color: @baizhan_map_select_color;
                        .u-coin-img {
                            filter: none;
                        }
                    }
                }
            }
            &.is-info {
                background-color: @baizhan_active !important;
                color: @baizhan_map_select_color !important;
                .u-name,
                .u-index {
                    color: @baizhan_map_select_color;
                }
                .u-img {
                    border-color: @baizhan_active;
                }
                .u-desc {
                    color: @baizhan_map_select_color;
                    .u-coin-img {
                        filter: none;
                    }
                }
                .u-info-icon {
                    .db;
                }
            }
            &:nth-of-type(10n),
            &:nth-of-type(10n).is-effect {
                height: 150px;
                // background-color: @baizhan_active;
                // &.is-current {
                //     height: 160px !important;
                // }
                .u-floor-content {
                    justify-content: center;
                }
                .u-name {
                    margin-top: 0;
                }
                .u-img {
                    position: relative !important;
                    top: unset !important;
                    box-sizing: border-box;
                    border: 4px solid @baizhan_map_select_color;
                    width: 50px;
                    height: 50px;
                    user-select: none;
                }
                &::after {
                    right: unset;
                    bottom: -25px;
                    width: 4px;
                    height: 25px;
                }
            }
        }
        .u-step {
            .flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            height: 150px;
            color: @baizhan_map_color;
            &.has-info {
                .u-floor {
                    opacity: 0.2;
                    &.is-info {
                        opacity: 1;
                    }
                }
            }
            &:nth-of-type(even) {
                flex-direction: row-reverse;
                .u-floor {
                    &::after {
                        position: absolute;
                        right: unset;
                        left: -8px;
                        width: 8px;
                        height: 4px;
                        display: block;
                        background-color: @baizhan_map_bg;
                        content: "";
                    }
                    &:nth-of-type(10n),
                    &:nth-of-type(10n).is-effect {
                        height: 150px;
                        // background-color: @baizhan_active;
                        .u-floor-content {
                            justify-content: center;
                        }
                        .u-name {
                            margin-top: 0;
                        }
                        .u-img {
                            position: relative !important;
                            top: unset !important;
                            box-sizing: border-box;
                            border: 4px solid @baizhan_map_select_color;
                            width: 50px;
                            height: 50px;
                        }
                        &::after {
                            left: unset;
                            bottom: -25px;
                            width: 4px;
                            height: 25px;
                        }
                    }
                }
            }
            &:nth-of-type(6) {
                .u-floor {
                    &:last-of-type {
                        &::after {
                            display: none;
                        }
                    }
                }
            }
        }
    }

    .m-right {
        flex: none;
        padding: 40px 100px 40px 40px;
        border-radius: 10px;
        background-image: url("@{baizhan_img_path}baizhan2_4.png");
        background-repeat: no-repeat;
        background-size: cover;
        color: #fff;
        box-sizing: border-box;
        .m-header {
            .flex;
            align-items: center;
            gap: 10px;
        }
        .u-title {
            background-image: url("@{baizhan_img_path}baizhan_31.png");
            width: 26px;
            height: 71px;
            line-height: 71px;
            text-align: center;
            font-style: italic;
        }
        .u-boss-name {
            writing-mode: vertical-lr;
        }
    }
    .m-show-wrap {
        max-width: 500px;
        .m-header {
            gap: 20px;
        }
        .u-avatar {
            margin-left: -12px;
            margin-right: -12px;
            width: 120px;
            height: 120px;
            background-image: url("@{baizhan_img_path}baizhan_39.png");
            background-repeat: no-repeat;
            background-size: cover;
            .flex;
            justify-content: center;
            align-items: center;
            img {
                width: 90px;
                height: 90px;
                border-radius: 50%;
            }
        }
        .u-effect-icon {
            .size(48px, 48px);
        }
        .u-effect-info {
            .flex;
            flex-direction: column;
            .u-effect-name {
                font-weight: bold;
            }
            .u-effect-desc {
                font-size: 12px;
                max-width: 200px;
                color: @skill_2;
            }
        }
        .m-reward {
            margin-top: 20px;
            .flex;
            gap: 20px;
            .u-title {
                background-image: url("@{baizhan_img_path}baizhan_32.png");
            }
            .u-rewards {
                .flex;
                align-items: center;
                gap: 10px;
            }
        }
    }
    .m-edit-wrap {
        .flex;
        gap: 20px;
        .m-form {
            .flex;
            flex-direction: column;
            gap: 10px;
        }
    }
}

.u-effect-option {
    .flex;
    align-items: center;
    gap: 10px;
    img {
        width: 20px;
        height: 20px;
    }
}
</style>
