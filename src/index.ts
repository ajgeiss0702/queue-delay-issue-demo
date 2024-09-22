/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const url = new URL(request.url);
		// browsers often automatically request this url, so just return a 404 to prevent adding extra messages to the queue
		if(url.pathname === "/favicon.ico") {
			return Response.json({error: "no favicon"}, {status: 404})
		}

		const totalHours = 2.9;
		const timeBetween = (totalHours * 60 * 60) / 50; // spread batch over the allotted time
		let delay = 0;
		for (let i = 0; i < 50; i++) {
			const delaySeconds = Math.floor(delay += timeBetween);

			console.log(i + " delayed by " + delaySeconds + " seconds");

			await env.QUEUE.send({
				scheduledFor: Date.now() + (delaySeconds * 1e3),
				messageNumber: i
			}, {delaySeconds});
		}

		return Response.json({success: true, message: "Scheduled 50 messages over the next 3 hours. Make sure you have the tail open. Any messages that are delivered earlier than they're supposed to will be logged with console.error and say how early they were"});
	},
	async queue(batch, env, ctx) {
		for (let message of batch.messages) {

			const distance = Date.now() - message.body.scheduledFor;

			if(distance > 10e3) { // call it failed if the message is more than 10 seconds early
				const distanceSeconds = Math.abs(distance / 1e3).toFixed(2);
				console.error(`Fail! Message ${message.body.messageNumber} called ` + distanceSeconds + " seconds early!")
			} else {
				const distanceSeconds = Math.abs(distance / 1e3).toFixed(2);
				const early = distance > 0;
				console.log(`Success! Message ${message.body.messageNumber} called ` + distanceSeconds + " seconds " + (early ? "early" : "late"));
			}
			message.ack();

		}
	}
} satisfies ExportedHandler<Env, ScheduledMessage>;

type ScheduledMessage = {
	scheduledFor: number,
	messageNumber: number
}
