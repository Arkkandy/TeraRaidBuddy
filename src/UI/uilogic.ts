// ========================================================================
// ========================================================================
// Enum states
export enum RaidPresetMode {
    Custom,
    FiveStar,
    FiveStarEvent,
    SixStar,
    SevenStarEvent
  }

 export function getPresetModeString( rpm: RaidPresetMode) : string {
    switch( rpm ) {
      case RaidPresetMode.Custom: return "Custom Boss";
      case RaidPresetMode.FiveStar: return "(5) ★★★★★ Boss"
      case RaidPresetMode.FiveStarEvent: return "(5) ★★★★★ Event";
      case RaidPresetMode.SixStar: return "(6) ★★★★★★ Boss";
      case RaidPresetMode.SevenStarEvent: return "(7) ★★★★★★★ Event";
    }
  
    return "";
  }
  
 export enum AbilitySelectionMode {
    NaturalAbilities,
    AnyAbilities
  }