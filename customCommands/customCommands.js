const Utils = require("../modules/utils.js");
const { config, lang, commands, embeds } = Utils.variables;
const Embed = Utils.Embed;
const CommandHandler = require('../modules/handlers/CommandHandler');
const eventHandler = require('../modules/handlers/EventHandler');
const CustomConfig = require('../modules/CustomConfig.js');

const fs = require("fs");
const YAML = require('yaml');
const chalk = require('chalk');
const fetch = require('node-fetch');
let licenseBool = false;
const url = ("https://pastebin.com/raw/W1pDcP27")

function fetchData() {
	return fetch('https://pastebin.com/raw/W1pDcP27') 
	.then(response => 
		response.text().then(text => text.split(/\r|\n/)));
}

const installModules = async (modules) => {
	return new Promise(async (resolve, reject) => {
		if (process.argv.slice(2).map(a => a.toLowerCase()).includes("--no-install")) resolve();
		else {
			const showInfo = process.argv.slice(2).map(a => a.toLowerCase()).includes("--show-install-output");
			const { spawn } = require('child_process');
			const npmCmd = process.platform == "win32" ? 'npm.cmd' : 'npm';
			const info = "[90m>[39m          [INFO]";
			const missingModules = modules.filter(module => {
				try {
					require.resolve(module);
					return;
				} catch (err) {
					return true;
				}
			});
			if (missingModules.length == 0) {
				resolve();
			} else {
				for (let i = 0; i < missingModules.length; i++) {
					const module = missingModules[i];
					console.log(info, `Installing module ${i + 1}/${missingModules.length} (${module})`);
					await new Promise(resolve => {
						const install = spawn(npmCmd, ['i', module]);
						install.stdout.on('data', (data) => {
							if (showInfo) console.log(data.toString().trim())
						})
						install.stderr.on('data', (data) => {
							if (showInfo) console.log("\u001b[31m" + data.toString().trim());
						})
						install.on('exit', () => {
							console.log(info, `Finished installing module ${i + 1}/${missingModules.length} (${((i + 1) / missingModules.length * 100).toFixed(2)}% done)`);
							resolve();
						})
					})
				}
				resolve();
			}
		}
	})
}

