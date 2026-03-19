import { Assets } from "../structures/Activity";
import { AssetsSchema } from "../schema/common";

/**
 * Builder for Discord Activity assets.
 */
export class AssetsBuilder {
    private assets: {
        large_image?: string | null;
        large_text?: string | null;
        large_url?: string | null;
        small_image?: string | null;
        small_text?: string | null;
        small_url?: string | null;
    } = {};

    /**
     * Sets the large image key or URL.
     * @param image Image key or URL (Supports only png, jpg, and jpeg).
     */
    setLargeImage(image: string): this {
        this.assets.large_image = image;
        return this;
    }

    /**
     * Sets the hover text for the large image.
     * @param text Hover text.
     */
    setLargeText(text: string): this {
        this.assets.large_text = text;
        return this;
    }

    /**
     * Sets the large image URL explicitly.
     * @param url URL for the large image.
     */
    setLargeUrl(url: string): this {
        this.assets.large_url = url;
        return this;
    }

    /**
     * Sets the small image key or URL.
     * @param image Image key or URL (Supports only png, jpg, and jpeg).
     */
    setSmallImage(image: string): this {
        this.assets.small_image = image;
        return this;
    }

    /**
     * Sets the hover text for the small image.
     * @param text Hover text.
     */
    setSmallText(text: string): this {
        this.assets.small_text = text;
        return this;
    }

    /**
     * Sets the small image URL explicitly.
     * @param url URL for the small image.
     */
    setSmallUrl(url: string): this {
        this.assets.small_url = url;
        return this;
    }

    /**
     * Validates and returns the final assets object.
     */
    toJSON(): Assets {
        return AssetsSchema.parse(this.assets) as Assets;
    }
}
