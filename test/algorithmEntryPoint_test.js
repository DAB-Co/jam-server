const path = require("path");
const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

// type, uri and name matter for the algorithm
const raw_artist_template = {
    "external_urls": {
        "spotify": "https://open.spotify.com/artist/0Riv2KnFcLZA3JSVryRg4y"
    },
    "followers": {
        "href": null,
        "total": 343764
    },
    "genres": [
        "anime score",
        "japanese soundtrack"
    ],
    "href": "https://api.spotify.com/v1/artists/0Riv2KnFcLZA3JSVryRg4y",
    "id": "0Riv2KnFcLZA3JSVryRg4y",
    "images": [
        {
            "height": 640,
            "url": "https://i.scdn.co/image/ab6761610000e5ebd72c87048c52a12fac25590a",
            "width": 640
        },
        {
            "height": 320,
            "url": "https://i.scdn.co/image/ab67616100005174d72c87048c52a12fac25590a",
            "width": 320
        },
        {
            "height": 160,
            "url": "https://i.scdn.co/image/ab6761610000f178d72c87048c52a12fac25590a",
            "width": 160
        }
    ],
    "name": "Hiroyuki Sawano",
    "popularity": 71,
    "type": "artist",
    "uri": "spotify:artist:0Riv2KnFcLZA3JSVryRg4y"
};

const raw_track_template =  {
    "album": {
        "album_type": "ALBUM",
        "artists": [
            {
                "external_urls": {
                    "spotify": "https://open.spotify.com/artist/0Riv2KnFcLZA3JSVryRg4y"
                },
                "href": "https://api.spotify.com/v1/artists/0Riv2KnFcLZA3JSVryRg4y",
                "id": "0Riv2KnFcLZA3JSVryRg4y",
                "name": "Hiroyuki Sawano",
                "type": "artist",
                "uri": "spotify:artist:0Riv2KnFcLZA3JSVryRg4y"
            }
        ],
        "available_markets": [
            "AD",
            "AE",
            "AR",
            "AT",
            "AU",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "KW",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "SA",
            "SE",
            "SG",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "US",
            "UY",
            "VN",
            "ZA"
        ],
        "external_urls": {
            "spotify": "https://open.spotify.com/album/0jNwqmKIwudqqbMJRRtzQb"
        },
        "href": "https://api.spotify.com/v1/albums/0jNwqmKIwudqqbMJRRtzQb",
        "id": "0jNwqmKIwudqqbMJRRtzQb",
        "images": [
            {
                "height": 640,
                "url": "https://i.scdn.co/image/ab67616d0000b2739c44e39f1b6aafe87a6db356",
                "width": 640
            },
            {
                "height": 300,
                "url": "https://i.scdn.co/image/ab67616d00001e029c44e39f1b6aafe87a6db356",
                "width": 300
            },
            {
                "height": 64,
                "url": "https://i.scdn.co/image/ab67616d000048519c44e39f1b6aafe87a6db356",
                "width": 64
            }
        ],
        "name": "TV Anime \"Attack on Titan Season 2\" (Original Soundtrack)",
        "release_date": "2017-06-07",
        "release_date_precision": "day",
        "total_tracks": 33,
        "type": "album",
        "uri": "spotify:album:0jNwqmKIwudqqbMJRRtzQb"
    },
    "artists": [
        {
            "external_urls": {
                "spotify": "https://open.spotify.com/artist/0Riv2KnFcLZA3JSVryRg4y"
            },
            "href": "https://api.spotify.com/v1/artists/0Riv2KnFcLZA3JSVryRg4y",
            "id": "0Riv2KnFcLZA3JSVryRg4y",
            "name": "Hiroyuki Sawano",
            "type": "artist",
            "uri": "spotify:artist:0Riv2KnFcLZA3JSVryRg4y"
        }
    ],
    "available_markets": [
        "AD",
        "AE",
        "AR",
        "AT",
        "AU",
        "BE",
        "BG",
        "BH",
        "BO",
        "BR",
        "CA",
        "CH",
        "CL",
        "CO",
        "CR",
        "CY",
        "CZ",
        "DE",
        "DK",
        "DO",
        "DZ",
        "EC",
        "EE",
        "EG",
        "ES",
        "FI",
        "FR",
        "GB",
        "GR",
        "GT",
        "HK",
        "HN",
        "HU",
        "ID",
        "IE",
        "IL",
        "IN",
        "IS",
        "IT",
        "JO",
        "KW",
        "LB",
        "LI",
        "LT",
        "LU",
        "LV",
        "MA",
        "MC",
        "MT",
        "MX",
        "MY",
        "NI",
        "NL",
        "NO",
        "NZ",
        "OM",
        "PA",
        "PE",
        "PH",
        "PL",
        "PS",
        "PT",
        "PY",
        "QA",
        "RO",
        "SA",
        "SE",
        "SG",
        "SK",
        "SV",
        "TH",
        "TN",
        "TR",
        "TW",
        "US",
        "UY",
        "VN",
        "ZA"
    ],
    "disc_number": 1,
    "duration_ms": 221426,
    "explicit": false,
    "external_ids": {
        "isrc": "JPPC01700987"
    },
    "external_urls": {
        "spotify": "https://open.spotify.com/track/6iaQi9uPzHoXLMo5g490Bj"
    },
    "href": "https://api.spotify.com/v1/tracks/6iaQi9uPzHoXLMo5g490Bj",
    "id": "6iaQi9uPzHoXLMo5g490Bj",
    "is_local": false,
    "name": "Barricades",
    "popularity": 69,
    "preview_url": "https://p.scdn.co/mp3-preview/bbe1deab369c542fce53777ee033d0ae7adceba6?cid=d54e533040294e3fa8f4ccdf8ebeccb9",
    "track_number": 1,
    "type": "track",
    "uri": "spotify:track:6iaQi9uPzHoXLMo5g490Bj"
};


function create_artist(name, uri) {
    let t = JSON.parse(JSON.stringify(raw_artist_template));
    t.name = name;
    t.uri = uri;
    return t;
}

function create_track(name, uri) {
    let t = JSON.parse(JSON.stringify(raw_track_template));
    t.name = name;
    t.uri = uri;
    return t;
}

describe(__filename, function () {
    let user_data = {};
    before(function() {
        // create user data
        for (let i=0; i<3; i++) {
            let id = utilsInitializer.accountUtils().addUser(`user${i}@email.com`, `user${i}`, "password", "api_token").lastInsertRowid;
            user_data[id] = [];
            // create users and tracks for user, order matters
        }
    });

    describe('', function () {
    });
});
