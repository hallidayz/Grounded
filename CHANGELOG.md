# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.13.7] - 2026-01-11

### Added

- **release-manager**: enhance version update logic to handle multiple patterns and improve text file management| (808c307)

- **tests**: add runtime test script to package.json and enhance DataContext for improved database loading and user recovery| (24c7c93)

- **App**: integrate emotional encouragement service and enhance Dashboard props| (c51ceab)

- **PWA**: add installation gate to ensure local installation before app loads, with iOS-specific instructions| (e5dd080)

- **database**: add userId indexes to all 12 tables for proper user data linking| (2b143f5)

- **HelpOverlay**: enhance clear data functionality to include user logout and redirect to login page| (06d3593)

- **Settings**: add day of week for weekly reports and day of month for monthly reports| (f4a808f)

- **clearData**: add clearAllData to adapters, remove from Settings, move to HelpOverlay System Danger section| (a5c58c3)

- **encouragement**: show encouragement on home screen, generate when emotion selected, carry over to reflection| (5461e12)

- **emotion**: create shared EmotionSelection component, replace ReflectionForm emotion picker, fix Lamini model path in encouragement generation| (6c23241)

- **AuthContext**: add persistent storage API for Android PWA credential persistence| (27f8777)

- **AIResponseBubble**: larger bouncing arrow, start with Select, add sub-emotion emojis, move swipe hint. feat(AppContent): fix reflection button to show Dashboard, fix resources to show CrisisResourcesModal. feat(GoalsSection): add instructions when no goals| (ffd944d)

- **settings**: add email configs, emergency contacts, report settings, nudges settings, and standalone theme toggle. feat(help): add terms acceptance date display| (dacc109)

- ensure new user registration saves credentials to localStorage for persistence| (749088f)

- ensure credentials persist in localStorage across Vercel updates and deployments| (6681b60)

- **App**: add auto-hide functionality for status overlay and welcome message for first-time users| (d4b1ad4)

- **AIResponseBubble**: enhance mood selection with primary and sub-emotion navigation| (ff0b039)

- restore top navigation with logo, settings, and help menu including hard clear data option| (4ffccda)

- **App**: implement AppDataContext for managing appData state across components| (591a743)

- **sw**: add auto-refresh cache helper for seamless PWA updates| (000963a)

- enhance app functionality with new dependencies and first-run detection|- Added `dexie-react-hooks` for improved state management with Dexie. (46e02b6)

- add database reset functionality to GroundedDB for version conflict resolution|- Implemented a resetDatabase method to delete and recreate the database, allowing users to resolve version conflicts or start fresh. (28efc54)

- enhance Dashboard with logging and modal handling improvements|- Added debug logging for reflection modal state changes and emotion selection, improving traceability during user interactions. (05daee1)

- integrate emotion context in Dashboard and enhance EmotionModal for improved user experience|- Removed the Grounded-PWA.zip file as it is no longer needed. (d75c0d3)

- enhance Tailwind configuration and EmotionModal component for improved animations and safe area handling|- Updated Tailwind configuration to include custom animations for modal transitions and added safe area utilities. (c9b2ef9)

- enhance DatabaseInspector with export/import and cloud sync functionalities|- Added export and import capabilities for the database in DatabaseInspector, allowing users to migrate data across browsers. (e24277a)

- add deployment diagnostics functionality to DatabaseInspector and app initialization|- Integrated deployment diagnostics feature in DatabaseInspector, allowing users to run diagnostics and view results, including origin, Dexie database status, storage usage, issues, and recommendations. (8dcd212)

- enhance DatabaseInspector and Login components with improved user feedback and accessibility|- Updated DatabaseInspector to provide clearer messaging about development mode availability, including additional context for users. (0afa585)

- enhance data handling and loading states in App and DataContext|- Introduced a LoadingScreen component to provide user feedback during data hydration. (c4d5805)

- add userId tracking to FeelingLog and goal creation in Dashboard|- Introduced optional userId field in FeelingLog for better data relationships. (6a6d4dc)

- implement logout functionality and theme toggle in navigation|- Added a logout button in the BottomNavigation component, prompting user confirmation before executing the logout action. (f4aaf6c)

- enhance Dashboard and EncourageSection with new emotion handling and UI updates|- Added new props to the Dashboard component for logging and goal updates, improving interaction capabilities. (9dec5b8)

- enhance Dashboard with emotion handling and modal integration|- Added EmotionModal and ReflectionForm to the Dashboard for improved emotional state management and user interaction. (8bf0e2a)

- enhance Dashboard component with improved state management and UI updates|- Refactored the Dashboard component to utilize TypeScript interfaces for better type safety and clarity. (f683516)

- enhance Dashboard and EncourageSection with emotion handling improvements|- Refactored the Dashboard component to streamline emotion state management, integrating EmotionModal for better user interaction. (d025a92)

- add dashboardActiveValueId prop to EncourageSection for conditional rendering|- Introduced dashboardActiveValueId prop to EncourageSection to manage the rendering of the EmotionSelector based on the active value card state. (c8c0436)

- integrate EmotionContext into Dashboard and App components|- Added EmotionProvider to the App component to manage shared emotional state across the application. (078595c)

- implement crisis alert handling in dashboard and AI services|- Added CrisisAlertModal to the Dashboard component to display alerts when a crisis is detected. (6d71b34)

- add settings view and enhance navigation|- Introduced a new settings view in the App component, allowing users to access settings directly from the navigation. (e7bb78b)

- introduce assessment and report management in database services|- Added new Assessment and CounselorReport interfaces to define data structures for AI assessments and reports. (bded675)

- implement legacy data migration in user hook and database services|- Added legacy data migration checks in the useUser hook to handle orphaned data for new and existing users. (955c1a8)

- add getAllUsers method to database services and adapters|- Implemented getAllUsers method in DatabaseService to retrieve all user data from the database. (c4fd8c1)

- enhance user experience with auto-navigation and improved button feedback|- Implemented an auto-navigation feature to redirect users to the login screen after 5 seconds during the authentication check. (34bf8d9)

- integrate goals into report generation and enhance email formatting|- Added goals parameter to report generation functions, allowing for comprehensive tracking of completed and active goals in reports. (29135d9)

- enhance AI interaction lifecycle and improve reflection analysis handling|- Added a detailed AI interaction lifecycle section to the documentation, outlining user workflow from emotional check-in to clinical reporting. (5380945)

- add goal editing functionality and enhance debug log features|- Implemented goal editing capability in the GoalsUpdateView component, allowing users to modify goal text directly. (15b2cb3)

- add mock Tauri plugin for web builds to handle API imports|- Introduced a custom plugin to mock Tauri API imports, providing fallback implementations for various methods. (cd71d29)

### Fixed

- **release-validator**: update commit message validation to allow optional scope in conventional commits format| (6c1e6d0)

- **vercel**: add headers for WebAssembly and service worker files to enhance cross-origin resource handling| (8eb5560)

- **logging**: suppress ONNX Runtime warnings in various components and enhance WASM support checks| (3e51a08)

- **authStore**: enhance localStorage backup handling for cross-platform compatibility and improve user recovery process| (643d082)

- **clear-cache**: preserve auth database during cache clearing to prevent user data loss| (b65a607)

- **dexie**: enhance database version handling to reset on detected version concatenation bug and export data before reset| (7be52d7)

- **AppContent, DataContext**: improve first-time user detection and ensure database loading for authenticated users| (1cac252)

- **dexie**: fix version check to prevent 40 instead of 4 bug, add proper number parsing and concatenation detection| (8f6bab2)

- **PWA**: skip installation gate in dev mode, fix manifest icon paths, prevent refresh loop| (6108c9e)

- **types**: make userId optional in RuleBasedUsageLog to match migration pattern| (1580b6b)

- **databaseAdapter**: improve userInteractions deletion with fallback to clear all if schema error| (1f1b917)

- **databaseAdapter**: add error handling for userInteractions deletion to prevent schema errors| (148d82c)

- **databaseAdapter**: fix clearAllData to delete userInteractions via sessionId relationship| (dc8c1dc)

- **databaseAdapter**: fix clearAllData to handle userInteractions without userId index| (e8f018e)

