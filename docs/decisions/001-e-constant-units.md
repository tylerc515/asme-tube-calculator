# e constant: independent table values, not unit conversions

`EXPANDED_END_E` in `src/engine/units.ts` holds `{ US: 0.04, SI: 1.0 }`. These are not a conversion of each other (0.04 in \* 25.4 = 1.016 mm, not 1.0 mm). Both values come directly from ASME Section I PG-27.4.4, which tabulates the expanded-tube-end thickness allowance separately for the U.S. customary and SI editions of the code. The SI edition rounds to 1.0 mm. Converting one to derive the other would introduce an error relative to the published standard.
