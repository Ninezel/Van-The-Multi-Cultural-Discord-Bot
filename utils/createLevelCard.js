const Canvas = require('canvas');
const path = require('path');

async function createLevelCard(user, levelData) {
  const width = 600;
  const height = 200;

  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load background image based on selectedBackground
  // Put your backgrounds in a folder like './backgrounds'
  const bgPath = path.join(__dirname, '..', 'backgrounds', `${levelData.selectedBackground || 'default'}.png`);
  const background = await Canvas.loadImage(bgPath);
  ctx.drawImage(background, 0, 0, width, height);

  // Draw user avatar circle
  const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 }).split('?')[0];
  const avatar = await Canvas.loadImage(avatarURL);

  const avatarX = 40;
  const avatarY = (height / 2) - 64; // center vertically
  const avatarSize = 128;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // Draw username and discriminator
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Sans-serif';
  ctx.fillText(user.username, avatarX + avatarSize + 30, avatarY + 40);
  ctx.font = '20px Sans-serif';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`#${user.discriminator}`, avatarX + avatarSize + 30, avatarY + 70);

  // Draw level and XP
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Sans-serif';
  ctx.fillText(`Level: ${levelData.level}`, avatarX + avatarSize + 30, avatarY + 110);
  ctx.fillText(`XP: ${levelData.xp} / ${levelData.level * 100}`, avatarX + avatarSize + 30, avatarY + 140);

  // Draw progress bar background
  const barX = avatarX + avatarSize + 30;
  const barY = avatarY + 160;
  const barWidth = 350;
  const barHeight = 25;

  ctx.fillStyle = '#444444';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Draw progress bar fill
  const progress = Math.min(levelData.xp / (levelData.level * 100), 1);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);

  // Optional: draw border around progress bar
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  return canvas.toBuffer();
}

module.exports = createLevelCard;
