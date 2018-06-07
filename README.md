# visual-navigation-demos

A collection of early stage collection explorer demos, combining XIMPEL and a number of d3 applications - intended for touch screen and touch table use.

Based on previous rough prototypes - d3 code still needs cleaning up, slowly progressing with that.
 
Uses a new iFrame extension of XIMPEL, which allows for overlays on top of an iframe (Iframe.js)

The initial prototype allows for switching between exploration "modalities" for different collections, and an initial feature to "save" found books (now done in the overarching ximpel context and only for the current session). In a future version, it would be nice to find a way to send this list of books to a user (e.g. by e-mail or sms).

Lots of things to improve, but at least showing the concept :)

Test collections:
- humsam pensum
- ureal geology
- ureal pensum

Possible to run locally (Mac) with Chrome, need to allow for local file access: 
open -n /Applications/Chromium.app --args -allow-file-access-from-files