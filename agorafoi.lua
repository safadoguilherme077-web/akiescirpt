local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local Workspace = game:GetService("Workspace")

local LP = Players.LocalPlayer
local Camera = Workspace.CurrentCamera

---------------------------------------------------
-- ⚙️ SETTINGS
---------------------------------------------------
local settings = {
    ESP = true,
    AimAssist = false,
    WallCheck = true,
    AimStrength = 0.12,
    FOV = 120,

    Fly = false,
    FlySpeed = 50,

    HeroFly = false,
    HeroSpeed = 200,

    Noclip = false,
    TeamCheck = true
}

local aiming = false
local highlights = {}

---------------------------------------------------
-- 🎮 RAYFIELD
---------------------------------------------------
local Rayfield = loadstring(game:HttpGet("https://sirius.menu/rayfield"))()

local Window = Rayfield:CreateWindow({
    Name = "FPS System",
    LoadingTitle = "Loading...",
    LoadingSubtitle = "Client Menu",
    ConfigurationSaving = {Enabled = false}
})

local CombatTab = Window:CreateTab("Combat")
local MoveTab = Window:CreateTab("Movement")

---------------------------------------------------
-- 🎛️ COMBAT
---------------------------------------------------
CombatTab:CreateToggle({
    Name = "👁️ ESP",
    CurrentValue = true,
    Callback = function(v) settings.ESP = v end
})

CombatTab:CreateToggle({
    Name = "🎯 Aim Assist",
    CurrentValue = false,
    Callback = function(v) settings.AimAssist = v end
})

CombatTab:CreateToggle({
    Name = "🧱 Wall Check",
    CurrentValue = true,
    Callback = function(v) settings.WallCheck = v end
})

CombatTab:CreateToggle({
    Name = "👥 Team Check",
    CurrentValue = true,
    Callback = function(v) settings.TeamCheck = v end
})

CombatTab:CreateSlider({
    Name = "💪 Aim Strength",
    Range = {0,1},
    Increment = 0.01,
    CurrentValue = 0.12,
    Callback = function(v) settings.AimStrength = v end
})

CombatTab:CreateSlider({
    Name = "📐 Aim FOV",
    Range = {50,300},
    Increment = 5,
    CurrentValue = 120,
    Callback = function(v) settings.FOV = v end
})

---------------------------------------------------
-- ✈️ MOVEMENT
---------------------------------------------------

-- NORMAL FLY
local bv, bg
local function toggleFly(state)
    local char = LP.Character
    if not char then return end
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return end

    if state then
        bv = Instance.new("BodyVelocity", root)
        bv.MaxForce = Vector3.new(1e5,1e5,1e5)

        bg = Instance.new("BodyGyro", root)
        bg.MaxTorque = Vector3.new(1e5,1e5,1e5)
    else
        if bv then bv:Destroy() end
        if bg then bg:Destroy() end
    end
end

MoveTab:CreateToggle({
    Name = "✈️ Fly",
    CurrentValue = false,
    Callback = function(v)
        settings.Fly = v
        if v then settings.HeroFly = false end
        toggleFly(v)
    end
})

MoveTab:CreateSlider({
    Name = "⚡ Fly Speed",
    Range = {20,200},
    Increment = 5,
    CurrentValue = 50,
    Callback = function(v) settings.FlySpeed = v end
})

-- HERO FLY
local heroBV, heroBG
local currentVelocity = Vector3.zero

local function toggleHeroFly(state)
    local char = LP.Character
    if not char then return end
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return end

    if state then
        heroBV = Instance.new("BodyVelocity", root)
        heroBV.MaxForce = Vector3.new(1e7,1e7,1e7)

        heroBG = Instance.new("BodyGyro", root)
        heroBG.MaxTorque = Vector3.new(1e7,1e7,1e7)
        heroBG.P = 5e5
    else
        currentVelocity = Vector3.zero
        if heroBV then heroBV:Destroy() end
        if heroBG then heroBG:Destroy() end
    end
end

MoveTab:CreateToggle({
    Name = "🦸 Hero Fly",
    CurrentValue = false,
    Callback = function(v)
        settings.HeroFly = v
        if v then settings.Fly = false toggleFly(false) end
        toggleHeroFly(v)
    end
})

MoveTab:CreateSlider({
    Name = "🚀 Hero Speed",
    Range = {50,500},
    Increment = 10,
    CurrentValue = 200,
    Callback = function(v) settings.HeroSpeed = v end
})

-- NOCLIP
MoveTab:CreateToggle({
    Name = "🚪 Noclip",
    CurrentValue = false,
    Callback = function(v)
        settings.Noclip = v
    end
})

---------------------------------------------------
-- 🧠 FUNÇÕES
---------------------------------------------------
local function isEnemy(plr)
    if not settings.TeamCheck then return true end
    if not plr.Team or not LP.Team then return true end
    return plr.Team ~= LP.Team
end

---------------------------------------------------
-- 🔁 LOOPS
---------------------------------------------------
RunService.RenderStepped:Connect(function()

    -- FLY NORMAL
    if settings.Fly and bv and bg then
        local moveDir = Vector3.zero
        local cam = Camera.CFrame

        if UserInputService:IsKeyDown(Enum.KeyCode.W) then moveDir += cam.LookVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.S) then moveDir -= cam.LookVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.A) then moveDir -= cam.RightVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.D) then moveDir += cam.RightVector end

        bv.Velocity = moveDir * settings.FlySpeed
        bg.CFrame = cam
    end

    -- HERO FLY
    if settings.HeroFly and heroBV and heroBG then
        local moveDir = Vector3.zero
        local cam = Camera.CFrame

        if UserInputService:IsKeyDown(Enum.KeyCode.W) then moveDir += cam.LookVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.S) then moveDir -= cam.LookVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.A) then moveDir -= cam.RightVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.D) then moveDir += cam.RightVector end
        if UserInputService:IsKeyDown(Enum.KeyCode.Space) then moveDir += Vector3.new(0,1,0) end
        if UserInputService:IsKeyDown(Enum.KeyCode.LeftControl) then moveDir -= Vector3.new(0,1,0) end

        local targetVelocity = moveDir * settings.HeroSpeed
        currentVelocity = currentVelocity:Lerp(targetVelocity, 0.15)

        heroBV.Velocity = currentVelocity

        if moveDir.Magnitude > 0 then
            local root = LP.Character.HumanoidRootPart
            heroBG.CFrame = CFrame.new(root.Position, root.Position + moveDir) * CFrame.Angles(math.rad(-75),0,0)
        else
            heroBG.CFrame = cam
        end
    end

    -- NOCLIP
    if settings.Noclip then
        local char = LP.Character
        if char then
            for _, v in pairs(char:GetDescendants()) do
                if v:IsA("BasePart") then
                    v.CanCollide = false
                end
            end
        end
    end

end)