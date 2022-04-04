## PlaceSI bot

Ne rabi posebne razlage. Če ne veš, za kaj se gre, pojdi drugam.
Template designa je na [https://github.com/jeancaffou/Bot/blob/master/design.png](https://github.com/jeancaffou/Bot/blob/master/design.png). Zaradi CORS je png hostan drugje preko PHP proxya.


### Installation instructions

before you start, make sure your cooldown has run out!

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extention or [Violentmonkey (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).
2. Click on this link: [https://github.com/jeancaffou/Bot/raw/master/placenlbot.user.js](https://github.com/jeancaffou/Bot/raw/master/placenlbot.user.js). If everything went well you'll see Tampermonkey ask you to add it. Click **Install**.
3. Reload your **r/place** tab. If everything went well, you'll see "Access token..." in the top right of your screen. The bot is now active, You'll be able to see what the bot is doing through these messages.

### Cons of this bot

- When the bot places a pixel, it will look as if it wasn't placed, while the bot has already done that (and thus you're in cooldown). You can see the cooldown in the topright of your screen.
