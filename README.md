# OnTrack

Hello everyone! I am Deo, a little known developer on the Roblox platform. I currently run UpLegacy Companies, which is a Roblox development and asset management firm. We have been providing many cheap Roblox group solutions and services. And with the recent increase in popularity in our Activity Tracking module I decided to release a **SELF-HOSTED** version to the public! ( This is actually my first community resource post :) )

The following features are included with OnTrack:

[details="Features"]
- Automatic logging and tracking of all your staff members in-game activity!
- Support for MULTIPLE games! (Only counts to a total time in-game and not separate game tracking. Future updates will release that!)
- **DISCORD** integration with instructions on a SLASH COMMAND bot!
- **AUTOMATIC** searching of usernames via Discord Integration. (It will autofill any username of your staff that has been in-game.)
[/details]



[details="Showcase"]

> https://youtube.com/shorts/pdq0Z4hzsmo?feature=shared

[/details]


*And that is that! I hope people out there will find this useful!*
*Lets get into it!*

*Requirements:*

- **IT IS RECOMMENDED YOU ARE AN EXPERIENCED CODER!** (The guides are as simple as I could make them, but it we are not providing support for free self hosted versions.)

- Linux Server (And basic understanding of Linux)
- Domain or Public IPV4 Address on your Server (I will show Cloudflared Linking Instructions)
- Discord Bot Token (And recommend understanding of Java Script.)
- A lot of *time* and **patience.**

