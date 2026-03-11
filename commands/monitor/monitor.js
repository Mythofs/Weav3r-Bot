const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { apiKey,ffscouterKey,channelId } = require('../../config.json');
const monitor = require('../../monitorStore.js');
const idCache = require('../../idCache.js');
const bstotal = require('../../bstotal.js');
const currentListings = require('../../currentListings.js');

module.exports = {
    data: new SlashCommandBuilder().setName('monitor').setDescription('Monitor an item.')
        .addStringOption((option) => option.setName('itemid').setDescription('The item to monitor').setRequired(true)),
    async execute(interaction) {
        const channel = interaction.client.channels.cache.get(channelId);
        const itemId = interaction.options.getString('itemid', true);
        const priceLimit = 1500000;
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
                        if((listing.price - data.bazaar_average) * listing.quantity * 0.1 > priceLimit)
                            profileId.add(listing.player_id);
                    }
                    for(const key of idCache.keys())
                        if(idCache.get(key).has(itemId) && !profileId.has(key)) {
                            idCache.get(key).delete(itemId);
                            if(idCache.get(key).size == 0)
                                idCache.delete(key);
                        }
                    for(const listing of currentListings) {

                    }
                    if(profileId.size == 0)
                        return;
                    const stats = await safeFetch(`https://ffscouter.com/api/v1/get-stats?key=${ffscouterKey}&targets=${Array.from(profileId).join()}`, channel);
                    for(const stat of stats) {
                        if(stat.bs_estimate < bstotal * 0.75) {
                            const icons = await safeFetch(`https://api.torn.com/v2/user/${stat.player_id}/icons?comment=Weav3r%20Mug%20Bot&key=${apiKey}`, channel);
                            const iconMap = new Map(icons.icons.map(icon => [icon.id, icon.description]));
                            //72 - greenleaf, 71 - traveling, 15 - hostpital, 35 - bazaar, 27 - company
                            if(!iconMap.has(72) && iconMap.has(71) && !iconMap.has(15) && (!iconMap.has(27) || !iconMap.get(27).includes("Clothing Store")))
                                if(currentListings.has(stat.player_id))
                                    currentListings.get(stat.player_id).add({itemId: itemId, bs: stat.bs_estimate_human, value: currentListing.price * currentListing.quantity, timestamp: Date.now()});
                                else
                                    currentListings.set(stat.player_id, {itemId: itemId, bs: stat.bs_estimate_human, value: currentListing.price * currentListing.quantity, timestamp: Date.now()});
                            if(!iconMap.has(72) && !iconMap.has(71) && !iconMap.has(15) && iconMap.has(35) && (!iconMap.has(27) || !iconMap.get(27).includes("Clothing Store")) && !(idCache.has(stat.player_id) && idCache.get(stat.player_id).has(itemId))) {
                                const currentListing = listings.find(l => l.player_id == stat.player_id);
                                const profile = await safeFetch(`https://api.torn.com/v2/user/${stat.player_id}/profile?striptags=true&comment=Weav3r%20Mug%20Bot&key=${apiKey}`, channel);
                                if(profile.profile.last_action.status != "Online") {
                                    channel.send({
                                        content: '@everyone',
                                        allowedMentions: { parse: ['everyone'] },
                                        embeds: [new EmbedBuilder()
                                        .setTitle(`${data.item_name} MUG ALERT`)
                                        .setThumbnail(`https://www.torn.com/images/items/${itemId}/large.png`)
                                        .setColor(0xF59E0B)
                                        .addFields(
                                            { name: 'Item', value: data.item_name, inline: true },
                                            { name: 'Price', value: '$' + currentListing.price.toLocaleString(), inline: true },
                                            { name: 'Total Value', value: '$' + (currentListing.price * currentListing.quantity).toLocaleString(), inline: true },
                                            { name: 'Name', value: `${profile.profile.name} (${profile.profile.id})`, inline: true},
                                            { name: 'Level', value: String(profile.profile.level), inline: true},
                                            { name: 'Last Action', value: profile.profile.last_action.status + " (" + profile.profile.last_action.relative + ")", inline: true},
                                            { name: 'Estimated Stats', value: stat.bs_estimate_human ?? 'Unknown', inline: true },
                                            { name: 'Bazaar Link', value: `[Bazaar](https://www.torn.com/bazaar.php?userId=${profile.profile.id}#/)` },
                                            { name: 'Profile Link', value: `[Profile](https://www.torn.com/profiles.php?XID=${profile.profile.id})` },
                                            { name: 'Attack Link', value: `[Attack](https://www.torn.com/loader.php?sid=attack&user2ID=${profile.profile.id})` },
                                        )
                                        .setTimestamp()
                                    ]});
                                    if(idCache.has(profile.profile.id))
                                        idCache.get(profile.profile.id).add(itemId);
                                    else
                                        idCache.set(profile.profile.id, new Set([itemId]));
                                }
                            }
                        }
                    }
                    console.log(itemId + ": " + profileId.size);
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