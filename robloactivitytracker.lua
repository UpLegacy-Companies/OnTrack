local HttpService = game:GetService("HttpService")
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
