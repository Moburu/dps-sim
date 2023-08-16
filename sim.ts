interface CombatLevels {
    hp: number;
    atk: number;
    str: number;
    def: number;
    magic: number;
    ranged: number;
}

interface OffensiveBonuses {
    atk: number;
    str: number;
    magicAtk: number;
    magicDmg: number;
    rangedAtk: number;
    rangedStr: number;
}

interface DefensiveBonuses {
    stab: number;
    slash: number;
    crush: number;
    magic: number;
    ranged: number;
}

interface Stats {
    levels: CombatLevels;
    offBonus: OffensiveBonuses;
    defBonus: DefensiveBonuses
}

interface MiscBonuses {
    atkBoost: number;
    strBoost: number;
    magicBoost: number;
    rangedBoost: number;
    prayerStrBonus: number;
    prayerAtkBonus: number;
    styleStrBonus: number;
    styleAtkBonus: number;
    salve?: boolean;
    void?: boolean;
    slayer?: boolean;
    inq?: boolean;
    tomeOfFire?: boolean;
    tomeOfWater?: boolean;
    tbow?: boolean;
    poweredStaff?: string;
}

const calcPoweredStaffMaxHit = (magicLvl: number, staffName: string | undefined) : number => {
    return Math.floor(magicLvl/3) + ({
        "Thammaron's Sceptre": -8,
        "Accursed Sceptre": -6,
        "Trident of the Seas": -5,
        "Trident of the Swamp": -2,
        "Sanguinesti Staff": -1,
        "Tumeken's Shadow": 1}[staffName!] ?? 0) }

const calcEffectiveStrength = (style: string, stats: CombatLevels, bonuses: MiscBonuses) : number => {
    let effectiveStrength;
    if (style === "melee") {
        // source: https://oldschool.runescape.wiki/w/Maximum_melee_hit
        effectiveStrength = Math.floor((Math.floor((stats.str+bonuses.strBoost)*bonuses.prayerStrBonus)+bonuses.styleStrBonus+8)*(bonuses.void ? 1.1 : 1));
    }
    else if (style === "ranged") {
        // source: https://oldschool.runescape.wiki/w/Maximum_ranged_hit
        effectiveStrength = Math.floor((Math.floor((stats.ranged+bonuses.rangedBoost)*bonuses.prayerStrBonus)+bonuses.styleStrBonus+8)*(bonuses.void ? 1.125 : 1));
    }
    return effectiveStrength
}

const calcEffectiveAttack = (style: string, levels: CombatLevels, bonuses: MiscBonuses) : number => {
    let effectiveAttack;
    if (style === "melee") {
        // source: https://oldschool.runescape.wiki/w/Maximum_melee_hit
        effectiveAttack = Math.floor((Math.floor((levels.atk + bonuses.atkBoost) * bonuses.prayerAtkBonus) + bonuses.styleAtkBonus + 8) * (bonuses.void ? 1.1 : 1));
    }
    else if (style === "ranged") {
        // source: https://oldschool.runescape.wiki/w/Maximum_ranged_hit
        effectiveAttack = Math.floor((Math.floor((levels.ranged + bonuses.rangedBoost) * bonuses.prayerAtkBonus) + bonuses.styleAtkBonus + 8) * (bonuses.void ? 1.1 : 1));
    } else if (style === "magic") {
        // source: https://oldschool.runescape.wiki/w/Damage_per_second/Magic
        effectiveAttack = Math.floor(Math.floor((levels.magic + bonuses.magicBoost) * bonuses.prayerAtkBonus) * (bonuses.void ? 1.45 : 1)) + bonuses.styleAtkBonus + 9;
    }
    return effectiveAttack
}

// TODO: Include twisted bow modifier
const calcMaxAttackRoll = (style: string, stats: Stats, bonuses: MiscBonuses) : number => {
    let maxAttackRoll;
    const effectiveAttack = calcEffectiveAttack(style, stats.levels, bonuses);
    // source: https://oldschool.runescape.wiki/w/Damage_per_second/Melee
    if (style === "melee") {
        maxAttackRoll = effectiveAttack * (stats.offBonus.atk + 64) * (bonuses.void ? 1.1 : 1) * (bonuses.slayer ? 7/6 : bonuses.salve ? 1.2 : 1) * (bonuses.inq ? 1.025 : 1);
    }
    // source: https://oldschool.runescape.wiki/w/Damage_per_second/Ranged
    else if (style === "ranged") {
        maxAttackRoll = effectiveAttack * (stats.offBonus.rangedAtk + 64) * (bonuses.void ? 1.1 : 1) * (bonuses.slayer ? 1.15 : bonuses.salve ? 1.2 : 1);
    } else if (style === "magic") {
        maxAttackRoll - effectiveAttack * (stats.offBonus.magicAtk + 64) * (bonuses.salve || bonuses.slayer ? 1.15 : 1);
    }
    return Math.floor(maxAttackRoll)
}