- **dexieDB**: permanently resolve version mismatch by checking existing version before opening| (f17fbcb)

- **Settings**: fix version display, add account data, replace prompt() with custom email modal| (ab1855e)

- **databaseAdapter**: remove compound index query and use reliable filter approach for getActiveValues| (8f8c154)

- **ValueSelection**: pass hideConfirm prop to hide confirm button when modals are open| (5008a07)

- **ValueSelection**: hide confirm button when modals are open and lower z-index to prevent overlay issues| (2a24035)

- **clearData**: remove all remaining onClearData references from Settings and AppContent| (f8d8cf1)

- **clearData**: remove old clear data section from HelpOverlay and cleanup AppContent| (b14e92c)

- **AppContent**: move all hooks before early returns to comply with Rules of Hooks| (4fd8972)

- **databaseAdapter**: add missing catch block in EncryptedAdapter getActiveValues| (c3f6557)

- **databaseAdapter**: add error handling to EncryptedAdapter getActiveValues| (a12b1c1)

- **databaseAdapter**: add error handling and validation for getActiveValues to prevent IDBKeyRange errors| (6a967a4)

- **AppContent**: add missing useCallback import| (9f2b64d)

- **AuthContext**: improve persistent storage logging - distinguish mobile vs desktop, reduce false warnings| (5deb107)

- **AuthContext**: correct authStore import - use named export instead of default| (95d8c89)

- **Dashboard**: expose setEncouragementText and properly carry over encouragement from home screen| (98a2e33)

- **ValueSelection**: add onSave prop to save without navigation, ensure values persist before add goal navigation| (da17e23)

- **ValueSelection**: auto-save values immediately on selection/reorder, save before add goal, and fix GoalsUpdateView missing props| (4c23c1e)

- **authStore**: ensure IndexedDB transaction completes before resolving user creation| (2950f5e)

- **authService**: add user verification after creation and credential storage verification to debug login issues| (c952102)

- **Login**: handle string userIds for encryption, add better error logging and ensure auth store is initialized before user lookup| (9e06ab3)

- **AuthContext**: improve cross-platform compatibility for persistent storage API with better error handling and platform detection| (ca5a341)

- **AuthContext**: add recovery logic to restore user from localStorage if initialization fails| (50b79ab)

- **AuthContext**: ensure auth store is initialized before getCurrentUser call| (f258327)

- **authService**: improve credential persistence error handling in login and registration| (f3325a5)

- **authService**: ensure auth store is initialized before user lookup and improve credential persistence logging| (4b02c4b)

- **AppContent**: update reflection button to navigate to home view and ensure onAddGoal is passed to ValueSelection| (b35114a)

- **AppContent**: implement reflection button to navigate to vault, add onAddGoal prop to ValueSelection, and navigate to help for resources| (7cbc4a6)

- **App**: use branding colors for loading screen instead of black/gray| (85156f3)

- **AppContent**: restore branding-defined light mode background (bg-primary #fafaf9) instead of neutral-900| (7af5574)

- **AppContent**: hide bottom navigation on values view to ensure confirm button is visible| (b26fc64)

- **ValueSelection**: increase z-index above bottom navigation and add padding to prevent overlap| (8a8dafd)

- **ValueSelection**: increase z-index and improve visibility of confirm button and value counter| (b1ac17b)

- **AuthContext**: load values from values table on login to ensure persistence across sessions| (d319926)

- **DataContext**: ensure value selection saves with priority for proper goal and self-care relationships| (955bb9b)

- **AIResponseBubble**: add missing refs for bubbleRef, touchStartX, mouseStartX, and isDragging| (db3096f)

- **AppContent**: move all hooks before early returns to fix Rules of Hooks violation| (dface5f)

- **AuthContext**: remove undefined initializeAuth call| (b9f77d2)

- simplify clear data handler to use DataContext method| (77481bd)

- change logout text and prevent React hydration error by memoizing values| (8072811)

- **AppContent**: pass required props to GoalsSection to prevent undefined filter error| (88cd8c4)

- **AuthContext**: correct async initialization structure| (47c4dee)

- add desktop drag support, fix emotion display, strengthen infinite loop prevention| (f1bfe3f)

- **AuthContext**: prevent infinite initialization loop with ref guard| (2edc7be)

- **AppContent**: improve layout spacing and ensure buttons are clickable| (fbd0da9)

- **AppContent**: add interactivity, proper navigation, and all view components| (136e0f8)

- **AuthContext**: add initialization logic to check existing authentication on startup| (4c693bd)

- **AppContent**: restore auth flow - handle login, terms, and checking states| (0e9c54a)

- **appcontent**: correct lazy imports for GoalsSection and VaultControl to match existing components| (6a37355)

- **app**: restore rendering chain, add error boundary and diagnostics overlay| (a51df45)

- **context**: add handleMoodLoopEntry and robust type safety| (27a383e)

- export ThemeContext as named export to resolve build error| (83b0747)

- add CrisisAlertModal to both locations to resolve build error| (60de0b5)

- resolve AI memory offset crash and revert reflection layout| (b67cb2d)

- prevent premature database deletion during migration| (dd44828)

- disable keepNames for worker stability and enforce remote models on web| (e035e83)

- resolve AI worker crash and enforce Xenova model paths| (eeb2621)

- prevent database migration modal from reappearing after dismissal| (dbd8728)

- force use of HuggingFace models in web production| (d68f791)

- re-enable VitePWA plugin to fix build failure| (d0b9916)

- set default AI model to distilbert for faster initial loading| (3d78de4)

- update Vite configuration to disable minification and improve chunking logic|- Explicitly disable minification to resolve transformers initialization issues. (5606537)

- update vite config to use virtual tauri mock plugin| (468cc1b)

- use direct dynamic imports for tauri modules to allow virtual plugin mocking| (ab85552)

- nuclear option for tauri mocks - resolve all api paths| (cb11384)

### Changed

- **DataContext**: enhance database loading logic and value saving conditions for improved user experience| (93a5a51)

- **ValueSelection**: simplify onAddGoal handler since values are auto-saved| (d1ea5a9)

- **DataContext**: remove redundant saveValue calls - setValuesActive already handles priority| (5152165)

- **AppContent**: remove lazy loading for instant PWA experience - use direct imports| (d29a7fe)

- **app**: streamline AppContent initialization and enhance lazy loading performance| (1a9b89a)

- **app**: add AppContent with hydration-ready callback and simplified lazy loading| (3b9555e)

- enhance app structure and improve user experience|- Refactored the useDashboard hook to optimize emotional encouragement generation and fallback handling. (4090464)

- improve error handling and logging in database operations|- Enhanced error handling during database interactions to provide clearer feedback to users. (2cd8d3b)

- improve data synchronization and initialization handling in App and DataContext components|- Enhanced the App component to prevent multiple data syncs by tracking userId with a ref. (5728fd8)

- restructure App component for improved state management and modularity|- Refactored the App component to enhance state management by integrating DataProvider and AuthProvider for better context handling. (4035802)

- simplify useDashboard hook with unified options interface|- Refactored the useDashboard hook to utilize a unified options interface, improving argument handling and reducing potential bugs related to argument order. (48f081f)

- replace useEmotion with local state in Dashboard component|- Updated the Dashboard component to manage emotional state using local state instead of the useEmotion hook. (7685bf2)

- update import statement for useDashboard in Dashboard component|- Changed the import of useDashboard to a named import for consistency and clarity in the Dashboard component. (5689559)

- replace GoalProgress component with GoalsSection in Dashboard|- Updated the Dashboard component to replace the GoalProgress component with GoalsSection for improved organization and clarity. (c51af68)

- remove unused components and files to streamline the project|- Deleted the App, constants, index.css, index.tsx, and various component files to clean up the codebase. (b4569e6)

- remove assessment and report operations from DatabaseService|- Deleted saveAssessment, getAssessments, saveReport, and getReports methods from DatabaseService to streamline the database operations. (b27a33b)

- improve navigation handling and emotional state management|- Updated navigation button click handlers to prevent default actions and ensure clean state transitions when navigating to the home view. (30808cf)

- optimize AI worker management and response handling|- Introduced a global worker instance to manage AI interactions more efficiently, reducing overhead from multiple worker initializations. (48e4799)

- enhance AI prompt structures and response validation|- Updated the prompt structure for generating encouragement and focus lens messages to improve clarity and reduce hallucinations. (7ee96b1)

- update Jest configuration and enhance type definitions|- Removed the coverage collection for declaration files in Jest configuration to streamline coverage reporting. (3cad617)

- update default AI model and enhance EmotionSelector component|- Changed the default AI model from DistilBERT to LaMini to prioritize counseling features. (75422b3)

- update UI components for improved consistency and branding|- Removed premature authentication state setting to ensure proper user session checks before displaying the login screen. (31d4de3)

- enhance report extraction logic to improve content quality|- Updated the extraction process to remove additional prompt artifacts, including "OUTPUT FORMAT REQUIREMENTS" and repetitive phrases. (d4f4c47)

- enhance AI prompt structures and validation logic|- Updated the useDashboard hook to allow "mixed" emotional states when a sub-feeling is selected, improving emotional context handling. (29acd50)

- update AI model from LaMini to DistilBERT and enhance debug log functionality|- Changed the default AI model from LaMini to DistilBERT for improved performance and reliability in mood tracking. (aa23300)

- enhance reflection analysis and report generation processes|- Improved the reflection analysis prompt structure to ensure clearer and more concise outputs. (5c10240)

- optimize AI goal suggestion prompt and response validation|- Revised the goal suggestion prompt to focus on SMART criteria, enhancing clarity and structure. (c1b00e8)

- improve AI encouragement prompt structure and response validation|- Updated the encouragement prompt format to a schema-only structure, reducing instruction repetition and enhancing clarity. (c2c29fb)

- update AI model from TinyLlama to LaMini and adjust related documentation|- Changed the default AI model from TinyLlama to LaMini for improved performance and reduced package size. (b40eee2)

- remove database migration modal and enhance email scheduling features|- Eliminated the database migration modal and its related state management to streamline the user experience. (1c48a2d)

### Other

- **vercel**: update build configuration to use Vite framework and simplify build command| (19d7429)

- update .gitignore to exclude .vercel and .env*.local files; fix regex for workbox source in vercel.json| (aed948e)

- **sw**: update cache version to v2 for installation verification| (f71977a)

- **cleanup**: remove old caches and perform fresh rebuild| (85a1cdb)

- update Vite configuration and Grounded-PWA.zip|- Explicitly define output file naming in vite.config.ts to avoid Rollup placeholder errors. (83144ad)

- update Vite configuration and Grounded-PWA.zip|- Comment out the ONNX fix plugin in vite.config.ts for debugging purposes. (57c887c)

- Trigger Vercel deployment| (6230157)

- **AppContent**: re-integrate GoalsSection, GoalsUpdateView, VaultControl, and navigation flow| (b4e346a)

-  (- Updat)

-  (- Enhan)

-  (- Modif)

-  (- Updat)

-  (- Impro)

-  (- Updat)

-  (- Refac)

- push without workflow file| (8c1a68e)

-  (- Intro)

-  (- Inclu)

-  (- Imple)

-  (- Enhan)

-  (- Updat)

-  (- Enhan)

-  (- Updat)

-  (- Updat)

-  (- Imple)

-  (- Modif)

-  (- Integ)

-  (- Enhan)

-  (- Updat)

-  (- Modif)

-  (- Integ)

-  (- Imple)

-  (- Updat)

-  (- Updat)

-  (- Enhan)

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Imple)

