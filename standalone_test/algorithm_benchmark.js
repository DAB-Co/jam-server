const path = require("path");
require(path.join(__dirname, "..", "overwrite_database.js"));
const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));
const spotifyApi = require(path.join(__dirname, "..", "utils", "spotifyApi.js"));

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


function create_artist(name, uri, genres) {
    let t = JSON.parse(JSON.stringify(raw_artist_template));
    t.name = name;
    t.uri = uri;
    t.genres = genres;
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
                    ((track_length1-i)*spotifyApi.type_weights[curr_type])
                    + ((track_length2-j)*spotifyApi.type_weights[curr_type2]);
                break;
            }
        }
    }

    let artist_length1 = u1.top_artists.items.length;
    let artist_length2 = u2.top_artists.items.length;
    let artist1_genres = new Map();
    for (let i=0; i<artist_length1; i++) {
        let curr_uri = u1.top_artists.items[i].uri;
        let curr_type = u1.top_artists.items[i].type;
        for (let j=0; j<u1.top_artists.items[i].genres.length; j++) {
            let genre_id = u1.top_artists.items[i].genres[j];
            if (artist1_genres.has(genre_id)) {
                let w = artist1_genres.get(genre_id);
                w += (artist_length1-i)*spotifyApi.type_weights[curr_type];
                artist1_genres.set(genre_id, w);
            }
            else {
                artist1_genres.set(genre_id, (artist_length1-i)*spotifyApi.type_weights[curr_type]);
            }
        }

        for (let j=0; j<artist_length2; j++) {
            if (curr_uri !== undefined && curr_uri === u2.top_artists.items[j].uri) {
                let curr_type2 = u2.top_artists.items[j].type;
                weight +=
                    ((artist_length1-i)*spotifyApi.type_weights[curr_type])
                    + ((artist_length2-j)*spotifyApi.type_weights[curr_type2]);
                break;
            }
        }
    }

    let artist2_genres = new Map();
    for (let i=0; i<artist_length2; i++) {
        let curr_type = u2.top_artists.items[i].type;
        for (let j=0; j<u2.top_artists.items[i].genres.length; j++) {
            let genre_id = u2.top_artists.items[i].genres[j];
            if (artist2_genres.has(genre_id)) {
                let w = artist2_genres.get(genre_id);
                w += (artist_length2-i)*spotifyApi.type_weights[curr_type];
                artist2_genres.set(genre_id, w);
            }
            else {
                artist2_genres.set(genre_id, (artist_length2-i)*spotifyApi.type_weights[curr_type]);
            }
        }
    }

    for (let [genre, genre_weight] of artist1_genres) {
        if (artist2_genres.has(genre)) {
            weight += genre_weight + artist2_genres.get(genre);
        }
    }

    return weight;
}

