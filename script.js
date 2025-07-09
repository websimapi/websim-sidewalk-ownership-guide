import gsap from "gsap";

// --- Audio Player ---
// A simple utility to play sounds on user interaction.
// This ensures we have a single AudioContext and helps with browser policies.
class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.buffers = new Map();
        this.clickSoundUrl = 'card_click.mp3';
        this.isInitialized = false;
        
        // Preload the click sound
        this._init();
    }

    _init() {
        if(this.isInitialized) return;

        // Create AudioContext on the first user gesture
        const initAudio = () => {
            if (this.audioContext) return;
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this._loadSound('click', this.clickSoundUrl);
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchend', initAudio);
             this.isInitialized = true;
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('touchend', initAudio);
    }
    
    async _loadSound(name, url) {
        if (!this.audioContext || this.buffers.has(name)) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (error) {
            console.error(`Error loading sound: ${name}`, error);
        }
    }

    play(name) {
        if (!this.audioContext || !this.buffers.has(name)) {
            return;
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers.get(name);
        source.connect(this.audioContext.destination);
        source.start(0);
    }
}

const audioPlayer = new AudioPlayer();


// --- Main Application Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // Animate cards on load
    gsap.to(".card", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.3
    });

    // Add click sound to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            audioPlayer.play('click');
        });
    });

});

