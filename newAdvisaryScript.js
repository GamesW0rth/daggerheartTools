var experiences = [];
var features = [];
const featureTypes = [
    "Action",
    "Action (2)",
    "Action (3)",
    "Reaction",
    "Passive",
]
const featurePresets = [
    {
        "Name":"Relentless (X)",
        "Type":"Passive",
        "Description":"This adversary can activate up to X times during a GM move, so long as there are enough action tokens. You still spend an action token each time you activate them in this way."
    },
    {
        "Name":"Slow (X)",
        "Type":"Passive",
        "Description":"This adversary costs X action tokens to activate, instead of just one token."
    },
    {
        "Name":"Minion (X)",
        "Type":"Passive",
        "Description":"For every X damage a PC deals to this adversary, an additional minion within the attack’s range is defeated."
    },
    {
        "Name":"Horde (X)",
        "Type":"Passive",
        "Description":"If the horde has marked at least half of their Hit Points, their attack only deals X damage."
    },
    {
        "Name":"Magic Resistance",
        "Type":"Passive",
        "Description":"This adversary is resistant to magic damage."
    },
    {
        "Name":"Armor",
        "Type":"Passive",
        "Description":"When this adversary takes physical damage, reduce that damage by X."
    }
    
]
var advisaryObject = {
    "Name": "",
    "Description": "",
    "MotivesTactics": "",
    "Tier": "",
    "Role": "",
    "id": -1,
    "Difficulty": "",
    "Modifier": "",
    "Weapon": {
    },
    "Thresholds": {
    },
    "HP": "",
    "Stress": "",
    "Experience": {
    },
    "Features": {
    }
}
/*

Armored Carapace - Passive

When this adversary takes physical damage, reduce that damage by X.
*/

document.addEventListener("DOMContentLoaded", function() {
    generateFeaturePresetList();
    updateCreationJson();
});

function updateCreationJson(){
    advisaryObject.Name = document.getElementById("name").value;
    advisaryObject.MotivesTactics = document.getElementById("motives").value;
    advisaryObject.Tier = document.getElementById("tier").value;
    advisaryObject.Role = document.getElementById("role").value;
    advisaryObject.Difficulty = document.getElementById("difficulty").value;
    advisaryObject.Modifier = document.getElementById("modifier").value;
    advisaryObject.HP = document.getElementById("hp").value;
    advisaryObject.Stress = document.getElementById("stress").value;
    advisaryObject.Thresholds.Minor = document.getElementById("minorThresh").value;
    advisaryObject.Thresholds.Major = document.getElementById("majorThresh").value;
    advisaryObject.Thresholds.Severe = document.getElementById("severeThresh").value;
    advisaryObject.Weapon = {
        "Name":document.getElementById("weaponName").value,
        "Range":document.getElementById("weaponRange").value,
        "Damage":diceString(),
        "Type":document.getElementById("damageType").value
    }
    advisaryObject.Experience = {};//empty exps
    experiences.forEach(experience =>{
        advisaryObject.Experience[experience.name] = experience.bonus;
    })
    advisaryObject.Features = {};
    features.forEach(feature=>{
        const newFeat = {
            "Type":feature.Type,
            "Description":feature.Description
        }
        advisaryObject.Features[feature.Name] = newFeat;
    });
    updateJSonField();
}
function diceString(){
    var result = "";
    var diceCount = document.getElementById("weaponDiceCount").value;
    var dice = document.getElementById("weaponDice").value;
    var bonus = document.getElementById("weaponDamageBonus").value;
    if (diceCount == 0){
        result += 1;
    }
    else{
        result +=diceCount;
    }
    result += dice;
    if(bonus<0){
        result += "-"+bonus;
    }
    else if (bonus>0){
        result += "+"+bonus;
    }
    return result;
}
function updateJSonField(){
    const div = document.getElementById("jsonArea");
    var jString = JSON.stringify(advisaryObject);
    var stringArr = jString.split('{');
    stringArr.splice(0,1);
    var stringHtml = "";
    stringArr.forEach(line =>{
        var newLine = "{";
        if (stringHtml != ""){
            newLine += "</br>"
        }
        if ((line.includes('"Description":')&&!line.includes('"MotivesTactics":""'))||line.length==1){
            newLine+=line;
        }
        else{
            var lineArr = line.split(',');
            lineArr.forEach(x =>{
                if (lineArr.indexOf(x)==0){
                    newLine+=x;
                }
                else{
                    newLine+=',</br>'+x;
                }
            });
        }
        stringHtml += newLine;
    })

    div.innerHTML = stringHtml;
}
function generateFeaturePresetList(){
    const presetSelect = document.getElementById("presets");
    const presetItemOne = document.createElement("option");
    presetItemOne.value = "default";
    presetItemOne.text = "select preset";
    presetSelect.appendChild(presetItemOne);

    featurePresets.forEach(preset =>{
        const newOption = document.createElement("option");
        newOption.value = preset.Name;
        newOption.text = preset.Name;
        presetSelect.appendChild(newOption);
    });

    presetSelect.onchange = function(){presetSelected();};
}