describe(__filename, function () {
    let user_data = {};
    let artists = [];
    let tracks = [];
    let genres = [];
    const user_count = 11;
    const artist_count = 5;
    const artist_count_for_each_user = 3;
    const track_count = 7;
    const track_count_for_each_user = 5;
    const genre_count = 6;
    const genre_count_for_each_artist = 3;
    this.timeout(Number.MAX_VALUE);
    before(function() {
        // kullanici yarat
        // tercihler yarat
        // kullanicilara rastgele tercihler ekle

        for (let i=0; i<genre_count; i++) {
            console.log(`creating genres progress %${(i/genre_count)*100}`);
            genres.push(`genre${i}`);
        }


        // kullanici yarat
        for (let i=0; i<user_count; i++) {
            console.log(`creating users progress %${(i/user_count)*100}`);
            let id = utilsInitializer.accountUtils().addUser(`user${i}@email.com`, `user${i}`, "password", "api_token").lastInsertRowid;
            user_data[id] = {
                "top_artists": {"items":[]},
                "top_tracks": {"items":[]}
            };
            utilsInitializer.userLanguagesUtils().addLanguages(id, ["ooga booga"]);
        }

        // artistler yarat
        for (let i=0; i<artist_count; i++) {
            console.log(`creating artists progress %${(i/artist_count)*100}`);

            let curr_genres = new Set();

            for (let j=0; j<genre_count_for_each_artist; j++) {
                curr_genres.add(genres[random(0, genre_count-1)]);
            }

            let artist = create_artist(`artist${i}`, `artist_uri${i}`, Array.from(curr_genres));
            artists.push(artist);
        }

        // trackler yarat
        for (let i=0; i<track_count; i++) {
            console.log(`creating tracks progress %${(i/track_count)*100}`);
            let track = create_track(`track${i}`, `track_uri${i}`);
            tracks.push(track);
        }

        let c = 0;
        for (let id in user_data) {
            console.log(`randomizing preferences progress %${(c/user_count)*100}`);
            let artist_indexes = new Set();
            let track_indexes = new Set();

            for (let i=0; i<artist_count_for_each_user; i++) {
                let r = undefined;
                do {
                    r = random(0, artists.length-1)
                } while (artist_indexes.has(r));
                artist_indexes.add(r);
                user_data[id].top_artists.items.push(artists[r]);
            }

            for (let i=0; i<track_count_for_each_user; i++) {
                let r = undefined;
                do {
                    r = random(0, tracks.length-1)
                } while (track_indexes.has(r));
                track_indexes.add(r);
                user_data[id].top_tracks.items.push(tracks[r]);
            }
            c++;
        }
    });

    describe('', function () {
        it("write raw_preferences to database", async function() {
            console.time("write");
            for (let id in user_data) {
                console.log(`writing prefs progress %${(id/user_count)*100}`);
                await spotifyApi.parsePreference(parseInt(id), user_data[id].top_tracks, algorithmEntryPoint);
                await spotifyApi.parsePreference(parseInt(id), user_data[id].top_artists, algorithmEntryPoint);
            }
            console.timeEnd("write");
        });
    });

    describe('', function() {
       it("match users", function() {
           console.time("apply");
           algorithmEntryPoint._apply_changes();
           console.timeEnd("apply");
           this.user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
           console.time("match");
           algorithmEntryPoint._match_users();
           console.timeEnd("match");
       });
    });

    describe('', function() {
        it("check if weights are correct", function() {
            console.time("check match");
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
            console.timeEnd("check match");
        });
    });

    describe('', function () {
       it("dump data", async function() {
           console.time("dump");
           await algorithmEntryPoint._dump_data();
           console.timeEnd("dump");
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
            //process.exit(0);
            assert.ok(leftover_count < 2);
        });
    });

    describe('', function() {
       it("run algorithm again for day2", async function() {
           console.time("apply");
           algorithmEntryPoint._apply_changes();
           console.timeEnd("apply");
           console.time("match");
           algorithmEntryPoint._match_users();
           console.timeEnd("match");
           console.time("dump");
           await algorithmEntryPoint._dump_data();
           console.timeEnd("dump");
           console.time("check match");
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
           console.timeEnd("check match");
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

    describe('', function() {
        it("queue changes twice", function() {
            let id = random(1, user_count);
            let random_user = user_data[id];
            let temp = random_user.top_tracks[0];
            random_user.top_tracks[0] = random_user.top_tracks[1];
            random_user.top_tracks[1] = temp;
            spotifyApi.parsePreference(id, random_user.top_tracks, algorithmEntryPoint);
            temp = random_user.top_tracks[2];
            random_user.top_tracks[2] = random_user.top_tracks[0];
            random_user.top_tracks[0] = temp;
            spotifyApi.parsePreference(id, random_user.top_tracks, algorithmEntryPoint);
            algorithmEntryPoint._apply_changes();
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
        });
    });

    describe('', function() {
        it("check if new user doesn't match with everyone when added", function() {
            let id = utilsInitializer.accountUtils().addUser("last@email.com", "last", "pass", "api_token").lastInsertRowid;
            utilsInitializer.userLanguagesUtils().addLanguages(id, ["ooga booga"]);
            algorithmEntryPoint._apply_changes();
            algorithmEntryPoint._match_users();
            assert.strictEqual(Object.keys(utilsInitializer.userFriendsUtils().getFriends(id)).length, 1);
        });
    });

    describe('', function() {
       it("set new user to inactive", function() {
          algorithmEntryPoint.inactive_users.add(user_count+1);
       });
    });

    describe('', function() {
        it("run algorithm again for day3", async function() {
            console.time("apply");
            algorithmEntryPoint._apply_changes();
            console.timeEnd("apply");
            console.time("match");
            algorithmEntryPoint._match_users();
            console.timeEnd("match");
            console.time("dump");
            await algorithmEntryPoint._dump_data();
            console.timeEnd("dump");
            console.time("check match");
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
            console.timeEnd("check match");
        });
    });

    describe('', function() {
        it("check if match count is correct for day 3", function() {
            let matches = algorithmEntryPoint.matched;
            for (let [id, match] of matches) {
                if ((match.size > 6 || match.size < 3) && id !== user_count+1) {
                    console.log(id);
                    assert.fail("wrong match count");
                }
                else if (id === user_count+1 && match.size !== 1) {
                    console.log(id);
                    assert.fail("wrong match count");
                }
            }
        });
    });
});
