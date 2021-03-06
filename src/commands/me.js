const moment = require("moment");
require("moment-duration-format");
const conf = require("../configs/config.json");
const messageUserChannel = require("../schemas/messageUserChannel");
const voiceUserChannel = require("../schemas/voiceUserChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const voiceUserParent = require("../schemas/voiceUserParent");

module.exports = {
	conf: {
		aliases: [],
		name: "me",
		help: "me",
		enabled: true
	},

	/**
	 * @param {Client} client
	 * @param {Message} message
	 * @param {Array<string>} args
	 * @param {MessageEmbed} embed
	 * @returns {Promise<void>}
	 */
	run: async (client, message, args, embed) => {
		const category = async (parentsArray) => {
			const data = await voiceUserParent.find({ guildID: message.guild.id, userID: message.author.id });
			const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
			let voiceStat = 0;
			for (var i = 0; i <= voiceUserParentData.length; i++) {
				voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
			}
			return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
		};

		const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
		const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
		const voiceLength = Active2 ? Active2.length : 0;
		let voiceTop;
		let messageTop;
		Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Veri bulunmuyor.";
		Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join("\n") : voiceTop = "Veri bulunmuyor.";

		const messageData = await messageUser.findOne({ guildID: message.guild.id, userID: message.author.id });
		const voiceData = await voiceUser.findOne({ guildID: message.guild.id, userID: message.author.id });

		const messageDaily = messageData ? messageData.dailyStat : 0;
		const messageWeekly = messageData ? messageData.weeklyStat : 0;

		const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika] s [saniye]");
		const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika] s [saniye]");

		const filteredParents = message.guild.channels.cache.filter((x) =>
			x.type === "category" &&
			!conf.publicParents.includes(x.id) &&
			!conf.registerParents.includes(x.id) &&
			!conf.solvingParents.includes(x.id) &&
			!conf.privateParents.includes(x.id) &&
			!conf.aloneParents.includes(x.id) &&
			!conf.funParents.includes(x.id)
		);

		embed.setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }));
		embed.setDescription(`
    ${message.author.toString()} (${message.member.roles.highest}) ki??isinin sunucu verileri
    **?????????????????????????????????????????????**
    **??? Ses Bilgileri:**
  ??? Toplam: \`${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika] s [saniye]")}\`
  ??? Public Odalar: \`${await category(conf.publicParents)}\`
  ??? Kay??t Odalar??: \`${await category(conf.registerParents)}\`
  ??? Sorun ????zme & Terapi: \`${await category(conf.solvingParents)}\`
  ??? Private Odalar: \`${await category(conf.privateParents)}\`
  ??? Game Odalar: \`${await category(conf.aloneParents)}\`
  ??? Oyun & E??lence Odalar??: \`${await category(conf.funParents)}\`
  ??? Di??er: \`${await category(filteredParents.map(x => x.id))}\`
    **?????????????????????????????????????????????**
    **??? Sesli Kanal Bilgileri: (\`Toplam ${voiceLength} kanal\`)**
    ${voiceTop}
    **?????????????????????????????????????????????**
    **??? Mesaj Bilgileri: (\`Toplam ${messageData ? messageData.topStat : 0} mesaj\`)**
    ${messageTop}
    `);
		embed.addField("Ses Verileri:", `
     \`???\` Haftal??k Ses: \`${voiceWeekly}\`
     \`???\` G??nl??k Ses: \`${voiceDaily}\`
    `, true);
		embed.addField("Mesaj Verileri:", `
    \`???\` Haftal??k Mesaj: \`${Number(messageWeekly).toLocaleString()} mesaj\`
    \`???\` G??nl??k Mesaj: \`${Number(messageDaily).toLocaleString()} mesaj\`
    `, true);
		message.channel.send(embed);
	}
};