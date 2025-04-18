class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.inventory = new Set();
        this.engine.addChoice("Begin the story", this.engine.storyData.InitialLocation);
    }

    handleChoice(startingLocation) {
        this.engine.gotoScene(Location, startingLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];

        // Special handling for Bookstore or Open Gym
        if (key === "Bookstore" || key === "Open Gym") {
            this.engine.show(locationData.Body);
            this.engine.gotoScene(End); // End the game immediately after showing text
            return;
        }

        this.engine.show(locationData.Body);

        if (key === "Beyond") {
            if (this.engine.inventory.has("Keycard")) {
                this.engine.show("<p><em>Looks like there are buses.</em></p>");
            } else {
                this.engine.show("<p><em>Hmm. I think there's more to explore...</em></p>");
                this.engine.show("<p><em>Looks like I need a Keycard.</em></p>");
            }
        }

        // Give item if defined
        if (locationData.Give) {
            this.engine.inventory.add(locationData.Give);
            this.engine.show(`<p><em>You found: ${locationData.Give}</em></p>`);
        }

        if (key === "Beyond") {
            this.engine.addChoice("Return to Kresge", { Target: "Kresge" });

            if (this.engine.inventory.has("Keycard")) {
                for (let choice of locationData.Choices) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        } else if (locationData.Choices && locationData.Choices.length > 0) {
            for (let choice of locationData.Choices) {
                if (!choice.Requires || this.engine.inventory.has(choice.Requires)) {
                    if (choice.Special === "MarketScene") {
                        this.engine.addChoice(choice.Text, { special: "MarketScene" });
                    } else {
                        this.engine.addChoice(choice.Text, choice);
                    }
                }
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (!choice) {
            this.engine.gotoScene(End);
            return;
        }

        if (choice.special === "MarketScene") {
            this.engine.gotoScene(MarketScene);
            return;
        }

        this.engine.show("&gt; " + choice.Text);
        this.engine.gotoScene(Location, choice.Target);
    }
}

class MarketScene extends Scene {
    create() {
        this.engine.show("You're in the Merrill Market. You can buy a bag of chips or a drink.");

        this.engine.addChoice("Buy chips", "Chips");
        this.engine.addChoice("Buy drink", "Drink");
        this.engine.addChoice("Leave market", "Merrill");
    }

    handleChoice(choice) {
        if (choice === "Chips" || choice === "Drink") {
            this.engine.inventory.add(choice);
            this.engine.show(`<p><em>You bought: ${choice}</em></p>`);
            this.engine.gotoScene(MarketScene);
        } else {
            this.engine.gotoScene(Location, choice);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);

        if (this.engine.inventory.size > 0) {
            this.engine.show("<p><strong>Your inventory:</strong> " + [...this.engine.inventory].join(", ") + "</p>");
        }
    }
}

Engine.load(Start, 'myStory.json');