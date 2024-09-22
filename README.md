# Queue delay issue demo
This repo was made to help reproduce (what I think is) a bug in Cloudflare Queues where the `delaySeconds` is sometimes ignored

## Setup
Make a queue called `delay-demo`, then deploy this worker.

Next, make sure you have the tail open.

Go to this worker's `workers.dev` url to queue up messages. They will be spread across 3 hours.

Next, wait 30ish seconds for the first few messages to come through.
If they come through around when they supposed to, the log message will say `Success`.
Otherwise, it will say `Fail` with `console.error`.

For some reason, the issue isn't always reproducible. If all of them succeed, make sure to wait 3 hours before trying again,
as overlapping messages appear to decrease the chance that the issue will happen for some reason.
