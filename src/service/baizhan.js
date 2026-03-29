import { $node, $cms } from "@jx3box/jx3box-common/js/api";

// 获取所有的百战BOSS列表
export function getBosses() {
    return $node().get("/monster/boss");
}

// 获取所有的百战Buff列表
export function getBuffs() {
    return $node().get("/monster/buffs");
}

// 获取所有的百战roll点效果
export function getEffects() {
    return $node().get("/monster/effects");
}

// 获取所有的百战技能类型列表
export function getTypes() {
    return $node().get("/monster/types");
}

// 百战技能查询
export function getSkills(params) {
    return $node().get("/monster/skills", {
        params,
    });
}

// 获取技能额外数据
export function getSkillInfo(params) {
    return $cms().get(`/api/cms/app/monster/skill`, {
        params,
    });
}

// 获取BOSS额外数据
export function getBossInfo(params) {
    return $cms().get(`/api/cms/app/monster/boss`, {
        params,
    });
}

// 获取当前地图
export function getMap(params) {
    return $cms().get(`/api/cms/app/monster/map`, {
        params,
    });
}
