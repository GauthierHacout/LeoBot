
// Every unicodes for flags emojis
const FLAGS = {
    FRENCH: '\u{1F1EB}\u{1F1F7}',
    SPANISH: '\u{1F1EA}\u{1F1F8}',
};

// Every unicodes for emojis
const EMOJIS = {
    ONE_HUNDRED: '\u{1F4AF}',
    HEARTH_WITH_STARS: '\u{1F496}',
    FACE_WITH_HEARTS: '\u{1F970}',
    WAVING_HAND: '\u{1F590}',
    MECHANICAL_ARM: '\u{1F9BE}',
    PROGRAMMER: '\u{1F468}\u{200D}\u{1F4BB}',
    FENCING: '\u{1F93A}',
    RHINO: '\u{1F98F}',
    BENTO: '\u{1F371}',
};

// Every unicodes for weather emojis
const WEATHER = {
    WIND: '\u{1F32A}\u{FE0F}',
    WATER: '\u{1F4A7}',
    THERMOMETER: '\u{1F321}',
    UV: '\u{2600}',
    RAIN: '\u{1F327}',
};

// Discord identifier for emojis used in the timebomb game & unicode emojis
// used to represent the teams, description is used to explain the gaeme mode
const TIMEBOMB = {
    BOMB: '<:Bomb:696729892334862436>',
    DEFUSER: '<:Defuser:696729911389454336>',
    NEUTRAL: '<:Neutral:696729921841528853>',
    EVIL: '\u{1F608}',
    GOOD: '\u{1F607}',
    DESCRIPTION: `\n The \u{1F608} team is trying to make to bomb (<:Bomb:696729892334862436>) explode. `+
    `\n The \u{1F607} team has to defuse it. `+
    `They need to find all the specialists (<:Defuser:696729911389454336>), `+
    `cause normal people (<:Neutral:696729921841528853>) are no use in this situation !`,
};

exports.FLAGS = FLAGS;
exports.EMOJIS = EMOJIS;
exports.TB = TIMEBOMB;
exports.W = WEATHER;