const calcMaxDefenceRoll = (style: string, stats: Stats, substyle?: string) : number => {
    let maxDefenceRoll;
    // source: https://oldschool.runescape.wiki/w/Damage_per_second/Melee
    if (style === "melee") {
        if (substyle === "stab") {
            maxDefenceRoll = (stats.levels.def + 9) * (stats.defBonus.stab + 64)
        } else if (substyle === "slash") {
            maxDefenceRoll = (stats.levels.def + 9) * (stats.defBonus.slash + 64)
        }
        else if (substyle === "crush") {
            maxDefenceRoll = (stats.levels.def + 9) * (stats.defBonus.crush + 64)
        }
    }
    // source: https://oldschool.runescape.wiki/w/Damage_per_second/Ranged
    else if (style === "ranged") {
        maxDefenceRoll = (stats.levels.def + 9) * (stats.defBonus.ranged + 64);
    }
    // source: https://oldschool.runescape.wiki/w/Damage_per_second/Magic
    else if (style === "magic") {
        maxDefenceRoll = (stats.levels.magic + 9) * (stats.defBonus.magic + 64);
    }
    return maxDefenceRoll
}

const rollAccuracy = (maxRoll: number) : number => Math.floor((Math.random() * maxRoll) + 1)

const calcHitChance = (attackRoll: number, defenceRoll: number) : number => {
    if (attackRoll > defenceRoll) {
        return 1 - ((defenceRoll + 2) / (2 * (attackRoll + 1)))
    } else {
        return attackRoll / (2 * (defenceRoll + 1))
    }
}

// TODO: Include twisted bow modifier
const calcMaxHit = (style: string, stats: Stats, bonuses: MiscBonuses) : number => {
    let baseDamage;
    let effectiveStrength;
    let gearBonus;
    let maxHit;
    if (style === "melee") {
        effectiveStrength = calcEffectiveStrength("melee", stats.levels, bonuses);
        // source: https://oldschool.runescape.wiki/w/Maximum_melee_hit
        baseDamage = Math.floor(0.5 + (effectiveStrength * ((bonuses.strBoost+64)/640)));
        gearBonus = (bonuses.slayer ? 7/6 :
            bonuses.salve ? 1.2 : 1) *
            (bonuses.inq ? 1.025 : 1);
        maxHit = Math.floor(baseDamage * gearBonus);
    } else if (style === "ranged") {
        effectiveStrength = calcEffectiveStrength("range", stats.levels, bonuses);
        // source: https://oldschool.runescape.wiki/w/Maximum_ranged_hit
        baseDamage = Math.floor(0.5 + (effectiveStrength * ((bonuses.rangedBoost+64)/640)));
        gearBonus = bonuses.slayer ? 1.15 :
            bonuses.salve ? 1.2 : 1;
        maxHit = Math.floor(baseDamage * gearBonus);
    } else if (style === "magic") {
        baseDamage = calcPoweredStaffMaxHit(stats.levels.magic, bonuses.poweredStaff);
        // source: https://oldschool.runescape.wiki/w/Maximum_magic_hit
        let adjustedBaseDamage = Math.floor(baseDamage * (1 + stats.offBonus.magicDmg));
        if (bonuses.slayer || bonuses.void) {
            adjustedBaseDamage = Math.floor(adjustedBaseDamage * 1.15);
        }
        if (bonuses.tomeOfFire) {
            adjustedBaseDamage = Math.floor(adjustedBaseDamage * 1.5);
        }
        if (bonuses.tomeOfWater) {
            adjustedBaseDamage = Math.floor(adjustedBaseDamage * 1.2);
        }
        maxHit = adjustedBaseDamage;
    }
    return maxHit
}
