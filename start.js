const { exec } = require('child_process');

// Step 1: Deploy slash commands
exec('node deploy-commands.js', (err, stdout, stderr) => {
  if (err) {
    console.error(`❌ Deploy error:\n${stderr}`);
    return;
  }
  console.log(`✅ Deploy complete:\n${stdout}`);

  // Step 2: Start the bot
  const botProcess = exec('node index.js');

  botProcess.stdout.on('data', data => console.log(data));
  botProcess.stderr.on('data', data => console.error(data));
});
