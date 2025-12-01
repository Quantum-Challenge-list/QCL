// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Simple Medal.tv clip ID extraction (supports /clip/, /clips/, games/<game>/clips/)
export function getMedalIdFromUrl(url) {
    return url.match(/medal\.tv\/(?:clip|clips|games\/[^\/]+\/clips)\/([^\/?#]+)/)?.[1] ?? '';
}

// Reliable Twitch clip ID extraction (supports clips.twitch.tv, twitch.tv/.../clip/..., twitch.tv/clip/...)
export function getTwitchClipIdFromUrl(url) {
    // 1) clips.twitch.tv/<slug>
    let match = url.match(/clips\.twitch\.tv\/([^\/?#]+)/);
    if (match) return match[1];

    // 2) twitch.tv/<anything>/clip/<slug>
    match = url.match(/twitch\.tv\/[^\/]+\/clip\/([^\/?#]+)/);
    if (match) return match[1];

    // 3) twitch.tv/clip/<slug>
    match = url.match(/twitch\.tv\/clip\/([^\/?#]+)/);
    if (match) return match[1];

    return '';
}

// Detect basic video platform type
export function getVideoPlatform(url) {
    if (url && /youtu\.?be/.test(url)) return "youtube";
    if (url && /medal\.tv/.test(url)) return "medal";
    if (url && (/twitch\.tv/.test(url) || /clips\.twitch\.tv/.test(url))) return "twitch";
    return "unknown";
}

export function embed(video) {
    const platform = getVideoPlatform(video);

    if (platform === "youtube") {
        return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
    }

    // Medal: return direct .mp4 (Medal blocks iframe embedding with X-Frame-Options)
    if (platform === "medal") {
        const id = getMedalIdFromUrl(video);
        // direct CDN .mp4 pattern — use in <video> tag
        return `https://cdn.medal.tv/clip/${id}/720p.mp4`;
    }

    // Twitch embed iframe format (parent is required). Use runtime hostname for localhost & prod.
    if (platform === "twitch") {
        const id = getTwitchClipIdFromUrl(video);
        // If code executes server-side and window is undefined, fallback to empty parent
        const parent = (typeof window !== "undefined" && window.location && window.location.hostname)
            ? window.location.hostname
            : "localhost";
        return `https://clips.twitch.tv/embed?clip=${id}&parent=${parent}`;
    }

    return video;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

// Get thumbnail image depending on platform
export function getThumbnailFromId(urlOrId) {
    const platform = getVideoPlatform(urlOrId);

    if (platform === "youtube") {
        const id = getYoutubeIdFromUrl(urlOrId);
        return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }

    // Medal thumbnail pattern (may work; if not, fall back to clip page)
    if (platform === "medal") {
        const id = getMedalIdFromUrl(urlOrId);
        return `https://cdn.medal.tv/clip/${id}/thumbnail.jpg`;
    }

    // Twitch preview image (note: sometimes Twitch preview URL patterns vary; this is common)
    if (platform === "twitch") {
        const id = getTwitchClipIdFromUrl(urlOrId);
        return `https://clips-media-assets2.twitch.tv/${id}-preview-480x272.jpg`;
    }

    return '';
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex],
        ];
    }

    return array;
}
