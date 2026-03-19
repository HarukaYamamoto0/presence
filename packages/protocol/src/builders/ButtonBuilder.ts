import { Button } from "../structures/Activity";
import { ButtonSchema } from "../schema/common";

/**
 * Builder for Discord Activity buttons.
 */
export class ButtonBuilder {
    private button: { label?: string; url?: string } = {};

    /**
     * Sets the label for the button.
     * @param label The text to display on the button.
     */
    setLabel(label: string): this {
        this.button.label = label;
        return this;
    }

    /**
     * Sets the URL for the button.
     * @param url The URL to open when the button is clicked.
     */
    setUrl(url: string): this {
        this.button.url = url;
        return this;
    }

    /**
     * Validates and returns the final button object.
     * @throws Error if the button does not have both label and url.
     */
    toJSON(): Button {
        if (!this.button.label || !this.button.url) {
            throw new Error('ButtonBuilder requires both label and url to be set.');
        }
        return ButtonSchema.parse(this.button) as Button;
    }
}