function presetSelected(){
    const presetSelect = document.getElementById("presets");
    if (presetSelect.value == "default"){
        return;
    }
    const selectedFeature = featurePresets.find((x=>x.Name==presetSelect.value));
    addPresetFeature(selectedFeature);
    presetSelect.value = "default";
}

function newFeature(){
    console.log("adding new feature");
    features.push({
        "Name":"New Feature",
        "Type":"Action",
        "Description":"Description"
    });
    regenerateFeatureList();
}
function addPresetFeature(preset){
    console.log("adding preset feature "+preset.Name);
    features.push({
        "Name":preset.Name,
        "Type":preset.Type,
        "Description":preset.Description
    });
    regenerateFeatureList();
}

function regenerateFeatureList(){
    const featureDiv = document.getElementById("features-div");
    featureDiv.textContent = '';
    features.forEach(feature => {
        featureDiv.appendChild(regenerateFeatureField(feature));
    });
}

function regenerateFeatureField(feature){
    const newfeatureDiv = document.createElement("div");

    const headerDiv = document.createElement("div");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = feature.Name;
    nameInput.onchange = function(){feature.Name = this.value;};

    headerDiv.appendChild(nameInput);
    headerDiv.classList.add("inline");

    const typeSelector = document.createElement("select");
    featureTypes.forEach(type=>{
        const newType = document.createElement("option")
        newType.value = type;
        newType.text = type;
        typeSelector.appendChild(newType);
    });
    typeSelector.value = feature.Type;
    
    typeSelector.onchange = function(){feature.Type = this.value;};
    headerDiv.appendChild(typeSelector);

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("button-text");
    deleteButton.style = "width: 40px;";
    deleteButton.innerText = "Delete"
    deleteButton.onclick = function(){features.splice(features.indexOf(feature),1);regenerateFeatureList();};
    headerDiv.appendChild(deleteButton);

    
    const descDiv =  document.createElement("textarea");
    descDiv.style = "width: 500px;"
    descDiv.innerText = feature.Description;
    descDiv.onchange = function(){feature.Description = this.value;};

    newfeatureDiv.appendChild(headerDiv);
    newfeatureDiv.appendChild(descDiv);

    return newfeatureDiv;
}

function newExperience(){
    console.log("adding new experience");
    var newExpId = Object.keys(experiences).length;
    experiences.push({
        "name":"NewExp "+newExpId,
        "bonus":"1"});
    regenerateExperienceDiv();
}
function regenerateExperienceDiv(){
    const experienceDiv = document.getElementById("experiences-div");
    experienceDiv.textContent = '';
    experiences.forEach(experience => {
        experienceDiv.appendChild(generateExperienceField(experience));
    });
}
function parseBonus(bonusInt){
    if(bonusInt>0){
        return "+"+bonusInt;
    }
    return bonusInt.toString();
}
function generateExperienceField(experience){
    const newExperienceDiv = document.createElement("div");
    newExperienceDiv.classList.add("inline");

    const experienceName = document.createElement("input");
    experienceName.type = "text";
    experienceName.value = experience.name;
    experienceName.onkeyup = function(){experience.name = experienceName.value;};

    const bonus = document.createElement("input");
    bonus.type ="number";
    bonus.style = "width: 30px;";
    bonus.value = parseInt(experience.bonus);
    bonus.min = 1;
    bonus.onchange = function(){experience.bonus = parseBonus(bonus.value);};

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("button-text");
    deleteButton.style = "width: 40px;";
    deleteButton.innerText = "Delete"
    deleteButton.onclick = function(){experiences.splice(experiences.indexOf(experience),1);regenerateExperienceDiv();};

    newExperienceDiv.appendChild(experienceName);
    newExperienceDiv.appendChild(bonus);
    newExperienceDiv.appendChild(deleteButton);
    return newExperienceDiv;
}