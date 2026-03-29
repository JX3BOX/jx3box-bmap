<template>
    <div class="m-bmap" :class="isPhone && 'is-map-phone'" v-loading="loading">
        <component
            :is="currentComponent"
            :maps="maps"
            :column="column"
            :row="row"
            :bosses="bosses"
            :effects="effects"
            :effectsFilter="effectsFilter"
            :updatedAt="updatedAt"
            v-bind="$attrs"
        ></component>
    </div>
</template>

<script>
import { getBosses, getBossInfo, getSkills, getSkillInfo, getEffects, getMap } from "../service/baizhan";
import {
    effects as baizhanEffects,
    skill_costs,
    skill_types,
    skill_colors,
    effectsFilter,
} from "../assets/data/baizhan_effects.js";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

import MapList from "./MapList.vue";
import MapSimple from "./MapSimple.vue";
import MapCompleted from "./Map.vue";

export default {
    name: "BMap",
    inheritAttrs: false,
    components: {
        MapList,
        MapSimple,
        MapCompleted,
    },
    props: {
        mode: {
            type: String,
            default: "simple",
        },
    },
    data() {
        return {
            loading: false,
            client: location.href.includes("origin") ? "origin" : "std",
            types: {
                skill_colors: skill_colors,
                skill_costs: skill_costs,
                skill_types: skill_types,
            },
            bosses: [],
            skills: [],
            skillExtraList: [],
            effects: [],
            downLoading: false,
            column: 10,
            row: 6,
            maps: [],
            map: null,
            effectsFilter,
        };
    },
    computed: {
        updatedAt() {
            return this.map?.updated_at || new Date();
        },
        currentComponent() {
            let componentId = "MapComplete";
            const mode = this.mode;
            if (mode === "list") {
                componentId = "MapList";
            }
            if (mode === "simple") {
                componentId = "MapSimple";
            }
            if (mode === "completed") {
                componentId = "MapCompleted";
            }
            return componentId;
        },
        isPhone() {
            return document.documentElement.clientWidth <= 768;
        },
    },
    methods: {
        setState(val) {
            this[val.key] = val.val;
        },
        async loadBosses() {
            const cache = sessionStorage.getItem(`baizhan-bosses`);
            if (cache) {
                const data = JSON.parse(cache);
                this.setState({
                    key: "bosses",
                    val: data,
                });
            } else {
                // 手动强制替换 或没有存storage
                await getBosses().then((res) => {
                    let list = res.data?.data || [];
                    list = list.map((item) => {
                        return {
                            id: item.dwNpcID,
                            avatar: item.ImagePath
                                ? `${__imgPath}pve/baizhan/${item.ImagePath.match(/\\([^\\]*)\./)[1].toLowerCase()}_${
                                      item.ImageFrame
                                  }.png`
                                : `${__imgPath}pve/baizhan/fbcdpanel02_51.png`,
                            name: item.szName,
                            skills: item.szSkill,
                        };
                    });
                    let map = new Map();
                    let mapList = list.filter((v) => !map.has(v.name) && map.set(v.name, 1));
                    const names = mapList.map((item) => item.name).join(",");
                    getBossInfo({ names: names }).then((resInfo) => {
                        const bossExtraList = resInfo.data?.data || [];
                        const bosses = list.map((item) => {
                            item.link = bossExtraList.find((boss) => boss.boss_name === item.name)?.link || "";
                            return item;
                        });

                        this.setState({
                            key: "bosses",
                            val: bosses,
                        });
                        sessionStorage.setItem(`baizhan-bosses`, JSON.stringify(bosses));
                    });
                });
            }
        },
        async loadSkills() {
            const cache = sessionStorage.getItem(`baizhan-skills`);
            const extraCache = sessionStorage.getItem(`baizhan-skillExtraList`);
            if (cache && extraCache) {
                const data = JSON.parse(cache);
                this.setState({
                    key: "skills",
                    val: data,
                });
                this.setState({
                    key: "currentSkill",
                    val: data?.[0] || {},
                });
                const extraData = JSON.parse(extraCache);
                this.setState({
                    key: "skillExtraList",
                    val: extraData,
                });
            } else {
                await getSkills().then((res) => {
                    const list = res.data?.data?.list || [];
                    const ids = list.map((item) => item.dwInSkillID).join(",");
                    getSkillInfo({ ids: ids }).then((resInfo) => {
                        const skillExtraList = resInfo.data?.data || [];
                        const newList = list.map((item) => {
                            const extra = skillExtraList.find((extra) => extra.skill_id === item.dwInSkillID) || {};
                            item.extra = extra;
                            item.skillIconId = item?.Skill?.IconID;
                            if (item.szBossName === "钱宗龙杜姬欣") {
                                item.szBossName = "钱宗龙";
                            }
                            return item;
                        });
                        this.setState({
                            key: "skills",
                            val: newList,
                        });
                        this.setState({
                            key: "currentSkill",
                            val: newList?.[0] || {},
                        });
                        this.setState({
                            key: "skillExtraList",
                            val: skillExtraList,
                        });
                        sessionStorage.setItem(`baizhan-skills`, JSON.stringify(newList));
                        sessionStorage.setItem(`baizhan-skillExtraList`, JSON.stringify(skillExtraList));
                    });
                });
            }
        },
        async loadEffects() {
            const cache = sessionStorage.getItem(`baizhan-effects`);
            if (cache) {
                const data = JSON.parse(cache);
                this.setState({
                    key: "effects",
                    val: data,
                });
            } else {
                await getEffects().then((res) => {
                    const list = res.data?.data || [];
                    list.unshift({
                        nID: 0,
                        dwIconID: 18505,
                        szName: "无",
                        szDescription: "",
                        reward: 0,
                        tags: "",
                        buffID: 24848,
                    });
                    const effects = list.map((item) => {
                        const effect = baizhanEffects.find((effect) => effect.id === item.nID) || {};
                        let reward = effect.reward;
                        if (effect.rewardRegexp) {
                            const matches = item.szDescription.match(effect.rewardRegexp);
                            if (matches?.[1]) {
                                reward = Number(matches[1]);
                            }
                        }
                        return {
                            ...item,
                            reward: reward || 0,
                            tags: effect?.tags || [],
                            buffID: effect?.buffID || 24848,
                            buffLevel: effect?.buffLevel || 1,
                        };
                    });
                    this.setState({
                        key: "effects",
                        val: effects,
                    });
                    sessionStorage.setItem(`baizhan-effects`, JSON.stringify(effects));
                });
            }
        },
        async loadMap() {
            await getMap().then((res) => {
                if (res.data?.code !== 0) return;
                this.map = res.data?.data || "";

                const bosses = this.bosses;
                const effects = this.effects;
                const data = res.data?.data?.data || [];
                const list = data.map((item) => {
                    return {
                        ...item,
                        boss: bosses.find((boss) => boss.id === item.dwBossID),
                        bossName: bosses.find((boss) => boss.id === item.dwBossID)?.name,
                        bossLink: bosses.find((boss) => boss.id === item.dwBossID)?.link,
                        bossAvatar: bosses.find((boss) => boss.id === item.dwBossID)?.avatar,
                        effect: effects.find((effect) => effect.nID === item.nEffectID),
                    };
                });
                this.setState({
                    key: "maps",
                    val: list,
                });
            });
        },
        async loadData() {
            const proArr = [];

            const bossPro = await this.loadBosses();
            proArr.push(bossPro);

            const skillPro = await this.loadSkills();
            proArr.push(skillPro);

            const effectPro = await this.loadEffects();
            proArr.push(effectPro);
            this.loading = true;
            await Promise.allSettled(proArr).then(() => {
                this.loadMap();
                this.loading = false;
            });
        },
    },
    mounted() {
        this.loadData();
    },
};
</script>

<style lang="less">
img {
    max-width: 100%;
}
</style>