(*If you don't meet the requirements above but are still interested in our service, please contact us for paid plans!*)

Here we go! (I recommend making a `project` directory and separate directories for each step EXCEPT Step 1.)

[details="1. Your Server is Accessible from the Internet"]

Ensure that your Domain is Cloudflared Proxied (Or have a publicly Accessible IPV4 Address)

* Please ensure that your domain is open through a public IPV4 address. If not, heres a cloudflare tutorial.

1. **Download the `cloudflared` binary**:
```
curl -O https://downloads.cloudflare.com/cloudflared/latest/linux/amd64/cloudflared
```

2. **Make it executable**:
```
chmod +x cloudflared
```

3. **Move it to a directory in your PATH**:

```
sudo mv cloudflared /usr/local/bin/
```

4. **Verify the installation**:

```
cloudflared --version
```

If it returns a version! Congrats, Cloudflared is installed! If you need to trouble shoot, check Cloudflare Documentation.

> (Find that here: https://developers.cloudflare.com/support/troubleshooting/cloudflare-errors/)

**Now that you have Cloudflared installed, lets make a tunnel!**

* **Authenticate**:

```
cloudflared tunnel login
```

This will open a browser to authenticate (or create) your Cloudflare account.

* **Create a new tunnel**:

```
cloudflared tunnel create <TUNNEL_NAME>
```

Replace `<TUNNEL_NAME>` with a name for your tunnel. This command generates a `tunnel` credential file stored at `~/.cloudflared/<TUNNEL_ID>.json`. I recommend that you copy this down for later.



LOOK HERE!! *Awesome! You've got a tunnel. Your good to go! Just make sure your DNS servers are updated! (Roblox.yourdomain.com is tunneled to TUNNEL_ID.cfargotunnels.com) Now lets define the Ingress Rules! (Ingress is what port incoming requests go to on your server. In this case, our server is going to run on port 5000.)*



1. **Create a configuration file**: Create a file called `config.yml` in the `~/.cloudflared/` directory:

```
nano ~/.cloudflared/config.yml
```

2. **Add ingress rules to the `config.yml` file**: Example `config.yml`:

```
tunnel: <TUNNEL_ID> 
credentials-file: /home/user/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: roblox.yourdomain.com
    service: http://localhost:6000
  - service: http_status:404
```

Replace `<TUNNEL_ID>` with the ID of your tunnel (copied down from earlier), and configure the hostname and services as required.  You set your hostname up in your DNS settings.

### Step 4: Run the Tunnel

1. **Run the tunnel manually**:

```
cloudflared tunnel run <TUNNEL_NAME>
```

And thats it! You got it!
Now, if you SSH'ed into your client, odds are after you closed the terminal the Cloudflare tunnel will stop. If it doesn't, congrats! You can move onto the next step. If it does, heres is how to troubleshoot!

#### Start the Cloudflare Tunnel with `nohup`

`nohup` allows you to run a command in the background, ignoring hangups (disconnections).

1. Install nohup and run the tunnel!

```
sudo apt install nohup
```

2. Now run the tunnel!

```
nohup cloudflared tunnel run <TUNNEL_NAME> > cloudflared.log 2>&1 &
```

Whew! Hard part is over! For those of you that have a public IPv4, I envy you!

[/details]


[details="2. Install your Database"]
Hey hey! Welcome! I'm glad you got through that Cloudflare mess- its almost as bad as 285 at 5:30pm on a Friday... 

Lets get your database running! For this we are using sqlite (yes, you could use mySQL. But I don't.)

### Install sqLite

Run: 

`
sudo apt update
sudo apt install sqlite3 -y
`

### **Step 2: Create a New Database**

`
sqlite3 activity.db
`

Whew! Database done. That was a little easier wasn't it?

Run 

`.quit
` 
to exist back to terminal.

[/details]


[details="3. Get your Discord Bot Running"]
Alright! It only get easier now! I'm going to spoon-feed it all to you from here! 
We are going to get your discord bot running now. 

Go to `https://github.com/UpLegacy-Companies/OnTrack/tree/main` and find the `Code` button in the top left. Now find the `Download ZIP` and download it! Then extract it to your computer and find `scbot` folder. Now take `bot.js` and add it to your directory! (sudo nano /home/user/project/bot/bot.js). Replace all the config details *use role id's* and now Control + X and save your file! In the main terminal run:


`sudo apt install npm nodejs -y`

And after that is done, run 

`sudo npm i`

This will install all your node modules. 

Now lets get your node rolling!

Run 
`npm start bot.js`

Now your bot is running, but again- you might want it online all the time eh?

Use this to do that!

* **Install PM2 Globally:**


```
sudo npm install -g pm2
```

### 3. **Start the Application with PM2**

Use PM2 to start the file.

* **Start the application:**

```
pm2 start bot.js
```

* **Allow PM2 to Start on Boot**

* ```
pm2 startup
```

This will output a command specific to your Linux distribution. Run the command as instructed.

* **Save the current processes:**

```
pm2 save
```

Now your bot should be running successfully! (If you can't find your token, or client ID's I'd recommend you look them up. 
 
Lets move on to the API!
[/details]


[details="4. Building your API"]

Remember that ZIP file from earlier? Well we need it again, inside there is a folder names `scapi`. Open that folder, edit the group and point requirements, and copy and paste `server.js` into a new file in your directory called server.js (Same way as before just change the name from /bot/bot.js to /server/server.js) 

[/details]


[details="5. Add to Roblox"]
You've made it!
Now, ensure HTTP request are on in your game, and add this script to your roblox game!


`local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local activityApiUrl = "https://yourdomain.name/log"
local groupId = 0  -- Replace with your group ID
local minRank = 2  -- Minimum rank required to log activity (inclusive)
local maxRank = 8  -- Maximum rank allowed to log activity (inclusive)

-- Function to check if the player is in the allowed rank range
local function isPlayerInRankRange(player)
	local rank = player:GetRankInGroup(groupId)
	return rank >= minRank and rank <= maxRank
end

-- Function to log activity data by sending a POST request to the API
local function logActivityToAPI(username, time)
	local data = {
		username = username,
		time = time
	}

	local jsonData = HttpService:JSONEncode(data)  -- Convert the data to JSON

	local headers = {
		["Content-Type"] = "application/json"
	}

	-- Send a POST request to the API
	local success, response = pcall(function()
		return HttpService:PostAsync(activityApiUrl, jsonData, Enum.HttpContentType.ApplicationJson)
	end)

	if success then
		print("Successfully logged activity for " .. username .. " to the API.")
	else
		print("Failed to log activity for " .. username .. ": " .. response)
	end
end

-- Track time spent by each player in the game
local playerTimes = {}  -- Table to store player times

-- Automatically log activity when a player joins, if they meet the rank requirements
Players.PlayerAdded:Connect(function(player)
	if isPlayerInRankRange(player) then
		print(player.Name .. " is in the allowed rank range. Logging their activity.")

		-- Track the time the player spends in the game
		local startTime = tick()  -- Get the current time when the player joins

		-- When the player leaves, calculate the time spent in-game
		player.AncestryChanged:Connect(function(_, parent)
			if not parent then  -- Player has left the game
				local endTime = tick()  -- Get the current time when the player leaves
				local timeSpent = math.floor((endTime - startTime) / 60)  -- Convert time to minutes

				-- Send the activity data as a POST request to the API
				logActivityToAPI(player.Name, timeSpent)
				print(player.Name .. " played for " .. timeSpent .. " minutes.")
			end
		end)
	else
		print(player.Name .. " does not have the required rank to log activity.")
	end
end)
`
[/details]

That's it! Your done! Let me know any feed back and how this could be improved/bugs! 
Have a great day all, and I hope you find this useful!

Cam


 
