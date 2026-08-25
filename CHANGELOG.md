# Changelog

## [0.4.0] - 2026-08-25

### Added
- Spinner wheel for selecting random substances from frequently used

### Fixed
- timeline dot was movin all over da place

## [0.3.9] - 2026-08-25

### Fixed
- some performance issues

## [0.3.8] - 2026-08-24

## Changed
- UI scale is now 85%. much less cramping

### Fixed
- Reminder time ticks live
- Enter after inputing dosage in the modal now logs the dose
- alc calc text overflow
- a bit of the lag in active session

## [0.3.7] - 2026-08-24

### Fixed
- NaN/neg/infinity dose saves
- route normalization
- ug mismatch
- dead medication interaction warnings
- haptics API usage
- persistence flush/store races
- consolidated push for doses/schedules
- timeline notification settings/notify bugs
- chart tooltip
- alcohol fields
- benzo calc
- redose planner
- favorites
- CSV impor

## [0.3.7] - 2026-08-16

### Fixed
- ????

## [0.3.6] - 2026-08-16

### Fixed
- actually replace icons

## [0.3.5] - 2026-08-14

### Fixed
- dose log searching
- duplication issues
- icon and splash screen issues

## [0.3.4] - 2026-08-11

### Fixed
- Exporting history to files now works.

## [0.3.3] - 2026-08-10

### Changed
- Modal scaling a little bit

### Fixed
- Plan Redose button in logger modal

## [0.3.2] - 2026-08-03

### Fixed
- psylog imports

## [0.3.1] - 2026-08-03

### Fixed
- minor fixes to due with importing from psylog

## [0.3.0] - 2026-07-22

### Fixed
- Performance issues in the Track page

## [0.2.11] - 2026-07-18

### Fixed
- icon generation

## [0.2.10] - 2026-07-18

### Changed
- tol target parity with site

## [0.2.9] - 2026-07-18

### Changed
- Update checker now checks on launch

## [0.2.8] - 2026-07-18

### Fixed
- Icon Gen

## [0.2.7] - 2026-07-18

### Fixed
- Icon Generation for the app

## [0.2.6] - 2026-07-18

### Fixed
- Various performance optimizations

## [0.2.5] - 2026-07-18

### Changed
- Alcohol Calculator auto converts logged alcohol into grams from shots or drinks.
- Alcohol in grams shows an equivalency in shots in dose history
- Message on dose logger to explain the conversion

## [0.2.4] - 2026-07-17

### Fixed
- sync issues

## [0.2.3] - 2026-07-17

### Fixed
- Test suite module isolation failure
- invalid vitest mock sig in component test
- dead dependency (prisma)
- duplicate app router routes
- playwright test file conflict

## [0.2.2] - 2026-07-17

### Fixed
- Icons for the app

## [0.2.1] - 2026-07-17

### Fixed
- Github Workflow wasn't compiling with the env variables needed for sync to function properly.

## [0.2.0] - 2026-07-17

### Changed
- Duration input for tolerance notifications now able to be hours or minutes.
- Moved timeline notifications into Settings.

## [0.1.9] - 2026-07-17

### Added
- Substance Selection for tolerance notifications

### Changed
- Tolerance notifications arent turned on for every substance, you now have to select the ones you want updates on.

### Fixed
- Tolerance notifications making multiple notifications


## [0.1.8] - 2026-07-16

### Added
- Tolerance reminder notifications, configurable in Settings page accessible via the sidebar

### Changed
- Moved dose reminder settings into the Settings page

## [0.1.7] - 2026-07-15

### Fixed
- Update Checker was not detecting right version
- Update Checker popup markdown

## [0.1.6] - 2026-07-15

### Added
- Custom Substance sync
- Medication Profile sync

### Fixed
- Accordions in harm reduction guides didnt work
- Scrolling was broken

### Changed
- Many behind the scenes UI things

## [0.1.5] - 2026-07-15

### Changed
- More build settings for speed of build

### Fixed
- Duration Interpolation warning wrongly applied to Custom Substances

## [0.1.4] - 2026-07-15

### Added
- Rust caching
- Gradle caching

### Fixed
- External browser used for links

### Changed
- horizontal padding to Safety page
- Build settings for speed


## [0.1.3] - 2026-07-15

### Fixed
- Update Checker should work now
- Markdown in the changelog should display correctly now

## [0.1.2] - 2026-07-14

### Changed
- Update substance info, wikipedia links and buttons.

## [0.1.1] - 2026-07-14

### Added
- Update Checker

### Fixed
- Flicker on substance page browse from Library

### Changed
- Modularization of some components


## [0.1.0] - 2026-07-13

### Added
- Changelog
- Custom Subtances
- Medication Profiles
- Benzo Equivalence Calculator2