-  (- Refac)

-  (- Updat)

-  (- Enhan)

-  (- Adjus)

-  (- Updat)

-  (- Impro)

-  (- Added)

-  (- Integ)

-  (- Updat)

-  (- Refac)

-  (- Refac)

-  (- Updat)

-  (- Impro)

-  (- Ensur)

-  (- Simpl)

-  (- Updat)

-  (- Enhan)

-  (- Remov)

-  (- Enhan)

-  (- Updat)

-  (- Impro)

-  (- This )

-  (- This )

-  (- Imple)

-  (- Updat)

-  (- Strea)

-  (- This )

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Simpl)

-  (- Remov)

-  (- Updat)

-  (- Updat)

-  (- Updat)

-  (- Enhan)

-  (- Impro)

-  (- This )

-  (- Updat)

-  (- This )

-  (- Enhan)

-  (- Updat)

-  (- Imple)

-  (- Updat)

-  (- Refac)

-  (- Enhan)

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Enhan)

-  (- Intro)

-  (- Refin)

-  (- Updat)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

-  (- Added)

-  (- Imple)

-  (- Updat)

-  (- Simpl)

-  (- Simpl)

-  (- Enhan)

-  (- Adjus)

-  (- Added)

-  (- Updat)

-  (- Remov)

-  (- Impro)

-  (- Adjus)

-  (- Refin)

-  (- Exten)

-  (- Updat)

-  (- Enhan)

-  (- Impro)

-  (- Imple)

-  (- Adjus)

-  (- Impro)

-  (- Simpl)

-  (- Impro)

-  (- Enhan)

-  (- Updat)

-  (- Enhan)

-  (- Added)

-  (- Updat)

-  (- Enhan)

-  (- Updat)

-  (- Imple)

-  (- Enhan)

-  (- Enhan)

-  (- Updat)

-  (- Adjus)

-  (- Impro)

-  (- Added)

-  (- Enhan)

-  (- Imple)

-  (- Imple)

-  (- Updat)

-  (- Intro)

-  (- Enhan)

-  (- Added)

-  (- Enhan)

-  (- Updat)

-  (- Updat)

-  (- Adjus)

-  (- Ensur)

-  (- Updat)

-  (- Integ)

-  (- Enhan)

-  (- Adjus)

-  (- Simpl)

-  (- Refre)

-  (- Updat)

-  (- Remov)

-  (- The m)

-  (- Updat)

-  (- Refre)

-  (- Adjus)

## [1.13.6] - 2026-01-11

### Added

- **release-manager**: enhance version update logic to handle multiple patterns and improve text file management| (808c307)

- **tests**: add runtime test script to package.json and enhance DataContext for improved database loading and user recovery| (24c7c93)

- **App**: integrate emotional encouragement service and enhance Dashboard props| (c51ceab)

- **PWA**: add installation gate to ensure local installation before app loads, with iOS-specific instructions| (e5dd080)

- **database**: add userId indexes to all 12 tables for proper user data linking| (2b143f5)

- **HelpOverlay**: enhance clear data functionality to include user logout and redirect to login page| (06d3593)

- **Settings**: add day of week for weekly reports and day of month for monthly reports| (f4a808f)

- **clearData**: add clearAllData to adapters, remove from Settings, move to HelpOverlay System Danger section| (a5c58c3)

- **encouragement**: show encouragement on home screen, generate when emotion selected, carry over to reflection| (5461e12)

- **emotion**: create shared EmotionSelection component, replace ReflectionForm emotion picker, fix Lamini model path in encouragement generation| (6c23241)

- **AuthContext**: add persistent storage API for Android PWA credential persistence| (27f8777)

- **AIResponseBubble**: larger bouncing arrow, start with Select, add sub-emotion emojis, move swipe hint. feat(AppContent): fix reflection button to show Dashboard, fix resources to show CrisisResourcesModal. feat(GoalsSection): add instructions when no goals| (ffd944d)

- **settings**: add email configs, emergency contacts, report settings, nudges settings, and standalone theme toggle. feat(help): add terms acceptance date display| (dacc109)

- ensure new user registration saves credentials to localStorage for persistence| (749088f)

- ensure credentials persist in localStorage across Vercel updates and deployments| (6681b60)

- **App**: add auto-hide functionality for status overlay and welcome message for first-time users| (d4b1ad4)

- **AIResponseBubble**: enhance mood selection with primary and sub-emotion navigation| (ff0b039)

- restore top navigation with logo, settings, and help menu including hard clear data option| (4ffccda)

- **App**: implement AppDataContext for managing appData state across components| (591a743)

- **sw**: add auto-refresh cache helper for seamless PWA updates| (000963a)

- enhance app functionality with new dependencies and first-run detection|- Added `dexie-react-hooks` for improved state management with Dexie. (46e02b6)

