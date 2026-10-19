# Dependency license fallbacks

The Webpack helper copies license and notice files from packages included in each
compilation into `licenses/<package>/<version>/`. Packages without license text
fail the build unless an exact name/version entry exists in `fallbacks.json`.
Review these entries when updating dependencies; do not extend them to unreviewed
versions.

The css-render packages use their exact release's repository license. The vdirs
notice is reconstructed from the published package's explicit MIT declaration and
author metadata because its package and repository omit the license text. Each
fallback includes a NOTICE recording its source and how it was prepared. Other
dependencies, including reflect-metadata and Lucide, retain their installed license
and notice files byte for byte.
