#!/usr/bin/env bash
set -euo pipefail

#Variables
APP="Bloom"
VERSION="0.1.0dev"
AUTHOR="Max Wolf"
CONTACT="max.wolf@stud.hshl.de"
TIMEOUT=10
BRANCH="main"

# Colors
green="$(printf '\033[32m')"
red="$(printf '\033[31m')"
purple="$(printf '\033[35m')"
bold="$(printf '\033[1m')"
cyan="$(printf '\033[36m')"
reset="$(printf '\033[0m')"

cols="$(tput cols 2>/dev/null || echo 80)"
line="$(printf '%*s' "$cols" '' | tr ' ' '=')"

lines=(
    "$APP"
    "Version $VERSION"
    ""
    "Author: $AUTHOR"
    "Contact: $CONTACT"
)

### Welcome Section ###
printf '%s\n' "$line"
for l in "${lines[@]}"; do
    len=${#l}
    pad=$(( (cols - len) / 2 ))
    if (( pad < 0 )); then pad=0; fi
    printf "%*s" "$pad" ""
    if [[ -n $l ]]; then
        printf "%s\n" "${bold}${cyan}${l}${reset}"
    else
        printf "\n"
    fi
done
printf '%s\n\n' "$line"

read -t "$TIMEOUT" -n 1 -p "Press any key to start (or wait ${TIMEOUT}s)..." _ || true
printf '\n\n'

### Git Section ###
# fetch latest updates on 'main'
printf "${bold}${purple}Git Update $APP ($BRANCH)...${reset}\n"
sleep 1
cd "$(dirname "$0")"
git fetch --prune origin
git reset --hard "origin/$BRANCH"

### Ableton Section ###
printf "${bold}${green}Starting Ableton Project...${reset}\n"
open "$(pwd)/ableton/sonic/sonic.als"
# wait for Ableton to launch
sleep 10

# determine the app process name from the .app folder name
APP_NAME="$(basename "$(ls -d /Applications/Ableton\ Live* 2>/dev/null | head -n1)" .app)"
if [ -n "$APP_NAME" ]; then
    # activate and press Space to start/stop playback
    osascript <<EOF
    tell application "$APP_NAME" to activate
    delay 0.2
    tell application "System Events"
    keystroke " "
    end tell
EOF
fi

### Node Section ###
printf "${bold}${green}Starting Node Server...${reset}\n"
sleep 1
cd Visuals
echo "npm run dev"