- add database reset functionality to GroundedDB for version conflict resolution|- Implemented a resetDatabase method to delete and recreate the database, allowing users to resolve version conflicts or start fresh. (28efc54)

- enhance Dashboard with logging and modal handling improvements|- Added debug logging for reflection modal state changes and emotion selection, improving traceability during user interactions. (05daee1)

- integrate emotion context in Dashboard and enhance EmotionModal for improved user experience|- Removed the Grounded-PWA.zip file as it is no longer needed. (d75c0d3)

- enhance Tailwind configuration and EmotionModal component for improved animations and safe area handling|- Updated Tailwind configuration to include custom animations for modal transitions and added safe area utilities. (c9b2ef9)

- enhance DatabaseInspector with export/import and cloud sync functionalities|- Added export and import capabilities for the database in DatabaseInspector, allowing users to migrate data across browsers. (e24277a)

- add deployment diagnostics functionality to DatabaseInspector and app initialization|- Integrated deployment diagnostics feature in DatabaseInspector, allowing users to run diagnostics and view results, including origin, Dexie database status, storage usage, issues, and recommendations. (8dcd212)

- enhance DatabaseInspector and Login components with improved user feedback and accessibility|- Updated DatabaseInspector to provide clearer messaging about development mode availability, including additional context for users. (0afa585)

- enhance data handling and loading states in App and DataContext|- Introduced a LoadingScreen component to provide user feedback during data hydration. (c4d5805)

- add userId tracking to FeelingLog and goal creation in Dashboard|- Introduced optional userId field in FeelingLog for better data relationships. (6a6d4dc)

- implement logout functionality and theme toggle in navigation|- Added a logout button in the BottomNavigation component, prompting user confirmation before executing the logout action. (f4aaf6c)

- enhance Dashboard and EncourageSection with new emotion handling and UI updates|- Added new props to the Dashboard component for logging and goal updates, improving interaction capabilities. (9dec5b8)

- enhance Dashboard with emotion handling and modal integration|- Added EmotionModal and ReflectionForm to the Dashboard for improved emotional state management and user interaction. (8bf0e2a)

- enhance Dashboard component with improved state management and UI updates|- Refactored the Dashboard component to utilize TypeScript interfaces for better type safety and clarity. (f683516)

- enhance Dashboard and EncourageSection with emotion handling improvements|- Refactored the Dashboard component to streamline emotion state management, integrating EmotionModal for better user interaction. (d025a92)

- add dashboardActiveValueId prop to EncourageSection for conditional rendering|- Introduced dashboardActiveValueId prop to EncourageSection to manage the rendering of the EmotionSelector based on the active value card state. (c8c0436)

- integrate EmotionContext into Dashboard and App components|- Added EmotionProvider to the App component to manage shared emotional state across the application. (078595c)

- implement crisis alert handling in dashboard and AI services|- Added CrisisAlertModal to the Dashboard component to display alerts when a crisis is detected. (6d71b34)

- add settings view and enhance navigation|- Introduced a new settings view in the App component, allowing users to access settings directly from the navigation. (e7bb78b)

- introduce assessment and report management in database services|- Added new Assessment and CounselorReport interfaces to define data structures for AI assessments and reports. (bded675)

- implement legacy data migration in user hook and database services|- Added legacy data migration checks in the useUser hook to handle orphaned data for new and existing users. (955c1a8)

- add getAllUsers method to database services and adapters|- Implemented getAllUsers method in DatabaseService to retrieve all user data from the database. (c4fd8c1)

- enhance user experience with auto-navigation and improved button feedback|- Implemented an auto-navigation feature to redirect users to the login screen after 5 seconds during the authentication check. (34bf8d9)

- integrate goals into report generation and enhance email formatting|- Added goals parameter to report generation functions, allowing for comprehensive tracking of completed and active goals in reports. (29135d9)

- enhance AI interaction lifecycle and improve reflection analysis handling|- Added a detailed AI interaction lifecycle section to the documentation, outlining user workflow from emotional check-in to clinical reporting. (5380945)

- add goal editing functionality and enhance debug log features|- Implemented goal editing capability in the GoalsUpdateView component, allowing users to modify goal text directly. (15b2cb3)

- add mock Tauri plugin for web builds to handle API imports|- Introduced a custom plugin to mock Tauri API imports, providing fallback implementations for various methods. (cd71d29)

### Fixed

- **vercel**: add headers for WebAssembly and service worker files to enhance cross-origin resource handling| (8eb5560)

- **logging**: suppress ONNX Runtime warnings in various components and enhance WASM support checks| (3e51a08)

- **authStore**: enhance localStorage backup handling for cross-platform compatibility and improve user recovery process| (643d082)

- **clear-cache**: preserve auth database during cache clearing to prevent user data loss| (b65a607)

- **dexie**: enhance database version handling to reset on detected version concatenation bug and export data before reset| (7be52d7)

- **AppContent, DataContext**: improve first-time user detection and ensure database loading for authenticated users| (1cac252)

- **dexie**: fix version check to prevent 40 instead of 4 bug, add proper number parsing and concatenation detection| (8f6bab2)

- **PWA**: skip installation gate in dev mode, fix manifest icon paths, prevent refresh loop| (6108c9e)

- **types**: make userId optional in RuleBasedUsageLog to match migration pattern| (1580b6b)

- **databaseAdapter**: improve userInteractions deletion with fallback to clear all if schema error| (1f1b917)

- **databaseAdapter**: add error handling for userInteractions deletion to prevent schema errors| (148d82c)

- **databaseAdapter**: fix clearAllData to delete userInteractions via sessionId relationship| (dc8c1dc)

- **databaseAdapter**: fix clearAllData to handle userInteractions without userId index| (e8f018e)

- **dexieDB**: permanently resolve version mismatch by checking existing version before opening| (f17fbcb)

- **Settings**: fix version display, add account data, replace prompt() with custom email modal| (ab1855e)

- **databaseAdapter**: remove compound index query and use reliable filter approach for getActiveValues| (8f8c154)

- **ValueSelection**: pass hideConfirm prop to hide confirm button when modals are open| (5008a07)

- **ValueSelection**: hide confirm button when modals are open and lower z-index to prevent overlay issues| (2a24035)

- **clearData**: remove all remaining onClearData references from Settings and AppContent| (f8d8cf1)

- **clearData**: remove old clear data section from HelpOverlay and cleanup AppContent| (b14e92c)

- **AppContent**: move all hooks before early returns to comply with Rules of Hooks| (4fd8972)

- **databaseAdapter**: add missing catch block in EncryptedAdapter getActiveValues| (c3f6557)

- **databaseAdapter**: add error handling to EncryptedAdapter getActiveValues| (a12b1c1)

- **databaseAdapter**: add error handling and validation for getActiveValues to prevent IDBKeyRange errors| (6a967a4)

- **AppContent**: add missing useCallback import| (9f2b64d)

- **AuthContext**: improve persistent storage logging - distinguish mobile vs desktop, reduce false warnings| (5deb107)

- **AuthContext**: correct authStore import - use named export instead of default| (95d8c89)

- **Dashboard**: expose setEncouragementText and properly carry over encouragement from home screen| (98a2e33)

- **ValueSelection**: add onSave prop to save without navigation, ensure values persist before add goal navigation| (da17e23)

- **ValueSelection**: auto-save values immediately on selection/reorder, save before add goal, and fix GoalsUpdateView missing props| (4c23c1e)

- **authStore**: ensure IndexedDB transaction completes before resolving user creation| (2950f5e)

- **authService**: add user verification after creation and credential storage verification to debug login issues| (c952102)

- **Login**: handle string userIds for encryption, add better error logging and ensure auth store is initialized before user lookup| (9e06ab3)

- **AuthContext**: improve cross-platform compatibility for persistent storage API with better error handling and platform detection| (ca5a341)

- **AuthContext**: add recovery logic to restore user from localStorage if initialization fails| (50b79ab)

- **AuthContext**: ensure auth store is initialized before getCurrentUser call| (f258327)

- **authService**: improve credential persistence error handling in login and registration| (f3325a5)

- **authService**: ensure auth store is initialized before user lookup and improve credential persistence logging| (4b02c4b)

