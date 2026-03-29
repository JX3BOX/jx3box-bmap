<template>
    <div class="m-bmap-list">
        <div class="u-tabs" v-if="maps.length">
            <div
                class="u-tab"
                :class="activeIndex === i && 'is-active'"
                v-for="i in base"
                :key="i"
                @click="activeIndex = i"
            >
                {{ (i - 1) * per + 1 }}~{{ i * per }}
            </div>
        </div>
        <div class="u-list" v-if="maps.length">
            <div
                class="u-item"
                ref="mapItem"
                :class="getSpecialStyle(index)"
                v-for="(item, index) in maps"
                :key="item.dwBossID"
                @click="toMap(index)"
            >
                <div class="u-item-left">
                    <!-- <div class="u-index">{{ (activeIndex - 1) * per + index + 1 }}</div> -->
                    <div class="u-index">{{ index + 1 }}</div>
                    <div class="u-avatar">
                        <img :src="item.bossAvatar" :alt="item.bossName" />
                    </div>
                    <div class="u-name">{{ item.bossName }}</div>
                </div>
                <div v-if="item.nEffectID" class="u-item-right">
                    <img :src="iconLink(item.effect.dwIconID)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { cloneDeep } from "lodash";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import jx3box from "@jx3box/jx3box-common/data/jx3box.json";
const { __Root } = jx3box;
export default {
    name: "MapList",
    props: {
        maps: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            activeIndex: 1,
            base: 3,
        };
    },
    computed: {
        mapList() {
            const list = [];
            let per = this.per;
            const maps = cloneDeep(this.maps);
            for (let i = 0; i < this.base; i++) {
                list.push(maps.slice(i * per, (i + 1) * per));
            }
            return list;
        },
        per() {
            const len = this.maps.length;
            return (len - (len % this.base)) / this.base;
        },
    },
    watch: {
        activeIndex(index) {
            const refIndex = index > 1 ? (index - 1) * this.per - 1 : (index - 1) * this.per;
            this.$refs.mapItem[refIndex].scrollIntoView({
                behavior: "smooth",
                block: refIndex ? "start" : "center",
            });
        },
    },
    methods: {
        iconLink,
        getSpecialStyle(i) {
            const index = i + 1;
            return !(index % 10) ? "is-special" : "";
        },
        toMap(i) {
            let url = process.env.NODE_ENV === "development" ? __Root : location.origin + "/";
            if (!isNaN(i)) {
                url += `fb/baizhan?floor=${i + 1}`;
            }
            window.open(url, "_blank");
        },
    },
};
</script>

<style lang="less">
.m-bmap-list {
    box-sizing: border-box;
    .u-tabs {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        background-color: #fff;
        z-index: 2;
        .u-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 76.67px;
            height: 24px;
            border-radius: 5px;
            border: 1px solid #ebebeb;
            font-size: 12px;
            color: #777;
            cursor: pointer;
            box-sizing: border-box;
            &.is-active,
            &:hover {
                background-color: #a361e4;
                color: #fff;
                border: 1px solid #a361e4;
            }
        }
    }
    .u-list {
        margin-bottom: 10px;
        .flex;
        flex-direction: column;
        gap: 10px;
        .u-item {
            background-color: #f4f4f4;
            .size(calc(100% - 20px), 30px);
            border-radius: 2px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            .u-item-left {
                .flex;
                align-items: center;
                height: 100%;
                gap: 10px;
                color: #777;
                .u-index {
                    .w(12px);
                    font-size: 10px;
                }
                .u-avatar {
                    .size(18px, 18px);
                    .r(50%);
                }
                .u-name {
                    font-size: 12px;
                }
            }
            &:hover {
                background-color: #f1e3ff;
            }
            &.is-special {
                background-color: #fe7171;
                .u-item-left {
                    color: #fff;
                }
                &:hover {
                    background-color: #a361e4;
                }
            }
            .u-item-right {
                .size(12px, 12px);
                .flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                overflow: hidden;
                img {
                    transform: scale(1.1);
                }
            }
        }
    }
}
</style>
