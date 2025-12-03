#!/usr/bin/env bash
set -euo pipefail

#Variables
APP="Bloom"
VERSION="1.0"
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
git pull

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
cd ./visuals
VISUALS_DIR="$(pwd)"
echo "Loading dependencies..."
if ! npm i; then
    echo "npm install failed" >&2
    exit 1
fi
echo "Dependencies Loaded"
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$VISUALS_DIR'; npm run visuals"
end tell
EOF
printf "${bold}${green}Server launched in a new Terminal window.${reset}\n"
sleep 3

open -a "Google Chrome" --args --kiosk "http://localhost:5173/"

sleep 3

# Try Chrome, else Safari, else stop after open
if [ -d "/Applications/Google Chrome.app" ]; then
    /usr/bin/osascript <<EOF
tell application "Google Chrome"
    activate
    delay 0.5
    -- open a new window if no windows
    if (count of windows) = 0 then make new window
    -- open URL in frontmost tab
    tell front window to set URL of active tab to "$URL"
    -- toggle presentation fullscreen
    tell application "System Events"
        tell process "Google Chrome"
            set frontmost to true
            -- press the green Zoom button to enter native fullscreen
            try
            click (first button of window 1 whose role description is "full screen")
            on error
            -- fallback: press Cmd+Ctrl+F
            keystroke "f" using {command down, control down}
            end try
        end tell
    end tell
end tell
EOF

elif [ -d "/Applications/Safari.app" ]; then
    /usr/bin/osascript <<EOF
tell application "Safari"
    activate
    if (count of windows) = 0 then make new document
    set URL of front document to "$URL"
end tell

tell application "System Events"
    tell process "Safari"
    set frontmost to true
    -- try the green button, fallback to Cmd+Ctrl+F
        try
            click (first button of window 1 whose role description is "full screen")
            on error
            keystroke "f" using {command down, control down}
        end try
    end tell
end tell
EOF

else
    echo "Neither Chrome nor Safari found — opened URL with default handler."
fi

sleep 5
echo "Finished"
