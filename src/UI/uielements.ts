let invalidIDs : string[] = [];

function getUIElement<T extends HTMLElement>( id: string, isOptional: boolean = false ) : T {
    let newElement = document.getElementById(id) as T;
    if ( newElement == null && !isOptional ) {
        invalidIDs.push(id);
    }
    return newElement;
}

function assertInitializationSuccess() {
    if ( invalidIDs.length > 0 ) {
        throw `Element with ID '${invalidIDs.join(',')}' not found.`;
    }
}

// ========================================================================
// ========================================================================
/* HTML DECLARATION INDEX

    HEADER ELEMENTS

    RAID BOSS SECTION
        - Raid preset tab buttons
        - Raid boss sprite and selection
        - Raid boss preset divs
        - Raid boss stats grid
        - Raid boss data
        - Raid boss ability
        - Raid boss main moveset
        - Raid boss extra moveset
        - Raid boss extra actions

    MAIN PARAMETERS SECTION

    SEARCH PARAMETERS SECTION
        -
        -
        -
        -
    
    RESULTS SECTION

======================================================================== */

const UIElements = {

    HelpSection: {
        UserGuidePopup: getUIElement<HTMLElement>('userGuide'),
        UserGuideToggle: getUIElement<HTMLButtonElement>('userGuideButton'),
    },

    // ========================================================================
    // ========================================================================
    // HEADER ELEMENTS
    Header: {
        calculateButton: getUIElement<HTMLButtonElement>('calculateButton'),

        focusTableButton: getUIElement<HTMLButtonElement>("focusTableButton"),
        advancedModeToggle: getUIElement<HTMLButtonElement>('advancedToggleButton'),
        ssTestButton: getUIElement<HTMLButtonElement>("ssTest"),
    },


    // ========================================================================
    // ========================================================================
    // RAID BOSS SECTION
    RaidBoss: {

        ExportPopupButton: getUIElement<HTMLButtonElement>('pokemonRaidExportButton'),

        ExportDataPrompt: getUIElement<HTMLElement>('bossExportPrompt'),
        ExportImportButton: getUIElement<HTMLButtonElement>('exportImportButton'),
        ExportReturnButton: getUIElement<HTMLButtonElement>('exportReturnButton'),
        ExportTextContent: getUIElement<HTMLTextAreaElement>('exportTextArea'),
        ExportErrorMessage: getUIElement<HTMLElement>('exportErrorMessage'),

        // Raid preset tab buttons
        CustomPresetButton: getUIElement<HTMLButtonElement>('pokemonRaidPresetCustomButton'),
        R5PresetButton: getUIElement<HTMLButtonElement>('pokemonRaidPresetRaid5Button'),
        R6PresetButton: getUIElement<HTMLButtonElement>('pokemonRaidPresetRaid6Button'),
        R5EPresetButton: getUIElement<HTMLButtonElement>('pokemonRaidPresetRaid5EButton'),
        R7EPresetButton: getUIElement<HTMLButtonElement>('pokemonRaidPresetRaid7EButton'),

        // Raid boss sprite and selection
        CustomSelect: getUIElement<HTMLSelectElement>('pokemonBossSelectCustom'),
        R5Select: getUIElement<HTMLSelectElement>('pokemonBossSelect5S'),
        R6Select: getUIElement<HTMLSelectElement>('pokemonBossSelect6S'),
        R5ESelect: getUIElement<HTMLSelectElement>('pokemonBossSelect5SE'),
        R7ESelect: getUIElement<HTMLSelectElement>('pokemonBossSelect7SE'),
        BossSprite: getUIElement<HTMLImageElement>('pokemonBossSprite'),

        // Raid boss preset divs (Used to show/hide selection)
        CustomGroup: getUIElement<HTMLDivElement>('CustomPokeBlock'),
        R5Group: getUIElement<HTMLDivElement>('5SBlock'),
        R5EGroup: getUIElement<HTMLDivElement>('5SEBlock'),
        R6Group: getUIElement<HTMLDivElement>('6SBlock'),
        R7EGroup: getUIElement<HTMLDivElement>('7SEBlock'),

        // Raid boss stats grid
        BossHPBase: getUIElement<HTMLInputElement>('parameterBossHPBase'),
        BossHPIV: getUIElement<HTMLInputElement>('parameterBossHPIV'),
        BossHPEV: getUIElement<HTMLInputElement>('parameterBossHPEV'),
        BossHPCalc: getUIElement<HTMLDivElement>('parameterBossHPCalc'),

        BossAtkBase: getUIElement<HTMLInputElement>('parameterBossAtkBase'),
        BossAtkIV: getUIElement<HTMLInputElement>('parameterBossAtkIV'),
        BossAtkEV: getUIElement<HTMLInputElement>('parameterBossAtkEV'),
        BossAtkStage: getUIElement<HTMLInputElement>('parameterBossAtkStage'),
        BossAtkCalc: getUIElement<HTMLDivElement>('parameterBossAtkCalc'),

        BossDefBase: getUIElement<HTMLInputElement>('parameterBossDefBase'),
        BossDefIV: getUIElement<HTMLInputElement>('parameterBossDefIV'),
        BossDefEV: getUIElement<HTMLInputElement>('parameterBossDefEV'),
        BossDefStage: getUIElement<HTMLInputElement>('parameterBossDefStage'),
        BossDefCalc: getUIElement<HTMLDivElement>('parameterBossDefCalc'),

        BossSpaBase: getUIElement<HTMLInputElement>('parameterBossSpaBase'),
        BossSpaIV: getUIElement<HTMLInputElement>('parameterBossSpaIV'),
        BossSpaEV: getUIElement<HTMLInputElement>('parameterBossSpaEV'),
        BossSpaStage: getUIElement<HTMLInputElement>('parameterBossSpaStage'),
        BossSpaCalc: getUIElement<HTMLDivElement>('parameterBossSpaCalc'),

        BossSpdBase: getUIElement<HTMLInputElement>('parameterBossSpdBase'),
        BossSpdIV: getUIElement<HTMLInputElement>('parameterBossSpdIV'),
        BossSpdEV: getUIElement<HTMLInputElement>('parameterBossSpdEV'),
        BossSpdStage: getUIElement<HTMLInputElement>('parameterBossSpdStage'),
        BossSpdCalc: getUIElement<HTMLDivElement>('parameterBossSpdCalc'),

        BossSpeBase: getUIElement<HTMLInputElement>('parameterBossSpeBase'),
        BossSpeIV: getUIElement<HTMLInputElement>('parameterBossSpeIV'),
        BossSpeEV: getUIElement<HTMLInputElement>('parameterBossSpeEV'),
        BossSpeStage: getUIElement<HTMLInputElement>('parameterBossSpeStage'),
        BossSpeCalc: getUIElement<HTMLDivElement>('parameterBossSpeCalc'),

        // Raid boss data
        BossTeraType: getUIElement<HTMLSelectElement>('pokemonBossTeraType'),
        BossNature: getUIElement<HTMLSelectElement>('pokemonBossNature'),
        BossLevel: getUIElement<HTMLInputElement>('pokemonBossLevel'),
        BossHPMultiplier: getUIElement<HTMLSelectElement>('pokemonBossHpMultiplier'),
        BossStatus: getUIElement<HTMLSelectElement>('pokemonBossStatus'),
        BossHeldItem: getUIElement<HTMLSelectElement>('pokemonBossHeldItem'),

        // Raid boss ability
        BossAbilityLabel: getUIElement('pokemonBossAbilityLabel'),
        BossNaturalAbilitySelect: getUIElement<HTMLSelectElement>('pokemonBossNaturalAbilities'),
        BossAllAbilitiesSelect: getUIElement<HTMLSelectElement>('pokemonBossAllAbilities'),


        // Raid boss main moveset
        BossMove1: getUIElement<HTMLSelectElement>('pokemonBossMove1'),
        BossMove2: getUIElement<HTMLSelectElement>('pokemonBossMove2'),
        BossMove3: getUIElement<HTMLSelectElement>('pokemonBossMove3'),
        BossMove4: getUIElement<HTMLSelectElement>('pokemonBossMove4'),
        BossMoveDefaultButton : getUIElement<HTMLButtonElement>('pokemonBossMainMoveDefault'),
        BossMoveClearButton : getUIElement<HTMLButtonElement>('pokemonBossMainMoveClear'),

        // Raid boss extra moveset
        BossAddMove1: getUIElement<HTMLSelectElement>('pokemonBossAddMove1'),
        BossAddMove2: getUIElement<HTMLSelectElement>('pokemonBossAddMove2'),
        BossAddMove3: getUIElement<HTMLSelectElement>('pokemonBossAddMove3'),
        BossAddMove4: getUIElement<HTMLSelectElement>('pokemonBossAddMove4'),
        BossAddMoveDefaultButton: getUIElement<HTMLButtonElement>('pokemonBossAddMoveDefault'),
        BossAddMoveClearButton : getUIElement<HTMLButtonElement>('pokemonBossAddMoveClear'),

        // Raid boss extra actions
        BossActionSection: getUIElement<HTMLElement>('pokemonBossExtraActionSection'),
        BossActionTable: getUIElement<HTMLTableElement>('pokemonBossActionTable'),

    },

    // ========================================================================
    // ========================================================================
    // MAIN PARAMETERS SECTION

    MainParams: {

        parameterSearchType: getUIElement<HTMLSelectElement>('searchtype'),
        parameterSearchDamageRank: getUIElement<HTMLSelectElement>('parameterSearchDamageRank'),
        parameterSearchDefNaturePref: getUIElement<HTMLSelectElement>('parameterSearchDefNature'),
        parameterSearchDefNaturePrefPQ: getUIElement<HTMLSelectElement>('parameterSearchDefNaturePQ'),
        parameterDefenderTeraType: getUIElement<HTMLSelectElement>('parameterDefenderTeraType'),

        // ========================================================================
        // Result Parameters Section
        parameterResultMoveVisibility: getUIElement<HTMLSelectElement>('parameterResultMoveVisibility'),
        parameterResultMoveDamage: getUIElement<HTMLSelectElement>('parameterResultMoveDamage'),
        parameterResultShowSprites: getUIElement<HTMLInputElement>('parameterResultShowSprites'),
        parameterResultShowOutspeed: getUIElement<HTMLInputElement>('parameterResultShowOutspeed'),
        parameterResultShowLeftoverEV: getUIElement<HTMLInputElement>('parameterResultShowLeftoverEV'),

    },

    // ========================================================================
    // ========================================================================
    // SEARCH PARAMETERS SECTION

    SearchParams: {

        // Search Parameters Section container (Advanced Mode will toggle this element)
        SearchParamContainer: getUIElement('searchParams'),

        // Search filters section
        FilterWhitelistSelect: getUIElement<HTMLSelectElement>('filterWhitelistSelect'),
        FilterWhitelistAdd: getUIElement<HTMLSelectElement>('filterWhitelistAddButton'),
        FilterWhitelistClear: getUIElement<HTMLSelectElement>('filterWhitelistClearButton'),
        FilterWhitelist: getUIElement<HTMLUListElement>('filterWhitelist'),

        FilterNFE: getUIElement<HTMLSelectElement>('filterNFE'),
        FilterSTAB: getUIElement<HTMLInputElement>('filterSTAB'),

        DexDescription: getUIElement<HTMLDivElement>('filterDexDescription'),
        FilterDexPaldea: getUIElement<HTMLInputElement>('filterDexPaldea'),
        FilterDexTeal: getUIElement<HTMLInputElement>('filterDexTeal'),
        FilterDexIndigo: getUIElement<HTMLInputElement>('filterDexIndigo'),
        FilterDexHOME: getUIElement<HTMLInputElement>('filterDexHome'),

        RarityDescription: getUIElement<HTMLDivElement>('filterRarityDescription'),
        FilterRarityRegular: getUIElement<HTMLInputElement>('filterRarityRegular'),
        FilterRarityParadox: getUIElement<HTMLInputElement>('filterRarityParadox'),
        FilterRarityLegendary: getUIElement<HTMLInputElement>('filterRarityLegendary'),
        FilterRarityMythical: getUIElement<HTMLInputElement>('filterRarityMythical'),

        // ========================================================================
        // Moves Parameters Section
        MoveMultiStrike2to5: getUIElement<HTMLSelectElement>('parameterMoveMultiStrike2to5'),
        MoveMultiStrikePopulationBomb: getUIElement<HTMLSelectElement>('parameterMoveMultiStrikePopBomb'),

        // Ability Parameters Section
        AbilityDisableBoss: getUIElement<HTMLInputElement>('abilityDisableBoss'),
        AbilityDisableDefender: getUIElement<HTMLInputElement>('abilityDisableDefender'),

        AbilityActivateTerrain: getUIElement<HTMLInputElement>('abilityActivateTerrain'),
        AbilityActivateWeather: getUIElement<HTMLInputElement>('abilityActivateWeather'),
        //const parameterAbilityForceTrigger: getUIElement<>('abilityForceTrigger'),

        AbilityMultiscale: getUIElement<HTMLInputElement>('abilityEnableMultiscale'),
        AbilityTeraShell: getUIElement<HTMLInputElement>('abilityEnableTeraShell'),
        AbilityMarvelScale: getUIElement<HTMLInputElement>('abilityEnableMarvelScale'),
        AbilityGrassPelt: getUIElement<HTMLInputElement>('abilityEnableGrassPelt'),
        AbilityOpportunist: getUIElement<HTMLInputElement>('abilityEnableOpportunist'),
        AbilityIntimidate: getUIElement<HTMLInputElement>('abilityEnableIntimidate'),
        AbilityIntrepidSword: getUIElement<HTMLInputElement>('abilityEnableIntrepidSword'),
        AbilityDauntlessShield: getUIElement<HTMLInputElement>('abilityEnableDauntlessShield'),
        AbilityImposter: getUIElement<HTMLInputElement>('abilityEnableImposter'),
        AbilitySlowStart: getUIElement<HTMLInputElement>('abilityEnableSlowStart'),
        AbilityNeutralizingGas: getUIElement<HTMLInputElement>('abilityEnableNeutralizingGas'),
        AbilityOrichalcumPulse: getUIElement<HTMLInputElement>('abilityEnableOrichalcumPulse'),
        AbilityDrought: getUIElement<HTMLInputElement>('abilityEnableDrought'),
        AbilityDrizzle: getUIElement<HTMLInputElement>('abilityEnableDrizzle'),
        AbilitySandStream: getUIElement<HTMLInputElement>('abilityEnableSandStream'),
        AbilitySnowWarning: getUIElement<HTMLInputElement>('abilityEnableSnowWarning'),
        AbilityHadronEngine: getUIElement<HTMLInputElement>('abilityEnableHadronEngine'),
        AbilityElectricSurge: getUIElement<HTMLInputElement>('abilityEnableElectricSurge'),
        AbilityGrassySurge: getUIElement<HTMLInputElement>('abilityEnableGrassySurge'),
        AbilityPsychicSurge: getUIElement<HTMLInputElement>('abilityEnablePsychicSurge'),
        AbilityMistySurge: getUIElement<HTMLInputElement>('abilityEnableMistySurge'),
        AbilityWaterAbsorb: getUIElement<HTMLInputElement>('abilityEnableWaterAbsorb'),
        AbilityDrySkin: getUIElement<HTMLInputElement>('abilityEnableDrySkin'),
        AbilityStormDrain: getUIElement<HTMLInputElement>('abilityEnableStormDrain'),
        AbilityVoltAbsorb: getUIElement<HTMLInputElement>('abilityEnableVoltAbsorb'),
        AbilityMotorDrive: getUIElement<HTMLInputElement>('abilityEnableMotorDrive'),
        AbilityLightningRod: getUIElement<HTMLInputElement>('abilityEnableLightningRod'),
        AbilityFlashFire: getUIElement<HTMLInputElement>('abilityEnableFlashFire'),
        AbilitySapSipper: getUIElement<HTMLInputElement>('abilityEnableSapSipper'),
        AbilityLevitate: getUIElement<HTMLInputElement>('abilityEnableLevitate'),
        AbilityQuarkDrive: getUIElement<HTMLInputElement>('abilityEnableQuarkDrive'),
        AbilityProtosynthesis: getUIElement<HTMLInputElement>('abilityEnableProtosynthesis'),
        AbilityAirLock: getUIElement<HTMLInputElement>('abilityEnableAirLock'),


        AbilityForceGrassPelt: getUIElement<HTMLInputElement>('abilityForceGrassPelt'),
        AbilityForceMarvelScale: getUIElement<HTMLSelectElement>('abilityForceMarvelScale'),
        AbilityForceQuarkDrive: getUIElement<HTMLInputElement>('abilityForceQuarkDrive'),
        AbilityForceProtosynthesis: getUIElement<HTMLInputElement>('abilityForceProtosynthesis'),

        // ========================================================================
        // Item Parameters Section
        ItemDisableBoss: getUIElement<HTMLInputElement>('parameterItemDisableBoss'),
        ItemDisableDefender: getUIElement<HTMLInputElement>('parameterItemDisableDefender'),

        ItemDefaultSelect: getUIElement<HTMLSelectElement>('parameterItemDefaultSelect'),
        ItemEvioliteToNFE: getUIElement<HTMLInputElement>('parameterItemEvioliteToNFE'),
        ItemBoosterEnergyToPQ: getUIElement<HTMLInputElement>('parameterItemBoosterEnergyToPQ'),

        // ========================================================================
        // Field Parameters Section
        FieldLockTerrain: getUIElement<HTMLInputElement>('parameterFieldLockTerrain'),
        FieldLockWeather: getUIElement<HTMLInputElement>('parameterFieldLockWeather'),
        FieldWeatherSelect: getUIElement<HTMLSelectElement>('parameterFieldWeatherSelect'),
        FieldTerrainSelect: getUIElement<HTMLSelectElement>('parameterFieldTerrainSelect'),

        FieldGravity: getUIElement<HTMLInputElement>('parameterFieldGravity'),
        FieldWonderRoom: getUIElement<HTMLInputElement>('parameterFieldWonderRoom'),
        FieldMagicRoom: getUIElement<HTMLInputElement>('parameterFieldMagicRoom'),
        FieldTrickRoom: getUIElement<HTMLInputElement>('parameterFieldTrickRoom'),

        FieldTabletsOfRuin: getUIElement<HTMLInputElement>('parameterFieldTabletsOfRuin'),
        FieldVesselOfRuin: getUIElement<HTMLInputElement>('parameterFieldVesselOfRuin'),
        FieldSwordOfRuin: getUIElement<HTMLInputElement>('parameterFieldSwordOfRuin'),
        FieldBeadsOfRuin: getUIElement<HTMLInputElement>('parameterFieldBeadsOfRuin'),

        FieldBossReflect: getUIElement<HTMLInputElement>('parameterFieldBossReflect'),
        FieldBossLightScreen: getUIElement<HTMLInputElement>('parameterFieldBossLightScreen'),
        FieldBossAuroraVeil: getUIElement<HTMLInputElement>('parameterFieldBossAuroraVeil'),
        FieldBossTailwind: getUIElement<HTMLInputElement>('parameterFieldBossTailwind'),
        FieldBossFocusEnergy: getUIElement<HTMLInputElement>('parameterFieldBossFocusEnergy'),

        FieldDefenderDefCheer: getUIElement<HTMLInputElement>('parameterFieldDefenderDefCheer'),
        FieldDefenderReflect: getUIElement<HTMLInputElement>('parameterFieldDefenderReflect'),
        FieldDefenderLightScreen: getUIElement<HTMLInputElement>('parameterFieldDefenderLightScreen'),
        FieldDefenderAuroraVeil: getUIElement<HTMLInputElement>('parameterFieldDefenderAuroraVeil'),
        FieldDefenderTailwind: getUIElement<HTMLInputElement>('parameterFieldDefenderTailwind'),
    },


    // ========================================================================
    // ========================================================================
    // RESULTS SECTION

    Results: {

        InfoEffectsAndSettings: getUIElement('resultsEffectsAndFilters'),
        InfoFilters: getUIElement('resultsPSFSummary'),

        // ========================================================================
        // Post Search Filters Section
        PSFContainer: getUIElement('postSearchFilters'),
        PSFFilterLearnMove: getUIElement<HTMLInputElement>('psfFilterLearnMove'),
        PSFLearnMoveSelect: getUIElement<HTMLSelectElement>('psfLearnMoveSelect'),
        PSFLearnMoveAdd: getUIElement<HTMLButtonElement>('psfLearnMoveAdd'),
        PSFLearnMoveClear: getUIElement<HTMLButtonElement>('psfLearnMoveClear'),
        PSFLearnMoveList: getUIElement<HTMLUListElement>('psfLearnMoveList'),
        PSFBaseSTAB: getUIElement<HTMLInputElement>('psfBaseSTAB'),
        PSFApplyButton: getUIElement<HTMLButtonElement>('psfApplyButton'),
        PSFClearButton: getUIElement<HTMLButtonElement>('psfClearButton'),

        // ========================================================================
        // Boss Info Summary Section

        BossInfoContainer: getUIElement('bossInfoSummary'),
        BossInfoPreset: getUIElement('bossSummaryPreset'),
        BossInfoSpecies: getUIElement('bossSummaryName'),
        BossInfoSprite: getUIElement<HTMLImageElement>('bossSummarySprite'),
        BossInfoTeraType: getUIElement('bossSummaryTera'),
        BossInfoLevel: getUIElement('bossSummaryLevel'),
        BossInfoItem: getUIElement('bossSummaryItem'),
        BossInfoNature: getUIElement('bossSummaryNature'),
        BossInfoAbility: getUIElement('bossSummaryAbility'),
        BossInfoHPValue: getUIElement('bossSummaryHPValue'),
        BossInfoAtkValue: getUIElement('bossSummaryAtkValue'),
        BossInfoDefValue: getUIElement('bossSummaryDefValue'),
        BossInfoSpaValue: getUIElement('bossSummarySpaValue'),
        BossInfoSpdValue: getUIElement('bossSummarySpdValue'),
        BossInfoSpeValue: getUIElement('bossSummarySpeValue'),
        BossInfoBurned: getUIElement('bossSummaryBurned'),
        BossInfoMain1: getUIElement('bossSummaryMain1'),
        BossInfoMain2: getUIElement('bossSummaryMain2'),
        BossInfoMain3: getUIElement('bossSummaryMain3'),
        BossInfoMain4: getUIElement('bossSummaryMain4'),
        BossInfoExtra1: getUIElement('bossSummaryExtra1'),
        BossInfoExtra2: getUIElement('bossSummaryExtra2'),
        BossInfoExtra3: getUIElement('bossSummaryExtra3'),
        BossInfoExtra4: getUIElement('bossSummaryExtra4'),
        BossInfoExtraSection: getUIElement('bossSummaryActionSection'),
        BossInfoExtraTable: getUIElement<HTMLTableElement>('bossSummaryActionTable'),

        // ========================================================================
        // Results section
        ResultPrevButton: getUIElement<HTMLButtonElement>('resultPrevButton'),
        ResultNextButton: getUIElement<HTMLButtonElement>('resultNextButton'),
        ResultPageSelect: getUIElement<HTMLSelectElement>('resultPageSelect'),
        ResultTotalPages: getUIElement<HTMLSelectElement>('resultTotalPages'),
        ResultItemsPerPageSelect: getUIElement<HTMLSelectElement>('resultItemsPerPageSelect'),

        ResultTableContainer: getUIElement('resultTableContainer'), // Unused
        ResultTableWatermark: getUIElement('resultTableWatermark'), // Unused

        FullTable: getUIElement<HTMLDivElement>('resultTableContents'),

        SearchSummary: getUIElement<HTMLHeadingElement>("ResultSummary"),
        ResultsTable: getUIElement<HTMLTableElement>('resultsTable')
    }

};

assertInitializationSuccess();

export default UIElements;