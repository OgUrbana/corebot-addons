const Utils = require('../modules/utils')
const CommandHandler = require('../modules/handlers/CommandHandler')
const EventHandler = require('../modules/handlers/EventHandler.js')

module.exports = async bot => {
	const CustomConfig = require('../modules/CustomConfig.js');
	const config = new CustomConfig('./addon_configs/kickRole.yml', {
		Required_Role: "Admin",
		Kick_Role: "test",
		Lang: {
			dateUntil: {
				Description: "{amountDays} day(s) until {date}"
			},
			noRole: {
				Description: "You do not have the required role!"
			},
			usersKicked: {
				Description: "The following users have been kicked: {kickedUsers}"
			},
			kickMessage: "Because I wanted to.",
		}
	})


	CommandHandler.set({
		name: `kickRole`,
		run: async (bot, message, args, { prefixUsed, commandUsed, member }) => {
			const user = Utils.ResolveUser(message);
			const requiredRole = Utils.hasRole(message.member, config.Required_Role)
			if (!requiredRole) return message.channel.send(Utils.Embed({ preset: 'error', description: config.Lang.noRole.Description }));
			message.guild.members.cache.forEach(member => {
				const kickRole = Utils.hasRole(member, config.Kick_Role);
				if (kickRole){
					member.kick(`${config.kickMessage}`);
					message.channel.send(Utils.setupEmbed({
						configPath: config.Lang.usersKicked,
						variables: [
						{ searchFor: /{kickedUsers}/g, replaceWith: (member) }
						]
					}))
				}
			})

		},
		description: "Kick all players who have a certain role.",
		usage: "kickrole",
		aliases: [""],
		type: "other"
	})

}