import { Application, Router, Status } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/atlas_sdk@v1.1.0/mod.ts";

const client = new MongoClient({
	endpoint: "https://us-west-2.aws.data.mongodb-api.com/app/data-bduil/endpoint/data/v1",
	dataSource: "Main-Cluster",
	auth: {
		apiKey: Deno.env.get("MONGO_API_KEY"),
	},
});

const db=client.database("website-tracking");
const tracks=db.collection("tracks");

function validateString(val){
	return (typeof val == "string"?val:"").substring(0,100);
}

const router = new Router();
router.post("/page", async (ctx) => {
	const req=ctx.request;
	const ua=req.headers.get("user-agent")??"Unknown";
	const ip=req.ip;
	const url=req.url.href;
	const info=validateString(await req.body().value);
	const time=new Date().getTime();
	tracks.insertOne({
		_id: new ObjectId(),
		ua,
		ip,
		url,
		info,
		time
	});
	ctx.response.status=Status.OK;
});

const app = new Application();
app.use(oakCors());// Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });