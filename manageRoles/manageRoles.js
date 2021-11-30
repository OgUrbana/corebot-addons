const Utils = require('../modules/utils')
const CommandHandler = require('../modules/handlers/CommandHandler')
const EventHandler = require('../modules/handlers/EventHandler.js')
const CustomConfig = require('../modules/CustomConfig.js');


module.exports = async bot => {
	const config = new CustomConfig('./addon_configs/manageRole.yml', {
		Settings: {
			Enabled: true
		},
		Roles: [
		{
			Type: 0, // Type 0 is when role is acquired, remove when taken back.
			"~22": "Type 0 is when role is acquired, Add role_to_give. remove role_to_give when they no longer have Role_Acquired.",
			Role_Acquired: "Supporter",
			Role_To_Give: "DJ"
		},
		{
			Type: 1, // Type 1 is to when role is acquired, 
			"~222": "Type 1 is to when role is acquired, Another is removed",
			Role_Acquired: "Muted",
			Role_To_Remove: "Communiy"
		},
		{
			Type: 2, //Whem muted role is obtained, remove role x and role y
			"~2223": "When role is obtained, remove role1 and role 2",
			Role_Acquired: "Muted", // when this role is acquired
			Role_To_Remove1: "Community", // remove these roles			
			Role_To_Remove2: "Verify" // remove these roles
		}
		]
	})


	EventHandler.set('guildMemberUpdate', async (bot, oldMember, newMember) => {
		Object.values(config.Roles).forEach(function (data) {

			const hadRole = Utils.hasRole(oldMember, data.Role_Acquired);
			const hasRole = Utils.hasRole(newMember, data.Role_Acquired);

			if (data.Type === 0) { // If Type = 0, when role is acquired, give other role.
				let roleChange = Utils.findRole(data.Role_To_Give, newMember.guild);
				if (!hasRole && hadRole) {
					newMember.roles.remove(roleChange);			
				}
				else if (!hadRole && hasRole) {
					newMember.roles.add(roleChange);			
				}
			}

			//if Type = 1, when Role_Acquired is given, remove Role_To_Remove
			else if (data.Type === 1) {
				let roleChange = Utils.findRole(data.Role_To_Remove, newMember.guild);
				if (!hasRole && hadRole) {
					newMember.roles.add(roleChange);			
				}
				else if (!hadRole && hasRole) {
					newMember.roles.remove(roleChange);			
				}
			}


			else if (data.Type === 2) {
				let roleChange = Utils.findRole(data.role_Acquired, newMember.Guild);
				let roleChange1 = Utils.findRole(data.Role_To_Remove1, newMember.guild);
				let roleChange2 = Utils.findRole(data.Role_To_Remove2, newMember.guild);
				if (!hasRole && hadRole) {
					newMember.roles.add(roleChange);			
				}
				else if (!hadRole && hasRole) {
					newMember.roles.remove(roleChange1);	
					newMember.roles.remove(roleChange2);		
				}
			}
		})

	})	



}