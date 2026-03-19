import { Secrets } from "../structures/Activity";
import { SecretsSchema } from "../schema/common";

/**
 * Builder for Discord Activity secrets.
 */
export class SecretsBuilder {
    private secrets: { join?: string; spectate?: string; match?: string } = {};

    /**
     * Sets the secret for joining a party.
     * @param secret Join secret.
     */
    setJoin(secret: string): this {
        this.secrets.join = secret;
        return this;
    }

    /**
     * Sets the secret for spectating a game.
     * @param secret Spectate secret.
     */
    setSpectate(secret: string): this {
        this.secrets.spectate = secret;
        return this;
    }

    /**
     * Sets the secret for a specific match.
     * @param secret Match secret.
     */
    setMatch(secret: string): this {
        this.secrets.match = secret;
        return this;
    }

    /**
     * Validates and returns the final secrets object.
     */
    toJSON(): Secrets {
        return SecretsSchema.parse(this.secrets) as Secrets;
    }
}
