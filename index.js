const { Client, Discord, Events } = require('discord.js-selfbot-v13');
const token = require('./config.json').token
const ban_command = require('./config.json').ban_command
const ban_reason = require('./config.json').ban_reason
const delay = require('./config.json').delay
let splitvalue = require('./config.json').splitvalue
const fs = require('node:fs');
let isBanRunning = false;
let timeouts = [];

if(ban_command === "") {
	console.log("=================\nWARNING: No ban command specified in the config file!\n=================")
}


const client = new Client({ // Create a new discord selfbot client
    checkUpdate: false,
});

client.on('ready', async () => { // Triggers when client is succesfully logged in
  console.log(`Logged in as ${client.user.username}!`);
})

client.on("messageCreate", async message => { // Triggers on every message received

	if(message.author.id != client.user.id) return // Returns if the author of the message is not the user logged in

  	if(message.content.startsWith(`!startban`)) { // Triggers start of ban automation

		if (isBanRunning) { // Check if the ban command is already running
			message.edit("A ban command is already running. Please wait until it finishes.");
			return;
		}

		isBanRunning = true; // Set isBanRunning to true

		fs.readFile('List-of-IDs.txt', (err, data) => { // Read contents of the List-of-IDs.txt file
			if (err) throw err;

			let ids = data.toString() // Put the file conent in a string
			let lines = ids.split(splitvalue); // Split the content into an array
			console.log(lines);
			if(lines.length === 1) { // Triggers if there is only 1 item in the array
				isBanRunning = false;
				message.edit(`Only 1 item in the array detected, please make sure you are using the correct split value in config.json`)
				return
			}
			if(splitvalue === "\n") splitvalue = "newline"

			message.edit(`Banning ${lines.length} users with ${delay}ms delay and using ` + "`" + splitvalue + "`" + ` to split the array!`)
			
			if(splitvalue === "newline") splitvalue = "\n"
			lines.forEach(function (element, index, array) { // Loops trough each string in the array with a set delay
				let timeoutId = setTimeout(function () {

					let element2 = element.trim() // Cuts the element in the array to make sure there are no double spaces in the final command
					message.channel.send(`${ban_command} ${element2} ${ban_reason}`) // Send final message

					if(index === array.length - 1){
						setTimeout(function () {
							message.channel.send(`Completed ban command succesfully!`)
							isBanRunning = false; // Set isBanRunning to false
							timeouts = []; // Reset the timeouts array
						}, delay);
					}

				}, index * delay) // Specify the delay incrementing for each string in the array
				timeouts.push(timeoutId); // Store each timeout ID in the timeouts array
			});
		})
	}

	if (message.content.includes(`!stopban`)) { // Stop command
		if (!isBanRunning) { // Check if the ban command is not running
			message.channel.send("There's no running ban command to stop.");
			return;
		}
	
		// Cancel all timeouts (stop executing future ban commands)
		timeouts.forEach(timeoutId => clearTimeout(timeoutId));
		timeouts = []; // Reset the timeouts array
	
		isBanRunning = false; // Set isBanRunning to false
		message.channel.send("Ban command execution has been stopped.");
	}

});

client.login(token).catch((err) => { // If the token is invalid return an error
  console.log("=================\nERROR: The token provided is invalid\n=================")
    process.exit()
  })