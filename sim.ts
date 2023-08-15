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
    poweredStaff?: string;
}

const calcPoweredStaffMaxHit = (staffName: string | undefined, magicLvl: number) : number => {
    let maxHit = Math.floor(magicLvl/3);
    // source: https://oldschool.runescape.wiki/w/Maximum_magic_hit
    if (staffName === "Thammaron's Sceptre") {
        maxHit -= 8;
    } else if (staffName === "Accursed Sceptre") {
        maxHit -= 6;
    } else if (staffName === "Trident of the Seas") {
        maxHit -= 5;
    } else if (staffName === "Trident of the Swamp") {
        maxHit -= 2;
    } else if (staffName === "Sanguinesti Staff") {
        maxHit -= 1;
    } else if (staffName === "Tumeken's Shadow") {
        maxHit += 1;
    }
    return maxHit
}

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

const calcMaxHit = (style: string, stats: Stats, bonuses: MiscBonuses) : number => {
    let baseDamage;
    let effectiveStrength;
    let gearBonus;
    let maxHit;
    if (style === "melee") {
        effectiveStrength = calcEffectiveStrength("melee", stats.levels, bonuses);
        // source: https://oldschool.runescape.wiki/w/Maximum_melee_hit
        baseDamage = Math.floor(0.5 + (effectiveStrength * ((bonuses.strBoost+64)/640)));
        gearBonus = bonuses.slayer ? 7/6 :
            bonuses.salve ? 1.2 :
            bonuses.inq ? 1.025 : 1;
        maxHit = Math.floor(baseDamage * gearBonus);
    } else if (style === "ranged") {
        effectiveStrength = calcEffectiveStrength("range", stats.levels, bonuses);
        // source: https://oldschool.runescape.wiki/w/Maximum_ranged_hit
        baseDamage = Math.floor(0.5 + (effectiveStrength * ((bonuses.rangedBoost+64)/640)));
        gearBonus = bonuses.slayer ? 1.15 :
            bonuses.salve ? 1.2 : 1;
        maxHit = Math.floor(baseDamage * gearBonus);
    } else if (style === "magic") {
        baseDamage = calcPoweredStaffMaxHit(bonuses.poweredStaff, stats.levels.magic);
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
