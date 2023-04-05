import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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

const PAGE_ROUTE = new URLPattern({ pathname: "/page" });

function validateString(val){
	return string.substring((typeof val == "string")?val:"",100);
}

const handler=async (request,connInfo)=>{
	const ua=request.headers.get("user-agent")??"Unknown";
	const ip=connInfo?.remoteAddr??"Unknown";

	const url=request.url;
	if(PAGE_ROUTE.exec(url)&&request.method=="POST"){
		const body=await request.json();
		tracks.insertOne({
			_id: new ObjectId(),
			ua: ua,
			ip: ip,
			url: url,
			info: validateString(body.info),
			time: new Date().getTime()
		});
		return new Response(null, {
			status: 200
		});
	}
	return new Response(null, {
		status: 404
	});
};

serve(handler);