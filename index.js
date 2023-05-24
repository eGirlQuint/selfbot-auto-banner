const { Client, Discord, Events } = require('discord.js-selfbot-v13');
const token = require('./config.json').token
const delay = require('./config.json').delay
const splitvalue = require('./config.json').splitvalue
const fs = require('node:fs');


const client = new Client({
    checkUpdate: false,
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.username}!`);
})

client.on("message", async message => {

	if(message.author.id != client.user.id) return // Returns if the author of the message is not the user logged in

  	if(message.content.includes(`!startban`)) { // Triggers start of ban automation
		fs.readFile('List-of-IDs.txt', (err, data) => { // Read contents of the List-of-IDs.txt file
			if (err) throw err;

			var ids = data.toString() // Put the file conent in a string
			let lines = ids.split(splitvalue); // Split the content into an array
			console.log(lines);

			message.channel.send(`Banning ${lines.length} users with ${delay}ms delay and using ${splitvalue} to split the array!`)
			
			lines.forEach(function (element, index, array) { // Loops trough each array with a set delay
				setTimeout(function () {

					let element2 = element.trim() // Cuts the element in the array to make sure there are no double spaces in the final command
					message.channel.send(`?banr ${element2}`) // Send final message

				}, index * delay) // Specify the delay incrementing for each string in the array
			});
		})
	}

});

client.login(token).catch((err) => { // If the token is invalid return an error
  console.log("=================\nERROR: The token provided is invalid\n=================")
    process.exit()
  })