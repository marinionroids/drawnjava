package com.casino.drawn.services.discord;


import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.time.Instant;

@Service
public class DiscordService {


    private final JDA jda;

    public DiscordService(JDA jda) {
        this.jda = jda;
    }


    public void sendMessage(String username, float amountSOL, float amountUSD) {
        EmbedBuilder embed = new EmbedBuilder();

        embed.setTitle("💰 New Deposit Received");
        embed.setColor(new Color(75, 181, 67));
        embed.setDescription("A deposit has been successfully processed");

        embed.addField("Username", username, true);
        embed.addField("Amount SOL", String.valueOf(amountSOL), true);
        embed.addField("Amount USD", String.valueOf(amountUSD), true);

        embed.setTimestamp(Instant.now());

        TextChannel channel = jda.getTextChannelById("1222320668490862722");
        if (channel != null) {
            channel.sendMessageEmbeds(embed.build()).queue();
        }
    }

    public void sendMessageOpenLootbox(String username) {
        EmbedBuilder embed = new EmbedBuilder();

        embed.setTitle("💰 A god has opened a lootbox");
        embed.setColor(new Color(75, 181, 67));

        embed.addField("Username", username, true);
        embed.setTimestamp(Instant.now());

        TextChannel channel = jda.getTextChannelById("1346611632104673303");
        if (channel != null) {
            channel.sendMessageEmbeds(embed.build()).queue();
        }
    }
}
