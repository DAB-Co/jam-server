const path = require("path");
const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));


const assert = require("assert");

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

/**
 * Returns a random number between min (inclusive) and max (inclusive)
 * https://futurestud.io/tutorials/generate-a-random-number-in-range-with-javascript-node-js
 */
function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

function random_list(n) {
    let l = [];
    for (let i=0; i<n; i++) {
        l.push(i);
    }

    for (let i=0; i<l.length; i++) {
        let r = random(0, l.length-1);
        let t = l[i];
        l[i] = l[r];
        l[r] = t;
    }

    return l;
}


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

function calculate_weight(u1, u2) {
    // {top_artists: {items:[]}, top_tracks:{items:[]}}
    let weight = 0;
    let track_length1 = u1.top_tracks.items.length;
    let track_length2 = u2.top_tracks.items.length;
    for (let i=0; i<track_length1; i++) {
        let curr_uri = u1.top_tracks.items[i].uri;
        let curr_type = u1.top_tracks.items[i].type;
        for (let j=0; j<track_length2; j++) {
            if (curr_uri !== undefined && curr_uri === u2.top_tracks.items[j].uri) {
                let curr_type2 = u2.top_tracks.items[j].type;
                weight +=
                    ((track_length1-i)*algorithmEntryPoint.type_weights[curr_type])
                    + ((track_length2-j)*algorithmEntryPoint.type_weights[curr_type2]);
                break;
            }
        }
    }

    let artist_length1 = u1.top_artists.items.length;
    let artist_length2 = u2.top_artists.items.length;
    for (let i=0; i<artist_length1; i++) {
        let curr_uri = u1.top_artists.items[i].uri;
        let curr_type = u1.top_artists.items[i].type;
        for (let j=0; j<artist_length2; j++) {
            if (curr_uri !== undefined && curr_uri === u2.top_artists.items[j].uri) {
                let curr_type2 = u2.top_artists.items[j].type;
                weight +=
                    ((artist_length1-i)*algorithmEntryPoint.type_weights[curr_type])
                    + ((artist_length2-j)*algorithmEntryPoint.type_weights[curr_type2]);
                break;
            }
        }
    }
    return weight;
}

describe(__filename, function () {
    let user_data = {};
    let artists = [];
    let tracks = [];
    const user_count = 11;
    const artist_count = 5;
    const track_count = 7;
    this.timeout(Number.MAX_VALUE);
    before(function() {
        // kullanici yarat
        // tercihler yarat
        // kullanicilara rastgele tercihler ekle

        // kullanici yarat
        for (let i=0; i<user_count; i++) {
            //console.log(`creating users progress %${(i/user_count)*100}`);
            let id = utilsInitializer.accountUtils().addUser(`different_user${i}@email.com`, `different_user${i}`, "password", "api_token").lastInsertRowid;
            user_data[id] = {
                "top_artists": {"items":[]},
                "top_tracks": {"items":[]}
            };
            utilsInitializer.userLanguagesUtils().addLanguages(id, ["ooga booga"]);
        }

        // artistler yarat
        for (let i=0; i<artist_count; i++) {
            //console.log(`creating artists progress %${(i/artist_count)*100}`);
            let artist = create_artist(`artist${i}`, `artist_uri${i}`);
            artists.push(artist);
        }

        // trackler yarat
        for (let i=0; i<track_count; i++) {
            //console.log(`creating tracks progress %${(i/track_count)*100}`);
            let track = create_track(`track${i}`, `track_uri${i}`);
            tracks.push(track);
        }

        // user data bir sozluk
        // int -> {satir 309}
        // artist ve track listelerinde olan degerlerden rastgele secilmis degerler olsun
        // ayni degereden iki tane olmasin
        // 3 artist 5 parca
        // bu yorumun altina yaz
        for (let id in user_data) {
            user_data[id].top_artists.items.push(create_artist(`${id}a`, `${id}a`));
            user_data[id].top_tracks.items.push(create_track(`${id}t`, `${id}t`));
        }
    });

    describe('', function () {
        it("write raw_preferences to database", async function() {
            //console.time("write");
            for (let id in user_data) {
                //console.log(`writing prefs progress %${(id/user_count)*100}`);
                await algorithmEntryPoint._add_preference(parseInt(id), user_data[id].top_tracks);
                await algorithmEntryPoint._add_preference(parseInt(id), user_data[id].top_artists);
            }
            //console.timeEnd("write");
        });
    });

    describe('', function() {
        it("match users", function() {
            //console.time("apply");
            algorithmEntryPoint._apply_changes();
            //console.timeEnd("apply");
            this.user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
            //console.time("match");
            algorithmEntryPoint._match_users();
            //console.timeEnd("match");
        });
    });

    describe('', function() {
        it("check if weights are correct", function() {
            //console.time("check match");
            for (let id in user_data) {
                for (let id2 in user_data) {
                    if (id === id2) {
                        continue;
                    }
                    let weight = algorithmEntryPoint.getWeight(parseInt(id), parseInt(id2));
                    let weight2 = algorithmEntryPoint.getWeight(parseInt(id2), parseInt(id));
                    assert.strictEqual(weight, weight2);
                    if (weight === undefined) {
                        weight = 0;
                    }
                    assert.strictEqual(weight, calculate_weight(user_data[id], user_data[id2]), `${id}---${id2}`);
                }
            }
            //console.timeEnd("check match");
        });
    });

    describe('', function () {
        it("dump data", async function() {
            //console.time("dump");
            await algorithmEntryPoint._dump_data();
            //console.timeEnd("dump");
        })
    });

    describe('', function() {
        it("check if match count is correct", function() {
            let matches = algorithmEntryPoint.matched;
            let leftover_count = 0;
            for (let [id, match] of matches) {
                if (match.size === 2) {
                    leftover_count++;
                }
                else if (match.size !== 1) {
                    assert.fail("wrong match count");
                }
            }
            assert.ok(leftover_count < 2);
        });
    });

    describe('', function() {
        it("run algorithm again for day2", async function() {
            //console.time("apply");
            algorithmEntryPoint._apply_changes();
            //console.timeEnd("apply");
            //console.time("match");
            algorithmEntryPoint._match_users();
            //console.timeEnd("match");
            //console.time("dump");
            await algorithmEntryPoint._dump_data();
            //console.timeEnd("dump");
            //console.time("check match");
            for (let id in user_data) {
                for (let id2 in user_data) {
                    if (id === id2) {
                        continue;
                    }
                    let weight = algorithmEntryPoint.getWeight(parseInt(id), parseInt(id2));
                    let weight2 = algorithmEntryPoint.getWeight(parseInt(id2), parseInt(id));
                    assert.strictEqual(weight, weight2);
                    if (weight === undefined) {
                        weight = 0;
                    }
                    assert.strictEqual(weight, calculate_weight(user_data[id], user_data[id2]), `${id}---${id2}`);
                }
            }
            //console.timeEnd("check match");
        });
    });

    describe('', function() {
        it("check if match count is correct for day 2", function() {
            let matches = algorithmEntryPoint.matched;
            let leftover_count = 0;
            for (let [id, match] of matches) {
                if (match.size === 4) {
                    leftover_count += 2;
                }
                else if (match.size === 3) {
                    leftover_count++;
                }
                else if (match.size !== 2) {
                    assert.fail("wrong match count");
                }
            }
            assert.ok(leftover_count < 3);
        });
    });
});
