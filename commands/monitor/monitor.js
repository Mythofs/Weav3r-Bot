const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { apiKey,ffscouterKey,channelId } = require('../../config.json');
const monitor = require('../../monitorStore.js');
const idCache = require('../../idCache.js');
const bstotal = require('../../bstotal.js');
const apiInfo = require('../../apiInfo.js');
const priceMin = require('../../priceMin.js');

module.exports = {
    data: new SlashCommandBuilder().setName('monitor').setDescription('Monitor an item.')
        .addStringOption((option) => option.setName('itemid').setDescription('The item to monitor').setRequired(true)),
    async execute(interaction) {
        const channel = interaction.client.channels.cache.get(channelId);
        const itemId = interaction.options.getString('itemid', true);
        if(monitor.has(itemId))
            return interaction.reply(`Already monitering item ${itemId}`);
        let interval;
        try {
            interval = setInterval(async () => {
                try {
                    const profileId = new Set();
                    const data = await safeFetch(`https://weav3r.dev/api/marketplace/${itemId}`, channel);
                    const listings = data.listings;
                    for(const listing of listings) {
                        if(listing.price * 0.95 > data.bazaar_average)
                            break;
                        if((listing.price - data.bazaar_average) * listing.quantity * 0.1 > priceMin)
                            profileId.add(listing.player_id);
                    }
                    for(const key of idCache.keys())
                        if(idCache.get(key).has(itemId) && !profileId.has(key)) {
                            idCache.get(key).delete(itemId);
                            if(idCache.get(key).size == 0)
                                idCache.delete(key);
                        }
                    if(profileId.size == 0)
                        return;
                    const stats = await safeFetch(`https://ffscouter.com/api/v1/get-stats?key=${ffscouterKey}&targets=${Array.from(profileId).join()}`, channel);
                    for(const stat of stats) {
                        if(stat.bs_estimate < bstotal * 0.75) {
                            const userInfo = await safeFetch(`https://api.torn.com/user/${stat.player_id}?selections=icons,bazaar,profile&key=${apiKey}`, channel);
                            console.log(userInfo);
                            const iconMap = new Map(userInfo.icons.map(icon => [icon.id, icon.description]));
                            //72 - greenleaf, 71 - traveling, 15 - hostpital, 35 - bazaar, 27 - company
                            if(!iconMap.has(72) && !iconMap.has(71) && !iconMap.has(15) && iconMap.has(35) && (!iconMap.has(27) || !iconMap.get(27).includes("Clothing Store")) && !(idCache.has(stat.player_id) && idCache.get(stat.player_id).has(itemId))) {
                                const listing = listings.find(l => l.player_id == stat.player_id);
                                if(userInfo.last_action.status != "Online") {
                                    channel.send({
                                        content: '@everyone',
                                        allowedMentions: { parse: ['everyone'] },
                                        embeds: [new EmbedBuilder()
                                        .setTitle(`${data.item_name} MUG ALERT`)
                                        .setThumbnail(`https://www.torn.com/images/items/${itemId}/large.png`)
                                        .setColor(0xF59E0B)
                                        .addFields(
                                            { name: 'Item', value: data.item_name, inline: true },
                                            { name: 'Price', value: '$' + listing.price.toLocaleString(), inline: true },
                                            { name: 'Total Value', value: '$' + (listing.price * listing.quantity).toLocaleString(), inline: true },
                                            { name: 'Name', value: `${userInfo.name} (${userInfo.id})`, inline: true},
                                            { name: 'Level', value: String(userInfo.level), inline: true},
                                            { name: 'Last Action', value: userInfo.last_action.status + " (" + userInfo.last_action.relative + ")", inline: true},
                                            { name: 'Estimated Stats', value: stat.bs_estimate_human ?? 'Unknown', inline: true },
                                            { name: 'Bazaar Link', value: `[Bazaar](https://www.torn.com/bazaar.php?userId=${userInfo.id}#/)` },
                                            { name: 'Profile Link', value: `[Profile](https://www.torn.com/profiles.php?XID=${userInfo.id})` },
                                            { name: 'Attack Link', value: `[Attack](https://www.torn.com/loader.php?sid=attack&user2ID=${userInfo.id})` },
                                        )
                                        .setTimestamp()
                                    ]});
                                    if(idCache.has(userInfo.id))
                                        idCache.get(userInfo.id).add(itemId);
                                    else
                                        idCache.set(userInfo.id, new Set([itemId]));
                                }
                            }
                        }
                    }
                    apiInfo.set(itemId, stats.length);
                }
                catch(error) {
                    console.error(error);
                    channel.send(`Error while monitoring ${error}`);
                }
            }, 65000);
            monitor.set(itemId, interval);
            await interaction.reply(`Started monitoring item ${itemId}`);
        }
        catch(error) {
            console.error(error);
            await channel.send(`There was an error while monitoring item ${itemId} :\n ${error.message}`);
        }
    }
};
async function safeFetch(url, channel) {
    let response;
    try {
        response = await fetch(url);
    } catch (err) {
        channel.send(`Error while fetching ${url}`);
        throw err;
    }
    let data;
    try {
        data = await response.json();
    } catch(err) {
        channel.send(`Invalid JSON from ${url}`);
        throw err;
    }

    if (!response.ok) {
        channel.send(`Error from ${url}: ${JSON.stringify(data)}`);
        throw new Error(`Error from ${url}`);
    }
    return data;
}