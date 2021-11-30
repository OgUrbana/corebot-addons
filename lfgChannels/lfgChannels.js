const Utils = require('../modules/utils');
const Embed = Utils.Embed;
const CommandHandler = require('../modules/handlers/CommandHandler');
const EventHandler = require('../modules/handlers/EventHandler.js');
const { usersInVoiceChannel } = Utils.variables;


module.exports = async bot => {
    const CustomConfig = require ('../modules/CustomConfig.js');
    const config = new CustomConfig('./addon_configs/lfgChannels.yml', {
        Settings: {
            DefaultLimit: 0
        },
        categoryChannels: [
            {
                Category: "💪Gaming💪",
                Channel: "Legit",
                Limit: 4
            },
            {
                Category: "💪Gaming💪",
                Channel: "Rage",
                Limit: 4  
            }
        ]
    })
    EventHandler.set('voiceStateUpdate', async (bot, oldState, newState) => {
        Object.values(config.categoryChannels).forEach((category, chan) => {

            let listChanID = []
            config.categoryChannels.forEach(chan => {
                let chann = Utils.findChannel(chan.Channel, oldState.guild, "voice");
                listChanID.push(chann.id);
            })
            if (!oldState.channel && newState.channel) {
                usersInVoiceChannel.push({ user: newState.member.id, joinedAt: Date.now() });
            } else if (oldState.channel && newState.channel && oldState.channelID !== newState.channelID && usersInVoiceChannel.map(u => u.user).includes(oldState.member.id)) {
                usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldState.member.id)), 1);
                usersInVoiceChannel.push({ user: newState.member.id, joinedAt: Date.now() });
            } else if (oldState.channel && !newState.channel && usersInVoiceChannel.map(u => u.user).includes(oldState.member.id)) {
                usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldState.member.id)), 1);
            }

            let tempVC = Utils.findChannel(category.Channel, oldState.guild, "voice");
            let tempCategory = Utils.findChannel(category.Category, oldState.guild, "category");
            let tempLimit = category.Category
            if (!tempVC || !tempCategory) return;

            if (tempCategory) {
                if (newState.channelID == tempVC.id) {
                    oldState.guild.channels.create((`${category.Channel} ${oldState.member.user.username}`), { type: 'voice', parent: tempCategory }).then(channel => {
                        Utils.variables.tempChannels.set(oldState.id, {
                            channel: {
                                id: channel.id,
                                name: channel.name
                            },
                            public: true,
                            allowedUsers: [ oldState.id ],
                            maxMembers: undefined
                        })
                        channel.setUserLimit(category.Limit);                            
                        oldState.setChannel(channel.id);
                    })
                }
            }

            if (oldState.channel && oldState.channel !== newState.channel && oldState.channel.parentID == tempCategory.id) {
                for (let i = 0; i < listChanID.length; i++) {
                if (oldState.channelID == listChanID[i]) return;                    
                }
                if (oldState.channel.members.size == 0 && oldState.channelID !== tempVC.id) {
                    if (Utils.variables.tempChannels.get(oldState.id)) {
                        setTimeout(() => {
                            Utils.variables.tempChannels.delete(oldState.id)
                        }, 3000)  
                    }
                    oldState.channel.delete().catch(err => { });
                }
            }

        })

    })
}