const initConfig = async (path, excludes = []) => {
	return new Promise(async (resolve, reject) => {
		const checkPath = async (path) => {
			return new Promise(async (res, reject) => {
				if (!fs.existsSync(path)) {
					console.log("\x1b[34m[Custom Commands]\x1b[32m[1m Missing Config Path | Creating path...\x1b[0m");
					fs.mkdir(path, async (err) => {
						if (err) {
							reject(err)
						}
						console.log("\1xb[34m[Custom Commands]\x1b[32m Config Path Created.\x1b[0m")
						res(true)
					})
				} else {
					console.log("\x1b[34m[Custom Commands]\x1b[32m Found Config Path. \x1b[0m")
					res(true)
				}
			})
		}
		await checkPath(path)
		const total_configs = await module.exports.getConfigsInJson(path);

		if (!total_configs) {
			console.log("\x1b[34m[Custom Commands]\x1b[32m Missing Config Files | Creating Default Configs...\x1b[0m")
			const examples = [
			{
				dir: "./addon_configs/custom_commands/Main.yml",
				reset: true,
				data: {
					LicenseKey: "LICENSE_KEY",
					Command: {
						RequiredRole: "admin",
						Name: "chelp",
						Description: "Send a help menu of Custom Commands",
						Usage: "chelp",
						Aliases: [],
						type: "other",
					},
					Embeds: {
						InvalidCommand: {
							Title: "Invalid Command",
							Description: "That Custom Command name does not exist.",
							Color: config.EmbedColors.Errors,
						},
						Cooldown: {
							Title: "Cooldown!",
							Description: "You are on cooldown for the command **{command-name}**. Please wait ``{end}`` until using that command again.",
							Color: config.EmbedColors.Error
						},
						List: {
							Template: "**{index}.** {name}\n> Commands ({total}): {commands}",
							Command_Template: "\n```Title: {title}\nType: {style}\nID: {custom_id}```",
							Title: "Command List {page}/{maxPages}",
							Description: "{commands}",
							Footer: "Send a Custom Command by running -command>",
						},
					},
				}
			},
			{
				dir: "./addon_configs/custom_commands/Example.yml",
				reset: true,
				data: {
					Command: {	
						RequiredRole: "Admin",
						Name: "test",
						Description: "Test Command",
						Usage: "test",
						Aliases: [],
						Type: "other",
					},
					CommandSettings: {
						RequiredChannels: {
							Channels: ["905315342308495383"],
							"~2212123": "Required Channels for this command to be sent in",
							BypassRoles: ["Admin"],
							Message: "Please us the correct channels!",
							"~21545121": "Wrong Channel Message",
					//		Cooldown: {
					//			Type: "REPLY",
					//			Private: true,
					//			Content: "{username} Please wait {end} till clicking the command again",
					//			Timeout: "5s",
					//			cdBypassRoles: ["Admin"],
					//		},
				},
			},
			Message: "_embed #channel ptext={author-tag} {author-ping} {args1} {args2} {args3} {args4} | author=name= icon={author-pfp} | title=this is a test embed | description=this is a test embed | thumbnail={user-pfp} | color=#4f545c",
			"~2": "The embed/text that will be sent with the commands",
			"~22": "Use https://robyul.chat/embed-creator",
		}
	}
	]
	await Utils.asyncForEach(examples, async (example) => {
		new CustomConfig(example.dir, example.data, example.reset)
	})
	console.log("\x1b[34m[Custom Commands]\x1b[32m Created Default Configs.\x1b[0m");

	resolve(await initConfig(path))
}
resolve(total_configs)
})

}

let axios;
let main_config;
let config_commands = [];
(async () => {
	console.log("\x1b[34m[Custom Commands]\x1b[32m Starting...\x1b[0m")
	await installModules(["axios"])
	axios = require("axios")
	console.log("\x1b[34m[Custom Commands]\x1b[32m Initializing Configs...\x1b[0m")
	const total_configs = await initConfig("./addon_configs/custom_commands/");
	if (!total_configs) return;
	console.log("\x1b[34m[Custom Commands]\x1b[32m Found \x1b[37m" + Object.values(total_configs).length + "\x1b[32m total config files.\x1b[0m")
	if (total_configs.Main) main_config = total_configs.Main
		Object.keys(total_configs).forEach(key => {
			if (["main"].includes(key.toLowerCase())) return;
			else config_commands.push(total_configs[key])
		})
})()




