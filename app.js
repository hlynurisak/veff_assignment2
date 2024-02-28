let songs = [];
let this_recording = [];
let is_recording = false;
const KEYS = {
    a: "c4",
    s: "d4",
    d: "e4",
    f: "f4",
    g: "g4",
    h: "a4",
    j: "b4",
    k: "c5",
    l: "d5",
    w: "c#4",
    e: "d#4",
    t: "f#4",
    y: "g#4",
    u: "bb4",
    o: "c#5",
    p: "d#5",
};


const sampler = new Tone.Sampler({
	urls: {
		"C4": "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		"A4": "A4.mp3",
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();


const fill_dropdown = async () => {
    const api_response = await axios("http://localhost:3000/api/v1/tunes");
    songs = api_response.data;
    const dropdown = document.getElementById("tunesDrop");
    dropdown.innerHTML = "";
    songs.forEach((song, index) => {
        const this_song = document.createElement("option");
        this_song.textContent = song.name;
        this_song.value = index;
        dropdown.appendChild(this_song);
    });
};


const post_recording = async () => {
    const song_name = document.getElementById("recordName").value;
    const api_response = await axios.post("http://localhost:3000/api/v1/tunes", {
        name: song_name,
        tune: this_recording,
    });
    songs.push(api_response.data);
    fill_dropdown();
};


document.addEventListener("keydown", (event) => {
    if (is_recording && document.activeElement.id !== "recordName" && KEYS[event.key]) {
        const note = KEYS[event.key];
        const time = Date.now() - beginning;
        this_recording.push({note: note, duration: "8n", timing: time/1000});
    }
    else if (KEYS[event.key]) {
        sampler.triggerAttackRelease(KEYS[event.key], "8n");
    }
});


document.getElementById("recordbtn").addEventListener("click", () => {
    document.getElementById("recordbtn").disabled = true;
    document.getElementById("stopbtn").disabled = false;
    is_recording = true;
    this_recording = [];
    beginning = Date.now();
});


document.getElementById("stopbtn").addEventListener("click", () => {
    document.getElementById("recordbtn").disabled = false;
    document.getElementById("stopbtn").disabled = true;
    is_recording = false;
    post_recording();
});

document.getElementById("tunebtn").addEventListener("click", () => {
    const song = songs[document.getElementById("tunesDrop").value].tune;
    const now = Tone.now();
    song.forEach((note) => {
        sampler.triggerAttackRelease(note.note, note.duration, now + note.timing);
    });
});


fill_dropdown();