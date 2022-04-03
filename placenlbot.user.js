// ==UserScript==
// @name         PlaceSI Bot
// @namespace    https://github.com/jeancaffou/Bot
// @version      21
// @description  Avtomatika za risat PlaceSI
// @author       NoahvdAa
// @match        https://www.reddit.com/r/place/*
// @match        https://new.reddit.com/r/place/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @require	     https://cdn.jsdelivr.net/npm/toastify-js
// @resource     TOASTIFY_CSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @updateURL    https://github.com/jeancaffou/Bot/raw/master/placenlbot.user.js
// @downloadURL  https://github.com/jeancaffou/Bot/raw/master/placenlbot.user.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

// Dodani Slovenski prevodi

//Sorry voor de rommelige code, haast en clean gaatn iet altijd samen ;)
//SI: Oprostite za neurejeno kodo, hitenje in čisto ne gresta vedno skupaj TEST

var order = undefined;
var accessToken;
var currentOrderCanvas = document.createElement('canvas');
var currentOrderCtx = currentOrderCanvas.getContext('2d');
var currentPlaceCanvas = document.createElement('canvas');

// Global constants
const DEFAULT_TOAST_DURATION_MS = 10000;

const COLOR_MAPPINGS = {
    '#BE0039': 1,
    '#FF4500': 2,
    '#FFA800': 3,
    '#FFD635': 4,
    '#00A368': 6,
    '#00CC78': 7,
    '#7EED56': 8,
    '#00756F': 9,
    '#009EAA': 10,
    '#2450A4': 12,
    '#3690EA': 13,
    '#51E9F4': 14,
    '#493AC1': 15,
    '#6A5CFF': 16,
    '#811E9F': 18,
    '#B44AC0': 19,
    '#FF3881': 22,
    '#FF99AA': 23,
    '#6D482F': 24,
    '#9C6926': 25,
    '#000000': 27,
    '#898D90': 29,
    '#D4D7D9': 30,
    '#FFFFFF': 31
};

let getRealWork = rgbaOrder => {
    let order = [];
    for (var i = 0; i < 2000000; i++) {
        if (rgbaOrder[(i * 4) + 3] !== 0) {
            order.push(i);
        }
    }
    return order;
};

let getPendingWork = (work, rgbaOrder, rgbaCanvas) => {
    let pendingWork = [];
    for (const i of work) {
        if (rgbaOrderToHex(i, rgbaOrder) !== rgbaOrderToHex(i, rgbaCanvas)) {
            pendingWork.push(i);
        }
    }
    return pendingWork;
};

(async function () {
    GM_addStyle(GM_getResourceText('TOASTIFY_CSS'));
    currentOrderCanvas.width = 2000;
    currentOrderCanvas.height = 1000;
    currentOrderCanvas.style.display = 'none';
    currentOrderCanvas = document.body.appendChild(currentOrderCanvas);
    currentPlaceCanvas.width = 2000;
    currentPlaceCanvas.height = 1000;
    currentPlaceCanvas.style.display = 'none';
    currentPlaceCanvas = document.body.appendChild(currentPlaceCanvas);

    Toastify({
        text: 'Pridobi access token...',
        duration: 10000
    }).showToast();
    accessToken = await getAccessToken();
    Toastify({
        text: 'Imamo access token!',
        duration: 10000
    }).showToast();

    getDesign();
    attemptPlace();

    setInterval(() => {
        getDesign();
    }, 10 * 60 * 1000);

    setInterval(async () => {
        accessToken = await getAccessToken();
    }, 30 * 60 * 1000)
})();

async function getDesign() {
    currentOrderCtx = await getCanvasFromUrl(`https://klv.si/placesi/design.php`, currentOrderCanvas, 0, 0, true);
    order = getRealWork(currentOrderCtx.getImageData(0, 0, 2000, 1000).data);
    Toastify({
        text: `Nov zemljevid je nalozen, skupaj ${order.length} slikovnih pik`,
        duration: 10000
    }).showToast();
}