- **AppContent**: update reflection button to navigate to home view and ensure onAddGoal is passed to ValueSelection| (b35114a)

- **AppContent**: implement reflection button to navigate to vault, add onAddGoal prop to ValueSelection, and navigate to help for resources| (7cbc4a6)

- **App**: use branding colors for loading screen instead of black/gray| (85156f3)

- **AppContent**: restore branding-defined light mode background (bg-primary #fafaf9) instead of neutral-900| (7af5574)

- **AppContent**: hide bottom navigation on values view to ensure confirm button is visible| (b26fc64)

- **ValueSelection**: increase z-index above bottom navigation and add padding to prevent overlap| (8a8dafd)

- **ValueSelection**: increase z-index and improve visibility of confirm button and value counter| (b1ac17b)

- **AuthContext**: load values from values table on login to ensure persistence across sessions| (d319926)

- **DataContext**: ensure value selection saves with priority for proper goal and self-care relationships| (955bb9b)

- **AIResponseBubble**: add missing refs for bubbleRef, touchStartX, mouseStartX, and isDragging| (db3096f)

- **AppContent**: move all hooks before early returns to fix Rules of Hooks violation| (dface5f)

- **AuthContext**: remove undefined initializeAuth call| (b9f77d2)

- simplify clear data handler to use DataContext method| (77481bd)

- change logout text and prevent React hydration error by memoizing values| (8072811)

- **AppContent**: pass required props to GoalsSection to prevent undefined filter error| (88cd8c4)

- **AuthContext**: correct async initialization structure| (47c4dee)

- add desktop drag support, fix emotion display, strengthen infinite loop prevention| (f1bfe3f)

- **AuthContext**: prevent infinite initialization loop with ref guard| (2edc7be)

- **AppContent**: improve layout spacing and ensure buttons are clickable| (fbd0da9)

- **AppContent**: add interactivity, proper navigation, and all view components| (136e0f8)

- **AuthContext**: add initialization logic to check existing authentication on startup| (4c693bd)

- **AppContent**: restore auth flow - handle login, terms, and checking states| (0e9c54a)

- **appcontent**: correct lazy imports for GoalsSection and VaultControl to match existing components| (6a37355)

- **app**: restore rendering chain, add error boundary and diagnostics overlay| (a51df45)

- **context**: add handleMoodLoopEntry and robust type safety| (27a383e)

- export ThemeContext as named export to resolve build error| (83b0747)

- add CrisisAlertModal to both locations to resolve build error| (60de0b5)

- resolve AI memory offset crash and revert reflection layout| (b67cb2d)

- prevent premature database deletion during migration| (dd44828)

- disable keepNames for worker stability and enforce remote models on web| (e035e83)

- resolve AI worker crash and enforce Xenova model paths| (eeb2621)

- prevent database migration modal from reappearing after dismissal| (dbd8728)

- force use of HuggingFace models in web production| (d68f791)

- re-enable VitePWA plugin to fix build failure| (d0b9916)

- set default AI model to distilbert for faster initial loading| (3d78de4)

- update Vite configuration to disable minification and improve chunking logic|- Explicitly disable minification to resolve transformers initialization issues. (5606537)

- update vite config to use virtual tauri mock plugin| (468cc1b)

- use direct dynamic imports for tauri modules to allow virtual plugin mocking| (ab85552)

- nuclear option for tauri mocks - resolve all api paths| (cb11384)

### Changed

- **DataContext**: enhance database loading logic and value saving conditions for improved user experience| (93a5a51)

- **ValueSelection**: simplify onAddGoal handler since values are auto-saved| (d1ea5a9)

- **DataContext**: remove redundant saveValue calls - setValuesActive already handles priority| (5152165)

- **AppContent**: remove lazy loading for instant PWA experience - use direct imports| (d29a7fe)

- **app**: streamline AppContent initialization and enhance lazy loading performance| (1a9b89a)

- **app**: add AppContent with hydration-ready callback and simplified lazy loading| (3b9555e)

- enhance app structure and improve user experience|- Refactored the useDashboard hook to optimize emotional encouragement generation and fallback handling. (4090464)

- improve error handling and logging in database operations|- Enhanced error handling during database interactions to provide clearer feedback to users. (2cd8d3b)

- improve data synchronization and initialization handling in App and DataContext components|- Enhanced the App component to prevent multiple data syncs by tracking userId with a ref. (5728fd8)

- restructure App component for improved state management and modularity|- Refactored the App component to enhance state management by integrating DataProvider and AuthProvider for better context handling. (4035802)

- simplify useDashboard hook with unified options interface|- Refactored the useDashboard hook to utilize a unified options interface, improving argument handling and reducing potential bugs related to argument order. (48f081f)

- replace useEmotion with local state in Dashboard component|- Updated the Dashboard component to manage emotional state using local state instead of the useEmotion hook. (7685bf2)

- update import statement for useDashboard in Dashboard component|- Changed the import of useDashboard to a named import for consistency and clarity in the Dashboard component. (5689559)

- replace GoalProgress component with GoalsSection in Dashboard|- Updated the Dashboard component to replace the GoalProgress component with GoalsSection for improved organization and clarity. (c51af68)

- remove unused components and files to streamline the project|- Deleted the App, constants, index.css, index.tsx, and various component files to clean up the codebase. (b4569e6)

- remove assessment and report operations from DatabaseService|- Deleted saveAssessment, getAssessments, saveReport, and getReports methods from DatabaseService to streamline the database operations. (b27a33b)

- improve navigation handling and emotional state management|- Updated navigation button click handlers to prevent default actions and ensure clean state transitions when navigating to the home view. (30808cf)

- optimize AI worker management and response handling|- Introduced a global worker instance to manage AI interactions more efficiently, reducing overhead from multiple worker initializations. (48e4799)

- enhance AI prompt structures and response validation|- Updated the prompt structure for generating encouragement and focus lens messages to improve clarity and reduce hallucinations. (7ee96b1)

- update Jest configuration and enhance type definitions|- Removed the coverage collection for declaration files in Jest configuration to streamline coverage reporting. (3cad617)

- update default AI model and enhance EmotionSelector component|- Changed the default AI model from DistilBERT to LaMini to prioritize counseling features. (75422b3)

- update UI components for improved consistency and branding|- Removed premature authentication state setting to ensure proper user session checks before displaying the login screen. (31d4de3)

- enhance report extraction logic to improve content quality|- Updated the extraction process to remove additional prompt artifacts, including "OUTPUT FORMAT REQUIREMENTS" and repetitive phrases. (d4f4c47)

- enhance AI prompt structures and validation logic|- Updated the useDashboard hook to allow "mixed" emotional states when a sub-feeling is selected, improving emotional context handling. (29acd50)

- update AI model from LaMini to DistilBERT and enhance debug log functionality|- Changed the default AI model from LaMini to DistilBERT for improved performance and reliability in mood tracking. (aa23300)

- enhance reflection analysis and report generation processes|- Improved the reflection analysis prompt structure to ensure clearer and more concise outputs. (5c10240)

- optimize AI goal suggestion prompt and response validation|- Revised the goal suggestion prompt to focus on SMART criteria, enhancing clarity and structure. (c1b00e8)

- improve AI encouragement prompt structure and response validation|- Updated the encouragement prompt format to a schema-only structure, reducing instruction repetition and enhancing clarity. (c2c29fb)

- update AI model from TinyLlama to LaMini and adjust related documentation|- Changed the default AI model from TinyLlama to LaMini for improved performance and reduced package size. (b40eee2)

- remove database migration modal and enhance email scheduling features|- Eliminated the database migration modal and its related state management to streamline the user experience. (1c48a2d)

### Other

- **vercel**: update build configuration to use Vite framework and simplify build command| (19d7429)

- update .gitignore to exclude .vercel and .env*.local files; fix regex for workbox source in vercel.json| (aed948e)

- **sw**: update cache version to v2 for installation verification| (f71977a)

- **cleanup**: remove old caches and perform fresh rebuild| (85a1cdb)

- update Vite configuration and Grounded-PWA.zip|- Explicitly define output file naming in vite.config.ts to avoid Rollup placeholder errors. (83144ad)

- update Vite configuration and Grounded-PWA.zip|- Comment out the ONNX fix plugin in vite.config.ts for debugging purposes. (57c887c)

- Trigger Vercel deployment| (6230157)

- **AppContent**: re-integrate GoalsSection, GoalsUpdateView, VaultControl, and navigation flow| (b4e346a)

-  (- Updat)

-  (- Enhan)

-  (- Modif)

-  (- Updat)

-  (- Impro)

-  (- Updat)

-  (- Refac)

- push without workflow file| (8c1a68e)

-  (- Intro)

-  (- Inclu)

-  (- Imple)

-  (- Enhan)

-  (- Updat)

-  (- Enhan)

-  (- Updat)

-  (- Updat)

-  (- Imple)

-  (- Modif)

-  (- Integ)

-  (- Enhan)

-  (- Updat)

-  (- Modif)

-  (- Integ)

-  (- Imple)

-  (- Updat)

-  (- Updat)

-  (- Enhan)

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Imple)

