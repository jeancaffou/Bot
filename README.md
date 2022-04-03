# PlaceSI bot

Ne rabi posebne razlage. Če ne veš, za kaj se gre, pojdi drugam.
Template designa je na [https://github.com/jeancaffou/Bot/blob/master/design.png](https://github.com/jeancaffou/Bot/blob/master/design.png). Zaradi CORS je png hostan drugje preko PHP proxya.

## User script bot

### Installation instructions

before you start, make sure your cooldown has run out!

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extention or [Violentmonkey (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).
2. Click on this link: [https://github.com/jeancaffou/Bot/raw/master/placenlbot.user.js](https://github.com/jeancaffou/Bot/raw/master/placenlbot.user.js). If everything went well you'll see Tampermonkey ask you to add it. Click **Install**.
3. Reload your **r/place** tab. If everything went well, you'll see "Access token..." in the top right of your screen. The bot is now active, You'll be able to see what the bot is doing through these messages.

### Cons of this bot

- When the bot places a pixel, it will look as if it wasn't placed, while the bot has already done that (and thus you're in cooldown). You can see the cooldown in the topright of your screen.

## Headless bot

### You can get an access token
1. Go to [r/place](https://www.reddit.com/r/place/)
2. Open the browser console (F12 -> Click on console)
3. paste this code and press enter:
```
async function getAccessToken() {
	const usingOldReddit = window.location.href.includes('new.reddit.com');
	const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
	const response = await fetch(url);
	const responseText = await response.text();

	return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}

await getAccessToken()
```
4. The text between quotes (`"`) is your access token.

### Installation instructions

1. Install [NodeJS](https://nodejs.org/).
2. Download the bot via [this link](https://github.com/PlaceNL/Bot/archive/refs/heads/master.zip).
3. Extract the bot anywhere on your desktop
4. Open a command prompt/terminal in this folder
    Windows: Shift+right mousebutton in the folder -> Click on "open Powershell here"
    Mac: No clue, sorry!
    Linux: Is this neccisary?
5. install the dependencies: `npm i`
6. execute the bot `node bot.js ACCESS_TOKEN_HIER`
7. BONUS: You can repeat these steps for any amount of accounts you'd want. Keep in mind to use different accounts.
