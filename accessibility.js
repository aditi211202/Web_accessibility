(function (window, document) {
    "use strict";

    const AccessibilityKit = {
        contrastModes: [
            null,
            "a11y-contrast",
            "a11y-contrast-blue",
            "a11y-contrast-yellow"
        ],
        contrastIndex: 0,
        baseFontSize: 100,   // 👈 original (equal point)
        fontSize: 100,
        speaking: false,
        utterance: null,
        currentLang: "en-IN",

        init() {
            document.addEventListener("DOMContentLoaded", () => {
                this.applyARIA();
                this.bindToolbarActions();

                // IMPORTANT: warm up speech engine
                speechSynthesis.getVoices();

                console.log("♿ AccessibilityKit ready");
            });

            // restore contrast mode
            const savedContrast = localStorage.getItem("a11y-contrast");
            if (savedContrast) {
                document.body.classList.add(savedContrast);
                this.contrastIndex =
                    this.contrastModes.indexOf(savedContrast);
            }

        },

        applyARIA() {
            document.querySelectorAll("img:not([alt])")
                .forEach(img => img.alt = "Image");
        },

        bindToolbarActions() {
            const toolbar = document.getElementById("a11y-toolbar");
            if (!toolbar) {
                console.error("a11y-toolbar not found");
                return;
            }

            toolbar.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn) return;

                const action = btn.getAttribute("data-action");
                console.log("A11Y button clicked:", action); // 🔍 DEBUG

                switch (action) {
                    case "font-plus":
                        this.increaseFont();
                        break;
                    case "font-minus":
                        this.decreaseFont();
                        break;
                    case "contrast":
                        this.toggleContrast();
                        break;
                    case "speech":
                        this.toggleSpeech();
                        break;
                    case "lang":
                        this.toggleLanguage();
                        break;
                    case "font-reset":
                        this.resetFont();
                        break;
                }
            });
        },


        increaseFont() {
            if (this.fontSize >= 250) return;
            this.fontSize += 10;
            document.documentElement.style.fontSize = this.fontSize + "%";
        },
        resetFont() {
            this.fontSize = this.baseFontSize;
            document.documentElement.style.fontSize = this.fontSize + "%";
        },
        decreaseFont() {
            if (this.fontSize <= 40) return;
            this.fontSize -= 10;
            document.documentElement.style.fontSize = this.fontSize + "%";
        },

        toggleContrast() {
            // remove all contrast classes
            document.body.classList.remove(
                "a11y-contrast",
                "a11y-contrast-blue",
                "a11y-contrast-yellow"
            );

            // next mode
            this.contrastIndex =
                (this.contrastIndex + 1) % this.contrastModes.length;

            const mode = this.contrastModes[this.contrastIndex];

            if (mode) {
                document.body.classList.add(mode);
            }

            // save preference
            localStorage.setItem("a11y-contrast", mode || "");

            const btn = document.querySelector('[data-action="contrast"]');
            btn?.setAttribute(
                "aria-pressed",
                this.contrastIndex !== 0
            );

        },

        // toggleContrast() {
        //     document.body.classList.toggle("a11y-contrast");
        // },

        toggleSpeech() {
            if (!("speechSynthesis" in window)) {
                alert("Speech not supported");
                return;
            }

            // Stop speaking
            if (this.speaking) {
                speechSynthesis.cancel();
                this.speaking = false;
                return;
            }

            const text = this.getPageText();
            if (!text) return;

            // CLEAR any stuck speech
            speechSynthesis.cancel();

            this.utterance = new SpeechSynthesisUtterance(text);

            // ✅ ONLY set language (safe)
            this.utterance.lang = this.currentLang;

            // ❌ DO NOT force voice (browser chooses best)
            // this.utterance.voice = ...

            this.utterance.rate = 0.7;
            this.utterance.pitch = 1;

            this.utterance.onend = () => {
                this.speaking = false;
            };

            speechSynthesis.speak(this.utterance);
            this.speaking = true;
        },

        getPageText() {
            // const clone = document.body.cloneNode(true);
            // clone.querySelectorAll("script, style, #a11y-toolbar")
            //     .forEach(el => el.remove());

            // return clone.innerText.trim().slice(0, 12000);
            // 🎯 BEST: sirf main content read ho
            const main =
                document.querySelector("main") ||
                document.querySelector("#main-content") ||
                document.querySelector("[role='main']");

            if (main) {
                return main.innerText.trim().slice(0, 12000);
            }

            // fallback (no clone)
            return document.body.innerText
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 12000);
        },

        toggleLanguage() {
            this.currentLang = this.currentLang === "en-IN" ? "hi-IN" : "en-IN";
            alert("Language set to: " + this.currentLang);
        },

    };

    window.AccessibilityKit = AccessibilityKit;
    AccessibilityKit.init();

})(window, document);