-  (- Refac)

-  (- Updat)

-  (- Enhan)

-  (- Adjus)

-  (- Updat)

-  (- Impro)

-  (- Added)

-  (- Integ)

-  (- Updat)

-  (- Refac)

-  (- Refac)

-  (- Updat)

-  (- Impro)

-  (- Ensur)

-  (- Simpl)

-  (- Updat)

-  (- Enhan)

-  (- Remov)

-  (- Enhan)

-  (- Updat)

-  (- Impro)

-  (- This )

-  (- This )

-  (- Imple)

-  (- Updat)

-  (- Strea)

-  (- This )

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Simpl)

-  (- Remov)

-  (- Updat)

-  (- Updat)

-  (- Updat)

-  (- Enhan)

-  (- Impro)

-  (- This )

-  (- Updat)

-  (- This )

-  (- Enhan)

-  (- Updat)

-  (- Imple)

-  (- Updat)

-  (- Refac)

-  (- Enhan)

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Enhan)

-  (- Intro)

-  (- Refin)

-  (- Updat)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

-  (- Added)

-  (- Imple)

-  (- Updat)

-  (- Simpl)

-  (- Simpl)

-  (- Enhan)

-  (- Adjus)

-  (- Added)

-  (- Updat)

-  (- Remov)

-  (- Impro)

-  (- Adjus)

-  (- Refin)

-  (- Exten)

-  (- Updat)

-  (- Enhan)

-  (- Impro)

-  (- Imple)

-  (- Adjus)

-  (- Impro)

-  (- Simpl)

-  (- Impro)

-  (- Enhan)

-  (- Updat)

-  (- Enhan)

-  (- Added)

-  (- Updat)

-  (- Enhan)

-  (- Updat)

-  (- Imple)

-  (- Enhan)

-  (- Enhan)

-  (- Updat)

-  (- Adjus)

-  (- Impro)

-  (- Added)

-  (- Enhan)

-  (- Imple)

-  (- Imple)

-  (- Updat)

-  (- Intro)

-  (- Enhan)

-  (- Added)

-  (- Enhan)

-  (- Updat)

-  (- Updat)

-  (- Adjus)

-  (- Ensur)

-  (- Updat)

-  (- Integ)

-  (- Enhan)

-  (- Adjus)

-  (- Simpl)

-  (- Refre)

-  (- Updat)

-  (- Remov)

-  (- The m)

-  (- Updat)

-  (- Refre)

-  (- Adjus)

## [1.13.5] - 2026-01-03

### Fixed

- disable PWA plugin to unblock vercel build| (2c9e4f6)

### Other

- Refactor release-validator.js to improve release validation logic by encapsulating functionality in a validateRelease function. Enhance error handling for version format and commit message validation, ensuring compliance with semantic versioning and conventional commit standards.| (695f340)

- Implement service worker registration in index.html and disable VitePWA plugin in vite.config.ts to streamline PWA setup.| (64d4ec6)

- Update README.txt to reflect new generation timestamp for package documentation.| (e3bdbe5)

- Refactor error handling in build-installers.js by removing type annotation from catch block, improving code clarity and consistency.| (0e4524d)

- Update database.ts to include new methods for managing feelingLogs, improving data handling and retrieval efficiency.| (9d595fd)

- Increment dbVersion in database.ts to 6 to ensure creation of feelingLogs store, enhancing database structure for future updates.| (90c587d)

- Add @babel/plugin-bugfix-firefox-class-in-computed-class-key to devDependencies in package.json and package-lock.json. Update tailwind.config.js to include additional content paths for components, hooks, services, App.tsx, and main.tsx to enhance Tailwind CSS utility class detection.| (25a6306)

- Enhance ONNX plugin logic in fixOnnxPlugin.ts to prevent duplicate declarations by checking for existing imports and variable declarations. This update ensures that ONNX is only initialized if it hasn't been imported or declared, improving stability and preventing identifier errors.| (032bc58)

- Refactor code for improved readability and consistency across multiple files. Adjust formatting in App.tsx, vite.config.ts, Dashboard.tsx, ReflectionForm.tsx, useDashboard.ts, build-installers.js, fix-sw-registration.js, release-validator.js, database.ts, and models.ts to enhance maintainability and ensure uniformity in code style.| (9d0a64f)

- Update quantized ONNX model file for distilbert-base-uncased-finetuned-sst-2-english| (2ff9b64)

- Configure Git LFS for large model files and PWA zip| (31be988)

- Add dexie as a dependency in package.json and package-lock.json to enhance database management capabilities.| (eec1e86)

- Refactor .gitignore to streamline ignored files, add coverage and build directories, and enhance environment variable handling. Update jest.config.js to improve test matching patterns and coverage collection. Modify tailwind.config.js to refine content paths and enhance color theme definitions. Update vite.config.ts to include new ONNX fix plugin, adjust asset inclusion, and optimize dependency handling. Revamp build-installers.js and release-validator.js scripts for improved installer building and release validation processes, ensuring better error handling and logging.| (aea3fb7)

- Add depcheck to package.json and package-lock.json for unused dependency detection| (ce34bae)

- Enhance ONNX initialization in vite.config.ts by implementing multiple assignment methods to ensure ONNX is always available, even before imports complete. Introduce a lazy evaluation function for destructuring ONNX properties, addressing critical issues related to undefined errors and improving overall stability.| (90b8325)

- Refactor ONNX initialization in vite.config.ts to enhance stability and prevent undefined errors. Ensure ONNX is initialized at the top of the file and implement comprehensive safeguards for destructuring ONNX properties. Adjust import handling to guarantee ONNX is available before any code execution, addressing critical issues related to variable initialization order and destructuring patterns.| (3c828b9)

- Refactor ONNX initialization in vite.config.ts to enhance stability and prevent undefined errors. Ensure ONNX is declared and initialized at the top of the file, with added safeguards for destructuring ONNX properties. Adjust import handling to guarantee ONNX is available before any code execution, addressing critical issues related to variable initialization order.| (f3e5380)

- Refactor ONNX initialization in vite.config.ts to ensure proper assignment and prevent undefined errors. Move ONNX declaration to the top of the file and adjust import handling to guarantee ONNX is available before any code execution. This change enhances module stability and addresses critical issues related to destructuring ONNX properties.| (927081b)

- Refactor ONNX initialization logic in vite.config.ts to retain static imports and prevent undefined errors. Adjust the handling of vendor module loading to ensure ONNX is properly initialized before use, eliminating the need for dynamic imports. This change enhances module stability and addresses previous issues related to variable initialization order.| (e5c38db)

- Improve ONNX initialization in vite.config.ts to prevent undefined errors. Ensure ONNX is declared and initialized correctly at the top of the module, adding safeguards to handle cases where it may be declared but not initialized. This change addresses critical issues related to destructuring ONNX properties.| (b009a76)

- Enhance legacy data detection and backup processes by implementing version handling for database access. Introduce graceful error handling for version mismatches and improve logging for database operations. Update model loading configuration to differentiate between production and development environments, ensuring appropriate logging based on the mode.| (e0713ea)

