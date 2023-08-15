interface CombatStats {
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
    stats: CombatStats;
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
    voidBonus?: boolean;
    slayerBonus?: boolean;
    tomeOfFireBonus?: boolean;
    tomeOfWaterBonus?: boolean;
    poweredStaff?: boolean;
}

const calcPoweredStaffMaxHit = (staffName: string, magicLvl: number) : number => {
    let maxHit = Math.floor(magicLvl/3);
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

const calcEffectiveStrength = (style: string, stats: CombatStats, miscBonuses: MiscBonuses) : number => {
    let effectiveStrength;


    return effectiveStrength
}

const calcMaxHit = (stats: Stats) : number => {
    let maxHit;


    return maxHit
}