async function attemptPlace() {
    if (order === undefined) {
        setTimeout(attemptPlace, 2000); // probeer opnieuw in 2sec.
        return;
    }
    var ctx;
    try {
        ctx = await getCanvasFromUrl(await getCurrentImageUrl('0'), currentPlaceCanvas, 0, 0, false);
        ctx = await getCanvasFromUrl(await getCurrentImageUrl('1'), currentPlaceCanvas, 1000, 0, false)
    } catch (e) {
        console.warn('Fout bij ophalen map: ', e);
        Toastify({
            text: 'Fout bij ophalen map. Opnieuw proberen in 10 sec...',
            duration: DEFAULT_TOAST_DURATION_MS
        }).showToast();
        setTimeout(attemptPlace, 10000); // probeer opnieuw in 10sec.
        return;
    }

    const rgbaOrder = currentOrderCtx.getImageData(0, 0, 2000, 1000).data;
    const rgbaCanvas = ctx.getImageData(0, 0, 2000, 1000).data;
    const work = getPendingWork(order, rgbaOrder, rgbaCanvas);

    if (work.length === 0) {
        Toastify({
            text: `Vsi piksli so ze na pravem mestu! Poskusi znova cez 30 sekund ...`,
            duration: 30000
        }).showToast();
        setTimeout(attemptPlace, 30000); // probeer opnieuw in 30sec.
        return;
    }

    const percentComplete = 100 - Math.ceil(work.length * 100 / order.length);
    const workRemaining = work.length;
    const idx = Math.floor(Math.random() * work.length);
    const i = work[idx];
    const x = i % 2000;
    const y = Math.floor(i / 2000);
    const hex = rgbaOrderToHex(i, rgbaOrder);

    Toastify({
        text: `Poskus postavitve piksla na ${x}, ${y}... (${percentComplete}% dokončano, ostalo še ${workRemaining})`,
        duration: DEFAULT_TOAST_DURATION_MS
    }).showToast();

    const res = await place(x, y, COLOR_MAPPINGS[hex]);
    const data = await res.json();
    try {
        if (data.errors) {
            const error = data.errors[0];
            const nextPixel = error.extensions.nextAvailablePixelTs + 3000;
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            const toast_duration = delay > 0 ? delay : DEFAULT_TOAST_DURATION_MS;
            Toastify({
                text: `Pixel je objavljen prehitro! Naslednji piksel bo postavljen na ${nextPixelDate.toLocaleTimeString()}.`,
                duration: toast_duration
            }).showToast();
            setTimeout(attemptPlace, delay);
        } else {
            const nextPixel = data.data.act.data[0].data.nextAvailablePixelTimestamp + 3000;
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            const toast_duration = delay > 0 ? delay : DEFAULT_TOAST_DURATION_MS;
            Toastify({
                text: `Pixel postavljen na ${x}, ${y}! Naslednji piksel bo postavljen na ${nextPixelDate.toLocaleTimeString()}.`,
                duration: toast_duration
            }).showToast();
            setTimeout(attemptPlace, delay);
        }
    } catch (e) {
        console.warn('Fout bij response analyseren', e);
        Toastify({
            text: `Analizirajte napako pri odgovoru: ${e}.`,
            duration: DEFAULT_TOAST_DURATION_MS
        }).showToast();
        setTimeout(attemptPlace, 10000);
    }
}

function place(x, y, color) {
    return fetch('https://gql-realtime-2.reddit.com/query', {
        method: 'POST',
        body: JSON.stringify({
            'operationName': 'setPixel',
            'variables': {
                'input': {
                    'actionName': 'r/replace:set_pixel',
                    'PixelMessageData': {
                        'coordinate': {
                            'x': x % 1000,
                            'y': y % 1000
                        },
                        'colorIndex': color,
                        'canvasIndex': (x > 999 ? 1 : 0)
                    }
                }
            },
            'query': 'mutation setPixel($input: ActInput!) {\n  act(input: $input) {\n    data {\n      ... on BasicMessage {\n        id\n        data {\n          ... on GetUserCooldownResponseMessageData {\n            nextAvailablePixelTimestamp\n            __typename\n          }\n          ... on SetPixelResponseMessageData {\n            timestamp\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n'
        }),
        headers: {
            'origin': 'https://hot-potato.reddit.com',
            'referer': 'https://hot-potato.reddit.com/',
            'apollographql-client-name': 'mona-lisa',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
}

async function getAccessToken() {
    const usingOldReddit = window.location.href.includes('new.reddit.com');
    const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
    const response = await fetch(url);
    const responseText = await response.text();

    // TODO: ew
    return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}

async function getCurrentImageUrl(id = '0') {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws');

        ws.onopen = () => {
            ws.send(JSON.stringify({
                'type': 'connection_init',
                'payload': {
                    'Authorization': `Bearer ${accessToken}`
                }
            }));
            ws.send(JSON.stringify({
                'id': '1',
                'type': 'start',
                'payload': {
                    'variables': {
                        'input': {
                            'channel': {
                                'teamOwner': 'AFD2022',
                                'category': 'CANVAS',
                                'tag': id
                            }
                        }
                    },
                    'extensions': {},
                    'operationName': 'replace',
                    'query': 'subscription replace($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on FullFrameMessageData {\n          __typename\n          name\n          timestamp\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}'
                }
            }));
        };

        ws.onmessage = (message) => {
            const { data } = message;
            const parsed = JSON.parse(data);

            // TODO: ew
            if (!parsed.payload || !parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) return;

            ws.close();
            resolve(parsed.payload.data.subscribe.data.name + `?noCache=${Date.now() * Math.random()}`);
        }

        ws.onerror = reject;
    });
}

function getCanvasFromUrl(url, canvas, x = 0, y = 0, clearCanvas = false) {
    return new Promise((resolve, reject) => {
        let loadImage = ctx => {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                if (clearCanvas) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, x, y);
                resolve(ctx);
            };
            img.onerror = () => {
                Toastify({
                    text: 'Napaka pri pridobivanju zemljevida. Poskusi znova čez 3 sekunde ...',
                    duration: 3000
                }).showToast();
                setTimeout(() => loadImage(ctx), 3000);
            };
            img.src = url;
        };
        loadImage(canvas.getContext('2d'));
    });
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

let rgbaOrderToHex = (i, rgbaOrder) =>
    rgbToHex(rgbaOrder[i * 4], rgbaOrder[i * 4 + 1], rgbaOrder[i * 4 + 2]);
