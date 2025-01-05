-- Roblox script to send POST request with only userId and points if the player is above a certain rank

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local API_URL = "https://yourdomain.com/promote"  -- Replace with your actual server URL
local GROUP_ID = 7384833  -- Replace with your group ID
local MIN_RANK = 218  -- Replace with the minimum rank to send the data (e.g., 100 means a rank above 100)

-- Function to promote a user based on their points and group rank
local function promoteUser(player)
	-- Ensure player has leaderstats with points value
	local leaderstats = player:FindFirstChild("leaderstats")
	if leaderstats then
		local points = leaderstats:FindFirstChild("Points")
		if points then
			-- Get the player's points from leaderstats
			local userPoints = points.Value

			-- Check the player's rank in the group
			local rank = player:GetRankInGroup(GROUP_ID)

			-- Only send the data if the player's rank is above the minimum required rank
			if rank >= MIN_RANK then
				-- Prepare the data to send
				local data = {
					userId = player.UserId,  -- sending the user ID
					points = userPoints      -- sending the user's points
				}

				local jsonData = HttpService:JSONEncode(data)  -- encoding the data to JSON format

				-- Sending POST request to the server with only userId and points
				local success, errorMessage = pcall(function()
					HttpService:PostAsync(API_URL, jsonData, Enum.HttpContentType.ApplicationJson)
				end)

				if success then
					print(player.Name .. " successfully sent points data!")
				else
					warn("Failed to send points data for " .. player.Name .. ": " .. errorMessage)
				end
			else
				print(player.Name .. " does not meet the rank requirement. Rank: " .. rank)
			end
		else
			warn("Points not found in leaderstats for " .. player.Name)
		end
	else
		warn("Leaderstats not found for " .. player.Name)
	end
end

-- Call the function for every player when they join
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		-- Wait until the leaderstats is available
		local leaderstats = player:WaitForChild("leaderstats")

		-- Make sure the player has a points value
		local points = leaderstats:WaitForChild("Points")

		-- Call the promote function
		promoteUser(player)
	end)
end)