- Update reflection analysis flow to save reflections before analysis, allowing for any length of reflection text. Adjust button label in ReflectionForm for clarity. Modify safety timeout in App component from 20 seconds to 10 seconds for quicker user feedback during authentication checks. Enhance model loading progress handling in AI services to improve user experience and error logging, especially in development mode.| (ac9236e)

- Refine model installation status handling to improve progress display and user feedback. Cap progress at 95% during loading and 90% during initialization to prevent misleading completion indicators. Enhance display logic to accurately reflect model loading states and ensure consistent messaging throughout the loading process.| (ca6b145)

- Refactor model loading logic in initializeModels function to improve progress tracking and error handling. Update status management to reflect actual model loading outcomes, ensuring accurate feedback for partial and complete model availability. Enhance logging for better visibility during model initialization.| (09f4b80)

- Refactor ReflectionForm and useDashboard hook to enhance reflection analysis handling. Update ReflectionForm to support both string and object formats for reflection analysis, ensuring backward compatibility. Modify useDashboard to improve session management by tracking activeValueId changes and formatting reflection analysis for display.| (09b0e3c)

- Enhance App and Dashboard components to manage initial value ID for goals. Introduce state management for initialValueId in App, ensuring it resets when navigating away from the home view. Update Dashboard to clear active value ID after use and improve session tracking in useDashboard hook by utilizing refs to prevent infinite loops. Add focus lens generation to AI service for enhanced user experience.| (26a5ee5)

- Refine model loading logic in initializeModels function to prevent repeated loading of TinyLlama when it fails. Introduce checks to ensure counseling model is only loaded if moodTrackerModel is unavailable and TinyLlama has successfully loaded. Enhance debug logging for better tracking of model reuse decisions.| (9dd335f)

- Implement rule-based usage logging and enhance feedback submission. Introduce a new RuleBasedUsageLog interface for structured logging. Update FeedbackButton component to include an option for users to consent to sharing usage data, and log relevant usage information during AI interactions. Enhance database service with methods for saving and retrieving rule-based usage logs. Improve AI services to log usage data for focus lens and reflection analysis operations, ensuring better tracking of user interactions.| (343e034)

- Refactor useDashboard hook to improve emotional encouragement generation and fallback handling. Update database service to include a new rule-based usage logs store. Enhance AI encouragement service with improved focus lens generation and fallback mechanisms. Modify reflection analysis to incorporate previous analysis context for better insights. Update goal suggestion logic to include counseling guidance, ensuring a more structured response.| (518687a)

- Enhance App component to include AI status display and improve user navigation. Update installation status hook to provide detailed display text. Refactor ValueSelection and Dashboard components to support goal creation and initial value setting. Implement emotion interaction logging in the database for better user feedback and tracking.| (0930c0f)

- Update package dependencies and enhance DatabaseMigrationModal UI. Bump version to 1.13.4, update framer-motion to 11.18.2, and modify button labels for clarity in the migration modal.| (11d3304)

- Enhance database service error handling by implementing silent failures for non-critical metadata and app data operations. Add checks for object store existence before accessing them, ensuring smoother operation during database upgrades. Improve model loading logic in AI services to prioritize available models and reduce console spam during initialization failures.| (6c07475)

- Enhance goal suggestion response structure by adding optional fields for inference analysis and LCSM inferences. Update reflection form to improve user experience with dynamic height adjustments. Refactor model installation status logic to prioritize accurate state reporting and improve error handling during model loading.| (7c3244f)

- Enhance model installation status tracking by adding real-time progress updates and error handling. Update App component to display installation progress and status more effectively. Refactor model loading logic to prioritize HuggingFace models in development mode and improve fallback mechanisms for local model loading failures.| (3069184)

- Improve app initialization by allowing non-blocking authentication state setting for quicker user access. Update model loading logic to track download progress and status, enhancing user feedback during model installation. Refactor hooks to ensure accurate progress reporting and error handling.| (77c11cd)

- Refactor model initialization logic to prevent infinite loops and improve error handling. Introduce cooldown and failure tracking for model loading attempts, reducing console spam and enhancing stability. Update dashboard hook to utilize refs for logs, preventing unnecessary re-renders.| (d95bfcb)

- Add model installation status hook and integrate into App component for improved user feedback during model loading. Update service worker handling to ensure models are preloaded only after activation, enhancing app performance and user experience.| (64d4427)

- Enhance noMinifyTransformersPlugin to improve import path restoration by handling multiple imports and ensuring correct initialization order with dynamic imports. Update comments for clarity and maintain build integrity.| (a39d91d)

- Add noMinifyTransformersPlugin to restore unminified transformers chunk after minification, ensuring correct import paths and preventing initialization errors. Update comments for clarity and enhance build configuration.| (5bdee4f)

- Refactor vite.config.ts by removing noMinifyTransformersPlugin and simplifying the excludeModelsPlugin. Update comments for clarity and enhance build configuration for better performance and compatibility. Preserve variable names in esbuild and streamline server settings.| (2fca5f8)

- Add noMinifyTransformersPlugin to restore unminified transformers chunk with correct import paths after minification. This update ensures initialization errors are avoided and improves the build process by preserving unminified code.| (fd77792)

- Remove noMinifyTransformersPlugin to prevent import path corruption; update comments to clarify that fix-transformers-imports.js now handles corrupted imports post-build.| (d611e3c)

- Add noMinifyTransformersPlugin to prevent minification of transformers chunk, ensuring correct import paths and avoiding initialization errors. Update fix-sw-registration.js to handle multiple manifest.json reference patterns for improved compatibility.| (225ff13)

- Enhance fix-transformers-imports.js with improved pattern matching for corrupted imports, including multiple debug patterns and fallback mechanisms. Added detailed logging for alternative matching strategies and brute force fixes, ensuring comprehensive handling of import path issues.| (8a4cfdd)

- Enhance fix-transformers-imports.js to check all JavaScript files for corrupted imports, improving detection and fixing capabilities. Added detailed logging for each file processed, ensuring better debugging and reporting of fixed imports.| (7a9864c)

- Improve corrupted import handling in fix-transformers-imports.js by implementing comprehensive pattern matching and detailed logging for debugging. This update enhances the detection and fixing of various corrupted import formats, ensuring accurate restoration of import paths.| (7484f8f)

- Refactor fix-transformers-imports.js to handle multiple corrupted import patterns, including minified versions and flexible spacing, ensuring accurate restoration of import paths.| (57afe21)

- Remove noMinifyTransformersPlugin to prevent import path corruption; update fix-transformers-imports.js to handle corrupted imports more effectively.| (8e6aa46)

- Update release notes to reflect the new release date and build date for version 1.13.4, changing both from 2025-12-31 to 2026-01-01.| (8a6139e)

- Enhance build process by adding transformer import fixes to the build script and improving the no-minify transformers plugin to correctly restore unminified code with accurate import paths after minification.| (330027d)

## [1.13.4] - 2026-01-01

### Other

- Update CHANGELOG.md for version 1.13.4, documenting enhancements to Vite configuration, SPA routing improvements, and various fixes including authentication handling and deployment issues.| (d21d9b6)

- Release version 1.13.3: Remove Netlify and Vercel configuration files, update package.json to include AI model bundling in the build process, and enhance the packaging script for improved mobile installation experience.| (c1151b4)

- Release version 1.13.1: Update configurations for Vercel and Netlify, enhance SPA routing, and implement various fixes and improvements in Vite configuration and authentication handling.| (cae1dc0)

- Update Vercel build command to clean additional directories for a more thorough build process| (c219fb1)

- Update Netlify and Vercel configurations to enhance SPA routing and add CORS/COEP headers for asset support; also update release date to January 1, 2026, in documentation.| (6f07694)

- Update release date to December 31, 2025, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (ede417c)

- Add rewrite that excludes assets and files with extensions for SPA routing| (c4c9c97)

- Fix rewrites: Only rewrite HTML requests, not JS/CSS/assets| (75910b7)

- Force clean build on Vercel to prevent cached malformed filenames| (b1cb7b3)

- Add explicit Content-Type headers for JS/CSS assets and set Vite base path| (a4890cf)

- Fix rewrites to exclude files with extensions - prevents JS modules from being served as HTML| (7db664f)

- Simplify rewrites and add test page| (5c19eef)

- Add CORS headers for assets and fix loading text| (d0e08e4)

