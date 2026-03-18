import {OpCodes} from "../constants";

export class Decoder {
	private buffer = Buffer.alloc(0);

	push(chunk: Buffer): { opcode: OpCodes; data: any }[] {
		this.buffer = Buffer.concat([this.buffer, chunk]);

		const messages = [];

		while (this.buffer.length >= 8) {
			const opcode: OpCodes = this.buffer.readInt32LE(0);
			const length = this.buffer.readInt32LE(4);

			if (this.buffer.length < 8 + length) break;

			const json = this.buffer.subarray(8, 8 + length).toString();
			try {
				messages.push({opcode, data: JSON.parse(json)});
			} catch (e) {
				// Skip invalid JSON
			}

			this.buffer = this.buffer.subarray(8 + length);
		}

		return messages;
	}
}