module.exports = {
	getConfigsInJson: async (path) => {
		return new Promise(async (resolve, reject) => {
			const configs = {}
			fs.readdir(path, async (err, files) => {
				if (err) {
					return reject(err)
				}
				await Utils.asyncForEach(files, async (file) => {
					return new Promise(async (resolve) => {
						const fileName = file.split(".")[0]
						if (file.endsWith(".json")) {
							try {
								fs.readFile(path + file, 'utf-8', async (err, data) => {
									if (err) {
										return reject(err);
									}
									data = await JSON.parse(data)
									configs[fileName] = data
									resolve(true)
								})
							} catch (err) {
								console.log(err)
								resolve(false)
							}
						}
						if (file.endsWith(".yml")) {
							const data = await YAML.parse(fs.readFileSync(path + file, 'utf-8'), options = { prettyErrors: true })
							configs[fileName] = data
							resolve(true)
						}
					})
				})

				if (Object.keys(configs).length >= 1) resolve(configs)
					else resolve(undefined)
				})

		})
	},
	getEnd: (string) => {
		if (string.toLowerCase() === "*") return null
			function getTimeElement(letter) {
				const find = string.toLowerCase().match(new RegExp('\\d+${letter}'));
				return parseInt(find ? find[o] : 0);
			}
			const mins = getTimeElement("m");
			const hours = getTimeElement("h");
			const days = getTimeElement("d");
			const seconds = getTimeElement("s");

			let total = 0;
			total += seconds * 1000
			total += mins * 60000;
			total += hours * 60 * 60000;
			total += days * 24 * 60 * 60000;
			const endAt = Date.now() + total;
			return endAt
		},
		getAdvancedEmbed: function (msg, vars) {
			try {
				if (vars) vars.forEach(v => msg = msg.replace(v.searchFor, v.replaceWith))
					if (!msg.includes("_embed")) return {
						text: msg,
						embed: null
					}
					let embed = {
						author: {},
						footer: {},
						thumbnail: {},
						image: {},
						fields: [],
					};

					let ptext;

					msg.replace("_embed #channel", "").split("|").forEach(property => {
						property = property.trim();

						let key = property.substring(0, property.indexOf("=")).trim();
						let value = property.substring(property.indexOf("=") + 1).trim();



						if (key == "author") {
							let startOfName = value.indexOf("name=") == -1 ? undefined : value.indexOf("name=");
							let startOfIcon = value.indexOf("icon=") == -1 ? undefined : value.indexOf("icon=");
							let startOfURL = value.indexOf("url=") == -1 ? undefined : value.indexOf("url=");

							let name = typeof startOfName == "number" ? value.substring(startOfName + 5, startOfIcon || startOfURL).trim() : undefined;
							let icon = typeof startOfIcon == "number" ? value.substring(startOfIcon + 5, startOfURL).trim() : undefined;
							let url = typeof startOfURL == "number" ? value.substring(startOfURL + 4).trim() : undefined;

							if (icon == "bot") icon = bot.user.displayAvatarURL({ dynamic: true });
							if (url == "bot") url = bot.user.displayAvatarURL({ dynamic: true });

							embed.author.name = name;
							embed.author.icon_url = icon;
							embed.author.url = url;

						} else if (key == "thumbnail") {
							if (value == "bot") value = bot.user.displayAvatarURL({ dynamic: true });

							embed.thumbnail.url = value;
						} else if (key == "image") {
							if (value == "bot") value = bot.user.displayAvatarURL({ dynamic: true });

							embed.image.url = value;
						} else if (key == "footer") {
							let startOfName = value.indexOf("name=") == -1 ? undefined : value.indexOf("name=");
							let startOfIcon = value.indexOf("icon=") == -1 ? undefined : value.indexOf("icon=");

							if (startOfName == undefined) return embed.footer.text = value;

							let name = typeof startOfName == "number" ? value.substring(startOfName + 5, startOfIcon).trim() : undefined;
							let icon = typeof startOfIcon == "number" ? value.substring(startOfIcon + 5).trim() : undefined;

							if (icon == "me") icon = member.user.displayAvatarURL({ dynamic: true });
							if (icon == "bot") icon = bot.user.displayAvatarURL({ dynamic: true });

							embed.footer.text = name;
							embed.footer.icon_url = icon;
						} else if (key == "color") {
							embed[key] = parseInt(value.replace("#", ""), 16);
						} else if (key == "field") {
							let startOfName = value.indexOf("name=") == -1 ? undefined : value.indexOf("name=");
							let startOfValue = value.indexOf("value=") == -1 ? undefined : value.indexOf("value=");
							let startOfInline = value.indexOf("inline=");

							let name = typeof startOfName == "number" ? value.substring(startOfName + 5, startOfValue).trim() : undefined;
							let v = typeof startOfValue == "number" ? value.substring(startOfValue + 6, startOfInline == -1 ? undefined : startOfInline).trim() : undefined;
							let inline = startOfInline == -1 ? true : value.substring(startOfInline + 7).trim();

							if (typeof inline == "string") inline = inline == "false" || inline == "no" ? false : true;
							if (!name) name = "\u200b";
							if (!value) value = "\u200b";

							embed.fields.push({ name, value: v, inline });
						} else if (key == "ptext") {
							ptext = value;
						} else embed[key] = value;
					});

					if (!embed.color) embed.color = config.EmbedColors.Default;

					return { text: ptext, embed };
				} catch (err) {
					console.log(err)
				}
			},
			run: async (bot) => {



				const wait = async () => {
					return new Promise(async (resolve) => {
						if (main_config) {
							console.log("\x1b[34m[Custom Commands]\x1b[32m Successfully loaded \x1b[37m" + config_commands.length + "\x1b[32m total commands.\x1b")
							resolve(true)
						}
						else {
							setTimeout(async () => {
								resolve(await wait())
							}, 500)
						}
					})
				}
				if (!main_config) await wait()


					async function loadLicenses() {
						const response = await fetch(url);
						const licenses = await response.text();

						return licenses;
					}

					let licenses = [];
					let updatedLicenses = [];
					try {
						licenses = await loadLicenses();
						licenses = licenses.split(/\r|\n/);
						updatedLicenses = licenses.filter(function(a){return a !== ''});
					} catch (e) {
						console.log("Error!");
						console.log(e);
					}


					for (let i = 0; i < updatedLicenses.length; i++) {
						if (updatedLicenses[i] === main_config.LicenseKey) {
							console.log("\x1b[34m[Custom Commands]\x1b[32m Valid License Key!\x1b");
							licenseBool = true;
							break;
						}
					}

					if (!licenseBool) {
						return console.log("\x1b[34m[Custom Commands]\x1b[32m INVALID LICENSE KEY!!\x1b");
					}

					config_commands.forEach(function(command) {
						if (!(command.Name === "chelp")) {
							CommandHandler.set({
								name: command.Command.Name,
								run: async(bot, message, args, { prefixUsed, commandUsed }) => {
									const variables = [
									...Utils.userVariables(message.member, 'user'),
									{ searchFor: /{test}/g, replaceWith: "Hello World" },
									{ searchFor: /{author-ping}/g, replaceWith: ( "<@" + message.author.id + ">") },
									{ searchFor: /{author-pfp}/g, replaceWith: ( message.author.displayAvatarURL() ) },
									{ searchFor: /{author-tag}/g, replaceWith: ( message.author.tag ) },
									{ searchFor: /{author-id}/g, replaceWith: ( message.author.id ) },
									{ searchFor: /{args1}/g, replaceWith: (args[0]) },
									{ searchFor: /{args2}/g, replaceWith: (args[1]) },
									{ searchFor: /{args3}/g, replaceWith: (args[2]) },
									{ searchFor: /{args4}/g, replaceWith: (args[3]) },
									{ searchFor: /{args5}/g, replaceWith: (args[4]) },
									{ searchFor: /{args6}/g, replaceWith: (args[5]) }
									]
									let requiredRole = Utils.hasRole(message.member, command.Command.RequiredRole);
									if (!requiredRole) return message.channel.send(Utils.Embed({ preset: 'nopermission' }));
									if (command.CommandSettings.RequiredChannels && !command.CommandSettings.RequiredChannels.Channels.includes(message.channel.id)) {
										if (command.CommandSettings.RequiredChannels.BypassRoles.some(r => !Utils.hasRole(message.member, r.toString()))) {
											const data = module.exports.getAdvancedEmbed(command.CommandSettings.RequiredChannels.Message, Utils.userVariables(message.member, 'user'))
											if (data) return message.channel.send(data.text, { embed: data.embed }).then(msg => {
												msg.delete({ timeout: 3500 })
											})
										}
									}

									const data = module.exports.getAdvancedEmbed(command.Message, variables)
									if (data) return message.channel.send(data.text, { embed: data.embed })
								},
							description: command.Command.Description,
							usage: command.Command.Usage,
							aliases: command.Command.Aliases,
							type: command.Command.Type
						})
						}
					})
				}
			}