- Fix deployment: Remove Google Fonts to resolve COEP conflicts, add SPA redirects| (20264a0)

- Fix blank page: Change COEP to credentialless to allow external resources| (aed7301)

- Update release date to January 1, 2026, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (1edd7b5)

- Update package-lock.json after npm install| (0f6dc61)

- Add rewrites to Vercel configuration for SPA routing|- Introduced a rewrites section in vercel.json to route all requests to index.html, enabling proper handling of single-page application navigation. (aed2eb8)

-  (- This )

- Implement safety timeout for authentication and enhance error handling during app initialization|- Added a safety timeout to force transition to the login screen if the app is stuck in the 'checking' state for more than 20 seconds. (8aecb6d)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

- Refactor noMinifyTransformersPlugin in Vite configuration to streamline logging and improve chunk handling|- Removed redundant logging fetch calls to enhance code clarity and reduce network overhead. (30d25f9)

-  (- Updat)

-  (- Adjus)

- Add noMinifyTransformersPlugin to Vite configuration to prevent minification issues|- Introduced a new plugin to handle transformers chunk, preventing initialization errors during minification. (d130632)

-  (- Enhan)

-  (- Updat)

- Refactor Vite configuration to improve minification and chunking strategy|- Switched from Terser to esbuild for minification to resolve initialization errors with transformers. (db0eb41)

-  (- Adjus)

-  (- Updat)

- Enhance Vite configuration for better handling of transformers|- Updated the Vite configuration to exclude '@xenova/transformers' from pre-bundling with a comment for clarity. (06cecd5)

-  (- Remov)

-  (- Added)

-  (- Suppr)

-  (- Adjus)

## [1.13.4] - 2026-01-01

### Other

- Release version 1.13.3: Remove Netlify and Vercel configuration files, update package.json to include AI model bundling in the build process, and enhance the packaging script for improved mobile installation experience.| (c1151b4)

- Release version 1.13.1: Update configurations for Vercel and Netlify, enhance SPA routing, and implement various fixes and improvements in Vite configuration and authentication handling.| (cae1dc0)

- Update Vercel build command to clean additional directories for a more thorough build process| (c219fb1)

- Update Netlify and Vercel configurations to enhance SPA routing and add CORS/COEP headers for asset support; also update release date to January 1, 2026, in documentation.| (6f07694)

- Update release date to December 31, 2025, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (ede417c)

- Add rewrite that excludes assets and files with extensions for SPA routing| (c4c9c97)

- Fix rewrites: Only rewrite HTML requests, not JS/CSS/assets| (75910b7)

- Force clean build on Vercel to prevent cached malformed filenames| (b1cb7b3)

- Add explicit Content-Type headers for JS/CSS assets and set Vite base path| (a4890cf)

- Fix rewrites to exclude files with extensions - prevents JS modules from being served as HTML| (7db664f)

- Simplify rewrites and add test page| (5c19eef)

- Add CORS headers for assets and fix loading text| (d0e08e4)

- Fix deployment: Remove Google Fonts to resolve COEP conflicts, add SPA redirects| (20264a0)

- Fix blank page: Change COEP to credentialless to allow external resources| (aed7301)

- Update release date to January 1, 2026, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (1edd7b5)

- Update package-lock.json after npm install| (0f6dc61)

- Add rewrites to Vercel configuration for SPA routing|- Introduced a rewrites section in vercel.json to route all requests to index.html, enabling proper handling of single-page application navigation. (aed2eb8)

-  (- This )

- Implement safety timeout for authentication and enhance error handling during app initialization|- Added a safety timeout to force transition to the login screen if the app is stuck in the 'checking' state for more than 20 seconds. (8aecb6d)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

- Refactor noMinifyTransformersPlugin in Vite configuration to streamline logging and improve chunk handling|- Removed redundant logging fetch calls to enhance code clarity and reduce network overhead. (30d25f9)

-  (- Updat)

-  (- Adjus)

- Add noMinifyTransformersPlugin to Vite configuration to prevent minification issues|- Introduced a new plugin to handle transformers chunk, preventing initialization errors during minification. (d130632)

-  (- Enhan)

-  (- Updat)

- Refactor Vite configuration to improve minification and chunking strategy|- Switched from Terser to esbuild for minification to resolve initialization errors with transformers. (db0eb41)

-  (- Adjus)

-  (- Updat)

- Enhance Vite configuration for better handling of transformers|- Updated the Vite configuration to exclude '@xenova/transformers' from pre-bundling with a comment for clarity. (06cecd5)

-  (- Remov)

-  (- Added)

-  (- Suppr)

-  (- Adjus)

## [1.13.1] - 2026-01-01

### Other

- Update Vercel build command to clean additional directories for a more thorough build process| (c219fb1)

- Update Netlify and Vercel configurations to enhance SPA routing and add CORS/COEP headers for asset support; also update release date to January 1, 2026, in documentation.| (6f07694)

- Update release date to December 31, 2025, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (ede417c)

- Add rewrite that excludes assets and files with extensions for SPA routing| (c4c9c97)

- Fix rewrites: Only rewrite HTML requests, not JS/CSS/assets| (75910b7)

- Force clean build on Vercel to prevent cached malformed filenames| (b1cb7b3)

- Add explicit Content-Type headers for JS/CSS assets and set Vite base path| (a4890cf)

- Fix rewrites to exclude files with extensions - prevents JS modules from being served as HTML| (7db664f)

- Simplify rewrites and add test page| (5c19eef)

- Add CORS headers for assets and fix loading text| (d0e08e4)

- Fix deployment: Remove Google Fonts to resolve COEP conflicts, add SPA redirects| (20264a0)

- Fix blank page: Change COEP to credentialless to allow external resources| (aed7301)

- Update release date to January 1, 2026, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (1edd7b5)

- Update package-lock.json after npm install| (0f6dc61)

- Add rewrites to Vercel configuration for SPA routing|- Introduced a rewrites section in vercel.json to route all requests to index.html, enabling proper handling of single-page application navigation. (aed2eb8)

-  (- This )

- Implement safety timeout for authentication and enhance error handling during app initialization|- Added a safety timeout to force transition to the login screen if the app is stuck in the 'checking' state for more than 20 seconds. (8aecb6d)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

- Refactor noMinifyTransformersPlugin in Vite configuration to streamline logging and improve chunk handling|- Removed redundant logging fetch calls to enhance code clarity and reduce network overhead. (30d25f9)

-  (- Updat)

-  (- Adjus)

- Add noMinifyTransformersPlugin to Vite configuration to prevent minification issues|- Introduced a new plugin to handle transformers chunk, preventing initialization errors during minification. (d130632)

-  (- Enhan)

-  (- Updat)

- Refactor Vite configuration to improve minification and chunking strategy|- Switched from Terser to esbuild for minification to resolve initialization errors with transformers. (db0eb41)

-  (- Adjus)

-  (- Updat)

- Enhance Vite configuration for better handling of transformers|- Updated the Vite configuration to exclude '@xenova/transformers' from pre-bundling with a comment for clarity. (06cecd5)

-  (- Remov)

-  (- Added)

-  (- Suppr)

-  (- Adjus)

## [1.13.0] - 2025-12-30

- No changes documented

## [1.12.28] - 2025-12-29

### Other

- Refactor release process and enhance versioning commands|- Updated package.json to introduce new versioning commands for patch, minor, and major releases, along with a changelog generator and release validator. (84f431d)

-  (- Refac)

-  (- Impro)

- Add Goals feature to App and related components|- Introduced a new GoalsUpdateView component for managing user goals, including progress updates and completion tracking. (70e9b3c)

-  (- Updat)

-  (- Enhan)

-  (- Modif)

-  (- Updat)

-  (- Impro)

- Enhance app initialization process and improve user feedback|- Integrated progress tracking during app initialization in App.tsx, providing users with real-time updates on the setup process. (da6dba7)

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Adjus)

- Add reflection analysis feature to Dashboard and ReflectionForm components| (74d0eb5)

## [Unreleased]

### Added
- Standardized version control release module
- Automated CHANGELOG generation from git commits
- Pre-release validation system
- Git tagging automation
- Version bumping with patch/minor/major support

