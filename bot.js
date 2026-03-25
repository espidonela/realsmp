const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = "MTQ4NjIyMzEyNDk0NDEzMDA2OA.GJnDUP.w7akY7cWOW_jk41WVc9HZaSQXoQiGP_FZeSrfs";
const API_KEY = "ptlc_6sMCN6LiRliifjjZTVmL2ctvqDRczeG4Cllu1oG4dF3";
const SERVER_ID = "64ca9d39";
const PROXY = "https://controlpanel.espinolamiguel444.workers.dev";
const PREFIX = "!";

async function powerAction(action) {
  const res = await fetch(`${PROXY}/api/client/servers/${SERVER_ID}/power`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ signal: action }),
  });
  return res.status === 204;
}

async function getServerStatus() {
  const res = await fetch(`${PROXY}/api/client/servers/${SERVER_ID}/resources`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();
  return data?.attributes?.current_state || "unknown";
}

client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  client.user.setActivity("The Goon SMP", { type: 3 });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const command = message.content.slice(PREFIX.length).trim().toLowerCase();

  if (command === "start") {
    const reply = await message.reply("⏳ Sending start signal...");
    try {
      const ok = await powerAction("start");
      if (ok) {
        reply.edit({
          content: "",
          embeds: [
            new EmbedBuilder()
              .setColor(0x00ff88)
              .setTitle("✅ Server Starting!")
              .setDescription("The Goon SMP is booting up.\nJoin at `emerald.magmanode.com:31723` in ~30 seconds.")
              .setFooter({ text: "Goon SMP Control" })
              .setTimestamp(),
          ],
        });
      } else {
        reply.edit("❌ Failed to start — it might already be running.");
      }
    } catch (err) {
      reply.edit("❌ Error: " + err.message);
    }
  }

  else if (command === "stop") {
    const reply = await message.reply("⏳ Sending stop signal...");
    try {
      const ok = await powerAction("stop");
      if (ok) {
        reply.edit({
          content: "",
          embeds: [
            new EmbedBuilder()
              .setColor(0xff3d5a)
              .setTitle("🔴 Server Stopped")
              .setDescription("The Goon SMP has been stopped.")
              .setFooter({ text: "Goon SMP Control" })
              .setTimestamp(),
          ],
        });
      } else {
        reply.edit("❌ Failed to stop the server.");
      }
    } catch (err) {
      reply.edit("❌ Error: " + err.message);
    }
  }

  else if (command === "restart") {
    const reply = await message.reply("⏳ Sending restart signal...");
    try {
      const ok = await powerAction("restart");
      if (ok) {
        reply.edit({
          content: "",
          embeds: [
            new EmbedBuilder()
              .setColor(0xffb300)
              .setTitle("🔄 Server Restarting")
              .setDescription("The Goon SMP is restarting. Back online in ~30 seconds.")
              .setFooter({ text: "Goon SMP Control" })
              .setTimestamp(),
          ],
        });
      } else {
        reply.edit("❌ Failed to restart.");
      }
    } catch (err) {
      reply.edit("❌ Error: " + err.message);
    }
  }

  else if (command === "status") {
    const reply = await message.reply("⏳ Checking server status...");
    try {
      const state = await getServerStatus();
      const colors = { running: 0x00ff88, offline: 0xff3d5a, starting: 0xffb300, stopping: 0xffb300 };
      const icons  = { running: "🟢", offline: "🔴", starting: "🟡", stopping: "🟡" };
      reply.edit({
        content: "",
        embeds: [
          new EmbedBuilder()
            .setColor(colors[state] || 0x888888)
            .setTitle(`${icons[state] || "⚪"} Server Status`)
            .addFields(
              { name: "State",   value: state.toUpperCase(), inline: true },
              { name: "Address", value: "`emerald.magmanode.com:31723`", inline: true }
            )
            .setFooter({ text: "Goon SMP Control" })
            .setTimestamp(),
        ],
      });
    } catch (err) {
      reply.edit("❌ Error: " + err.message);
    }
  }

  else if (command === "help") {
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00e5ff)
          .setTitle("⛏ Goon SMP Commands")
          .addFields(
            { name: "`!start`",   value: "Start the server",   inline: true },
            { name: "`!stop`",    value: "Stop the server",    inline: true },
            { name: "`!restart`", value: "Restart the server", inline: true },
            { name: "`!status`",  value: "Check server status",inline: true }
          )
          .setFooter({ text: "Goon SMP Control" }),
      ],
    });
  }
});

client.login(TOKEN);
