import { Party } from "../structures/Activity";
import { PartySchema } from "../schema/common";

/**
 * Builder for Discord Activity party.
 */
export class PartyBuilder {
    private party: { id?: string; size?: [number, number] } = {};

    /**
     * Sets the party ID.
     * @param id Party ID.
     */
    setId(id: string): this {
        this.party.id = id;
        return this;
    }

    /**
     * Sets the party size.
     * @param current Current number of players in the party.
     * @param max Maximum number of players allowed in the party.
     */
    setSize(current: number, max: number): this {
        this.party.size = [current, max];
        return this;
    }

    /**
     * Validates and returns the final party object.
     */
    toJSON(): Party {
        return PartySchema.parse(this.party) as Party;
    }
}
