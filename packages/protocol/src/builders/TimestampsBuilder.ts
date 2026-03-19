import { Timestamps } from "../structures/Activity";
import { TimestampsSchema } from "../schema/common";

/**
 * Builder for Discord Activity timestamps.
 */
export class TimestampsBuilder {
    private timestamps: { start?: number; end?: number } = {};

    /**
     * Sets the start timestamp.
     * @param start Unix timestamp in milliseconds or Date object.
     */
    setStart(start: number | Date): this {
        this.timestamps.start = start instanceof Date ? start.getTime() : start;
        return this;
    }

    /**
     * Sets the end timestamp.
     * @param end Unix timestamp in milliseconds or Date object.
     */
    setEnd(end: number | Date): this {
        this.timestamps.end = end instanceof Date ? end.getTime() : end;
        return this;
    }

    /**
     * Validates and returns the final timestamps object.
     */
    toJSON(): Timestamps {
        return TimestampsSchema.parse(this.timestamps) as Timestamps;
    }
}
