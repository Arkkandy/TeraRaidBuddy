# TeraRaidBuddy
The quickest, easiest and most complete Tera Raid calculator!

This calculator will perform damage checks for the designated raid boss against the entirety of pokemon available in Generation 9. Use various EV Training Methods to help you find which pokemon are best suited to tank said raid boss. You can choose from any of the available in-game Raid Bosses 5 stars or above, the most recent 5 star or 7 star events as well as theorycraft for future raid events by setting up your custom bosses.

And you can use the export/import tool to save any custom bosses you create.

> [!NOTE]
> It is very likely you will find bugs, if you do please let the author know!

## Features

* Calculate damage between 1 pokemon and the entirety of Generation 9. Results are listed from lowest damage taken to highest damage taken.
* Set various parameters including boss stats, tera type and moves. Switch between natural abilities and all abilities by clicking the "Ability*" label.
* Main parameters let you decide how counter stats are determined and what is shown in the results table. Select what moves you want to see, including best main move, main movepool or extra moves. Extra moves that would typically affect multiple targets, like Earthquake, automatically do reduced damage. Damage ranking only factors main moves - extra Moves are merely informative.
* User guide - Read about important tips in the website.
* Advanced Mode - Set ability, moves, items, field settings for both boss and raid counters, as well as raid counter filters.
* Screenshot - Automatically save a screenshot of the results table using html2canvas, which will copy the table as it appears in your browser.

> [!WARNING]
> Beware the screenshot feature may not function correctly on mobile due to incomplete styling. The resulting screenshot can be very large due to browser scaling!

* Multiple EV Training Methods
    * No investment - Zero ev training.
    * Full Defense - Train all counters with 252 HP and 252 Def.
    * Full Sp.Defense - Train all counters with 252 HP and 252 SpD.
    * Mixed Defense Simple - Test 6 spreads:

        +Def Nature, 252 HP, 252 Def,   4 SpD

        +Def Nature, 252 HP,   4 Def, 252 SpD

        +Def Nature,   4 HP, 252 Def, 252 SpD

        +SpD Nature, 252 HP, 252 Def,   4 SpD

        +SpD Nature, 252 HP,   4 Def, 252 SpD

        +SpD Nature,   4 HP, 252 Def, 252 SpD

    * Simple Offensive - Train all counters with 252 HP and 252 Atk or 252 SpA.

    * Balanced Defenses - Finds the optimal defensive spread to balance physical and special damage. Ideal for 7 star raids.
    * Speed > Defenses - Invest to outspeed if possible and then optimal balance with the remaining EVs.
    * Attack > Defenses - Invest in maximum offense and invest the remaining 256 EVs on optimal defense.
    * Speed > Attack > Defenses - Outspeed, maximum offenses and rest goes into optimal defense.

    * Best Defense Threshold - Finds the minimum investment EV spread that grants the best survivability threshold (explained below).
    * Speed > BDT - Invest to outspeed and invest the remaining EVs in BDT.
    * BDT > Attack - Prioritze the BDT and invest the remaining EVs in offense.
    * Speed > BDT > Attack - Invest to outspeed, prioritize BDT and invest the remaining EVs in offense.

### Best Defense Threshold - explained

**Threshold** - In the context of the training algorithm, the threshold considered is the number of turns a pokemon will survive damage.
    Threshold = 0 -> Survive 0 turns -> 100%+ damage
    Threshold = 1 -> Survive 1 turns -> [50% - 100%[ damage
    Threshold = 2 -> Survive 2 turns -> [33.3% - 50%[ damage
    and so on...

The Best Defense Threshold algorithm will find the minimum EV investment to reach the best Threshold that is possible for each raid counter species against the raid boss, adapted for all applicable parameters - stat boosts, field effects, moves, tera type and abilities.

## Credits and mentions

Tera raid tool made by Arkandy
[u/AndsLG](https://www.reddit.com/user/AndSLG) - [youtube/@Arkandy](https://www.youtube.com/@Arkandy) - [twitch.tv/arkkandy](https://www.twitch.tv/arkkandy)

Damage calc code adapted from [@smogon/damage-calc](https://github.com/smogon/damage-calc)
Learnset look-up adapted from [@pkmn/ps](https://github.com/pkmn/ps)
Extra action data adapted from [Serebii](https://www.serebii.net/)

Sprites in "Assets" obtained from [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Main_Page), [Serebii](https://www.serebii.net/), [r/PokeLeaks](https://www.reddit.com/r/PokeLeaks/comments/ytt6ve/all_new_hd_sprite_icons_for_scarletviolet_link_in/) and adapted from [twitter/mattyoukhana_](https://twitter.com/mattyoukhana_).
