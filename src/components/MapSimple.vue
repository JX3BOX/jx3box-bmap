<template>
    <div class="m-bmap-simple">
        <div class="u-list" :class="list.length % 2 ? 'is-odd' : 'is-even'" v-if="maps.length">
            <div class="u-row" v-for="(item, index) in list" :key="index">
                <el-tooltip v-for="(floor, cIndex) in item" :key="cIndex" placement="top" popper-class="u-bmap-tooltip">
                    <template #content>
                        <div class="u-tip">
                            <div class="u-top">
                                <div class="u-avatar">
                                    <img :src="floor.bossAvatar" :alt="floor.bossName" />
                                </div>
                                <div class="u-right">
                                    <div class="u-name">{{ floor.bossName }}</div>
                                    <div class="u-desc">
                                        <div v-if="floor.effect.tags.length" class="u-tag">
                                            {{ floor.effect.tags.join("/") }}
                                            + {{ floor.effect.reward }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="floor.nEffectID" class="u-bottom">
                                <div class="u-name">{{ floor.effect.szName }}</div>
                                <div class="u-desc">{{ floor.effect.szDescription }}</div>
                            </div>
                        </div>
                    </template>
                    <div class="u-column" :class="{ 'is-effect': floor.nEffectID, 'is-elite': !((cIndex + 1) % 10) }">
                        <div class="u-img-index" @click="toMap(index * column + cIndex + 1)">
                            <div class="u-img">
                                <img class="u-effect" :src="iconLink(floor.effect.dwIconID)" />
                            </div>
                            <div class="u-index">
                                <span class="u-index-number">{{ index * column + cIndex + 1 }}</span>
                            </div>
                        </div>
                        <div class="u-name">{{ floor.bossName }}</div>
                        <div class="u-gift">
                            <span class="u-tag" v-if="floor.effect.tags.length">{{ floor.effect.tags[0] }}</span>
                            <span class="u-coin" v-if="floor.effect.reward">+{{ floor.effect.reward }}</span>
                        </div>
                        <div class="u-elite"></div>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import jx3box from "@jx3box/jx3box-common/data/jx3box.json";
const { __Root } = jx3box;
import { cloneDeep } from "lodash";
import { arr1to2 } from "../utils/index.js";
export default {
    name: "MapSimple",
    props: {
        maps: {
            type: Array,
            required: true,
        },
        column: {
            type: Number,
            default: 10,
        },
    },
    computed: {
        list() {
            const data = cloneDeep(this.maps);
            return arr1to2(data, this.column);
        },
    },
    methods: {
        iconLink,
        toMap(i) {
            let url = process.env.NODE_ENV === "development" ? __Root : location.origin + "/";
            if (!isNaN(i)) {
                url += `fb/baizhan?floor=${i}`;
            }
            window.open(url, "_blank");
        },
    },
};
</script>

<style lang="less">
.m-bmap-simple {
    padding: 10px 0;
    .u-list {
        margin: 0 auto;
        position: relative;
        .flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        @border-color: #eee;

        .u-row {
            position: relative;
            .flex;
            gap: 12px;
            height: 75px;

            .u-column {
                position: relative;
                .flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                .w(60px);
                font-size: 12px;

                @s: 32px;
                @b: 2px;
                @e: @s + @b * 6;
                .u-elite {
                    .none;
                    position: absolute;
                    top: -@b;
                    z-index: 0;
                    width: @e;
                    height: @e * 0.9;
                    background-color: #9b7137;
                    transform: rotate(90deg);
                    clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
                }
                &.is-elite {
                    .u-elite {
                        .db;
                    }
                }
                .u-img-index {
                    cursor: pointer;
                    &:hover {
                        .u-img {
                            filter: brightness(1.2) saturate(1.2);
                            transform: scale(1.1);
                        }
                    }
                }
                .u-img {
                    position: relative;
                    .size(@s);
                    .r(50%);
                    flex: none;
                    cursor: pointer;
                    transition: 0.2s ease-in-out;
                    border: @b solid #d9e0e3;
                    box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    z-index: 1;
                    .u-effect {
                        .size(@s + @b);
                        .pr;
                        top: -@b;
                    }
                }

                @mark: 16px;
                // @mark: 8px;
                .u-index {
                    position: absolute;
                    top: (@s - @b - @mark / 2);
                    left: 50%;
                    margin-left: -(@mark / 2);
                    .size(@mark);
                    .x;
                    z-index: 2;

                    &::after {
                        content: "";
                        .pa;
                        top: 0;
                        .db;
                        .size(100%);
                        transform: rotate(45deg);
                        // background-color: #d6ac6d;
                        background-color: #868686;
                        box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
                    }

                    .u-index-number {
                        line-height: @mark;
                        .pa;
                        // left:-@mark - 1px;
                        left: (-@mark - @b)/2 - 1px;
                        .z(5);
                        .db;
                        font-size: 12px;
                        color: #eee;
                        .w((@mark + @b)*2);
                        // transform:scale(0.6);
                        // .w(@mark*2/0.6);
                        .x;
                        .db;
                    }
                }

                .u-name {
                    .fz(12px);
                    .mt(5px);
                    transform: scale(0.9);
                    white-space: nowrap;
                }

                .u-gift {
                    width: 160px;
                    font-size: 20px;
                    transform: scale(0.5);
                    margin-top: -5px;
                    color: #900;
                    .x;
                    white-space: nowrap;
                }
                .u-coin {
                    .ml(5px);
                    color: orange;
                }
                &.is-effect {
                    .u-index::after {
                        background-color: #9b7137;
                    }
                }
            }
            &:nth-of-type(even) {
                flex-direction: row-reverse;
                &:not(:last-of-type) {
                    &::before {
                        position: absolute;
                        content: "";
                        left: -15px;
                        top: 16px;
                        width: 1px;
                        height: 95px;
                        background-color: @border-color;
                    }
                    &:not(:last-of-type) {
                        .u-column {
                            &:last-of-type {
                                &::before {
                                    position: absolute;
                                    left: -15px;
                                    top: 16px;
                                    content: "";
                                    width: 15px;
                                    height: 1px;
                                    background-color: @border-color;
                                }
                            }
                            &::after {
                                position: absolute;
                                right: -15px;
                                top: 16px;
                                content: "";
                                width: 20px;
                                height: 1px;
                                background-color: @border-color;
                            }
                        }
                    }
                }
            }
            &:nth-of-type(odd) {
                &:not(:last-of-type) {
                    &::after {
                        position: absolute;
                        content: "";
                        right: -15px;
                        top: 16px;
                        width: 1px;
                        height: 95px;
                        background-color: @border-color;
                    }
                    .u-column {
                        &::after {
                            position: absolute;
                            right: -15px;
                            top: 16px;
                            content: "";
                            width: 20px;
                            height: 1px;
                            background-color: @border-color;
                        }
                    }
                }
                &:not(:first-of-type) {
                    .u-column {
                        &:first-of-type {
                            &::before {
                                position: absolute;
                                left: -15px;
                                top: 16px;
                                content: "";
                                width: 15px;
                                height: 1px;
                                background-color: @border-color;
                            }
                        }
                    }
                }
            }
        }
        &.is-odd {
            // 奇数总行
            // 最后一行
            .u-row {
                &:last-of-type {
                    .u-column {
                        &:not(:last-of-type) {
                            &::after {
                                position: absolute;
                                right: -15px;
                                top: 16px;
                                content: "";
                                width: 20px;
                                height: 1px;
                                background-color: @border-color;
                            }
                        }
                    }
                }
            }
        }
        &.is-even {
            // 偶数总行
            // 最后一行
            .u-row {
                &:last-of-type {
                    .u-column {
                        &::after {
                            position: absolute;
                            right: -15px;
                            top: 16px;
                            content: "";
                            width: 20px;
                            height: 1px;
                            background-color: @border-color;
                        }
                    }
                }
            }
        }
    }
}
.is-map-phone {
    .m-bmap-simple {
        .u-list {
            align-items: flex-start;
            overflow-y: hidden;
            overflow-x: auto;
            padding: 10px 20px;
        }
        // .u-row {
        //     gap: 8px;
        //     height: 45px;
        //     &::after,
        //     &::before {
        //         .none;
        //     }
        //     .u-column {
        //         .size(32px, 32px);
        //         .u-img {
        //             .size(100%, 100%);
        //             img {
        //                 .size(100%, 100%);
        //             }
        //         }
        //         &::after,
        //         &::before {
        //             .none;
        //         }
        //     }
        //     .u-name {
        //         margin-top: -2px;
        //         font-size: 20px;
        //         transform: scale(0.5);
        //         text-align: center;
        //     }
        //     .u-tag,
        //     .u-gift {
        //         .none;
        //     }
        // }
    }
}
.u-bmap-tooltip {
    max-width: 200px;
    background-color: rgba(0, 0, 0, 0.8) !important;
    .u-top {
        .flex;
        align-items: flex-start;
        gap: 10px;
        .u-avatar {
            width: 36px;
            height: 36px;
        }
        .u-right {
            .flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            .u-name {
                font-size: 13px;
                .bold;
                color: #ff0;
            }
            .u-tag {
                color: orange;
            }
        }
    }
    .u-bottom {
        .fz(12px,1.5);
        .mt(10px);
        & > div {
            margin-bottom: 3px;
        }
    }
}
</style>
