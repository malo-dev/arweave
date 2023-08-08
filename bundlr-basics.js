import Bundlr from "@bundlr-network/client";
import express from 'express'
import cors from 'cors'
import fs from "fs";
const app = express()
const connectToNode = async () => {
	const privateKey = "./key.json";
	const jwk = JSON.parse(fs.readFileSync(privateKey).toString());
	const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);
	console.log(`wallet address = ${bundlr.address}`);
	return bundlr;
};

/**************************** FUND NODE *********************************************/
/**
 * Checks the price to upload 1MB data, then funds a node with sufficient funds.
 */
const fundNode = async (bundlr) => {
	// const privateKey = "arweave-key-aOTcToJZnW6wQQE6fKSFCta7etFX5Gy8KjJ_B-GsS14.json";
	// const jwk = JSON.parse(fs.readFileSync(privateKey).toString());
	// const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);

	console.log(bundlr);
	const dataSizeToCheck = 1048576;
	const price1MBAtomic = await bundlr.getPrice(dataSizeToCheck);
	
	const price1MBConverted = bundlr.utils.unitConverter(price1MBAtomic);
	console.log(`Uploading 1MB to Bundlr costs $${price1MBAtomic}`);

	/********************************** CHECK LOADED BALANCE ****************************************/
	// Get loaded balance in atomic units
	const atomicBalance = await bundlr.getLoadedBalance();
	console.log(`Node balance (atomic units) = ${atomicBalance}`);

	// Convert balance to an easier to read format
	const convertedBalance = bundlr.utils.unitConverter(atomicBalance);
	console.log(`Node balance (converted) = ${convertedBalance}`);

	/********************************** LAZY FUNDING A NODE ******************************************/
	// If the balance funded (atomicBalance) is less than the cost
	// to upload 1MB (price1MBAtomic), then go ahead and fund your wallet
	// NOTE: Some chains are faster or slower than others. It can take
	// upwards of 40 minutes for Arweave to process your funding. If you
	// don't see your balance right away, don't stress. Grab a cup of tea
	// maybe take a walk, and then check back.
	if (atomicBalance < price1MBAtomic) {
		console.log("Funding wallet--->");
		// Fund the node, give it enough so you can upload a full MB
		try {
			// response = {
			// 	id, // the txID of the fund transfer
			// 	quantity, // how much is being transferred
			// 	reward, // the amount taken by the network as a fee
			// 	target, // the address the funds were sent to
			// };
			const response = await bundlr.fund(price1MBAtomic);
			console.log(`Funding successful txID=${response.id} amount funded=${response.quantity}`);
		} catch (e) {
			console.log("Error funding node ", e);
		}
	}
};

/********************************** WITHDRAWING FUNDS FROM A NODE ****************************************/
/**
 * Excess funds sent to a node can be withdrawn at any time.
 */
const withdrawFromNode = async (bundlr) => {
	try {
		// 400 - something went wrong
		// response.data  = "Not enough balance for requested withdrawal"

		// 200 - Ok
		// response.data = {
		//     requested, // the requested amount,
		//     fee,       // the reward required by the network (network fee)
		//     final,     // total cost to your account (requested + fee)
		//     tx_id,     // the ID of the withdrawal transaction
		// }
		// 1. Get current balance
		const curBalance = await bundlr.getLoadedBalance();
		// 2. Withdraw all
		const response = await bundlr.withdrawBalance(curBalance);

		console.log(
			`Funds withdrawn txID=${response.data.tx_id} amount requested=${response.data.requested}`,
		);
	} catch (e) {
		console.log("Error wiithdrawing funds ", e);
	}
};

/********************************** UPLOAD DATA ****************************************/
/**
 * Upload any arbitrary data to Bundlr
 */
const uploadData = async (bundlr) => {
	// If it can be reduced to 1s and 0s, you can store it via Bundlr.
	const dataToUpload = `${{
		data: "oeuvre d'art",
		priceOf : 20
	}}`;
	try {
		const response = await bundlr.upload(dataToUpload); 
		const responseImage = await bundlr.uploadFile("../assets/" + fileToUpload); // Returns an axios response
		// console.log(`File uploaded ==> https://arweave.net/${responseImage.id}`);
		// return `https://arweave.net/${response.id}
		
	const data = {
			data: `https://arweave.net/${response.id}`,
			image : `https://arweave.net/${responseImage.id}`
	}
		return data
	} catch (e) {
		console.log("Error uploading file ", e);
	}
};



app.post("/",async (req,res) => {
	const bundlr = await connectToNode();
	const val = await uploadData(bundlr);
	res.json(val)
})
app.get("/",async (req,res) => {
	const bundlr = await connectToNode();
	const val = await uploadData(bundlr);
	res.json(val)
})
const port = 8000
app.listen(port,() => {
	console.log()
})


// This function must always be called


